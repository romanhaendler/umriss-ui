/* pnpm test:visual:quick <package> - the cheap layout checks (tests tagged
   @quick) of one demo, light project only. See docs/testing.md. */
import { spawnSync } from "node:child_process";
import { pnpm } from "./pnpm.mjs";
import { PACKAGES } from "./ports.ts";

const pkg = process.argv[2];
const project = { core: "ui-light" }[pkg] ?? `${pkg}-light`;
if (!PACKAGES.includes(pkg)) {
  console.error(`usage: pnpm test:visual:quick <${PACKAGES.join("|")}> [playwright args]`);
  process.exit(2);
}
const run = spawnSync(
  ...pnpm(["exec", "playwright", "test", "--grep", "@quick", "--project", project, ...process.argv.slice(3)]),
  { stdio: "inherit", env: { ...process.env, DEMOS: pkg } },
);
process.exit(run.status ?? 1);
