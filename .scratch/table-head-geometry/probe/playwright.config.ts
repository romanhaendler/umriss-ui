import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  timeout: 300_000,
  workers: 3,
  reporter: [["list"]],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }, { name: "webkit", use: { ...devices["Desktop Safari"] } }],
  use: { baseURL: "http://localhost:4175", viewport: { width: 1280, height: 900 } },
});
