use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum RbacEffect {
    AccessOk,
    AccessDenied,
}
