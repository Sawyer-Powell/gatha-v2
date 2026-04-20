import { mount } from "svelte";
import App from "$lib/App.svelte";
import { body, lightTheme } from "./app.css";
import { initialize } from "$lib/store.svelte";

async function main() {
  await initialize();

  document.body.classList.add(lightTheme, body);

  mount(App, {
    target: document.getElementById("app")!,
  });
}

main();
