pub mod account_store;
pub mod activity_db;
pub mod app_db;
pub mod event_store;

use sled::transaction::{
    ConflictableTransactionError, TransactionError, Transactional, TransactionalTree,
};
use sled::{IVec, Tree};

use crate::error::AppResult;

pub type DbKey = IVec;

pub fn transaction<T: Transactional<anyhow::Error> + ?Sized, R>(
    transactee: &T,
    f: impl Fn(&T::View) -> anyhow::Result<R>,
) -> anyhow::Result<R> {
    transactee
        .transaction(|view| f(view).map_err(ConflictableTransactionError::Abort))
        .map_err(|e| match e {
            TransactionError::Abort(anyhow_err) => anyhow_err,
            TransactionError::Storage(sled_err) => anyhow::Error::from(sled_err),
        })
}

/// Constructs a transaction against the database that also increments
/// the event cursor
pub fn eventful_transaction<E, const N: usize>(
    store: &event_store::AppEventStore,
    event_id: &DbKey,
    domain_trees: [&Tree; N],
    f: impl Fn([&TransactionalTree; N]) -> anyhow::Result<Vec<E>>,
) -> AppResult<Vec<E>> {
    let mut all_trees: Vec<&Tree> = domain_trees.into();
    all_trees.push(&store.cursor);
    transaction(&all_trees[..], |tx_trees| {
        let tx_cursor = &tx_trees[N];
        let domain: [&TransactionalTree; N] = std::array::from_fn(|i| &tx_trees[i]);
        let effects = f(domain)?;
        store.set_cursor(tx_cursor, event_id)?;
        Ok(effects)
    })
}

pub trait EventStore {
    type Event;

    fn write_event(&self, ev: &Self::Event) -> AppResult<DbKey>;
    #[allow(clippy::type_complexity)]
    fn unprocessed_events(
        &self,
    ) -> AppResult<impl Iterator<Item = AppResult<(DbKey, Self::Event)>>>;
}

/// Trait used for creating an event processor.
/// Event processors use events to apply database updates, then produce
/// effects.
pub trait EventProcessor {
    type Event;
    type Effect;
    type EventStore: EventStore;

    fn process_event(
        &self,
        event_id: &DbKey,
        event: &Self::Event,
        store: &Self::EventStore,
    ) -> AppResult<Vec<Self::Effect>>;
}
