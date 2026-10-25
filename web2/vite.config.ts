import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Live market quotes (same as PC): the browser connects to /ws/socket.io/websocket on this
      // host and the dev server forwards it to TradingView with the Origin it requires.
      // Production needs the same rule in Nginx.
      "/ws": {
        target: "wss://widgetdata.tradingview.com",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, ""),
        headers: { Origin: "https://www.tradingview.com" },
      },
    },
  },
  resolve: {
    alias: {
      "src/config": path.resolve(__dirname, "src/config"),
      "src/shared": path.resolve(__dirname, "src/shared"),
      "src/view": path.resolve(__dirname, "src/view"),
      "src/modules": path.resolve(__dirname, "src/modules"),
      "src/security": path.resolve(__dirname, "src/security"),
      "src/services": path.resolve(__dirname, "src/services"),
      "src/i18n": path.resolve(__dirname, "src/i18n"),
    },
  },
});
