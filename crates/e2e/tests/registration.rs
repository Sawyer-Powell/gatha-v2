#![allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests {
    use std::rc::Rc;

    use client::{
        reducers::session::{AppPage, AuthState, AuthUIEvent, SessionUIEvent, SignInStatus},
        state::{AppStore, Store, UIEvent},
    };
    use e2e::TestDispatcher;

    async fn process_event(
        client_store: &mut AppStore,
        server_dispatcher: &TestDispatcher,
        event: impl Into<UIEvent>,
    ) {
        client_store
            .process_event(event.into(), Rc::new(|_| {}), server_dispatcher)
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn test_registration() {
        let mut client_store = AppStore::default();
        let server_dispatcher = TestDispatcher::new().unwrap();

        // Navigate to SignIn page first (default is Loading)
        process_event(
            &mut client_store,
            &server_dispatcher,
            SessionUIEvent::ChangePage(AppPage::SignIn {
                email: String::new(),
                password: String::new(),
                status: SignInStatus::default(),
            }),
        )
        .await;

        process_event(
            &mut client_store,
            &server_dispatcher,
            AuthUIEvent::UpdateEmail("sawyerhpowell@gmail.com".into()),
        )
        .await;

        process_event(
            &mut client_store,
            &server_dispatcher,
            AuthUIEvent::UpdatePassword("password :)".into()),
        )
        .await;

        process_event(
            &mut client_store,
            &server_dispatcher,
            SessionUIEvent::Register,
        )
        .await;

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
