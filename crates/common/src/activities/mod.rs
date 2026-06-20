use serde::{Deserialize, Serialize};

pub mod email;

#[derive(Serialize, Deserialize, Debug)]
pub enum ActivityEffect {
    Email(email::ActivityEffect),
}
