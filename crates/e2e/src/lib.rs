use std::sync::Arc;

use anyhow::Context;
use client::ServerEventDispatcher;
use client::error::ClientResult;
use common::events::{ServerEffect, ServerEvent};
use server::app_db::AppDb;
use server::event_bus::EventBus;
use server::{AppConfig, AppState, DbConfig};

pub struct TestDispatcher {
    pub state: Arc<AppState>,
}

impl TestDispatcher {
    pub fn new() -> ClientResult<Self> {
        let config = AppConfig {
            db: DbConfig::Temporary,
            otel_endpoint: None,
            server_address: "0.0.0.0:0".to_string(),
        };

        let db = Arc::new(AppDb::new(&config)?);

        let state = Arc::new(AppState {
            event_bus: EventBus::new(db.clone()),
            db,
        });

        Ok(Self { state })
    }
}

impl ServerEventDispatcher for TestDispatcher {
    async fn dispatch(&self, event: &ServerEvent) -> ClientResult<Vec<ServerEffect>> {
        let receiver = self.state.event_bus.submit(event)?;
        let effects = receiver
            .await
            .context("Failed to receive effects from event bus")?;
        Ok(effects)
    }
}
