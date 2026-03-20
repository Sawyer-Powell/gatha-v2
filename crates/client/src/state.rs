use diff::Diff;
use serde::Serialize;

use crate::error::ClientResult;
use std::cell::RefCell;
use std::rc::Rc;

pub type Mutater<T> = dyn Fn(&T, &dyn Fn(&mut T)) -> T;

pub trait Reducer: Serialize + Default + Clone + Diff {
    type Event;
    async fn process_event(&self, event: Self::Event, mutate: &Mutater<Self>)
    -> ClientResult<Self>;
}

type OnChange<T> = dyn Fn(&<T as Diff>::Repr);

pub trait Store: Serialize + Default + Clone + Diff {
    type Event;
    async fn process_event(
        &mut self,
        event: Self::Event,
        on_change: Rc<OnChange<Self>>,
    ) -> ClientResult<()>;
}

pub fn make_mutation<S: Store + 'static, R: Reducer + 'static>(
    store: S,
    accessor: impl Fn(&mut S) -> &mut R + 'static,
    on_change: Rc<OnChange<S>>,
) -> impl Fn(&R, &dyn Fn(&mut R)) -> R {
    let baseline = RefCell::new(store);
    move |_state: &R, mutation: &dyn Fn(&mut R)| {
        let prev = baseline.borrow().clone();
        let mut next = prev.clone();
        mutation(accessor(&mut next));
        let diff = prev.diff(&next);
        on_change(&diff);
        *baseline.borrow_mut() = next.clone();
        accessor(&mut next).clone()
    }
}
