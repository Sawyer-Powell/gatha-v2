import { mount } from "svelte";
import App from "$lib/App.svelte";
import { body, lightTheme } from "./app.css";

const app = mount(App, {
  target: document.getElementById("app")!,
});

document.body.classList.add(lightTheme, body);

export default app;
