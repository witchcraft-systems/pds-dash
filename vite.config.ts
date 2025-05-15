import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { themePlugin } from "./theming";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    themePlugin(),
    svelte(),
  ],
});
