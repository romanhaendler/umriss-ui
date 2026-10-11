// `pnpm check [package]`: the shrink guard, eslint, the package's typecheck and
// its unit tests, in that order; stops at the first failure and names it.
// Without an argument: every package.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const all = ["core", "charts", "table", "schedule", "calculation", "demo"];
const arg = process.argv[2];
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

run("shrink guard", "node", ["scripts/check-shrunk.mjs"]);
for (const name of arg ? [arg] : all) {
  const filter = ["--filter", `@umriss-ui/${name}`];
  run(`${name}: eslint`, "pnpm", ["exec", "eslint", "--max-warnings", "0", `packages/${name}`]);
  run(`${name}: typecheck`, "pnpm", [...filter, "typecheck"]);
  run(`${name}: test:unit`, "pnpm", [...filter, "test:unit"]);
}
console.log("\ncheck: all passed");
