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
    pub db: Arc<AppDb>,
    pub event_bus: EventBus,
}

#[tracing::instrument(skip(state))]
async fn handle_event(
    State(state): State<Arc<AppState>>,
    Json(event): Json<ServerEvent>,
) -> AppResult<Json<Vec<ServerEffect>>> {
    let receiver = state.event_bus.submit(&event)?;
    let effects = receiver.await.map_err(|_| AppError::EffectChannelClosed)?;
    Ok(Json(effects))
}

fn init_tracing() {
    use opentelemetry::trace::TracerProvider;
    use opentelemetry_otlp::WithExportConfig;
    use tracing_subscriber::layer::SubscriberExt;
    use tracing_subscriber::util::SubscriberInitExt;

    let otlp_exporter = opentelemetry_otlp::SpanExporter::builder()
        .with_tonic()
        .with_endpoint("http://localhost:4317")
        .build()
        .expect("failed to create OTLP exporter");

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
    let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);

    let fmt_layer = tracing_subscriber::fmt::layer();
    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "server=debug".parse().unwrap());

    tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt_layer)
        .with(otel_layer)
        .init();
}

#[tokio::main]
async fn main() -> AppResult<()> {
    init_tracing();

    let config = AppConfig {
        db: DbConfig::Temporary,
    };

    let db = Arc::new(AppDb::new(&config)?);

    let app_state = Arc::new(AppState {
        event_bus: EventBus::new(db.clone()),
        db,
    });

    let app = Router::new()
        .route("/ev", post(handle_event))
        .with_state(app_state);

    let socket = tokio::net::TcpSocket::new_v4().unwrap();
    socket.set_reuseaddr(true).unwrap();
    socket.bind("0.0.0.0:3000".parse().unwrap()).unwrap();
    let listener = socket.listen(1024).unwrap();
    println!("Listening on 0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

#[cfg(test)]
mod test {
    use common::events::{ServerEffect, ServerEvent, account};

    use crate::testing::{dispatch_event, spin_up};

    #[tokio::test]
    async fn test_register_and_sign_in() {
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
