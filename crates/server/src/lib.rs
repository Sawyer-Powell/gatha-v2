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
    pub tls_cert: String,
    pub tls_key: String,
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
            tls_cert: env::var("TLS_CERT").context("TLS_CERT not set")?,
            tls_key: env::var("TLS_KEY").context("TLS_KEY not set")?,
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

    // Intercept whoami event
    if let ServerEvent::WhoAmI = event.event {
        let empty_headers = header::HeaderMap::new();
        match event.auth {
            Some(auth) => {
                // Verify the account still exists in the DB
                match state
                    .db
                    .account_store
                    .get_by_id(auth.account_id())
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
                {
                    Some(account) => {
                        let effect = ServerEffect::WhoAmI {
                            email: account.email,
                        };
                        return Ok((empty_headers, Json(vec![effect])));
                    }
                    None => {
                        return Ok((empty_headers, Json(vec![ServerEffect::SessionExpired])));
                    }
                }
            }
            None => {
                return Ok((empty_headers, Json(vec![ServerEffect::SessionExpired])));
            }
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
    let sign_in = effects.iter().find_map(|effect| match effect {
        ServerEffect::Account(account::ServerEffect::SignInSuccess { account_id, email }) => {
            Some((*account_id, email.clone()))
        }
        _ => None,
    });

    let mut response_headers = header::HeaderMap::new();
    if let Some((account_id, email)) = sign_in {
        let auth = Auth::new(
            account_id,
            email,
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

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod test {
    use axum::body::Body;
    use axum::http::{Request, StatusCode, header};
    use axum::routing::post;
    use axum::Router;
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    use common::events::*;

    use crate::testing::spin_up;

    fn app() -> Router {
        let state = spin_up().unwrap();
        Router::new()
            .route("/ev", post(super::handle_event))
            .with_state(state)
    }

    fn json_request(body: &ServerEventWrapped) -> Request<Body> {
        Request::builder()
            .method("POST")
            .uri("/ev")
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(serde_json::to_string(body).unwrap()))
            .unwrap()
    }

    fn register_event(email: &str, password: &str) -> ServerEventWrapped {
        ServerEventWrapped {
            auth: None,
            event: ServerEvent::Account(account::ServerEvent::Register {
                email: email.into(),
                password: password.into(),
            }),
        }
    }

    fn whoami_event() -> ServerEventWrapped {
        ServerEventWrapped {
            auth: None,
            event: ServerEvent::WhoAmI,
        }
    }

    /// Extract the auth_token cookie value from a Set-Cookie header
    fn extract_set_cookie(response: &axum::http::Response<Body>) -> Option<String> {
        response
            .headers()
            .get(header::SET_COOKIE)?
            .to_str()
            .ok()?
            .split(';')
            .next()?
            .strip_prefix("auth_token=")
            .map(|s| s.to_string())
    }

    #[tokio::test]
    async fn test_registration_sets_auth_cookie() {
        let app = app();

        let response = app
            .oneshot(json_request(&register_event("test@example.com", "testpassword")))
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        // Should have a Set-Cookie header with auth_token
        let cookie = extract_set_cookie(&response);
        assert!(cookie.is_some(), "registration should set an auth_token cookie");

        // Cookie should be non-empty and decodable
        let token = cookie.unwrap();
        assert!(!token.is_empty());

        // Verify the token decrypts to the correct email
        let auth = crate::auth::decrypt_auth(&token, &[0x00; 32]).unwrap();
        assert_eq!(auth.email(), "test@example.com");
        assert!(!auth.is_expired());
    }

    #[tokio::test]
    async fn test_whoami_with_valid_cookie() {
        let app = app();

        // First, register to get an auth cookie
        let register_response = app
            .clone()
            .oneshot(json_request(&register_event("whoami@example.com", "testpassword")))
            .await
            .unwrap();

        let token = extract_set_cookie(&register_response)
            .expect("registration should set auth cookie");

        // Now send a WhoAmI request with the cookie
        let whoami_request = Request::builder()
            .method("POST")
            .uri("/ev")
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::COOKIE, format!("auth_token={}", token))
            .body(Body::from(serde_json::to_string(&whoami_event()).unwrap()))
            .unwrap();

        let response = app.oneshot(whoami_request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let effects: Vec<ServerEffect> = serde_json::from_slice(&body).unwrap();

        assert_eq!(effects.len(), 1);
        assert!(
            matches!(&effects[0], ServerEffect::WhoAmI { email } if email == "whoami@example.com"),
            "whoami should return the email from the auth token"
        );
    }

    #[tokio::test]
    async fn test_whoami_without_cookie() {
        let app = app();

        let response = app
            .oneshot(json_request(&whoami_event()))
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let effects: Vec<ServerEffect> = serde_json::from_slice(&body).unwrap();

        assert_eq!(effects.len(), 1);
        assert!(
            matches!(&effects[0], ServerEffect::SessionExpired),
            "whoami without cookie should return SessionExpired"
        );
    }
}
