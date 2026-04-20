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
    email: String, // serves as unique identifier of user
    password: String,
    created: DateTime<Utc>,
    last_login: DateTime<Utc>,
}

pub struct AccountStore {
    pub accounts: Tree,
}

impl AccountStore {
    fn register(
        &self,
        email: &str,
        password: &str,
        tx_accounts: &TransactionalTree,
    ) -> AppResult<bool> {
        // Check to see if an existing account exists
        if let Some(_) = tx_accounts.get(email.as_bytes())? {
            return Ok(false);
        }

        let account = Account {
            email: email.into(),
            password: hash_password(password)?,
            created: Utc::now(),
            last_login: Utc::now(),
        };
        tx_accounts.insert(email.as_bytes(), rmp_serde::to_vec(&account)?)?;

        Ok(true)
    }

    fn sign_in(
        &self,
        email: &str,
        password: &str,
        tx_accounts: &TransactionalTree,
    ) -> AppResult<bool> {
        let Some(data) = tx_accounts.get(email.as_bytes())? else {
            return verify_password_dummy(password);
        };

        let mut account = rmp_serde::from_slice::<Account>(&data)?;
        let valid = verify_password(password, &account.password)?;

        if valid {
            account.last_login = Utc::now();
            tx_accounts.insert(email.as_bytes(), rmp_serde::to_vec(&account)?)?;
        }

        Ok(valid)
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
        eventful_transaction(store, event_id, [&self.accounts], |[tx_accounts]| {
            let mut effects: Vec<Self::Effect> = Vec::new();

            match event {
                account::ServerEvent::SignIn { email, password } => {
                    let success = self.sign_in(email, password, tx_accounts)?;
                    if success {
                        effects.push(account::ServerEffect::SignInSuccess {
                            email: email.clone(),
                        });
                    } else {
                        effects.push(account::ServerEffect::SignInFailed);
                    }
                }
                account::ServerEvent::Register { email, password } => {
                    let account_created = self.register(email, password, tx_accounts)?;
                    if account_created {
                        effects.push(account::ServerEffect::SignInSuccess {
                            email: email.clone(),
                        })
                    } else {
                        effects.push(account::ServerEffect::RegistrationDuplicate);
                    }
                }
            }

            Ok(effects)
        })
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

        assert!(
            effects.len() == 1,
            "registration event should only produce one effect"
        );

        assert!(
            effects
                .iter()
                .filter(|e| {
                    let ServerEffect::Account(account::ServerEffect::SignInSuccess { email }) = e
                    else {
                        return false;
                    };
                    email == &test_email.clone()
                })
                .count()
                == 1,
            "registration effect should only produce a sign in success effect, containing correct email"
        );

        let end_time = Utc::now();

        match state
            .db
            .account_store
            .accounts
            .get(test_email.as_bytes())
            .unwrap()
        {
            Some(data) => {
                let account = rmp_serde::from_slice::<Account>(&data).unwrap();
                assert!(
                    account.email == test_email,
                    "account email in db should be email from event"
                );
                assert!(
                    account.password != test_pass,
                    "account pasword in db shouldn't match event's due to hashing"
                );
                assert!(
                    account.created >= start_time && account.created <= end_time,
                    "account creation time in db should be recent"
                );
                assert!(
                    account.last_login >= start_time && account.last_login <= end_time,
                    "account last login time in db should be recent"
                );
            }
            _ => panic!("account does not exist in store after registration"),
        }
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
        assert!(
            matches!(
                &effects[0],
                ServerEffect::Account(account::ServerEffect::SignInSuccess { email }) if email == test_email
            ),
            "sign in should produce SignInSuccess with correct email"
        );

        // Verify last_login was updated in the db
        let data = state
            .db
            .account_store
            .accounts
            .get(test_email.as_bytes())
            .unwrap()
            .expect("account should exist after sign in");
        let account = rmp_serde::from_slice::<Account>(&data).unwrap();
        assert!(
            account.last_login >= sign_in_time && account.last_login <= after_sign_in,
            "last_login should be updated to sign in time"
        );
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
