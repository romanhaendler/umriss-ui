/* The completeness guard of the text for coding agents
   (.scratch/ai-readable-docs, A4): every name a package exports appears in its
   `llms-full.txt`. An export the text does not name is one an agent will not
   find, and guess at instead.

   The other half of A4 - every example compiles as it stands there - needs no
   test of its own: the text carries the example file through `displaySource`,
   the same function the demo shows it with, and the package's typecheck
   compiles that file (`demo/` is in every package's tsconfig).

   The entries are the ones each package's `vite.config.ts` builds, subpaths
   included: a German wording is an export a reader imports too.

   Every export of the main entry that no page names gets its declaration in
   "The rest of the API" - so for those the first check holds by construction,
   and a second one keeps the guard honest: a COMPONENT (an export with a
   `<Name>Props` beside it) must be named by the pages themselves. A new
   component without a page, or dropped from its page, fails here instead of
   sliding quietly into the appendix. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ts from "typescript";
import { missingFrom, renderLlms } from "../src/tooling/llms";
import { apiHtml, tableModel } from "../src/tooling/apiTable";
import { adrLinks, linkedTables, requiredTypes, sourceFiles } from "../src/tooling/props";
import { readProps } from "../src/tooling/propsReader";
import { siteLeaks } from "../src/tooling/references";
import type { Rubric } from "../src/outline";

const PACKAGES = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const ENTRIES: Readonly<Record<string, readonly string[]>> = {
  core: ["src/index.ts", "src/lib/language/de.ts"],
  charts: ["src/index.ts", "src/wording/de.ts"],
  table: ["src/index.ts"],
  schedule: ["src/index.ts"],
  calculation: ["src/index.ts"],
};

/** Every name the entries export - values and types alike, re-exports
    followed, as the compiler sees the module. */
function exportedNames(files: readonly string[]): string[] {
  const program = ts.createProgram([...files], { jsx: ts.JsxEmit.ReactJSX, allowImportingTsExtensions: true, noEmit: true });
  const checker = program.getTypeChecker();
  return files.flatMap((file) => {
    const symbol = checker.getSymbolAtLocation(program.getSourceFile(file)!);
    return symbol === undefined ? [] : checker.getExportsOfModule(symbol).map((one) => one.name);
  });
}

describe("missingFrom", () => {
  it("fails for an export the text does not name, and not for a longer name that contains it", () => {
    expect(missingFrom("A `Gauge` and its `GaugeProps`.", ["Gauge", "GaugeProps", "GAUGE_RANGE"])).toEqual(["GAUGE_RANGE"]);
    expect(missingFrom("`GaugeProps` only.", ["Gauge"])).toEqual(["Gauge"]);
  });

  it("counts only code, not a word in a sentence", () => {
    expect(missingFrom("Read the format first.\n\n```ts\nformatValue(1);\n```\n", ["format", "formatValue"])).toEqual(["format"]);
  });
});

describe.each(Object.keys(ENTRIES))("the llms-full.txt of %s", (dir) => {
  it("names every export of the package, and carries the app's API section on every page", async () => {
    const packageDir = join(PACKAGES, dir);
    const { OUTLINE, EVENTS_APART = false } = (await import(join(packageDir, "demo", "outline.ts"))) as { OUTLINE: readonly Rubric[]; EVENTS_APART?: boolean };
    const types = linkedTables(readProps(sourceFiles(join(packageDir, "src")), requiredTypes(OUTLINE)).types, adrLinks());
    const { full, pages: sitePages } = renderLlms({ packageDir, outline: OUTLINE, tables: types, eventsApart: EVENTS_APART });

    /* No page sends its reader to a requirement they cannot see, and every
       ADR it names is a link (.scratch/props-table-hygiene, 03). */
    for (const page of sitePages) expect(siteLeaks(page.html), page.path).toEqual([]);

    /* The API section the app mounts (`Page.tsx`: the same call, with the
       demo's `EVENTS_APART`) is the one the prerendered page carries. */
    for (const page of OUTLINE.flatMap((rubric) => rubric.pages).filter((one) => one.types.length > 0)) {
      const app = apiHtml(page.types.map((type) => tableModel(types[type]!, EVENTS_APART)));
      expect(sitePages.find((one) => one.path === `${page.id}/`)!.html, page.id).toContain(`<div class="apiTables">${app}</div>`);
    }

    const names = exportedNames(ENTRIES[dir]!.map((entry) => join(packageDir, entry)));
    expect(names.length).toBeGreaterThan(0);
    expect(missingFrom(full, names)).toEqual([]);

    const pages = full.split("\n## The rest of the API\n")[0]!;
    const components = names.filter((name) => names.includes(`${name}Props`));
    expect(components.length).toBeGreaterThan(0);
    expect(missingFrom(pages, components)).toEqual([]);
  }, 60_000);
});
