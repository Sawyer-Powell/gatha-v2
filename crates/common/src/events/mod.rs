use serde::{Deserialize, Serialize};

use crate::events::account::*;

pub mod account;

#[derive(Serialize, Deserialize, Debug)]
pub enum AppEvent {
    AccountEvent(AccountEvent),
}

#[derive(Serialize, Deserialize, Debug)]
pub enum AppEffect {
    AccountEffect(AccountEffect),
}
