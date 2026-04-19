use std::{
    ops::Bound,
    sync::atomic::{AtomicU64, Ordering},
};

use common::events;
use sled::{Tree, transaction::TransactionalTree};
use tracing::debug;

use crate::{
    db::{DbKey, EventStore},
    error::AppResult,
};

pub struct AppEventStore {
    pub events: Tree,
    pub cursor: Tree,
    pub next_id: AtomicU64,
}

impl AppEventStore {
    pub fn set_cursor(&self, tx_cursor: &TransactionalTree, event_id: &DbKey) -> AppResult<()> {
        tx_cursor.insert("event_id", event_id)?;
        Ok(())
    }

    fn id_to_bytes(id: u64) -> [u8; 8] {
        id.to_be_bytes()
    }

    pub fn get_cursor(&self) -> AppResult<Option<DbKey>> {
        let event = self.cursor.get("event_id")?;
        Ok(event)
    }

    pub fn restore_next_id(events: &Tree) -> u64 {
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
    type Event = events::ServerEventWrapped;

    fn write_event(&self, ev: &Self::Event) -> AppResult<DbKey> {
        let bytes = rmp_serde::to_vec(ev)?;
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let key = Self::id_to_bytes(id);
        self.events.insert(key, bytes.as_slice())?;

        Ok(DbKey::from(&key))
    }

    fn unprocessed_events(
        &self,
    ) -> AppResult<impl Iterator<Item = AppResult<(DbKey, Self::Event)>>> {
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
            let event = rmp_serde::from_slice::<events::ServerEventWrapped>(&value)?;
            Ok((key, event))
        }))
    }
}
