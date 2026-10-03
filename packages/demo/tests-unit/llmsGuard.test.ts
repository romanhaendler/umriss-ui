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

   Every export stands on the package's API index (ADR-0044); where a package
   has none yet, every export of the main entry that no table and no
   definition explains gets its declaration in "The rest of the API" - so for
   those the first check holds by construction,
   and a second one keeps the guard honest: a COMPONENT (an export with a
   `<Name>Props` beside it) must be named by the pages themselves. A new
   component without a page, or dropped from its page, fails here instead of
   sliding quietly into the appendix. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ts from "typescript";
import { missingFrom, renderLlms } from "../src/tooling/llms";
import { apiHtml, apiSection } from "../src/tooling/apiTable";
import { adrLinks, linkedTables, readPackage } from "../src/tooling/props";
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
    const { OUTLINE } = (await import(join(packageDir, "demo", "outline.ts"))) as { OUTLINE: readonly Rubric[] };
    const types = linkedTables(readPackage(packageDir, OUTLINE).types, adrLinks());
    const { full, pages: sitePages } = renderLlms({ packageDir, outline: OUTLINE, tables: types });

    /* No page sends its reader to a requirement they cannot see, and every
       ADR it names is a link (.scratch/props-table-hygiene, 03). */
    for (const page of sitePages) expect(siteLeaks(page.html), page.path).toEqual([]);

    /* The API section the app mounts (`Page.tsx`: the same call) is the one the
       prerendered page carries. */
    const all = OUTLINE.flatMap((rubric) => rubric.pages);
    for (const page of all.filter((one) => one.types.length > 0)) {
      const app = apiHtml(apiSection(page, all, types));
      expect(sitePages.find((one) => one.path === `${page.id}/`)!.html, page.id).toContain(`<div class="apiTables">${app}</div>`);
    }

    /* The keys of another page link its Keyboard section, and a page's
       accessibility stands as a section of its own (.scratch/a11y-and-finish, 01). */
    for (const page of OUTLINE.flatMap((rubric) => rubric.pages)) {
      const html = sitePages.find((one) => one.path === `${page.id}/`)!.html;
      for (const id of (page.keysOf ?? []).filter((one) => typeof one === "string")) {
        expect(html, page.id).toContain(`/${id}/#keyboard-${id}">`);
        expect(sitePages.find((one) => one.path === `${id}/`)!.html, id).toContain(`<h2 id="keyboard-${id}">Keyboard</h2>`);
      }
      /* A neighbour's page is one of its demo's pages, and the link lands on
         its Keyboard section there. */
      for (const { page: foreign } of (page.keysOf ?? []).filter((one) => typeof one !== "string")) {
        const [packageName, id] = foreign.split("#") as [string, string];
        const { OUTLINE: theirs } = (await import(join(PACKAGES, packageName.split("/")[1]!, "demo", "outline.ts"))) as { OUTLINE: readonly Rubric[] };
        expect(theirs.flatMap((rubric) => rubric.pages).map((one) => one.id), `${page.id} → ${foreign}`).toContain(id);
        expect(html, `${page.id} → ${foreign}`).toContain(`/${id}/#keyboard-${id}">`);
      }
      if (page.accessibility !== undefined) expect(html, page.id).toContain(`<h2 id="accessibility-${page.id}">Accessibility</h2>`);
    }

    const names = exportedNames(ENTRIES[dir]!.map((entry) => join(packageDir, entry)));
    expect(names.length).toBeGreaterThan(0);
    expect(missingFrom(full, names)).toEqual([]);

    /* Where the package has an API index, every name stands there with its
       anchor (ADR-0044) - and the index is no page that names a component
       for the check below. */
    const index = sitePages.find((one) => one.path === "api/");
    if (index !== undefined) {
      for (const name of names) expect(index.html.includes(`id="${name}"`) || index.html.includes(`id="type-${name}"`), name).toBe(true);
    }
    const pages = full.split("\n## The rest of the API\n")[0]!.split("\n## API index\n")[0]!;
    const components = names.filter((name) => names.includes(`${name}Props`));
    expect(components.length).toBeGreaterThan(0);
    expect(missingFrom(pages, components)).toEqual([]);

    /* The holes the spec names: a type a table names is defined on its page,
       and what neither a table nor a definition explains stands in the
       appendix with its declaration (types-without-holes). */
    const { defined, appendix } = KNOWN[dir]!;
    for (const name of defined) expect(pages, name).toMatch(new RegExp(`^###### \`${name}(<[^\`]*>)?\`$`, "m"));
    const rest = full.split("\n## The rest of the API\n")[1] ?? "";
    for (const name of appendix) expect(rest, name).toContain(`### \`${name}\`\n\n\`\`\`ts\n`);
  }, 60_000);
});

const KNOWN: Readonly<Record<string, { defined: readonly string[]; appendix: readonly string[] }>> = {
  core: { defined: ["ButtonSize", "Wording"], appendix: ["useTree", "useToast"] },
  charts: { defined: ["Accessor"], appendix: ["controlLimits"] },
  table: { defined: ["TableRef", "Limit"], appendix: ["useTable"] },
  schedule: { defined: ["Intent"], appendix: ["applyIntent"] },
  calculation: { defined: ["Limit"], appendix: [] },
};
