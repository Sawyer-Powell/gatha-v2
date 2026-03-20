use std::ops::Bound;
use std::sync::atomic::{AtomicU64, Ordering};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sled::transaction::{
    ConflictableTransactionError, TransactionError, Transactional, TransactionalTree,
};
use sled::{IVec, Tree};
use tracing::debug;

use crate::error::AppResult;
use crate::{AppConfig, DbConfig};
use common::events::{self, account};
use common::traits::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct Account {
    username: String,
    password: String,
    created: DateTime<Utc>,
    last_login: Option<DateTime<Utc>>,
}

pub struct AccountStore {
    accounts: Tree,
}

impl AccountStore {
    fn register(
        &self,
        username: &str,
        password: &str,
        tx_accounts: &TransactionalTree,
    ) -> AppResult<()> {
        let account = Account {
            username: username.into(),
            password: password.into(),
            created: Utc::now(),
            last_login: None,
        };

        tx_accounts.insert(username.as_bytes(), rmp_serde::to_vec(&account)?)?;

        Ok(())
    }

    fn sign_in(
        &self,
        username: &str,
        password: &str,
        tx_accounts: &TransactionalTree,
    ) -> AppResult<bool> {
        let account = tx_accounts.get(username.as_bytes())?;

        let Some(account) = account else {
            return Ok(false);
        };

        let account = &*account;
        let mut account = rmp_serde::from_slice::<Account>(account)?;

        let valid = account.username == username && account.password == password;

        if valid {
            account.last_login = Some(Utc::now());
            tx_accounts.insert(username.as_bytes(), rmp_serde::to_vec(&account)?)?;
        }

        Ok(valid)
    }
}

impl EventProcessor for AccountStore {
    type Event = account::ServerEvent;
    type EventId = IVec;
    type Effect = account::ServerEffect;
    type EventStore = AppEventStore;
    type Result<T> = AppResult<T>;

    #[tracing::instrument(name = "AccountStore.process_event", skip_all)]
    fn process_event(
        &self,
        event_id: &Self::EventId,
        event: &Self::Event,
        store: &AppEventStore,
    ) -> AppResult<Vec<Self::Effect>> {
        let effects = transaction(
            &(&self.accounts, &store.cursor),
            |(tx_accounts, tx_cursor)| {
                let mut effects: Vec<Self::Effect> = Vec::new();

                match event {
                    account::ServerEvent::SignIn { username, password } => {
                        let success = self.sign_in(username, password, tx_accounts)?;
                        if success {
                            effects.push(account::ServerEffect::SignInSuccess);
                        } else {
                            effects.push(account::ServerEffect::SignInFailed);
                        }
                    }
                    account::ServerEvent::Register { username, password } => {
                        self.register(username, password, tx_accounts)?;
                        effects.push(account::ServerEffect::RegistrationOk);
                    }
                }

                store.set_cursor(tx_cursor, event_id)?;

                Ok(effects)
            },
        )?;

        Ok(effects)
    }
}

pub fn transaction<T: Transactional<anyhow::Error>, R>(
    transactee: &T,
    f: impl Fn(&T::View) -> anyhow::Result<R>,
) -> anyhow::Result<R> {
    transactee
        .transaction(|view| f(view).map_err(ConflictableTransactionError::Abort))
        .map_err(|e| match e {
            TransactionError::Abort(anyhow_err) => anyhow_err,
            TransactionError::Storage(sled_err) => anyhow::Error::from(sled_err),
        })
}

pub struct AppEventStore {
    events: Tree,
    cursor: Tree,
    next_id: AtomicU64,
}

impl AppEventStore {
    pub fn set_cursor(&self, tx_cursor: &TransactionalTree, event_id: &IVec) -> AppResult<()> {
        tx_cursor.insert("event_id", event_id)?;
        Ok(())
    }

    fn id_to_bytes(id: u64) -> [u8; 8] {
        id.to_be_bytes()
    }

    pub fn get_cursor(&self) -> AppResult<Option<IVec>> {
        let event = self.cursor.get("event_id")?;
        Ok(event)
    }

    fn restore_next_id(events: &Tree) -> u64 {
        match events.last() {
            Ok(Some((key, _))) => {
                let bytes: [u8; 8] = key.as_ref().try_into().unwrap_or([0; 8]);
                u64::from_be_bytes(bytes) + 1
            }
            _ => 0,
        }
    }
}

impl EventStore for AppEventStore {
    type EventId = IVec;
    type Event = events::ServerEvent;
    type Result<T> = AppResult<T>;

    fn write_event(&self, ev: &Self::Event) -> AppResult<IVec> {
        let bytes = rmp_serde::to_vec(ev)?;
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let key = Self::id_to_bytes(id);
        self.events.insert(key, bytes.as_slice())?;

        Ok(IVec::from(&key))
    }

    fn unprocessed_events(
        &self,
    ) -> AppResult<impl Iterator<Item = AppResult<(Self::EventId, Self::Event)>>> {
        let last_processed = self.cursor.get("event_id")?;
        let event_count = self.events.len();
        debug!(?last_processed, event_count, "Reading unprocessed events");

        let iter = match last_processed {
            Some(ref id) => {
                debug!(cursor_bytes = ?id.as_ref(), "Scanning from cursor (excluded)");
                self.events
                    .range((Bound::Excluded(id.clone()), Bound::Unbounded))
            }
            None => {
                debug!("No cursor, scanning from beginning");
                self.events.range::<&[u8], _>(..)
            }
        };

        Ok(iter.map(|item| {
            let (key, value) = item?;
            let event = rmp_serde::from_slice::<events::ServerEvent>(&value)?;
            Ok((key, event))
        }))
    }
}

pub struct AppDb {
    pub db: sled::Db,
    pub event_store: AppEventStore,
    pub account_store: AccountStore,
}

impl AppDb {
    pub fn new(config: &AppConfig) -> AppResult<Self> {
        let db_config = match &config.db {
            DbConfig::Temporary => sled::Config::default().temporary(true),
            DbConfig::Persistent { path } => sled::Config::default().path(path),
        };

        let db = db_config.open()?;

        let events = db.open_tree("events")?;
        let next_id = AppEventStore::restore_next_id(&events);

        Ok(Self {
            event_store: AppEventStore {
                events,
                cursor: db.open_tree("event_cursor")?,
                next_id: AtomicU64::new(next_id),
            },
            account_store: AccountStore {
                accounts: db.open_tree("accounts")?,
            },
            db,
        })
    }
}

impl EventProcessor for AppDb {
    type Event = events::ServerEvent;
    type EventId = IVec;
    type Effect = events::ServerEffect;
    type EventStore = AppEventStore;
    type Result<T> = AppResult<T>;

    #[tracing::instrument(name = "AppDb.process_event", skip_all)]
    fn process_event(
        &self,
        event_id: &Self::EventId,
        event: &Self::Event,
        store: &AppEventStore,
    ) -> AppResult<Vec<Self::Effect>> {
        let effects = match event {
            events::ServerEvent::Account(account_event) => self
                .account_store
                .process_event(event_id, account_event, store)?
                .into_iter()
                .map(events::ServerEffect::Account)
                .collect(),
        };

        Ok(effects)
    }
}
