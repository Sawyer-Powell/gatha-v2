use std::sync::atomic::AtomicU64;

use common::events;

use super::{DbKey, EventProcessor, account_store::AccountStore, event_store::AppEventStore};
use crate::{AppConfig, DbConfig, error::AppResult};

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
    type Event = events::ServerEventWrapped;
    type Effect = events::ServerEffect;
    type EventStore = AppEventStore;

    #[tracing::instrument(name = "AppDb.process_event", skip_all)]
    fn process_event(
        &self,
        event_id: &DbKey,
        event: &Self::Event,
        store: &AppEventStore,
    ) -> AppResult<Vec<Self::Effect>> {
        let effects = match &event.event {
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
