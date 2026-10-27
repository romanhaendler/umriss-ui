/* Shared Playwright setup of the monorepo (R-1.3).
   - Five demos, five servers: core on 4173, charts on 4174, table on 4175,
     schedule on 4176, calculation on 4177, dashboard on 4178, alarms on 4179.
   - Screenshot comparisons run against the real demo build (vite preview),
     not against the dev server.
   - Light/dark via colorScheme emulation: with nothing stored, the shell's
     theme follows prefers-color-scheme, and every test starts with empty
     storage.
   - Baselines are platform-specific (suffix -linux/-darwin/-win32) and come
     into being on the first run with --update-snapshots. */

import { defineConfig, devices } from "@playwright/test";

/* DEMOS=table,charts limits servers and projects to those packages (unset = all). */
const ALL = ["core", "charts", "table", "schedule", "calculation", "dashboard", "alarms"];
const asked = process.env.DEMOS?.split(",").map((d) => d.trim()).filter(Boolean);
const wanted = asked?.length ? asked : ALL;
const unknown = wanted.filter((d) => !ALL.includes(d));
if (unknown.length) throw new Error(`DEMOS: unknown ${unknown.join(", ")}; known: ${ALL.join(", ")}`);
const PKG_OF_PORT: Record<number, string> = { 4173: "core", 4174: "charts", 4175: "table", 4176: "schedule", 4177: "calculation", 4178: "dashboard", 4179: "alarms" };
const has = (pkg: string) => wanted.includes(pkg);

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.001,
    },
  },
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  },
  webServer: ([
    {
      command:
        "pnpm --filter @umriss-ui/core build:demo && pnpm --filter @umriss-ui/core preview:demo",
      port: 4173,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "pnpm --filter @umriss-ui/charts build:demo && pnpm --filter @umriss-ui/charts preview:demo",
      port: 4174,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "pnpm --filter @umriss-ui/table build:demo && pnpm --filter @umriss-ui/table preview:demo",
      port: 4175,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "pnpm --filter @umriss-ui/schedule build:demo && pnpm --filter @umriss-ui/schedule preview:demo",
      port: 4176,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "pnpm --filter @umriss-ui/calculation build:demo && pnpm --filter @umriss-ui/calculation preview:demo",
      port: 4177,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "pnpm --filter @umriss-ui/dashboard build:demo && pnpm --filter @umriss-ui/dashboard preview:demo",
      port: 4178,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "pnpm --filter @umriss-ui/alarms build:demo && pnpm --filter @umriss-ui/alarms preview:demo",
      port: 4179,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ]).filter((server) => has(PKG_OF_PORT[server.port])),
  projects: ([
    {
      name: "ui-light",
      testDir: "packages/core/tests-visual",
      use: { baseURL: "http://localhost:4173", colorScheme: "light" },
    },
    {
      name: "ui-dark",
      testDir: "packages/core/tests-visual",
      use: { baseURL: "http://localhost:4173", colorScheme: "dark" },
    },
    {
      name: "charts-light",
      testDir: "packages/charts/tests-visual",
      use: { baseURL: "http://localhost:4174", colorScheme: "light" },
    },
    {
      name: "charts-dark",
      testDir: "packages/charts/tests-visual",
      use: { baseURL: "http://localhost:4174", colorScheme: "dark" },
    },
    {
      name: "table-light",
      testDir: "packages/table/tests-visual",
      use: { baseURL: "http://localhost:4175", colorScheme: "light" },
    },
    {
      name: "table-dark",
      testDir: "packages/table/tests-visual",
      use: { baseURL: "http://localhost:4175", colorScheme: "dark" },
    },
    {
      name: "schedule-light",
      testDir: "packages/schedule/tests-visual",
      use: { baseURL: "http://localhost:4176", colorScheme: "light" },
    },
    {
      name: "schedule-dark",
      testDir: "packages/schedule/tests-visual",
      use: { baseURL: "http://localhost:4176", colorScheme: "dark" },
    },
    {
      name: "calculation-light",
      testDir: "packages/calculation/tests-visual",
      use: { baseURL: "http://localhost:4177", colorScheme: "light" },
    },
    {
      name: "calculation-dark",
      testDir: "packages/calculation/tests-visual",
      use: { baseURL: "http://localhost:4177", colorScheme: "dark" },
    },
    {
      name: "dashboard-light",
      testDir: "packages/dashboard/tests-visual",
      use: { baseURL: "http://localhost:4178", colorScheme: "light" },
    },
    {
      name: "dashboard-dark",
      testDir: "packages/dashboard/tests-visual",
      use: { baseURL: "http://localhost:4178", colorScheme: "dark" },
    },
    {
      name: "alarms-light",
      testDir: "packages/alarms/tests-visual",
      use: { baseURL: "http://localhost:4179", colorScheme: "light" },
    },
    {
      name: "alarms-dark",
      testDir: "packages/alarms/tests-visual",
      use: { baseURL: "http://localhost:4179", colorScheme: "dark" },
    },
  ]).filter((project) => has(project.testDir.split("/")[1])),
});
