use std::sync::Arc;

use serde::{Serialize, de::DeserializeOwned};

use crate::db::activity_db::{Activity, ActivityDb, HistoryEntry};
use crate::error::AppResult;

pub mod email;

/// The restrained handle an activity function gets: read prior history and
/// append intermediary steps. The author writes normal imperative code and
/// uses `history()` to skip work already done on a previous attempt.
pub struct ActivityCtx<HistoryVariants> {
    db: Arc<ActivityDb>,
    activity_id: u64,
    history: Vec<HistoryEntry<HistoryVariants>>,
}

impl<HistoryVariants> ActivityCtx<HistoryVariants>
where
    HistoryVariants: Clone + Serialize + DeserializeOwned,
    Activity<HistoryVariants>: Serialize + DeserializeOwned,
{
    pub fn new(db: Arc<ActivityDb>, activity_id: u64) -> AppResult<Self> {
        let history = db
            .get_activity::<HistoryVariants>(activity_id)?
            .into_history();
        Ok(Self {
            db,
            activity_id,
            history,
        })
    }

    pub fn history(&self) -> &[HistoryEntry<HistoryVariants>] {
        &self.history
    }

    /// Record an intermediary step, persisted immediately so a later retry
    /// observes it and can skip the work that produced it.
    pub fn record(&mut self, body: HistoryVariants) -> AppResult<()> {
        let entry = HistoryEntry::intermediary(body);
        self.db.append_history(entry.clone(), self.activity_id)?;
        self.history.push(entry);
        Ok(())
    }
}
