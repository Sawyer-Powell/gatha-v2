#![cfg(test)]
use std::sync::Arc;

use crate::{
    AppConfig, AppState, DbConfig,
    app_db::AppDb,
    error::{AppError, AppResult},
    event_bus::EventBus,
};
use common::events::*;

/// Spins up the event loop and returns a usable
/// AppState
pub fn spin_up() -> AppResult<Arc<AppState>> {
    let config = AppConfig {
        db: DbConfig::Temporary,
    };

    let db = Arc::new(AppDb::new(&config)?);

    let app_state = Arc::new(AppState {
        event_bus: EventBus::new(db.clone()),
        db,
    });

    Ok(app_state)
}

pub async fn dispatch_event(
    app_state: &Arc<AppState>,
    event: ServerEvent,
) -> AppResult<Vec<ServerEffect>> {
    let receiver = app_state.event_bus.submit(&event)?;
    let effects = receiver.await.map_err(|_| AppError::EffectChannelClosed)?;
    Ok(effects)
}
