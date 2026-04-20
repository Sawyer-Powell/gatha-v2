#![allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests {
    use std::rc::Rc;

    use client::{
        reducers::session::{AppPage, AuthState, AuthUIEvent, SessionUIEvent},
        state::{AppStore, Store, UIEvent},
    };
    use e2e::TestDispatcher;

    #[tokio::test]
    async fn test_registration() {
        let mut client_store = AppStore::default();
        let server_dispatcher = TestDispatcher::new().unwrap();

        let mut process_event = async |event: UIEvent| {
            client_store
                .process_event(event, Rc::new(|_| {}), &server_dispatcher)
                .await
                .unwrap();
        };

        process_event(UIEvent::Session(SessionUIEvent::Auth(
            AuthUIEvent::UpdateEmail("sawyerhpowell@gmail.com".into()),
        )))
        .await;

        process_event(UIEvent::Session(SessionUIEvent::Auth(
            AuthUIEvent::UpdatePassword("password :)".into()),
        )))
        .await;

        process_event(UIEvent::Session(SessionUIEvent::Register)).await;

        assert!(
            server_dispatcher
                .state
                .db
                .account_store
                .accounts_by_email
                .contains_key("sawyerhpowell@gmail.com")
                .unwrap()
        );

        assert!(matches!(
            client_store.session.auth,
            AuthState::SignedIn { .. }
        ));

        assert!(matches!(client_store.session.page, AppPage::Home));
    }
}
