/* Each ADR's status is written once, in its file's Status line; the index
   row repeats it word for word, and every ADR file has exactly one row. */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ADR = join(ROOT, "docs", "adr");

it("gives each ADR one index row with its Status line, word for word", () => {
  const rows = new Map<string, string>();
  for (const line of readFileSync(join(ADR, "README.md"), "utf8").split("\n")) {
    const match = line.match(/^\| \[(\d{4})\]\(/);
    if (match) rows.set(match[1]!, line.split("|").map((cell) => cell.trim())[4]!);
  }
  const problems: string[] = [];
  const files = readdirSync(ADR).filter((name) => /^\d{4}-.*\.md$/.test(name));
  for (const name of files) {
    const number = name.slice(0, 4);
    const status = readFileSync(join(ADR, name), "utf8").split("\n").find((line) => line.startsWith("Status: "))?.slice("Status: ".length).trim();
    if (status === undefined) problems.push(`${number}: no Status line`);
    else if (!rows.has(number)) problems.push(`${number}: no index row`);
    else if (rows.get(number) !== status) problems.push(`${number}: file "${status}", index "${rows.get(number)}"`);
  }
  for (const number of rows.keys()) if (!files.some((name) => name.startsWith(number))) problems.push(`${number}: index row without a file`);
  expect(problems).toEqual([]);
});
