// Fails when a tracked text file that still exists is now empty, or had at
// least 20 lines and lost more than 80 % of them - the working tree (staged and
// unstaged) against HEAD. Deleted files are fine.
// `node scripts/check-shrunk.mjs [--allow <path>]...`
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const allowed = new Set();
for (let i = 0; i < args.length; i++) if (args[i] === "--allow") allowed.add(args[++i]);

const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28 });
const root = git("rev-parse", "--show-toplevel").trim();
process.chdir(root);

const lines = (text) => (text === "" ? 0 : text.split("\n").length - (text.endsWith("\n") ? 1 : 0));
const bad = [];
for (const path of git("diff", "HEAD", "--name-only", "--diff-filter=M", "-z").split("\0").filter(Boolean)) {
  if (allowed.has(path) || !existsSync(path)) continue;
  const before = execFileSync("git", ["show", `HEAD:${path}`], { maxBuffer: 1 << 28 });
  if (before.includes(0)) continue; // binary
  const was = lines(before.toString("utf8"));
  const now = lines(readFileSync(path, "utf8"));
  if (was > 0 && now === 0) bad.push(`${path}: now empty (was ${was} lines)`);
  else if (was >= 20 && now < was * 0.2) bad.push(`${path}: ${was} -> ${now} lines`);
}
if (bad.length) {
  console.error(`check-shrunk: a file shrank by more than it should (--allow <path> lets a deliberate case through):\n  ${bad.join("\n  ")}`);
  process.exit(1);
}
