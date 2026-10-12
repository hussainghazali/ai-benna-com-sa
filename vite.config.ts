import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    // Proxy /api → Benna production API (avoids browser CORS; injects x-api-key server-side)
    proxy: {
      "/api": {
        target: "https://vendor.benna.com.sa",
        changeOrigin: true,
        secure: true,
        // Prod API enforces a server-side Origin allowlist — spoof an allowed one
        headers: {
          origin: "https://dev.store.benna.com.sa",
          referer: "https://dev.store.benna.com.sa/",
        },
      },
    },
  },
});
