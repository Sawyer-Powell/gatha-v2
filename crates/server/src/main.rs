use std::sync::Arc;

use anyhow::Context;
use axum::{Router, routing::post};
use axum_server::tls_rustls::RustlsConfig;
use opentelemetry::trace::TracerProvider;
use opentelemetry_otlp::WithExportConfig;
use tracing::instrument;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_tree::HierarchicalLayer;

use server::db::app_db::AppDb;
use server::error::AppResult;
use server::event_bus::EventBus;
use server::{AppConfig, AppState, handle_event};

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
        auth_secret: config.auth_secret,
    });

    let app = Router::new()
        .route("/ev", post(handle_event))
        .with_state(app_state);

    let tls_config = RustlsConfig::from_pem_file(&config.tls_cert, &config.tls_key)
        .await
        .context("Failed to load TLS certs")?;

    let addr: std::net::SocketAddr = config
        .server_address
        .parse()
        .context("Could not parse address")?;

    println!("Listening on https://{}", addr);
    axum_server::bind_rustls(addr, tls_config)
        .serve(app.into_make_service())
        .await
        .context("Critical error while serving app")?;

    Ok(())
}
