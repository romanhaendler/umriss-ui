/* The documentation is not hosted: no tracked live file names the old Pages
   address. History is excluded by name - changelogs, the journal, research,
   the archive, the ADRs and the open work. */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { HOSTED_HOST as HOSTED } from "../src/address";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HISTORY = /(^|\/)CHANGELOG\.md$|^docs\/(journal\.md|research\/|archive\/|adr\/)|^\.scratch\//;

it("names the hosted address in no live file", () => {
  const files = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 }).split("\0").filter((f) => f && !HISTORY.test(f));
  const named = files.filter((f) => {
    try {
      return readFileSync(join(ROOT, f), "utf8").includes(HOSTED);
    } catch {
      return false;
    }
  });
  expect(files.length).toBeGreaterThan(100);
  expect(named).toEqual([]);
});
