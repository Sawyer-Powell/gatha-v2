use common::events::{ServerEffect, ServerEvent, account};
use macro_rules_attribute::apply;

use crate::{
    ServerEventDispatcher,
    error::ClientResult,
    state::{Mutate, Reducer},
};

#[apply(client_state)]
#[derive(Default, PartialEq)]
pub enum SignInStatus {
    #[default]
    Ready,
    Loading,
    InvalidCredentials,
    ValidationError { message: String },
}

#[apply(client_state)]
#[derive(Default, PartialEq)]
pub enum AuthState {
    #[default]
    SignedOut,
    SignedIn {
        email: String,
    },
}

#[apply(client_state)]
#[derive(Default)]
pub enum AppPage {
    #[default]
    Loading,
    SignIn {
        email: String,
        password: String,
        status: SignInStatus,
    },
    Home,
    PasswordReset {
        email: String,
    },
}

#[apply(client_state)]
#[derive(Default)]
pub struct SessionState {
    pub auth: AuthState,
    pub page: AppPage,
}

#[apply(client_event)]
pub enum AuthUIEvent {
    UpdateEmail(String),
    UpdatePassword(String),
}

#[apply(client_event)]
pub enum SessionUIEvent {
    ChangePage(AppPage),
    WhoAmI(AppPage),
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
            SessionUIEvent::WhoAmI(requested_page) => match next.auth {
                AuthState::SignedIn { .. } => {
                    next = mutate(&next, &|state| state.page = requested_page.clone());
                }
                AuthState::SignedOut => {
                    let effects = dispatcher.dispatch(&ServerEvent::WhoAmI).await?;

                    for effect in effects {
                        match effect {
                            ServerEffect::WhoAmI { email } => {
                                next = mutate(&next, &|state| {
                                    state.auth =
                                        AuthState::SignedIn { email: email.clone() };
                                    state.page = requested_page.clone();
                                });
                            }
                            ServerEffect::SessionExpired => {
                                next = mutate(&next, &|state| {
                                    state.page = AppPage::SignIn {
                                        email: String::new(),
                                        password: String::new(),
                                        status: SignInStatus::default(),
                                    };
                                });
                            }
                            _ => {
                                return Err(anyhow::anyhow!("Unexpected effect from WhoAmI"));
                            }
                        }
                    }
                }
            },
            SessionUIEvent::ChangePage(page) => match next.auth {
                AuthState::SignedIn { .. } => {
                    next = mutate(&next, &|state| state.page = page.clone());
                }
                AuthState::SignedOut => match page {
                    AppPage::SignIn { .. } | AppPage::PasswordReset { .. } => {
                        next = mutate(&next, &|state| state.page = page.clone());
                    }
                    _ => {
                        return Err(anyhow::anyhow!("Invalid page for signed out state"));
                    }
                },
            },
            SessionUIEvent::SignIn => {
                let AppPage::SignIn {
                    ref email,
                    ref password,
                    ..
                } = next.page
                else {
                    return Err(anyhow::anyhow!("SignIn event requires SignIn page"));
                };
                let email = email.clone();
                let password = password.clone();

                // Client-side validation
                if let Err(msg) = common::validation::validate_email(&email)
                    .and_then(|_| common::validation::validate_password(&password))
                {
                    next = mutate(&next, &|state| {
                        if let AppPage::SignIn { ref mut status, .. } = state.page {
                            *status = SignInStatus::ValidationError {
                                message: msg.into(),
                            };
                        }
                    });
                    return Ok(next);
                }

                next = mutate(&next, &|state| {
                    if let AppPage::SignIn { ref mut status, .. } = state.page {
                        *status = SignInStatus::Loading;
                    }
                });

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
                                state.page = AppPage::SignIn {
                                    email: email.clone(),
                                    password: password.clone(),
                                    status: SignInStatus::InvalidCredentials,
                                };
                            });
                        }
                        ServerEffect::Account(account::ServerEffect::SignInSuccess {
                            email: _, ..
                        }) => {
                            next = mutate(&next, &|state| {
                                state.auth = AuthState::SignedIn {
                                    email: email.clone(),
                                };
                                state.page = AppPage::Home;
                            });
                        }
                        _ => {
                            return Err(anyhow::anyhow!("Unexpected server effect"));
                        }
                    }
                }
            }
            SessionUIEvent::Register => {
                let AppPage::SignIn {
                    ref email,
                    ref password,
                    ..
                } = next.page
                else {
                    return Err(anyhow::anyhow!("Register event requires SignIn page"));
                };
                let email = email.clone();
                let password = password.clone();

                // Client-side validation
                if let Err(msg) = common::validation::validate_email(&email)
                    .and_then(|_| common::validation::validate_password(&password))
                {
                    next = mutate(&next, &|state| {
                        if let AppPage::SignIn { ref mut status, .. } = state.page {
                            *status = SignInStatus::ValidationError {
                                message: msg.into(),
                            };
                        }
                    });
                    return Ok(next);
                }

                let effects = dispatcher
                    .dispatch(&ServerEvent::Account(account::ServerEvent::Register {
                        email: email.clone(),
                        password: password.clone(),
                    }))
                    .await?;

                for effect in effects {
                    match effect {
                        ServerEffect::Account(account::ServerEffect::SignInSuccess {
                            email, ..
                        }) => {
                            next = mutate(&next, &|state| {
                                state.auth = AuthState::SignedIn {
                                    email: email.clone(),
                                };
                                state.page = AppPage::Home;
                            });
                        }
                        _ => {
                            return Err(anyhow::anyhow!("Unexpected server effect"));
                        }
                    }
                }
            }
            SessionUIEvent::Auth(auth_event) => match auth_event {
                AuthUIEvent::UpdateEmail(email) => {
                    next = mutate(&next, &|state| {
                        if let AppPage::SignIn {
                            email: ref mut e, ..
                        } = state.page
                        {
                            *e = email.clone();
                        }
                    });
                }
                AuthUIEvent::UpdatePassword(password) => {
                    next = mutate(&next, &|state| {
                        if let AppPage::SignIn {
                            password: ref mut p,
                            ..
                        } = state.page
                        {
                            *p = password.clone();
                        }
                    });
                }
            },
        }

        Ok(next)
    }
}
