use std::sync::Arc;

use crate::{
    AppConfig, AppState, DbConfig, db::app_db::AppDb, error::AppResult, event_bus::EventBus,
};
use anyhow::Context;
use common::events::*;

/// Spins up the event loop and returns a usable
/// AppState
pub fn spin_up() -> AppResult<Arc<AppState>> {
    let config = AppConfig {
        db: DbConfig::Temporary,
        otel_endpoint: None,
        server_address: "0.0.0.0:3000".to_string(),
        auth_secret: [0x00; 32],
    };

    let db = Arc::new(AppDb::new(&config)?);

    let app_state = Arc::new(AppState {
        event_bus: EventBus::new(db.clone()),
        db,
        auth_secret: config.auth_secret,
    });

    Ok(app_state)
}

pub async fn dispatch_event(
    app_state: &Arc<AppState>,
    event: ServerEventWrapped,
) -> AppResult<Vec<ServerEffect>> {
    let receiver = app_state.event_bus.submit(&event)?;
    let effects = receiver
        .await
        .context("Failed to receive effects from event bus")?;
    Ok(effects)
}
