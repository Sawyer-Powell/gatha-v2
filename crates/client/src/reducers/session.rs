use common::events::{ServerEffect, ServerEvent, account};
use diff::Diff;
use serde::{Deserialize, Serialize};

use crate::{
    ServerEventDispatcher,
    error::ClientResult,
    state::{Mutate, Reducer},
};

#[derive(Serialize, Clone, Default, Diff, Debug, PartialEq)]
#[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
#[cfg_attr(feature = "wasm", tsify(into_wasm_abi))]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub enum SignInStatus {
    #[default]
    Ready,
    Loading,
    InvalidCredentials,
}

#[derive(Serialize, Clone, Debug, Diff, PartialEq)]
#[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
#[cfg_attr(feature = "wasm", tsify(into_wasm_abi))]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub enum AuthState {
    SignedOut {
        email: String,
        password: String,
        status: SignInStatus,
    },
    SignedIn {
        email: String,
    },
}

impl Default for AuthState {
    fn default() -> Self {
        Self::SignedOut {
            email: "".into(),
            password: "".into(),
            status: SignInStatus::default(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Default, Diff, Debug)]
#[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
#[cfg_attr(feature = "wasm", tsify(into_wasm_abi))]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub enum Page {
    #[default]
    SignIn,
    PasswordReset,
    Home,
}

#[derive(Serialize, Clone, Default, Diff, Debug)]
#[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
#[cfg_attr(feature = "wasm", tsify(into_wasm_abi))]
#[diff(attr(
    #[derive(Serialize, Clone, Debug)]
))]
pub struct SessionState {
    pub page: Page,
    pub auth: AuthState,
}

#[derive(Deserialize, Clone, Debug)]
#[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
#[cfg_attr(feature = "wasm", tsify(from_wasm_abi))]
pub enum AuthUIEvent {
    UpdateEmail(String),
    UpdatePassword(String),
}

#[derive(Deserialize, Clone, Debug)]
#[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
#[cfg_attr(feature = "wasm", tsify(from_wasm_abi))]
pub enum SessionUIEvent {
    ChangePage(Page),
    SignIn,
    Register,
    Auth(AuthUIEvent),
}

impl<D: ServerEventDispatcher> Reducer<D> for SessionState {
    type Event = SessionUIEvent;

    async fn process_event(
        &self,
        event: Self::Event,
        mutate: &Mutate<Self>,
        dispatcher: &D,
    ) -> ClientResult<Self> {
        let mut next = self.clone().to_owned();
        match event {
            SessionUIEvent::ChangePage(page) => match next.auth {
                AuthState::SignedIn { .. } => {
                    next = mutate(&next, &|state| state.page = page.clone());
                }
                AuthState::SignedOut { .. } => match page {
                    Page::SignIn => {
                        next = mutate(&next, &|state| state.page = page.clone());
                    }
                    Page::PasswordReset => {
                        next = mutate(&next, &|state| state.page = page.clone());
                    }
                    _ => {
                        return Err(anyhow::anyhow!("Invalid page for signed out state"));
                    }
                },
            },
            SessionUIEvent::SignIn => match next.auth.clone() {
                AuthState::SignedOut {
                    email, password, ..
                } => {
                    let effects = dispatcher
                        .dispatch(&ServerEvent::Account(account::ServerEvent::SignIn {
                            email: email.clone(),
                            password: password.clone(),
                        }))
                        .await?;
                    for effect in effects {
                        match effect {
                            ServerEffect::Account(account::ServerEffect::SignInFailed) => {
                                next = mutate(&next, &|state| {
                                    state.auth = AuthState::SignedOut {
                                        email: email.clone(),
                                        password: password.clone(),
                                        status: SignInStatus::InvalidCredentials,
                                    }
                                });
                            }
                            ServerEffect::Account(account::ServerEffect::SignInSuccess) => {
                                next = mutate(&next, &|state| {
                                    state.auth = AuthState::SignedIn {
                                        email: email.clone(),
                                    };
                                    state.page = Page::Home;
                                });
                            }
                            _ => {
                                return Err(anyhow::anyhow!("Unexpected server effect"));
                            }
                        }
                    }
                }
                _ => return Err(anyhow::anyhow!("Already signed in")),
            },
            SessionUIEvent::Register => match next.auth.clone() {
                AuthState::SignedOut {
                    email, password, ..
                } => {
                    let effects = dispatcher
                        .dispatch(&ServerEvent::Account(account::ServerEvent::Register {
                            email: email.clone(),
                            password: password.clone(),
                        }))
                        .await?;

                    for effect in effects {
                        match effect {
                            ServerEffect::Account(account::ServerEffect::RegistrationOk) => {
                                next = mutate(&next.clone(), &|state| {
                                    state.auth = AuthState::SignedIn {
                                        email: email.clone(),
                                    };
                                    state.page = Page::Home;
                                });
                            }
                            _ => {
                                return Err(anyhow::anyhow!("Unexpected server effect"));
                            }
                        }
                    }
                }
                _ => {
                    next = mutate(&next, &|state| {
                        state.page = Page::Home;
                    });
                }
            },
            SessionUIEvent::Auth(auth_event) => match auth_event {
                AuthUIEvent::UpdateEmail(email) => {
                    next = mutate(&next, &|state| {
                        if let AuthState::SignedOut {
                            email: ref mut _email,
                            ..
                        } = state.auth
                        {
                            *_email = email.clone();
                        }
                    });
                }
                AuthUIEvent::UpdatePassword(password) => {
                    next = mutate(&next, &|state| {
                        if let AuthState::SignedOut {
                            password: ref mut _password,
                            ..
                        } = state.auth
                        {
                            *_password = password.clone();
                        }
                    });
                }
            },
        }

        Ok(next)
    }
}
