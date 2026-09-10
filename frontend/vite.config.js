import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/shorten': 'http://localhost:10000',
      '/analytics': 'http://localhost:10000',
    }
  }
})
