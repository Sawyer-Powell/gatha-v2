use common::events::ServerEffect;
use common::events::ServerEvent;

use crate::error::ClientResult;

pub mod error;
pub mod reducers;
pub mod state;

pub trait ServerEventDispatcher {
    fn dispatch(
        &self,
        event: &ServerEvent,
    ) -> impl futures::Future<Output = ClientResult<Vec<ServerEffect>>>;
}

#[cfg(feature = "wasm")]
pub mod wasm;
