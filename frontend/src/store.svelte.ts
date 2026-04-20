import init, {
  EventBus,
  type AppPage,
  type AppStore,
  type UIEvent,
} from "$wasm/client_wasm";
import { applyDiff } from "$lib/utils/applyDiff";

type PageName = "SignIn" | "Home" | "PasswordReset";

const routeToPage: Record<string, () => AppPage> = {
  "/": () => "Home",
  "/sign-in": () => ({ SignIn: { email: "", password: "", status: "Ready" } }),
  "/password-reset": () => ({ PasswordReset: { email: "" } }),
};

const pageNameToPath: Record<PageName, string> = {
  Home: "/",
  SignIn: "/sign-in",
  PasswordReset: "/password-reset",
};

function pageFromUrl(): AppPage {
  const factory = routeToPage[window.location.pathname];
  return factory ? factory() : "Home";
}

function getPageName(page: AppPage): PageName {
  if (page === "Home") return "Home";
  if (typeof page === "object" && "SignIn" in page) return "SignIn";
  if (typeof page === "object" && "PasswordReset" in page) return "PasswordReset";
  return "Home";
}

let store = $state<AppStore>({
  session: {
    auth: "SignedOut",
    page: { SignIn: { email: "", password: "", status: "Ready" } },
  },
});

let eventBus: EventBus;

export async function initialize() {
  await init();
  eventBus = new EventBus((diff: any) => {
    applyDiff(store, diff);

    // Render page changes to the URL
    const path = pageNameToPath[getPageName(store.session.page)];
    if (path && window.location.pathname !== path) {
      history.pushState(null, "", path);
    }
  });

  // Boot: check auth and navigate to current URL's page
  dispatch({ Session: { WhoAmI: pageFromUrl() } });

  // Browser back/forward
  window.addEventListener("popstate", () => {
    dispatch({ Session: { ChangePage: pageFromUrl() } });
  });
}

export function dispatch(event: UIEvent) {
  eventBus.dispatch(event);
}

export function getStore() {
  return store;
}
