import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests", timeout: 60000, workers: 1,
  use: { baseURL: "http://localhost:4300", browserName: "chromium" },
  webServer: { command: "npx vite --port 4300 --strictPort", url: "http://localhost:4300", reuseExistingServer: true, timeout: 60000 },
});
