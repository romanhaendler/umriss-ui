/* Shared Playwright setup of the monorepo (R-1.3).
   - One demo, one server per package, on UMRISS_PORT_BASE (default 4173) plus
     the package's offset: core +0, charts +1, table +2, schedule +3,
     calculation +4, dashboard +5, alarms +6 (scripts/ports.ts). Checkouts
     running at the same time take bases of their own.
   - Screenshot comparisons run against the real demo build (vite preview),
     not against the dev server.
   - Light/dark via colorScheme emulation: with nothing stored, the shell's
     theme follows prefers-color-scheme, and every test starts with empty
     storage.
   - Baselines are platform-specific (suffix -linux/-darwin/-win32) and come
     into being on the first run with --update-snapshots. */

import { defineConfig, devices } from "@playwright/test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PACKAGES, portOf, reusable } from "./scripts/ports.ts";

const root = dirname(fileURLToPath(import.meta.url));

/* DEMOS=table,charts limits servers and projects to those packages (unset = all). */
const ALL: readonly string[] = PACKAGES;
const asked = process.env.DEMOS?.split(",").map((d) => d.trim()).filter(Boolean);
const wanted = asked?.length ? asked : ALL;
const unknown = wanted.filter((d) => !ALL.includes(d));
if (unknown.length) throw new Error(`DEMOS: unknown ${unknown.join(", ")}; known: ${ALL.join(", ")}`);

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
  webServer: wanted.map((pkg) => ({
    command: `pnpm --filter @umriss-ui/${pkg} build:demo && pnpm --filter @umriss-ui/${pkg} preview:demo`,
    port: portOf(pkg),
    reuseExistingServer: !process.env.CI && reusable(portOf(pkg), root),
    timeout: 180_000,
  })),
  projects: wanted.flatMap((pkg) =>
    (["light", "dark"] as const).map((colorScheme) => ({
      name: `${pkg === "core" ? "ui" : pkg}-${colorScheme === "dark" ? "dark" : "light"}`,
      testDir: `packages/${pkg}/tests-visual`,
      use: { baseURL: `http://localhost:${portOf(pkg)}`, colorScheme },
    })),
  ),
});
