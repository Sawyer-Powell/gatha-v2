use diff::Diff;
use serde::Serialize;

pub type Mutater<T> = dyn Fn(&T, &dyn Fn(&mut T)) -> T;

pub trait Reducer: Serialize + Default + Clone + Diff {
    type Event;
    async fn process_event(&self, event: Self::Event, mutate: &Mutater<Self>) -> Self;
}

pub trait Store: Serialize + Default + Clone + Diff {
    type Event;
    async fn process_event(
        &mut self,
        event: Self::Event,
        on_change: Rc<dyn Fn(&<Self as Diff>::Repr)>,
    );
}

use std::rc::Rc;

use std::cell::RefCell;

pub fn make_mutation<S: Store + 'static, R: Reducer + 'static>(
    store: S,
    accessor: impl Fn(&mut S) -> &mut R + 'static,
    on_change: Rc<dyn Fn(&<S as Diff>::Repr)>,
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
