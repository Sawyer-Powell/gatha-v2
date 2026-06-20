use std::sync::Arc;
use std::time::Duration;

use dashmap::DashSet;
use tokio::sync::{Semaphore, mpsc};
use tracing::warn;

use crate::activities::ActivityCtx;
use crate::activities::email::{self, EmailHistory, EmailProvider};
use crate::db::activity_db::{ActivityDb, ActivityState};
use crate::error::AppResult;

/// Max activities running concurrently. Activities are IO-bound (HTTP/provider
/// calls), so each in-flight one is a cheap task, not a thread — this can be set
/// high without burning OS threads.
const MAX_CONCURRENT_ACTIVITIES: usize = 1024;
/// Bounded in-memory queue capacity. Backpressure beyond this falls back to the
/// poller, which re-reads pending work from the durable store.
const QUEUE_CAPACITY: usize = 1024;
/// How often the poller re-scans the store for runnable activities.
const POLL_INTERVAL: Duration = Duration::from_secs(1);

pub enum ActivityRequest {
    Email {
        to: String,
        subject: String,
        body: String,
    },
}

pub struct ActivityBus {
    db: Arc<ActivityDb>,
    tx: mpsc::Sender<u64>,
    /// Ids that are queued or running, so the poller never double-feeds work
    /// that is already in flight.
    in_flight: Arc<DashSet<u64>>,
}

impl ActivityBus {
    pub fn new(db: Arc<ActivityDb>, email_provider: Arc<dyn EmailProvider>) -> Self {
        let (tx, rx) = mpsc::channel::<u64>(QUEUE_CAPACITY);
        let in_flight: Arc<DashSet<u64>> = Arc::new(DashSet::new());

        spawn_dispatcher(rx, db.clone(), email_provider, in_flight.clone());
        spawn_poller(tx.clone(), db.clone(), in_flight.clone());

        Self { db, tx, in_flight }
    }

    /// Fire-and-forget. Persists the activity, then enqueues it for immediate
    /// execution; if the queue is full the poller will pick it up within a tick.
    pub fn submit(&self, request: ActivityRequest) -> AppResult<()> {
        let id = match request {
            ActivityRequest::Email { to, subject, body } => self
                .db
                .new_activity(EmailHistory::Requested { to, subject, body })?,
        };

        // Reserve before sending so the poller won't also grab it; release the
        // reservation if the queue is full and let the poller handle it.
        self.in_flight.insert(id);
        if self.tx.try_send(id).is_err() {
            self.in_flight.remove(&id);
        }

        Ok(())
    }
}

/// Pulls ids off the queue and runs each as a bounded-concurrency async task.
/// A semaphore caps how many run at once; the dispatcher parks on `acquire`
/// when saturated, which in turn backs pressure up into the queue.
fn spawn_dispatcher(
    mut rx: mpsc::Receiver<u64>,
    db: Arc<ActivityDb>,
    provider: Arc<dyn EmailProvider>,
    in_flight: Arc<DashSet<u64>>,
) {
    let limit = Arc::new(Semaphore::new(MAX_CONCURRENT_ACTIVITIES));

    tokio::spawn(async move {
        while let Some(id) = rx.recv().await {
            let Ok(permit) = limit.clone().acquire_owned().await else {
                break; // semaphore closed
            };
            let db = db.clone();
            let provider = provider.clone();
            let in_flight = in_flight.clone();

            tokio::spawn(async move {
                if let Err(e) = drive_activity(db, provider, id).await {
                    warn!("Activity {id} failed: {:?}", e);
                }
                in_flight.remove(&id);
                drop(permit);
            });
        }
    });
}

/// Durable backstop so activities survive restarts/deploys: re-scans the store
/// every tick and feeds any runnable activity that isn't already in flight.
fn spawn_poller(tx: mpsc::Sender<u64>, db: Arc<ActivityDb>, in_flight: Arc<DashSet<u64>>) {
    tokio::spawn(async move {
        let mut tick = tokio::time::interval(POLL_INTERVAL);
        loop {
            tick.tick().await;
            if let Err(e) = enqueue_pending(&db, &in_flight, &tx).await {
                warn!("Activity poll failed: {:?}", e);
            }
        }
    });
}

async fn enqueue_pending(
    db: &ActivityDb,
    in_flight: &DashSet<u64>,
    tx: &mpsc::Sender<u64>,
) -> AppResult<()> {
    for state in [ActivityState::New, ActivityState::Processing] {
        for id in db.activity_ids_for_state(state)? {
            // `insert` returns true only if the id wasn't already in flight.
            if in_flight.insert(id) && tx.send(id).await.is_err() {
                // Channel closed (shutting down); stop feeding.
                in_flight.remove(&id);
                return Ok(());
            }
        }
    }

    Ok(())
}

/// Runs a single activity to a terminal history entry. Idempotent across
/// retries because the activity function consults existing history.
async fn drive_activity(
    db: Arc<ActivityDb>,
    provider: Arc<dyn EmailProvider>,
    id: u64,
) -> AppResult<()> {
    // Only email activities exist today; a kind tag/registry goes here when we
    // add more types.
    let mut ctx = ActivityCtx::<EmailHistory>::new(db.clone(), id)?;
    let outcome = email::run(&mut ctx, provider.as_ref()).await;
    db.append_history(outcome, id)
}
