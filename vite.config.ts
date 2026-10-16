import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";
const api = { "/api": "http://localhost:3001" };   // the STEMQuest server (see server/index.js)
export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwind()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { host: true, proxy: api },   // host: true lets other devices on your Wi-Fi open the site
  preview: { proxy: api },
});
