use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum AccountEvent {
    Register { username: String, password: String },
    SignIn { username: String, password: String },
}

#[derive(Serialize, Deserialize, Debug)]
pub enum AccountEffect {
    RegistrationOk,
    SignInFailed,
    SignInSuccess,
}
