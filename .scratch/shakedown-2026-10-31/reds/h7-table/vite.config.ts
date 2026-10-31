import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()], build: { cssTarget: "chrome123" }, server: { port: 4300, strictPort: true } });
