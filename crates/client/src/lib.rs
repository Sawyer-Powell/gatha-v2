use common::events::ServerEffect;
use common::events::ServerEvent;
use macro_rules_attribute::attribute_alias;

use crate::error::ClientResult;

attribute_alias! {
    // State types: serialized to JS, diffable. Add `#[derive(Default)]` etc. as needed.
    #[apply(client_state)] =
        #[derive(serde::Serialize, serde::Deserialize, Clone, diff::Diff, Debug)]
        #[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
        #[cfg_attr(feature = "wasm", tsify(into_wasm_abi))]
        #[diff(attr(
            #[derive(serde::Serialize, Clone, Debug)]
        ))];

    // Event types: deserialized from JS, not diffable.
    #[apply(client_event)] =
        #[derive(serde::Deserialize, Clone, Debug)]
        #[cfg_attr(feature = "wasm", derive(tsify_next::Tsify))]
        #[cfg_attr(feature = "wasm", tsify(from_wasm_abi))];
}

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
