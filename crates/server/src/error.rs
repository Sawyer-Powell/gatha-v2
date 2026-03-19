use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use sled::transaction::{ConflictableTransactionError, TransactionError};

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("sled error: {0}")]
    Db(#[from] sled::Error),

    #[error("invalid ulid, expected 16 bytes")]
    InvalidKey,

    #[error("postcard serialization error: {0}")]
    PostcardSerialization(#[from] postcard::Error),

    #[error("sled unabortable transaction error: {0}")]
    SledUnabortableTransactionError(#[from] sled::transaction::UnabortableTransactionError),

    #[error("poisoned lock: {0}")]
    PoisonedLock(String),

    #[error("effect channel closed")]
    EffectChannelClosed,

    #[error("event bus closed")]
    EventBusClosed,
}

impl From<TransactionError<AppError>> for AppError {
    fn from(e: TransactionError<AppError>) -> Self {
        match e {
            TransactionError::Abort(app_err) => app_err,
            TransactionError::Storage(sled_err) => AppError::Db(sled_err),
        }
    }
}

impl From<ConflictableTransactionError<AppError>> for AppError {
    fn from(e: ConflictableTransactionError<AppError>) -> Self {
        match e {
            ConflictableTransactionError::Abort(app_err) => app_err,
            ConflictableTransactionError::Storage(sled_err) => AppError::Db(sled_err),
            ConflictableTransactionError::Conflict => {
                unreachable!("sled transaction conflict should be retried internally")
            }
        }
    }
}

pub type AppResult<T> = std::result::Result<T, AppError>;

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()).into_response()
    }
}

pub trait IntoTransactionError<T> {
    fn tx(self) -> Result<T, ConflictableTransactionError<AppError>>;
}

impl<T, E: Into<AppError>> IntoTransactionError<T> for Result<T, E> {
    fn tx(self) -> Result<T, ConflictableTransactionError<AppError>> {
        self.map_err(|e| ConflictableTransactionError::Abort(e.into()))
    }
}
