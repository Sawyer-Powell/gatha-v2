use diff::Diff;
use futures::{StreamExt, channel::mpsc};
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::js_sys;
use wasm_bindgen_futures::spawn_local;

trait Reducer: Serialize + Default + Clone + Diff {
    type Event;
    async fn process_event(
        &self,
        event: Self::Event,
        mutate: &dyn Fn(&Self, &dyn Fn(&mut Self)) -> Self,
    ) -> Self;
}

trait Store: Serialize + Default + Clone + Diff {
    type Event;
    async fn process_event(
        &mut self,
        event: Self::Event,
        on_change: &dyn Fn(&<Self as Diff>::Repr),
    );
}

#[derive(Serialize, Clone, Default, Diff, PartialEq)]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub struct AccountForm {
    pub username: String,
    pub password: String,
}

impl Reducer for AccountForm {
    type Event = FormEvent;

    async fn process_event(
        &self,
        event: Self::Event,
        mutate: &dyn Fn(&Self, &dyn Fn(&mut Self)) -> Self,
    ) -> Self {
        match event {
            FormEvent::UpdateUsername(username) => mutate(self, &|state| {
                state.username = username.clone();
            }),
        }
    }
}

#[derive(Serialize, Clone, Default, Diff, PartialEq)]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub struct AppStore {
    form: AccountForm,
}

fn make_mutation<'a, S: Store + 'a, R: Reducer + 'a>(
    store: S,
    accessor: impl Fn(&mut S) -> &mut R + 'a,
    on_change: &'a dyn Fn(&<S as Diff>::Repr),
) -> impl Fn(&R, &dyn Fn(&mut R)) -> R + 'a {
    move |_state: &R, mutation: &dyn Fn(&mut R)| {
        let mut next = store.clone();
        mutation(accessor(&mut next));
        let diff = store.diff(&next);
        on_change(&diff);
        accessor(&mut next).clone()
    }
}

use tsify_next::Tsify;

#[derive(Deserialize, Tsify, Clone, Debug)]
#[tsify(from_wasm_abi)]
pub enum FormEvent {
    UpdateUsername(String),
}

#[derive(Deserialize, Tsify, Clone, Debug)]
#[tsify(from_wasm_abi)]
pub enum AppEvent {
    Form(FormEvent),
}

impl Store for AppStore {
    type Event = AppEvent;

    async fn process_event(
        &mut self,
        event: Self::Event,
        on_change: &dyn Fn(&<Self as Diff>::Repr),
    ) {
        let form_mutation = make_mutation(self.clone(), |store| &mut store.form, on_change);
        match event {
            AppEvent::Form(form_event) => {
                self.form = self.form.process_event(form_event, &form_mutation).await
            }
        };
    }
}

#[wasm_bindgen]
pub struct EventBus {
    sender: mpsc::UnboundedSender<AppEvent>,
}

#[wasm_bindgen]
impl EventBus {
    #[wasm_bindgen(constructor)]
    pub fn new(on_change: js_sys::Function) -> Self {
        let (sender, mut receiver) = mpsc::unbounded();
        spawn_local(async move {
            let mut store = AppStore::default();
            let on_change = move |diff: &AppStoreDiff| {
                let js_diff = serde_wasm_bindgen::to_value(diff).unwrap();
                let _ = on_change.call1(&JsValue::NULL, &js_diff);
            };
            while let Some(event) = receiver.next().await {
                store.process_event(event, &on_change).await;
            }
        });
        Self { sender }
    }

    pub fn dispatch(&self, event: AppEvent) {
        let _ = self.sender.unbounded_send(event);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_store_dispatch() {
        let mut store = AppStore::default();
        let diffs: std::cell::RefCell<Vec<AppStoreDiff>> = std::cell::RefCell::new(vec![]);

        let on_change = |diff: &AppStoreDiff| {
            diffs.borrow_mut().push(diff.clone());
        };

        futures::executor::block_on(store.process_event(
            AppEvent::Form(FormEvent::UpdateUsername("Alice".into())),
            &on_change,
        ));

        let diffs = diffs.borrow();
        assert_eq!(diffs.len(), 1);
        assert_eq!(diffs[0].form.username, Some("Alice".into()));
        assert_eq!(diffs[0].form.password, None);
    }
}
