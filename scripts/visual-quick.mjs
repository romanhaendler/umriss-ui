/* pnpm test:visual:quick <package> - the cheap layout checks (tests tagged
   @quick) of one demo, light project only. See docs/testing.md. */
import { spawnSync } from "node:child_process";

const pkg = process.argv[2];
const project = { core: "ui-light" }[pkg] ?? `${pkg}-light`;
if (!["core", "charts", "table", "schedule", "calculation", "dashboard", "alarms"].includes(pkg)) {
  console.error("usage: pnpm test:visual:quick <core|charts|table|schedule|calculation|dashboard|alarms> [playwright args]");
  process.exit(2);
}
const run = spawnSync(
  "pnpm",
  ["exec", "playwright", "test", "--grep", "@quick", "--project", project, ...process.argv.slice(3)],
  { stdio: "inherit", env: { ...process.env, DEMOS: pkg } },
);
process.exit(run.status ?? 1);
