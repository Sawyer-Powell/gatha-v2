use common::events::{ServerEffect, ServerEvent, account};
use diff::Diff;
use serde::{Deserialize, Serialize};
use tsify_next::Tsify;

use crate::{
    dispatch_server_event,
    error::ClientResult,
    state::{Mutate, Reducer},
};

#[derive(Serialize, Clone, Default, Diff, Tsify, Debug)]
#[tsify(into_wasm_abi)]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub enum AccountSignInStatus {
    #[default]
    Ready,
    Loading,
    Success,
    Failed,
}

#[derive(Serialize, Clone, Default, Diff, Tsify, Debug)]
#[tsify(into_wasm_abi)]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub struct AccountState {
    pub username: String,
    pub password: String,
    pub sign_in_status: AccountSignInStatus,
}

#[derive(Deserialize, Tsify, Clone, Debug)]
#[tsify(from_wasm_abi)]
pub enum AccountUIEvent {
    SignInButtonClicked,
    UsernameChanged(String),
    PasswordChanged(String),
}

impl AccountState {
    async fn sign_in(&self, mutate: &Mutate<Self>) -> ClientResult<Self> {
        let mut next = mutate(self, &|state| {
            state.sign_in_status = AccountSignInStatus::Loading
        });
        let effects = dispatch_server_event(&ServerEvent::Account(account::ServerEvent::SignIn {
            username: self.username.clone(),
            password: self.password.clone(),
        }))
        .await?;

        for effect in effects {
            match effect {
                ServerEffect::Account(account::ServerEffect::SignInSuccess) => {
                    next = mutate(&next, &|state| {
                        state.sign_in_status = AccountSignInStatus::Success
                    });
                }
                ServerEffect::Account(account::ServerEffect::SignInFailed) => {
                    next = mutate(&next, &|state| {
                        state.sign_in_status = AccountSignInStatus::Failed
                    });
                }
                _ => {}
            }
        }

        Ok(next)
    }
}

impl Reducer for AccountState {
    type Event = AccountUIEvent;

    async fn process_event(&self, event: Self::Event, mutate: &Mutate<Self>) -> ClientResult<Self> {
        Ok(match event {
            AccountUIEvent::SignInButtonClicked => self.sign_in(mutate).await?,
            AccountUIEvent::UsernameChanged(username) => {
                mutate(self, &|state| state.username = username.clone())
            }
            AccountUIEvent::PasswordChanged(password) => {
                mutate(self, &|state| state.password = password.clone())
            }
        })
    }
}
