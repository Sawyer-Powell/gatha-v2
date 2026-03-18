mod app_db;
mod error;
mod event_bus;
mod testing;

use std::sync::Arc;

use axum::extract::State;
use axum::{Json, Router, routing::post};

use crate::app_db::AppDb;
use crate::error::{AppError, AppResult};
use crate::event_bus::EventBus;
use common::events::*;

pub enum DbConfig {
    Temporary,
    Persistent { path: String },
}

pub struct AppConfig {
    pub db: DbConfig,
}

pub struct AppState {
    pub db: AppDb,
    pub event_bus: EventBus,
}

async fn handle_event(
    State(state): State<Arc<AppState>>,
    Json(event): Json<AppEvent>,
) -> AppResult<Json<Vec<AppEffect>>> {
    let receiver = tokio::task::block_in_place(|| state.event_bus.submit(&event, &state.db))?;
    let effects = receiver.await.map_err(|_| AppError::EffectChannelClosed)?;
    Ok(Json(effects))
}

#[tokio::main]
async fn main() -> AppResult<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "gatha_v2=debug".parse().unwrap()),
        )
        .init();

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

    let app = Router::new()
        .route("/ev", post(handle_event))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Listening on 0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

#[cfg(test)]
mod test {
    use common::events::account::{AccountEffect, AccountEvent};

    use crate::testing::{dispatch_event, spin_up};

    use super::*;

    #[tokio::test]
    async fn test_register_and_sign_in() {
        let state = spin_up().unwrap();

        let effects = dispatch_event(
            &state,
            AppEvent::AccountEvent(AccountEvent::Register {
                username: "alice".into(),
                password: "password123".into(),
            }),
        )
        .await
        .unwrap();

        assert_eq!(effects.len(), 1);
        assert!(matches!(
            effects[0],
            AppEffect::AccountEffect(AccountEffect::RegistrationOk)
        ));
    }
}
