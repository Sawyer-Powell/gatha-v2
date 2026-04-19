pub mod auth;
pub mod db;
pub mod error;
pub mod event_bus;
pub mod testing;

use std::sync::Arc;

use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;
use axum::http::header;
use axum::response::IntoResponse;
use chrono::{Duration, Utc};

use crate::auth::{decrypt_auth, encrypt_auth};
use crate::db::app_db::AppDb;
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
    pub auth_secret: [u8; 32],
}

impl AppConfig {
    pub fn from_env() -> AppResult<Self> {
        use anyhow::Context;
        use std::env;

        dotenvy::dotenv().ok();

        let auth_secret_hex = env::var("AUTH_SECRET")
            .context("AUTH_SECRET not set (expected 64 hex chars for 32 bytes)")?;
        let auth_secret_bytes =
            hex::decode(&auth_secret_hex).context("AUTH_SECRET must be valid hex")?;
        let auth_secret: [u8; 32] = auth_secret_bytes
            .try_into()
            .map_err(|_| anyhow::anyhow!("AUTH_SECRET must be exactly 32 bytes (64 hex chars)"))?;

        Ok(Self {
            db: match env::var("DB_PATH").ok() {
                Some(path) => DbConfig::Persistent { path },
                None => DbConfig::Temporary,
            },
            server_address: env::var("SERVER_ADDR").context("SERVER_ADDR not set")?,
            otel_endpoint: env::var("OTEL_ENDPOINT").ok(),
            auth_secret,
        })
    }
}

pub struct AppState {
    pub db: Arc<AppDb>,
    pub event_bus: EventBus,
    pub auth_secret: [u8; 32],
}

const AUTH_TOKEN_COOKIE: &str = "auth_token";
const AUTH_TOKEN_EXPIRY_HOURS: i64 = 24;

fn extract_cookie<'a>(headers: &'a header::HeaderMap, name: &str) -> Option<&'a str> {
    headers
        .get(header::COOKIE)?
        .to_str()
        .ok()?
        .split(';')
        .find_map(|pair| {
            let pair = pair.trim();
            let (key, value) = pair.split_once('=')?;
            (key.trim() == name).then_some(value.trim())
        })
}

#[tracing::instrument(skip(state, headers))]
pub async fn handle_event(
    State(state): State<Arc<AppState>>,
    headers: header::HeaderMap,
    Json(mut event): Json<ServerEventWrapped>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Decode auth from cookie if present
    if let Some(token) = extract_cookie(&headers, AUTH_TOKEN_COOKIE) {
        match decrypt_auth(token, &state.auth_secret) {
            Ok(auth) if !auth.is_expired() => {
                event.set_auth(auth);
            }
            _ => {} // expired or invalid token — proceed without auth
        }
    }

    let receiver = state
        .event_bus
        .submit(&event)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let effects = receiver
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // If sign-in succeeded, set the auth cookie
    let sign_in_success_email = effects.iter().find_map(|effect| match effect {
        ServerEffect::Account(account::ServerEffect::SignInSuccess { email }) => Some(email),
        _ => None,
    });

    let mut response_headers = header::HeaderMap::new();
    if let Some(email) = sign_in_success_email {
        let auth = Auth::new(
            email.clone(),
            Utc::now() + Duration::hours(AUTH_TOKEN_EXPIRY_HOURS),
        );
        let token = encrypt_auth(&auth, &state.auth_secret)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        let cookie = format!(
            "{}={}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age={}",
            AUTH_TOKEN_COOKIE,
            token,
            AUTH_TOKEN_EXPIRY_HOURS * 3600,
        );
        response_headers.insert(
            header::SET_COOKIE,
            cookie.parse().map_err(|e: header::InvalidHeaderValue| {
                (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
            })?,
        );
    }

    Ok((response_headers, Json(effects)))
}
