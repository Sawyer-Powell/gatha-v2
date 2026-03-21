mod app_db;
mod error;
mod event_bus;
mod testing;

use std::env;
use std::sync::Arc;

use anyhow::Context;
use axum::extract::State;
use axum::http::StatusCode;
use axum::{Json, Router, routing::post};
use opentelemetry::trace::TracerProvider;
use opentelemetry_otlp::WithExportConfig;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

use tracing::instrument;
use tracing_tree::HierarchicalLayer;

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
async fn handle_event(
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

fn init_tracing(config: &AppConfig) -> AppResult<()> {
    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        match "server=debug".parse() {
            Ok(filter) => filter,
            Err(_) => unreachable!("failed to parse server=debug filter"),
        }
    });

    let tree_layer = HierarchicalLayer::new(2)
        .with_targets(true)
        .with_ansi(true)
        .with_bracketed_fields(false);

    let otel_layer = if let Some(otel_endpoint) = config.otel_endpoint.as_ref() {
        let otlp_exporter = opentelemetry_otlp::SpanExporter::builder()
            .with_tonic()
            .with_endpoint(otel_endpoint)
            .build()?;

        let resource = opentelemetry_sdk::Resource::builder()
            .with_service_name("gatha-server")
            .build();

        let batch_processor = opentelemetry_sdk::trace::BatchSpanProcessor::builder(otlp_exporter)
            .with_batch_config(
                opentelemetry_sdk::trace::BatchConfigBuilder::default()
                    .with_scheduled_delay(std::time::Duration::from_millis(500))
                    .build(),
            )
            .build();

        let tracer_provider = opentelemetry_sdk::trace::SdkTracerProvider::builder()
            .with_span_processor(batch_processor)
            .with_resource(resource)
            .build();

        let tracer = tracer_provider.tracer("gatha-server");
        Some(tracing_opentelemetry::layer().with_tracer(tracer))
    } else {
        None
    };

    tracing_subscriber::registry()
        .with(env_filter)
        .with(tree_layer)
        .with(otel_layer)
        .init();

    Ok(())
}

#[tokio::main]
#[instrument(err)]
async fn main() -> AppResult<()> {
    let config = AppConfig::from_env()?;
    init_tracing(&config)?;

    let db = Arc::new(AppDb::new(&config)?);

    let app_state = Arc::new(AppState {
        event_bus: EventBus::new(db.clone()),
        db,
    });

    let app = Router::new()
        .route("/ev", post(handle_event))
        .with_state(app_state);

    let socket = tokio::net::TcpSocket::new_v4()?;
    socket.set_reuseaddr(true)?;
    socket
        .bind(
            config
                .server_address
                .parse()
                .context("Could not parse address")?,
        )
        .context("Failed to bind to socket")?;
    let listener = socket.listen(1024).context("Failed to bind to socket")?;
    println!("Listening on {}", config.server_address);
    axum::serve(listener, app)
        .await
        .context("Critical error while serving app")?;

    Ok(())
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod test {
    use common::events::{ServerEffect, ServerEvent, account};
    use tracing_subscriber::layer::SubscriberExt;
    use tracing_subscriber::util::SubscriberInitExt;
    use tracing_tree::HierarchicalLayer;

    use crate::testing::{dispatch_event, spin_up};

    fn init_test_tracing() {
        let filter = tracing_subscriber::EnvFilter::new("server=debug");
        let _ = tracing_subscriber::registry()
            .with(filter)
            .with(
                HierarchicalLayer::new(2)
                    .with_targets(true)
                    .with_bracketed_fields(false),
            )
            .try_init();
    }

    #[tokio::test]
    async fn test_register_and_sign_in() {
        init_test_tracing();

        let state = spin_up().unwrap();

        let effects = dispatch_event(
            &state,
            ServerEvent::Account(account::ServerEvent::Register {
                username: "alice".into(),
                password: "password123".into(),
            }),
        )
        .await
        .unwrap();

        assert_eq!(effects.len(), 1);
        assert!(matches!(
            effects[0],
            ServerEffect::Account(account::ServerEffect::RegistrationOk)
        ));
    }
}
