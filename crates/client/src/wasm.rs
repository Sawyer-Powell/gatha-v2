use std::rc::Rc;

use futures::{StreamExt, channel::mpsc};
use gloo_net::http::Request;
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;

use crate::ServerEventDispatcher;
use crate::error::ClientResult;
use crate::state::UIEvent;
use crate::state::{AppStore, AppStoreDiff, Store};

pub struct GlooServerDispatcher;

impl ServerEventDispatcher for GlooServerDispatcher {
    async fn dispatch(
        &self,
        event: &common::events::ServerEvent,
    ) -> ClientResult<Vec<common::events::ServerEffect>> {
        let resp = Request::post("/ev").json(event)?.send().await?;
        Ok(resp.json().await?)
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
            let on_change: Rc<dyn Fn(&AppStoreDiff)> =
                Rc::new(
                    move |diff: &AppStoreDiff| match serde_wasm_bindgen::to_value(diff) {
                        Ok(js_diff) => {
                            let _ = on_change.call1(&JsValue::NULL, &js_diff);
                        }
                        Err(e) => log::error!("failed to serialize diff: {}", e),
                    },
                );
            while let Some(event) = receiver.next().await {
                if let Err(e) = store
                    .process_event(event, on_change.clone(), &GlooServerDispatcher)
                    .await
                {
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
pub fn create_event_bus(on_change: js_sys::Function) -> EventBus {
    console_log::init_with_level(log::Level::Debug).ok();
    EventBus::new(on_change)
}
