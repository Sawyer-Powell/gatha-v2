use std::sync::Arc;

use anyhow::Context;
use client::ServerEventDispatcher;
use client::error::ClientResult;
use common::events::{Auth, ServerEffect, ServerEvent, ServerEventWrapped};
use server::db::app_db::AppDb;
use server::event_bus::EventBus;
use server::{AppConfig, AppState, DbConfig};

pub struct TestDispatcher {
    pub state: Arc<AppState>,
    // Auth is provided on the dispatcher, can be mutated in tests to change user information
    // Note that auth information is not stored as a session serverside, this mocks real
    // verified authoritiative auth information on requests.
    pub auth: Option<Auth>,
}

impl TestDispatcher {
    pub fn new() -> ClientResult<Self> {
        let config = AppConfig {
            db: DbConfig::Temporary,
            otel_endpoint: None,
            server_address: "0.0.0.0:0".to_string(),
            auth_secret: [0x00; 32],
        };

        let db = Arc::new(AppDb::new(&config)?);

        let state = Arc::new(AppState {
            event_bus: EventBus::new(db.clone()),
            db,
            auth_secret: config.auth_secret,
        });

        Ok(Self { state, auth: None })
    }
}

impl ServerEventDispatcher for TestDispatcher {
    async fn dispatch(&self, event: &ServerEvent) -> ClientResult<Vec<ServerEffect>> {
        let receiver = self.state.event_bus.submit(&ServerEventWrapped {
            event: event.clone(),
            auth: self.auth.clone(),
        })?;
        let effects = receiver
            .await
            .context("Failed to receive effects from event bus")?;
        Ok(effects)
    }
}
