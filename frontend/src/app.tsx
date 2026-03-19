import { deepSignal } from "deepsignal";
import init, { EventBus, type AppStore } from "./wasm/client";

await init();

const state = deepSignal<AppStore>({
  account: { username: "", password: "", sign_in_status: "Ready" },
});

function applyDiff(diff: any, target: any = state) {
  for (const [key, value] of Object.entries(diff)) {
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      applyDiff(value, target[key]);
    } else if (value != null && value !== "NoChange") {
      target[key] = value;
    }
  }
}

const bus = new EventBus(applyDiff);

export function App() {
  return (
    <section id="center">
      <h1>Gatha</h1>
      <h1>STATUS: {state.account.$sign_in_status}</h1>
      <h1>{state.account.$username}</h1>
      <h1>{state.account.$password}</h1>
      <input
        type="text"
        placeholder="Username"
        value={state.account.username}
        onInput={(e) =>
          bus.dispatch({
            Account: {
              UsernameChanged: e.currentTarget.value,
            },
          })
        }
      />
      <input
        type="password"
        placeholder="Password"
        value={state.account.password}
        onInput={(e) =>
          bus.dispatch({
            Account: {
              PasswordChanged: e.currentTarget.value,
            },
          })
        }
      />
      <button
        type="submit"
        onClick={() =>
          bus.dispatch({
            Account: "SignInButtonClicked",
          })
        }
      >
        Sign In
      </button>
    </section>
  );
}
