import path from "path";
import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import wasm from "vite-plugin-wasm";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");
  if (!env.SERVER_ADDR) throw new Error("SERVER_ADDR not set in .env");
  const serverAddr = env.SERVER_ADDR;

  return {
    plugins: [svelte(), vanillaExtractPlugin(), wasm()],
    resolve: {
      alias: {
        $lib: path.resolve(__dirname, "./src"),
        $wasm: path.resolve(__dirname, "./src/wasm"),
      },
    },
    server: {
      watch: { usePolling: true, interval: 100 },
      proxy: {
        "/ev": {
          target: `https://${serverAddr}`,
          secure: false,
        },
      },
    },
  };
});
