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

    let app_state = Arc::new(AppState {
        db: AppDb::new(&config)?,
        event_bus: EventBus::new(),
    });

    // Spawn the event loop on a dedicated OS thread
    let app_state_cloned = app_state.clone();
    std::thread::spawn(move || {
        if let Err(e) = app_state_cloned.event_bus.event_loop(&app_state_cloned.db) {
            panic!("Event processor crashed: {e}");
        }
    });

    Ok(app_state)
}

pub async fn dispatch_event(
    app_state: &Arc<AppState>,
    event: ServerEvent,
) -> AppResult<Vec<ServerEffect>> {
    let receiver = app_state.event_bus.submit(&event, &app_state.db)?;
    let effects = receiver.await.map_err(|_| AppError::EffectChannelClosed)?;
    Ok(effects)
}
