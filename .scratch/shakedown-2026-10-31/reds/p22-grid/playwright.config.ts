import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests", timeout: 60000, workers: 1,
  use: { baseURL: "http://localhost:4370", browserName: "chromium" },
  webServer: { command: "npx vite --port 4370 --strictPort", url: "http://localhost:4370", reuseExistingServer: true, timeout: 60000 },
});
