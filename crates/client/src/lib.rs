use common::events::ServerEffect;
use common::events::ServerEvent;
use diff::Diff;
use futures::{StreamExt, channel::mpsc};
use gloo_net::http::Request;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::js_sys;
use wasm_bindgen_futures::spawn_local;

use crate::error::ClientResult;
use crate::state::Reducer;
use crate::state::Store;
use crate::state::make_mutation;

mod error;
mod reducers;
mod state;

pub async fn dispatch_server_event(event: &ServerEvent) -> ClientResult<Vec<ServerEffect>> {
    let resp = Request::post("/ev").json(event)?.send().await?;
    Ok(resp.json().await?)
}

#[derive(Serialize, Clone, Default, Diff, Tsify, Debug)]
#[tsify(into_wasm_abi)]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub struct AppStore {
    account: reducers::account::AccountState,
}

#[derive(Deserialize, Tsify, Clone, Debug)]
#[tsify(from_wasm_abi)]
pub enum UIEvent {
    Account(reducers::account::AccountUIEvent),
}

impl Store for AppStore {
    type Event = UIEvent;

    async fn process_event(
        &mut self,
        event: Self::Event,
        on_change: std::rc::Rc<dyn Fn(&<Self as Diff>::Repr)>,
    ) -> ClientResult<()> {
        let account_mx = make_mutation(self.clone(), |store| &mut store.account, on_change);
        match event {
            UIEvent::Account(form_event) => {
                self.account = self.account.process_event(form_event, &account_mx).await?
            }
        };
        Ok(())
    }
}

#[derive(Debug)]
#[wasm_bindgen]
pub struct EventBus {
    sender: mpsc::UnboundedSender<UIEvent>,
}

#[wasm_bindgen]
impl EventBus {
    #[wasm_bindgen(constructor)]
    pub fn new(on_change: js_sys::Function) -> Self {
        let (sender, mut receiver) = mpsc::unbounded();
        spawn_local(async move {
            let mut store = AppStore::default();
            let on_change: std::rc::Rc<dyn Fn(&AppStoreDiff)> =
                std::rc::Rc::new(move |diff: &AppStoreDiff| {
                    match serde_wasm_bindgen::to_value(diff) {
                        Ok(js_diff) => {
                            let _ = on_change.call1(&JsValue::NULL, &js_diff);
                        }
                        Err(e) => log::error!("failed to serialize diff: {}", e),
                    }
                });
            while let Some(event) = receiver.next().await {
                if let Err(e) = store.process_event(event, on_change.clone()).await {
                    log::error!("failed to process event: {}", e);
                }
            }
        });
        Self { sender }
    }

    pub fn dispatch(&self, event: UIEvent) {
        let _ = self.sender.unbounded_send(event);
    }
}

#[wasm_bindgen]
pub fn init(on_change: js_sys::Function) -> EventBus {
    console_log::init_with_level(log::Level::Debug).ok();
    EventBus::new(on_change)
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    #[test]
    fn test_store_dispatch() {
        let mut store = AppStore::default();
        let diffs: std::rc::Rc<std::cell::RefCell<Vec<AppStoreDiff>>> =
            std::rc::Rc::new(std::cell::RefCell::new(vec![]));

        let on_change: std::rc::Rc<dyn Fn(&AppStoreDiff)> = {
            let diffs = diffs.clone();
            std::rc::Rc::new(move |diff: &AppStoreDiff| {
                diffs.borrow_mut().push(diff.clone());
            })
        };

        futures::executor::block_on(store.process_event(
            UIEvent::Account(reducers::account::AccountUIEvent::UsernameChanged(
                "Alice".into(),
            )),
            on_change,
        ))
        .unwrap();

        let diffs = diffs.borrow();
        assert_eq!(diffs.len(), 1);
        assert_eq!(diffs[0].account.username, Some("Alice".into()));
        assert_eq!(diffs[0].account.password, None);
    }

    #[test]
    fn test_diff_json_shape() {
        use reducers::account::*;
        let a = AccountState::default();
        let mut b = a.clone();
        b.username = "Alice".into();

        let diff = a.diff(&b);
        println!(
            "diff json: {}",
            serde_json::to_string_pretty(&diff).unwrap()
        );

        let mut c = a.clone();
        c.sign_in_status = AccountSignInStatus::Loading;
        let diff2 = a.diff(&c);
        println!(
            "enum diff json: {}",
            serde_json::to_string_pretty(&diff2).unwrap()
        );
    }
}
