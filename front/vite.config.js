import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": "/src", // This will point '@' to the src folder
    },
  },
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
});
