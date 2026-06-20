use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ActivityEffect {
    Success,
    Failure,
}
