/* pnpm test:visual:quick <package> - the cheap layout checks (tests tagged
   @quick) of one demo, light project only. See docs/testing.md. */
import { spawnSync } from "node:child_process";
import { pnpm } from "./pnpm.mjs";
import { PACKAGES } from "./ports.ts";

const pkg = process.argv[2];
const base = pkg === "core" ? "ui" : pkg;
/* Without ENGINES: Chromium's light project, with its screenshots. With it
   (chromium, firefox, webkit): the engines' quick projects, which compare
   none; the config reads it too. */
const engines = (process.env.ENGINES ?? "").split(",").map((e) => e.trim()).filter(Boolean);
const projects = engines.length === 0 ? ["--project", `${base}-light`] : engines.flatMap((e) => ["--project", `${base}-quick-${e}`]);
if (!PACKAGES.includes(pkg)) {
  console.error(`usage: pnpm test:visual:quick <${PACKAGES.join("|")}> [playwright args]`);
  process.exit(2);
}
const run = spawnSync(
  ...pnpm(["exec", "playwright", "test", "--grep", "@quick", ...projects, ...process.argv.slice(3)]),
  { stdio: "inherit", env: { ...process.env, DEMOS: pkg } },
);
process.exit(run.status ?? 1);
