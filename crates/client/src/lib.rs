use std::{cell::RefCell, rc::Rc};

use common::events::{
    AppEffect, AppEvent,
    account::{AccountEffect, AccountEvent},
};
use futures::{StreamExt, channel::mpsc};
use gloo_net::http::Request;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{js_sys, spawn_local};

#[derive(Serialize, Clone, Copy, PartialEq)]
pub enum SignInStatus {
    Ready,
    Processing,
    Success,
    Failed,
}

impl Default for SignInStatus {
    fn default() -> Self {
        Self::Ready
    }
}

#[derive(Serialize, Clone, Default)]
pub struct AccountState {
    pub username: String,
    pub password: String,
    pub sign_in: SignInStatus,
}

impl AccountState {
    async fn process_event(&mut self, event: UIEvent, notify: &dyn Fn(&AccountState)) {
        match event {
            UIEvent::UsernameUpdate(username) => {
                self.username = username;
                notify(self);
            }
            UIEvent::PasswordUpdate(password) => {
                self.password = password;
                notify(self);
            }
            UIEvent::SignInButtonClick => {
                self.sign_in(notify).await;
            }
        }
    }

    async fn sign_in(&mut self, notify: &dyn Fn(&AccountState)) {
        if self.sign_in != SignInStatus::Ready && self.sign_in != SignInStatus::Failed {
            return;
        }

        self.sign_in = SignInStatus::Processing;
        notify(self);

        let effects = match dispatch_to_server(AppEvent::AccountEvent(AccountEvent::SignIn {
            username: self.username.clone(),
            password: self.password.clone(),
        }))
        .await
        {
            Ok(effects) => effects,
            Err(_) => {
                self.sign_in = SignInStatus::Failed;
                notify(self);
                return;
            }
        };

        for effect in effects {
            match effect {
                AppEffect::AccountEffect(AccountEffect::SignInSuccess) => {
                    self.sign_in = SignInStatus::Success;
                }
                AppEffect::AccountEffect(AccountEffect::SignInFailed) => {
                    self.sign_in = SignInStatus::Failed;
                }
                _ => (),
            }
        }
        notify(self);
    }
}

#[derive(Deserialize, Tsify, Clone, Debug)]
#[tsify(from_wasm_abi)]
pub enum UIEvent {
    UsernameUpdate(String),
    PasswordUpdate(String),
    SignInButtonClick,
}

#[wasm_bindgen]
pub struct AccountStore {
    state: Rc<RefCell<AccountState>>,
    sender: mpsc::UnboundedSender<UIEvent>,
    on_change: js_sys::Function,
}

#[wasm_bindgen]
impl AccountStore {
    #[wasm_bindgen(constructor)]
    pub fn new(on_change: js_sys::Function) -> Self {
        let state = Rc::new(RefCell::new(AccountState::default()));
        let (sender, mut receiver) = mpsc::unbounded::<UIEvent>();

        let state_loop = Rc::clone(&state);
        let on_change_loop = on_change.clone();

        spawn_local(async move {
            while let Some(event) = receiver.next().await {
                let notify = |state: &AccountState| {
                    let snapshot = serde_wasm_bindgen::to_value(state).unwrap();
                    let _ = on_change_loop.call1(&JsValue::NULL, &snapshot);
                };
                state_loop.borrow_mut().process_event(event, &notify).await;
            }
        });

        let store = Self {
            state,
            sender,
            on_change,
        };
        store.notify();
        store
    }

    fn notify(&self) {
        let snapshot = serde_wasm_bindgen::to_value(&*self.state.borrow()).unwrap();
        let _ = self.on_change.call1(&JsValue::NULL, &snapshot);
    }

    #[wasm_bindgen]
    pub fn dispatch(&self, event: UIEvent) {
        let _ = self.sender.unbounded_send(event);
    }
}

async fn dispatch_to_server(event: AppEvent) -> Result<Vec<AppEffect>, JsValue> {
    let resp = Request::post("/ev")
        .json(&event)
        .map_err(|e| JsValue::from_str(&e.to_string()))?
        .send()
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    resp.json()
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))
}
