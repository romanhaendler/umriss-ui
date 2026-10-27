/* The agent skill (skills/umriss-ui/SKILL.md) names only what exists: every
   name it imports, and every hook or multi-word component it puts in code
   font, is exported by some package's entry. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ENTRIES = ["core/src/index.ts", "core/src/lib/language/de.ts", "charts/src/index.ts", "charts/src/wording/de.ts", "table/src/index.ts", "schedule/src/index.ts", "calculation/src/index.ts", "dashboard/src/index.ts", "alarms/src/index.ts"].map((f) => join(ROOT, "packages", f));

it("names no export that no package has", () => {
  const program = ts.createProgram(ENTRIES, { jsx: ts.JsxEmit.ReactJSX, allowImportingTsExtensions: true, noEmit: true });
  const checker = program.getTypeChecker();
  const exported = new Set(ENTRIES.flatMap((file) => checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(file)!)!).map((one) => one.name)));
  const skill = readFileSync(join(ROOT, "skills", "umriss-ui", "SKILL.md"), "utf8");
  const named = [
    ...[...skill.matchAll(/import \{([^}]+)\} from "@umriss-ui/g)].flatMap((m) => m[1]!.split(",").map((n) => n.trim())),
    ...[...skill.matchAll(/`(use[A-Z]\w*|[A-Z][a-z]+(?:[A-Z][a-z]+)+|[A-Z]+(?:_[A-Z]+)+)`/g)].map((m) => m[1]!),
  ];
  expect(named.length).toBeGreaterThan(5);
  expect(named.filter((n) => !exported.has(n))).toEqual([]);
});
