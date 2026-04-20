use std::sync::atomic::{AtomicU64, Ordering};

use crate::auth::{hash_password, verify_password, verify_password_dummy};
use chrono::{DateTime, Utc};
use common::events::account;
use serde::{Deserialize, Serialize};
use sled::Tree;
use sled::transaction::TransactionalTree;

use crate::db::event_store::AppEventStore;
use crate::db::{DbKey, EventProcessor, eventful_transaction};
use crate::error::AppResult;

#[derive(Serialize, Deserialize, Debug)]
pub struct Account {
    pub id: u64,
    pub email: String,
    password: String,
    pub created: DateTime<Utc>,
    pub last_login: DateTime<Utc>,
}

pub struct AccountStore {
    pub accounts: Tree,
    pub accounts_by_email: Tree,
    next_id: AtomicU64,
}

impl AccountStore {
    pub fn new(accounts: Tree, accounts_by_email: Tree) -> Self {
        let next_id = match accounts.last() {
            Ok(Some((key, _))) => {
                let bytes: [u8; 8] = key.as_ref().try_into().unwrap_or([0; 8]);
                u64::from_be_bytes(bytes) + 1
            }
            _ => 1,
        };

        Self {
            accounts,
            accounts_by_email,
            next_id: AtomicU64::new(next_id),
        }
    }

    fn id_to_bytes(id: u64) -> [u8; 8] {
        id.to_be_bytes()
    }

    pub fn get_by_id(&self, id: u64) -> AppResult<Option<Account>> {
        let key = Self::id_to_bytes(id);
        match self.accounts.get(key)? {
            Some(data) => Ok(Some(rmp_serde::from_slice(&data)?)),
            None => Ok(None),
        }
    }

    fn register(
        &self,
        email: &str,
        password: &str,
        tx_accounts: &TransactionalTree,
        tx_by_email: &TransactionalTree,
    ) -> AppResult<Option<u64>> {
        // Check if email already taken
        if tx_by_email.get(email.as_bytes())?.is_some() {
            return Ok(None);
        }

        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let key = Self::id_to_bytes(id);

        let account = Account {
            id,
            email: email.into(),
            password: hash_password(password)?,
            created: Utc::now(),
            last_login: Utc::now(),
        };

        tx_accounts.insert(&key, rmp_serde::to_vec(&account)?)?;
        tx_by_email.insert(email.as_bytes(), &key)?;

        Ok(Some(id))
    }

    fn sign_in(
        &self,
        email: &str,
        password: &str,
        tx_accounts: &TransactionalTree,
        tx_by_email: &TransactionalTree,
    ) -> AppResult<Option<u64>> {
        let Some(id_bytes) = tx_by_email.get(email.as_bytes())? else {
            verify_password_dummy(password)?;
            return Ok(None);
        };

        let Some(data) = tx_accounts.get(&*id_bytes)? else {
            return Ok(None);
        };

        let mut account = rmp_serde::from_slice::<Account>(&data)?;
        let valid = verify_password(password, &account.password)?;

        if valid {
            account.last_login = Utc::now();
            tx_accounts.insert(&*id_bytes, rmp_serde::to_vec(&account)?)?;
            Ok(Some(account.id))
        } else {
            Ok(None)
        }
    }
}

impl EventProcessor for AccountStore {
    type Event = account::ServerEvent;
    type Effect = account::ServerEffect;
    type EventStore = AppEventStore;

    #[tracing::instrument(name = "AccountStore.process_event", skip_all)]
    fn process_event(
        &self,
        event_id: &DbKey,
        event: &Self::Event,
        store: &AppEventStore,
    ) -> AppResult<Vec<Self::Effect>> {
        eventful_transaction(
            store,
            event_id,
            [&self.accounts, &self.accounts_by_email],
            |[tx_accounts, tx_by_email]| {
                let mut effects: Vec<Self::Effect> = Vec::new();

                match event {
                    account::ServerEvent::SignIn { email, password } => {
                        match self.sign_in(email, password, tx_accounts, tx_by_email)? {
                            Some(id) => effects.push(account::ServerEffect::SignInSuccess {
                                account_id: id,
                                email: email.clone(),
                            }),
                            None => effects.push(account::ServerEffect::SignInFailed),
                        }
                    }
                    account::ServerEvent::Register { email, password } => {
                        match self.register(email, password, tx_accounts, tx_by_email)? {
                            Some(id) => effects.push(account::ServerEffect::SignInSuccess {
                                account_id: id,
                                email: email.clone(),
                            }),
                            None => effects.push(account::ServerEffect::RegistrationDuplicate),
                        }
                    }
                }

                Ok(effects)
            },
        )
    }
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod test {
    use crate::db::account_store::Account;
    use crate::testing::{dispatch_event, spin_up};
    use chrono::Utc;
    use common::events::{ServerEffect, ServerEvent, ServerEventWrapped, account};

    #[tokio::test]
    async fn test_register() {
        let state = spin_up().unwrap();
        let start_time = Utc::now();

        let test_email: String = "test@example.com".into();
        let test_pass: String = "testpassword".into();

        let effects = dispatch_event(
            &state,
            ServerEventWrapped {
                auth: None,
                event: ServerEvent::Account(account::ServerEvent::Register {
                    email: test_email.clone(),
                    password: test_pass.clone(),
                }),
            },
        )
        .await
        .unwrap();

        let end_time = Utc::now();

        assert_eq!(effects.len(), 1, "registration should produce one effect");

        let ServerEffect::Account(account::ServerEffect::SignInSuccess { account_id, email }) =
            &effects[0]
        else {
            panic!("expected SignInSuccess, got {:?}", effects[0]);
        };
        assert_eq!(email, &test_email);
        assert!(*account_id > 0, "account_id should be positive");

        // Verify account in DB by id
        let account = state
            .db
            .account_store
            .get_by_id(*account_id)
            .unwrap()
            .expect("account should exist by id");

        assert_eq!(account.email, test_email);
        assert_ne!(account.password, test_pass, "password should be hashed");
        assert!(account.created >= start_time && account.created <= end_time);
        assert!(account.last_login >= start_time && account.last_login <= end_time);

        // Verify email index points to the account
        let id_from_email = state
            .db
            .account_store
            .accounts_by_email
            .get(test_email.as_bytes())
            .unwrap()
            .expect("email index should exist");
        let id_bytes: [u8; 8] = id_from_email.as_ref().try_into().unwrap();
        assert_eq!(u64::from_be_bytes(id_bytes), *account_id);
    }

    #[tokio::test]
    async fn test_register_duplicate() {
        let state = spin_up().unwrap();

        register_account(&state, "dupe@example.com", "password").await;

        let effects = dispatch_event(
            &state,
            ServerEventWrapped {
                auth: None,
                event: ServerEvent::Account(account::ServerEvent::Register {
                    email: "dupe@example.com".into(),
                    password: "password".into(),
                }),
            },
        )
        .await
        .unwrap();

        assert_eq!(effects.len(), 1);
        assert!(
            matches!(
                &effects[0],
                ServerEffect::Account(account::ServerEffect::RegistrationDuplicate)
            ),
            "duplicate registration should produce RegistrationDuplicate"
        );
    }

    async fn register_account(
        state: &std::sync::Arc<crate::AppState>,
        email: &str,
        password: &str,
    ) {
        dispatch_event(
            state,
            ServerEventWrapped {
                auth: None,
                event: ServerEvent::Account(account::ServerEvent::Register {
                    email: email.into(),
                    password: password.into(),
                }),
            },
        )
        .await
        .unwrap();
    }

    #[tokio::test]
    async fn test_sign_in_success() {
        let state = spin_up().unwrap();
        let test_email = "signin@example.com";
        let test_pass = "testpassword";

        register_account(&state, test_email, test_pass).await;

        let sign_in_time = Utc::now();

        let effects = dispatch_event(
            &state,
            ServerEventWrapped {
                auth: None,
                event: ServerEvent::Account(account::ServerEvent::SignIn {
                    email: test_email.into(),
                    password: test_pass.into(),
                }),
            },
        )
        .await
        .unwrap();

        let after_sign_in = Utc::now();

        assert_eq!(effects.len(), 1, "sign in should produce one effect");
        let ServerEffect::Account(account::ServerEffect::SignInSuccess { account_id, email }) =
            &effects[0]
        else {
            panic!("expected SignInSuccess");
        };
        assert_eq!(email, test_email);

        // Verify last_login was updated
        let account = state
            .db
            .account_store
            .get_by_id(*account_id)
            .unwrap()
            .expect("account should exist");
        assert!(account.last_login >= sign_in_time && account.last_login <= after_sign_in);
    }

    #[tokio::test]
    async fn test_sign_in_wrong_password() {
        let state = spin_up().unwrap();
        let test_email = "wrongpass@example.com";

        register_account(&state, test_email, "correctpassword").await;

        let effects = dispatch_event(
            &state,
            ServerEventWrapped {
                auth: None,
                event: ServerEvent::Account(account::ServerEvent::SignIn {
                    email: test_email.into(),
                    password: "wrongpassword".into(),
                }),
            },
        )
        .await
        .unwrap();

        assert_eq!(effects.len(), 1);
        assert!(
            matches!(&effects[0], ServerEffect::Account(account::ServerEffect::SignInFailed)),
            "sign in with wrong password should produce SignInFailed"
        );
    }

    #[tokio::test]
    async fn test_sign_in_nonexistent_user() {
        let state = spin_up().unwrap();

        let effects = dispatch_event(
            &state,
            ServerEventWrapped {
                auth: None,
                event: ServerEvent::Account(account::ServerEvent::SignIn {
                    email: "nobody@example.com".into(),
                    password: "anypassword".into(),
                }),
            },
        )
        .await
        .unwrap();

        assert_eq!(effects.len(), 1);
        assert!(
            matches!(&effects[0], ServerEffect::Account(account::ServerEffect::SignInFailed)),
            "sign in with nonexistent user should produce SignInFailed"
        );
    }
}
