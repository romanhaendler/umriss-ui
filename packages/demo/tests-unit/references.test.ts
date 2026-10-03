/* What a reader's text may name, and how (.scratch/props-table-hygiene, 03):
   no requirement number and no source path, and every ADR number a link to
   its file. The props reader's half - a flag with file and line - stands in
   `propsReader.test.ts`; the guard over every prerendered page of the five
   demos in `llmsGuard.test.ts`. */

import { describe, expect, it } from "vitest";
import { adrLinksOf, internalReferences, linkAdrs, linkAdrSpans, linkReferences, siteLeaks, ADR_HOME } from "../src/tooling/references";
import { referenceHtml, type ReferenceTable } from "../src/tooling/referenceTable";
import { adrLinks, linkedTables, outlineFlags } from "../src/tooling/props";
import { tableHtml, tableMarkdown, tableModel } from "../src/tooling/apiTable";
import { ADR_0032, type Rubric } from "../src/outline";

const LINKS = adrLinksOf(["0021-the-styles-load-themselves.md", "0032-what-umriss-is-not.md", "README.md"]);
const STYLES = `${ADR_HOME}0021-the-styles-load-themselves.md`;

describe("the ADR links", () => {
  it("are read by number from the file names, and the repository's resolve - ADR-0032 to its page on the site", () => {
    expect(LINKS).toEqual({ "0021": STYLES, "0032": ADR_0032 });
    expect(adrLinks()["0001"]).toMatch(/\/docs\/adr\/0001-[\w-]+\.md$/);
  });

  it("turn every bare mention into a link, and leave one already linked or in code alone", () => {
    expect(linkAdrs("No rule on `html` (ADR-0021).", LINKS)).toBe(`No rule on \`html\` ([ADR-0021](${STYLES})).`);
    expect(linkAdrs("Why: [ADR-0032](https://example.org/a.md), and `ADR-0021`.", LINKS)).toBe("Why: [ADR-0032](https://example.org/a.md), and `ADR-0021`.");
  });

  it("link a reference table's plain pieces, and leave its code alone", () => {
    expect(linkAdrSpans([{ kind: "text", text: "Folded (ADR-0021): how many." }, { kind: "code", text: "ADR-0032" }], LINKS)).toEqual([
      { kind: "text", text: "Folded (" },
      { kind: "link", text: "ADR-0021", href: STYLES },
      { kind: "text", text: "): how many." },
      { kind: "code", text: "ADR-0032" },
    ]);
  });

  it("link a reference table's group titles and notes as well as its rows", () => {
    const table: ReferenceTable = {
      title: "Tokens",
      anchor: "tokens",
      lead: [],
      columns: ["Token"],
      groups: [{ title: [{ kind: "text", text: "Styles (ADR-0021)" }], note: [[{ kind: "text", text: "See ADR-0032." }]], rows: [] }],
    };
    const [group] = linkReferences({ theming: [table] }, LINKS).theming![0]!.groups;
    expect(group!.title).toContainEqual({ kind: "link", text: "ADR-0021", href: STYLES });
    expect(group!.note![0]).toContainEqual({ kind: "link", text: "ADR-0032", href: ADR_0032 });
    expect(siteLeaks(referenceHtml(linkReferences({ theming: [table] }, LINKS).theming![0]!))).toEqual([]);
  });

  it("stop at a number no file answers", () => {
    expect(() => linkAdrs("Argued in ADR-9999.", LINKS)).toThrow(/ADR-9999 names no file/);
  });
});

describe("internalReferences", () => {
  it("finds a requirement number, a source path and a source file", () => {
    expect(internalReferences("Binding to a y axis (R-4.12); see R-3.3.5.", LINKS)).toEqual(["R-4.12", "R-3.3.5"]);
    expect(internalReferences("See `lib/language`, or src/index.", LINKS)).toEqual(["lib/language", "src/index"]);
    expect(internalReferences("As `useTable.tsx` does, with `theme.css`.", LINKS)).toEqual(["useTable.tsx", "theme.css"]);
  });

  it("finds an ADR number no file answers, and nothing in an ADR number that resolves", () => {
    expect(internalReferences("(ADR-0021), (ADR-9999)", LINKS)).toEqual(["ADR-9999"]);
  });

  it("leaves a package's subpath and a link's address alone - what a reader imports or follows", () => {
    expect(internalReferences("`@umriss-ui/core/styles.css` stays exported.", LINKS)).toEqual([]);
    expect(internalReferences("See [the theme](https://example.org/src/theme.ts).", LINKS)).toEqual([]);
  });
});

describe("outlineFlags", () => {
  const OUTLINE: Rubric[] = [
    {
      id: "basics",
      name: "Basics",
      sentence: "The first steps.",
      pages: [
        { id: "axis", name: "Axis", sentence: "An axis.", limits: ["No log scale (R-4.1)."], types: [], exports: [] },
        { id: "theme", name: "Theme", sentence: "See `src/theme.ts`.", types: [], exports: [] },
      ],
    },
  ];
  const SOURCE = ['export const OUTLINE = [', '  { id: "axis",', '    limits: ["No log scale (R-4.1)."] },', '  { id: "theme", sentence: "See `src/theme.ts`." },', "];"].join("\n");

  it("lists every page text with an internal reference, with its line in the outline", () => {
    expect(outlineFlags(OUTLINE, SOURCE, LINKS)).toEqual([
      { line: 3, where: "axis", found: ["R-4.1"] },
      { line: 4, where: "theme", found: ["src/theme.ts"] },
    ]);
  });
});

describe("both writers", () => {
  it("render an ADR link and the Language link from the same row", () => {
    const tables = linkedTables(
      {
        LanguageProps: {
          name: "LanguageProps",
          parameter: [],
          omitted: [],
          props: [{ name: "language", type: "Language", optional: true, description: "Formats (ADR-0021) - see [Language](#/language)." }],
        },
      },
      LINKS,
    );
    const model = tableModel(tables.LanguageProps!);
    expect(tableHtml(model)).toContain(`Formats (<a href="${STYLES}">ADR-0021</a>) - see <a href="../language/">Language</a>.`);
    expect(tableMarkdown(model)).toContain(`Formats ([ADR-0021](${STYLES})) - see [Language](#/language).`);
  });
});

describe("siteLeaks", () => {
  it("finds a requirement number anywhere and an ADR number outside a link - a code block may name one", () => {
    expect(siteLeaks(`<p>Gap (R-2.5), <a href="${STYLES}">ADR-0021</a></p><pre><code>// (ADR-0008)</code></pre>`)).toEqual(["R-2.5"]);
    expect(siteLeaks("<p>As decided (ADR-0021).</p>")).toEqual(["ADR-0021"]);
  });
});
