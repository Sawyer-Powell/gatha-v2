use std::sync::atomic::{AtomicU64, Ordering};

use anyhow::{Context, bail};
use serde::{Deserialize, Serialize, de::DeserializeOwned};

use crate::{AppConfig, DbConfig, db::transaction, error::AppResult};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum HistoryEntryType {
    Init,
    Intermediary,
    Error,
    Completion,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HistoryEntry<HistoryVariants> {
    pub ty: HistoryEntryType,
    /// Each entry in history has a deliberately enumerated set of variants
    pub body: HistoryVariants,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Activity<HistoryVariants> {
    history: Vec<HistoryEntry<HistoryVariants>>,
}

impl<Variants> HistoryEntry<Variants> {
    pub fn intermediary(body: Variants) -> Self {
        Self {
            ty: HistoryEntryType::Intermediary,
            body,
        }
    }

    pub fn completion(body: Variants) -> Self {
        Self {
            ty: HistoryEntryType::Completion,
            body,
        }
    }

    pub fn error(body: Variants) -> Self {
        Self {
            ty: HistoryEntryType::Error,
            body,
        }
    }
}

impl<HistoryVariants> Activity<HistoryVariants> {
    pub fn into_history(self) -> Vec<HistoryEntry<HistoryVariants>> {
        self.history
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq)]
pub enum ActivityState {
    New,
    Processing,
    Completed,
    Errored,
}

pub struct ActivityDb {
    pub db: sled::Db,
    /// Append only list of events
    pub activities: sled::Tree,
    /// Compound key of `state/activity_id`
    pub states: sled::Tree,
    pub next_id: AtomicU64,
}

impl ActivityState {
    fn as_key(self) -> &'static str {
        match self {
            ActivityState::New => "new",
            ActivityState::Processing => "processing",
            ActivityState::Completed => "completed",
            ActivityState::Errored => "errored",
        }
    }

    fn all() -> [Self; 4] {
        [
            ActivityState::New,
            ActivityState::Processing,
            ActivityState::Completed,
            ActivityState::Errored,
        ]
    }
}

impl ActivityDb {
    pub fn new(config: &AppConfig) -> AppResult<Self> {
        let db_config = match &config.db {
            DbConfig::Temporary => sled::Config::default().temporary(true),
            DbConfig::Persistent {
                app_db_path: path, ..
            } => sled::Config::default().path(path),
        };

        let db = db_config.open()?;
        let activities = db.open_tree("activities")?;
        let states = db.open_tree("activity_states")?;
        let next_id = Self::restore_next_id(&activities)?;

        Ok(Self {
            db,
            activities,
            states,
            next_id: AtomicU64::new(next_id),
        })
    }

    fn activity_state_key(state: &str, activity_id: u64) -> Vec<u8> {
        let mut key = Vec::with_capacity(state.len() + 1 + 8);
        key.extend_from_slice(state.as_bytes());
        key.push(b'/');
        key.extend_from_slice(&activity_id.to_be_bytes());
        key
    }

    fn restore_next_id(activities: &sled::Tree) -> AppResult<u64> {
        let max_id = activities.iter().keys().try_fold(
            None,
            |max_id: Option<u64>, key| -> AppResult<Option<u64>> {
                let key = key?;
                let bytes: [u8; 8] = key
                    .as_ref()
                    .try_into()
                    .context("activity id keys must be 8 bytes")?;
                let id = u64::from_be_bytes(bytes);

                Ok(Some(max_id.map_or(id, |max_id| max_id.max(id))))
            },
        )?;

        max_id
            .map(|id| id.checked_add(1).context("activity id overflow"))
            .transpose()
            .map(|next_id| next_id.unwrap_or(0))
    }

    pub fn new_activity<HistoryVariants: Serialize>(
        &self,
        first_entry: HistoryVariants,
    ) -> AppResult<u64> {
        let activity = Activity {
            history: vec![HistoryEntry {
                ty: HistoryEntryType::Init,
                body: first_entry,
            }],
        };
        let activity_bytes = rmp_serde::to_vec(&activity)?;
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let id_key = id.to_be_bytes();
        let state_key = Self::activity_state_key(ActivityState::New.as_key(), id);

        transaction(
            &(&self.activities, &self.states),
            |(tx_activities, tx_states)| {
                tx_activities.insert(&id_key, activity_bytes.as_slice())?;
                tx_states.insert(state_key.as_slice(), &[])?;
                Ok(())
            },
        )?;

        Ok(id)
    }

    fn current_activity_state(
        tx_states: &sled::transaction::TransactionalTree,
        activity_id: u64,
    ) -> AppResult<Option<ActivityState>> {
        let mut current_state = None;

        for state in ActivityState::all() {
            let state_key = Self::activity_state_key(state.as_key(), activity_id);
            if tx_states.get(state_key.as_slice())?.is_some()
                && current_state.replace(state).is_some()
            {
                bail!("activity {activity_id} has multiple state entries");
            }
        }

        Ok(current_state)
    }

    fn transition_for_entry(
        current_state: ActivityState,
        entry_type: &HistoryEntryType,
    ) -> AppResult<ActivityState> {
        match (current_state, entry_type) {
            (_, HistoryEntryType::Init) => {
                bail!("init history entries can only be used when creating an activity")
            }
            (ActivityState::New, HistoryEntryType::Intermediary) => Ok(ActivityState::Processing),
            (ActivityState::Processing, HistoryEntryType::Intermediary) => {
                Ok(ActivityState::Processing)
            }
            (ActivityState::New | ActivityState::Processing, HistoryEntryType::Error) => {
                Ok(ActivityState::Errored)
            }
            (ActivityState::New | ActivityState::Processing, HistoryEntryType::Completion) => {
                Ok(ActivityState::Completed)
            }
            (ActivityState::Completed, _) => {
                bail!("cannot append history to a completed activity")
            }
            (ActivityState::Errored, _) => bail!("cannot append history to an errored activity"),
        }
    }

    pub fn get_activity<HistoryVariants>(
        &self,
        activity_id: u64,
    ) -> AppResult<Activity<HistoryVariants>>
    where
        Activity<HistoryVariants>: DeserializeOwned,
    {
        let activity_key = activity_id.to_be_bytes();
        let activity_bytes = self
            .activities
            .get(activity_key)?
            .with_context(|| format!("activity {activity_id} not found"))?;

        Ok(rmp_serde::from_slice(&activity_bytes)?)
    }

    pub fn activity_ids_for_state(&self, state: ActivityState) -> AppResult<Vec<u64>> {
        let state = state.as_key();
        let mut prefix = Vec::with_capacity(state.len() + 1);
        prefix.extend_from_slice(state.as_bytes());
        prefix.push(b'/');

        self.states
            .scan_prefix(prefix)
            .keys()
            .map(|key| {
                let key = key?;
                let activity_id_bytes: [u8; 8] = key
                    .as_ref()
                    .get(state.len() + 1..)
                    .context("activity state keys must include an 8 byte activity id")?
                    .try_into()
                    .context("activity ids in state keys must be 8 bytes")?;

                Ok(u64::from_be_bytes(activity_id_bytes))
            })
            .collect()
    }

    pub fn append_history<HistoryVariants>(
        &self,
        entry: HistoryEntry<HistoryVariants>,
        activity_id: u64,
    ) -> AppResult<()>
    where
        Activity<HistoryVariants>: Serialize + DeserializeOwned,
        HistoryEntry<HistoryVariants>: Clone,
    {
        let activity_key = activity_id.to_be_bytes();

        transaction(
            &(&self.activities, &self.states),
            |(tx_activities, tx_states)| {
                let activity_bytes = tx_activities
                    .get(activity_key)?
                    .with_context(|| format!("activity {activity_id} not found"))?;
                let current_state = Self::current_activity_state(tx_states, activity_id)?
                    .with_context(|| format!("activity {activity_id} has no state entry"))?;
                let next_state = Self::transition_for_entry(current_state, &entry.ty)?;

                let mut activity =
                    rmp_serde::from_slice::<Activity<HistoryVariants>>(&activity_bytes)?;

                activity.history.push(entry.clone());

                let next_activity_bytes = rmp_serde::to_vec(&activity)?;
                tx_activities.insert(&activity_key, next_activity_bytes.as_slice())?;

                if next_state != current_state {
                    let current_state_key =
                        Self::activity_state_key(current_state.as_key(), activity_id);
                    let next_state_key = Self::activity_state_key(next_state.as_key(), activity_id);
                    tx_states.remove(current_state_key.as_slice())?;
                    tx_states.insert(next_state_key.as_slice(), &[])?;
                }

                Ok(())
            },
        )
    }
}
