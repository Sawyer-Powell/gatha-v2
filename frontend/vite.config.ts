import { defineConfig, loadEnv } from "vite";
import preact from "@preact/preset-vite";
import wasm from "vite-plugin-wasm";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");
  if (!env.SERVER_ADDR) throw new Error("SERVER_ADDR not set in .env");
  const serverAddr = env.SERVER_ADDR;

  return {
    plugins: [preact(), wasm()],
    server: {
      proxy: {
        "/ev": `http://${serverAddr}`,
      },
    },
  };
});
