import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests", timeout: 60000, workers: 1,
  use: { actionTimeout: 6000, baseURL: "http://localhost:4390", browserName: "chromium" },
  webServer: { command: "npx vite --port 4390 --strictPort", url: "http://localhost:4390", reuseExistingServer: true, timeout: 60000 },
});
