use serde::{Deserialize, Serialize};
use veil::Redact;

#[derive(Serialize, Deserialize, Redact, Clone)]
pub enum ServerEvent {
    Register { username: String, #[redact] password: String },
    SignIn { username: String, #[redact] password: String },
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ServerEffect {
    RegistrationOk,
    SignInFailed,
    SignInSuccess,
}
