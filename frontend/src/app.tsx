import { deepSignal } from "deepsignal";
import init, { EventBus } from "./wasm/client";

await init();

interface AccountForm {
  username: string;
  password: string;
}

interface AppState {
  form: AccountForm;
}

const state = deepSignal<AppState>({
  form: { username: "", password: "" },
});

function applyDiff(diff: Partial<AppState>) {
  if (diff.form) {
    for (const [key, value] of Object.entries(diff.form)) {
      if (value != null) {
        (state.form as any)[key] = value;
      }
    }
  }
}

const bus = new EventBus(applyDiff);

export function App() {
  return (
    <section id="center">
      <h1>Gatha</h1>
      <h1>{state.form.$username}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          type="text"
          placeholder="Username"
          value={state.form.username}
          onInput={(e) =>
            bus.dispatch({ Form: { UpdateUsername: e.currentTarget.value } })
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={state.form.password}
        />
        <button type="submit">Sign In</button>
      </form>
    </section>
  );
}
