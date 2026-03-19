use std::{
    collections::HashMap,
    sync::{Condvar, Mutex},
};

use sled::IVec;
use tokio::sync::oneshot;
use tracing::warn;

use common::events::*;
use common::traits::*;

use crate::{
    app_db::AppDb,
    error::{AppError, AppResult},
};

type WaiterMap = HashMap<IVec, oneshot::Sender<Vec<ServerEffect>>>;

pub struct EventBus {
    pub waiters: Mutex<WaiterMap>,
    pub condvar: Condvar,
    pub latest_event_id: Mutex<Option<IVec>>,
}

impl EventBus {
    pub fn new() -> Self {
        Self {
            waiters: Mutex::new(HashMap::new()),
            condvar: Condvar::new(),
            latest_event_id: Mutex::new(None),
        }
    }

    pub fn submit(
        &self,
        event: &ServerEvent,
        db: &AppDb,
    ) -> AppResult<oneshot::Receiver<Vec<ServerEffect>>> {
        let event_id = db.event_store.write_event(event)?;
        let _span = tracing::info_span!("event_bus.submit").entered();
        let (sender, receiver) = oneshot::channel();

        self.waiters
            .lock()
            .map_err(|e| AppError::PoisonedLock(e.to_string()))?
            .insert(event_id.clone(), sender);

        *self
            .latest_event_id
            .lock()
            .map_err(|e| AppError::PoisonedLock(e.to_string()))? = Some(event_id.clone());

        self.condvar.notify_one();

        Ok(receiver)
    }

    pub fn event_loop(&self, db: &AppDb) -> AppResult<()> {
        loop {
            // First compare our event cursor to the latest event we've received
            // If the latest event is not equal to our event cursor, that means
            // new events have been written, and need processing. If not, we park
            // the thread until something has been written.
            {
                let event_cursor = db.event_store.get_cursor()?;
                let mut mutex_latest_id = self
                    .latest_event_id
                    .lock()
                    .map_err(|e| AppError::PoisonedLock(e.to_string()))?;
                // Use a while loop here since condvar can have spurious wake ups
                // even when value we're blocked on hasn't changed
                while *mutex_latest_id == event_cursor {
                    mutex_latest_id = self
                        .condvar
                        .wait(mutex_latest_id)
                        .map_err(|e| AppError::PoisonedLock(e.to_string()))?;
                }
            }

            for event in db.event_store.unprocessed_events()? {
                let (event_id, event) = event?;
                let effects = {
                    let _span = tracing::info_span!("event_loop.process").entered();
                    db.process_event(&event_id, &event, &db.event_store)?
                };

                // Unblock waiter
                let waiter = match self
                    .waiters
                    .lock()
                    .map_err(|e| AppError::PoisonedLock(e.to_string()))?
                    .remove(&event_id)
                {
                    Some(waiter) => waiter,
                    None => {
                        warn!(
                            "Could not find event id in EventBus waiters: {:?}",
                            event_id
                        );
                        continue;
                    }
                };

                // Send message over our waiter
                if let Err(effects) = waiter.send(effects) {
                    warn!(
                        "Could not respond with effects over waiter for event id {:?}: {:?}",
                        event_id, effects
                    );
                }
            }
        }
    }
}
