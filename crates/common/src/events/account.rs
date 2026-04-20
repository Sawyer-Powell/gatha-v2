use serde::{Deserialize, Serialize};
use veil::Redact;

#[derive(Serialize, Deserialize, Redact, Clone)]
pub enum ServerEvent {
    Register {
        email: String,
        #[redact]
        password: String,
    },
    SignIn {
        email: String,
        #[redact]
        password: String,
    },
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ServerEffect {
    RegistrationDuplicate,
    SignInFailed,
    SignInSuccess { account_id: u64, email: String },
}
