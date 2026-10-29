// `pnpm check [package]`: the shrink guard, eslint, the package's typecheck and
// its unit tests, in that order; stops at the first failure and names it.
// Without an argument: every package. `--allow <path>` goes on to the guard.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pnpm } from "./pnpm.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const all = ["core", "charts", "table", "schedule", "calculation", "dashboard", "alarms", "demo"];
const args = process.argv.slice(2);
const allowed = args.flatMap((value, i) => (args[i - 1] === "--allow" ? ["--allow", value] : []));
const arg = args.find((value, i) => value !== "--allow" && args[i - 1] !== "--allow");
if (arg && !all.includes(arg)) {
  console.error(`check: unknown package "${arg}" (one of ${all.join(", ")})`);
  process.exit(2);
}

const run = (label, cmd, args) => {
  console.log(`\n> ${label}`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`\ncheck: FAILED at ${label}`);
    process.exit(r.status ?? 1);
  }
};

run("shrink guard", "node", ["scripts/check-shrunk.mjs", ...allowed]);
for (const name of arg ? [arg] : all) {
  const filter = ["--filter", `@umriss-ui/${name}`];
  run(`${name}: eslint`, ...pnpm(["exec", "eslint", "--max-warnings", "0", `packages/${name}`]));
  run(`${name}: typecheck`, ...pnpm([...filter, "typecheck"]));
  run(`${name}: test:unit`, ...pnpm([...filter, "test:unit"]));
}
console.log("\ncheck: all passed");
