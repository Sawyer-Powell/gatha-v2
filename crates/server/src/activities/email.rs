use serde::{Deserialize, Serialize};

use crate::activities::ActivityCtx;
use crate::db::activity_db::HistoryEntry;
use crate::error::AppResult;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum EmailHistory {
    /// Init: the email that was requested.
    Requested {
        to: String,
        subject: String,
        body: String,
    },
    /// Intermediary: the provider accepted the email.
    Sent { provider_id: String },
    /// Completion.
    Completed,
    /// Error.
    Failed { reason: String },
}

#[async_trait::async_trait]
pub trait EmailProvider: Send + Sync {
    /// Send an email, returning a provider-specific message id.
    async fn send(&self, to: &str, subject: &str, body: &str) -> AppResult<String>;
}

/// MVP provider that just logs. Swap for a real one (e.g. Resend over reqwest).
pub struct LogEmailProvider;

#[async_trait::async_trait]
impl EmailProvider for LogEmailProvider {
    async fn send(&self, to: &str, subject: &str, body: &str) -> AppResult<String> {
        tracing::info!(to, subject, body, "sending email");
        Ok(format!("log-{}", chrono::Utc::now().timestamp_millis()))
    }
}

/// Reads existing history so a retry skips a send that already happened, then
/// returns the final history entry for the bus to record.
pub async fn run(
    ctx: &mut ActivityCtx<EmailHistory>,
    provider: &dyn EmailProvider,
) -> HistoryEntry<EmailHistory> {
    let already_sent = ctx
        .history()
        .iter()
        .any(|entry| matches!(entry.body, EmailHistory::Sent { .. }));

    if !already_sent {
        let Some(EmailHistory::Requested { to, subject, body }) =
            ctx.history().first().map(|entry| entry.body.clone())
        else {
            return HistoryEntry::error(EmailHistory::Failed {
                reason: "activity has no email request".into(),
            });
        };

        let provider_id = match provider.send(&to, &subject, &body).await {
            Ok(id) => id,
            Err(e) => {
                return HistoryEntry::error(EmailHistory::Failed {
                    reason: e.to_string(),
                });
            }
        };

        // Persist the send before completing so a crash + retry won't double-send.
        if let Err(e) = ctx.record(EmailHistory::Sent { provider_id }) {
            return HistoryEntry::error(EmailHistory::Failed {
                reason: e.to_string(),
            });
        }
    }

    HistoryEntry::completion(EmailHistory::Completed)
}
