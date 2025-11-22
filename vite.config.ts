import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/v1": {
        target: "http://localhost:8000", // ajuste a porta conforme seu backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
