use std::sync::Arc;

use tokio::sync::{mpsc, oneshot};
use tracing::warn;

use common::events::*;
use common::traits::*;

use crate::{
    app_db::AppDb,
    error::{AppError, AppResult},
};

struct EventMessage {
    event: ServerEvent,
    waiter: oneshot::Sender<Vec<ServerEffect>>,
    caller_span: tracing::Span,
}

pub struct EventBus {
    sender: mpsc::UnboundedSender<EventMessage>,
}

impl EventBus {
    pub fn new(db: Arc<AppDb>) -> Self {
        let (sender, mut receiver) = mpsc::unbounded_channel::<EventMessage>();

        tokio::spawn(async move {
            while let Some(msg) = receiver.recv().await {
                let _root =
                    tracing::info_span!(parent: &msg.caller_span, "event_loop.process").entered();

                let event_id = {
                    let _span = tracing::info_span!("event_bus.write_event").entered();
                    db.event_store.write_event(&msg.event)
                };

                let event_id = match event_id {
                    Ok(id) => id,
                    Err(e) => {
                        warn!("Failed to write event: {:?}", e);
                        continue;
                    }
                };

                let effects = {
                    let _span = tracing::info_span!("event_bus.process_event").entered();
                    db.process_event(&event_id, &msg.event, &db.event_store)
                };

                match effects {
                    Ok(effects) => {
                        if let Err(effects) = msg.waiter.send(effects) {
                            warn!("Could not respond with effects: {:?}", effects);
                        }
                    }
                    Err(e) => {
                        warn!("Failed to process event: {:?}", e);
                    }
                }
            }
        });

        Self { sender }
    }

    pub fn submit(&self, event: &ServerEvent) -> AppResult<oneshot::Receiver<Vec<ServerEffect>>> {
        let (waiter, receiver) = oneshot::channel();
        let caller_span = tracing::Span::current();

        self.sender
            .send(EventMessage {
                event: event.clone(),
                waiter,
                caller_span,
            })
            .map_err(|_| AppError::EventBusClosed)?;

        Ok(receiver)
    }
}
