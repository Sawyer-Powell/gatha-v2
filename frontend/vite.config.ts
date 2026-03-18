import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [preact(), wasm()],
  server: {
    proxy: {
      "/ev": "http://localhost:3000",
    },
  },
});
