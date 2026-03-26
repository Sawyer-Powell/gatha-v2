use diff::Diff;
use serde::{Deserialize, Serialize};

use crate::ServerEventDispatcher;
use crate::error::ClientResult;
use crate::reducers::session::{SessionState, SessionUIEvent};
use std::cell::RefCell;
use std::rc::Rc;

pub type Mutate<T> = dyn Fn(&T, &dyn Fn(&mut T)) -> T;

pub trait Reducer<D: ServerEventDispatcher>: Diff {
    type Event;

    fn process_event(
        &self,
        event: Self::Event,
        mutate: &Mutate<Self>,
        server_dispatcher: &D,
    ) -> impl futures::Future<Output = ClientResult<Self>>;
}

type OnChange<T> = dyn Fn(&<T as Diff>::Repr);

pub trait Store<D: ServerEventDispatcher>: Diff {
    type Event;

    fn process_event(
        &mut self,
        event: Self::Event,
        on_change: Rc<OnChange<Self>>,
        dispatcher: &D,
    ) -> impl futures::Future<Output = ClientResult<()>>;
}

pub fn make_mutation<S: 'static + Clone + Diff, R: 'static + Clone>(
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

#[derive(Serialize, Clone, Default, Diff, Debug)]
#[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
#[cfg_attr(feature = "wasm", tsify(into_wasm_abi))]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub struct AppStore {
    pub session: SessionState,
}

#[derive(Deserialize, Clone, Debug)]
#[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
#[cfg_attr(feature = "wasm", tsify(from_wasm_abi))]
pub enum UIEvent {
    Session(SessionUIEvent),
}

impl<D: ServerEventDispatcher> Store<D> for AppStore {
    type Event = UIEvent;

    async fn process_event(
        &mut self,
        event: Self::Event,
        on_change: Rc<dyn Fn(&<Self as Diff>::Repr)>,
        dispatcher: &D,
    ) -> ClientResult<()> {
        use crate::state::Reducer;
        let session_mx = make_mutation(self.clone(), |store| &mut store.session, on_change);
        match event {
            UIEvent::Session(form_event) => {
                self.session = self
                    .session
                    .process_event(form_event, &session_mx, dispatcher)
                    .await?
            }
        };
        Ok(())
    }
}
