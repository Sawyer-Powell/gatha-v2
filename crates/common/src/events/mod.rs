use serde::{Deserialize, Serialize};

use chrono::{DateTime, Utc};
pub mod account;
pub mod rbac;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ServerEvent {
    Account(account::ServerEvent),
    WhoAmI,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Auth {
    expires: DateTime<Utc>,
    email: String,
}

impl Auth {
    pub fn new(email: String, expires: DateTime<Utc>) -> Self {
        Self { email, expires }
    }

    pub fn is_expired(&self) -> bool {
        Utc::now() > self.expires
    }

    pub fn email(&self) -> &str {
        &self.email
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ServerEventWrapped {
    pub event: ServerEvent,
    // This is not sent over JSON but set by the server
    // event handler from the request context
    pub auth: Option<Auth>,
}

impl ServerEventWrapped {
    pub fn set_auth(&mut self, auth: Auth) {
        self.auth = Some(auth);
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ServerEffect {
    Account(account::ServerEffect),
    Rbac(rbac::RbacEffect),
    WhoAmI { email: String },
    SessionExpired,
}
