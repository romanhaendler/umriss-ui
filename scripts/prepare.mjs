/* `pnpm install` runs this: point git at the repo's hooks, in a checkout only.
   Node instead of shell syntax, so it runs the same under cmd.exe. */
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

if (existsSync(".git")) {
  try {
    execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
  } catch {
    /* no git on PATH: the hooks are optional, the install is not */
  }
}
