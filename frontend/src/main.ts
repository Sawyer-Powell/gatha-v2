import { mount } from "svelte";
import App from "$lib/App.svelte";
import { body, lightTheme } from "./app.css";
import { initialize } from "$lib/store.svelte";

async function main() {
  document.body.classList.add(lightTheme, body);

  if (import.meta.env.DEV && window.location.pathname === "/design-system") {
    const { default: DesignSystem } = await import(
      "$lib/design-system/DesignSystem.svelte"
    );

    mount(DesignSystem, {
      target: document.getElementById("app")!,
    });
    return;
  }

  await initialize();

  mount(App, {
    target: document.getElementById("app")!,
  });
}

main();
