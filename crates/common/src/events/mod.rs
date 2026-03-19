use serde::{Deserialize, Serialize};

pub mod account;

#[derive(Serialize, Deserialize, Debug)]
pub enum ServerEvent {
    Account(account::ServerEvent),
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ServerEffect {
    Account(account::ServerEffect),
}
