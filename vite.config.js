import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  plugins: [react(), svgr()],
  server: {
    port: parseInt(process.env.VITE_DEV_PORT) || 5273,
    host: true, // Allow external connections
  },
  preview: {
    port: parseInt(process.env.VITE_PREVIEW_PORT) || 4273,
    host: true, // Allow external connections
  },
});
