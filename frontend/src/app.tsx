import { create } from "zustand";
import init, { AccountStore } from "./wasm/client";

await init();

interface AccountState {
  username: string;
  password: string;
  sign_in: "Ready" | "Processing" | "Success" | "Failed";
}

const useAccountStore = create<AccountState & { store: AccountStore }>(
  (set) => {
    const store = new AccountStore((snapshot: AccountState) => {
      set(snapshot);
    });

    return {
      username: "",
      password: "",
      sign_in: "Ready",
      store,
    };
  },
);

export function App() {
  const { username, password, sign_in, store } = useAccountStore();

  return (
    <section id="center">
      <h1>Gatha</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          store.dispatch("SignInButtonClick");
        }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onInput={(e) =>
            store.dispatch({ UsernameUpdate: e.currentTarget.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onInput={(e) =>
            store.dispatch({ PasswordUpdate: e.currentTarget.value })
          }
        />
        <button type="submit" disabled={sign_in === "Processing"}>
          Sign In
        </button>
        <p>Status: {sign_in}</p>
      </form>
    </section>
  );
}
