pub mod app_db;
pub mod error;
pub mod event_bus;
pub mod testing;

use std::sync::Arc;

use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;

use crate::app_db::AppDb;
use crate::error::AppResult;
use crate::event_bus::EventBus;
use common::events::*;

pub enum DbConfig {
    Temporary,
    Persistent { path: String },
}

pub struct AppConfig {
    pub db: DbConfig,
    pub server_address: String,
    pub otel_endpoint: Option<String>,
}

impl AppConfig {
    pub fn from_env() -> AppResult<Self> {
        use anyhow::Context;
        use std::env;

        dotenvy::dotenv().ok();

        Ok(Self {
            db: match env::var("DB_PATH").ok() {
                Some(path) => DbConfig::Persistent { path },
                None => DbConfig::Temporary,
            },
            server_address: env::var("SERVER_ADDR").context("SERVER_ADDR not set")?,
            otel_endpoint: env::var("OTEL_ENDPOINT").ok(),
        })
    }
}

pub struct AppState {
    pub db: Arc<AppDb>,
    pub event_bus: EventBus,
}

#[tracing::instrument(skip(state))]
pub async fn handle_event(
    State(state): State<Arc<AppState>>,
    Json(event): Json<ServerEvent>,
) -> Result<Json<Vec<ServerEffect>>, (StatusCode, String)> {
    let receiver = state
        .event_bus
        .submit(&event)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    let effects = receiver
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(effects))
}
