/* What the palette searches, in one shape for every kind of find
   (.scratch/one-search).

   The generator writes a package's entries as its search fragment
   (`demo/.generated/search.json`, `tooling/llms.ts`), from the same outline
   and example files as the pages, so that the search cannot find what the
   site does not show. The shell searches them; until the fragment has
   arrived it takes the same entries from the outline it already holds.

   An entry's address is the site's, with the package's directory in it:
   `/table/width-and-pinning/`, `/core/select/#clear-the-choice`. One form for
   every package, so that fragments of five demos can stand in one index.

   Like the outline, this file imports nothing but the outline (and types):
   the generator loads it in Node without a bundler. */

import { API_INDEX, SCENARIOS, addressOfPlace, type Rubric } from "./outline.ts";
import type { ApiIndexModel } from "./tooling/apiIndex.ts";
import type { Span } from "./tooling/apiTable.ts";
import type { ReferenceTable } from "./tooling/referenceTable.ts";

/** What a find is, from the broadest answer to the narrowest - the order the
    palette ranks them in when they match alike. */
export type SearchKind = "page" | "scenario" | "example" | "export" | "prop" | "token" | "wording";

export interface SearchEntry {
  /** Below the site's root, with an optional anchor: `/core/select/#basic`. */
  address: string;
  /** Searched first, and shown. */
  label: string;
  /** `<package> · <rubric or page>`: the heading it stands under, searched
      second. */
  group: string;
  kind: SearchKind;
  /** Searched last, never shown: a page's lede, an example's lead. */
  keywords?: readonly string[];
}

/** A text of the outline without its marks: `code` and [links](#/page) as
    the words they show. */
export function plain(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1").replace(/`+ ?([^`]+?) ?`+/g, "$1");
}

/** A page's props tables, as far as the search reads them: each table's
    type, and each row's name and the type it is inherited from. */
export interface PropsOfPage {
  pageId: string;
  tables: readonly { name: string; groups: readonly { rows: readonly { name: string; origin?: string }[] }[] }[];
}

/** A package's props (.scratch/one-search 04): one entry per row, at its
    anchor `#<Type>-<prop>`, grouped under its type - `size` of `ButtonProps`
    is not `size` of `TableProps`. A table shown on several pages is found on
    the first; a row inherited from a type whose own row is found already is
    not found twice. */
export function propEntries(packageId: string, pages: readonly PropsOfPage[]): SearchEntry[] {
  const rows = new Map<string, { entry: SearchEntry; declared?: string }>();
  for (const { pageId, tables } of pages) {
    for (const table of tables) {
      for (const row of table.groups.flatMap((group) => group.rows)) {
        const anchor = `${table.name}-${row.name}`;
        if (rows.has(anchor)) continue;
        rows.set(anchor, {
          entry: { address: `/${packageId}${addressOfPlace(`/${pageId}/${anchor}`)}`, label: row.name, group: `${packageId} · ${table.name}`, kind: "prop" },
          ...(row.origin === undefined ? {} : { declared: `${row.origin}-${row.name}` }),
        });
      }
    }
  }
  return [...rows.values()].filter(({ declared }) => declared === undefined || !rows.has(declared)).map(({ entry }) => entry);
}

/** A package's entries: its front page, its scenarios, its pages and its
    examples. `packageId` is the package's directory on the site (`core`). */
export function searchEntries(
  packageId: string,
  outline: readonly Rubric[],
  scenarios: readonly { id: string; title: string }[],
  examples: readonly { pageId: string; id: string; title: string; lead?: string }[],
): SearchEntry[] {
  const at = (place: string) => `/${packageId}${addressOfPlace(place)}`;
  const scenariosGroup = `${packageId} · Scenarios`;
  const pages = outline.flatMap((rubric) => rubric.pages.map((page) => ({ page, rubric })));
  return [
    { address: at(""), label: "Scenarios", group: scenariosGroup, kind: "page" },
    ...scenarios.map((scenario): SearchEntry => ({ address: at(`/${SCENARIOS}/${scenario.id}`), label: scenario.title, group: scenariosGroup, kind: "scenario" })),
    ...pages.map(({ page, rubric }): SearchEntry => ({
      address: at(`/${page.id}`),
      label: page.name,
      group: `${packageId} · ${rubric.name}`,
      kind: "page",
      keywords: [plain(page.sentence)],
    })),
    ...examples.map((example): SearchEntry => ({
      address: at(`/${example.pageId}/${example.id}`),
      label: example.title,
      group: `${packageId} · ${pages.find(({ page }) => page.id === example.pageId)?.page.name ?? example.pageId}`,
      kind: "example",
      ...(example.lead === undefined ? {} : { keywords: [plain(example.lead)] }),
    })),
  ];
}

/** A page's reference tables as entries, one a row, landing on the row
    (.scratch/one-search 06): the Theming page's tokens, the Language page's
    wording keys. A table with an English and a German column is wording, and
    its two texts are the keywords - a string seen on screen, in either
    language, finds the key behind it. A row's label is its first cell. */
export function referenceEntries(packageId: string, outline: readonly Rubric[], references: Readonly<Record<string, readonly ReferenceTable[]>>): SearchEntry[] {
  const words = (cell: readonly Span[] | undefined) => (cell ?? []).flatMap((span) => (span.kind === "swatch" ? [] : [span.text])).join("");
  return outline.flatMap((rubric) =>
    rubric.pages.flatMap((page) =>
      (references[page.id] ?? []).flatMap((table) => {
        const texts = [table.columns.indexOf("English"), table.columns.indexOf("German")];
        const wording = !texts.includes(-1);
        return table.groups.flatMap((group) =>
          group.rows.map(
            (row): SearchEntry => ({
              address: `/${packageId}${addressOfPlace(`/${page.id}/${row.anchor}`)}`,
              label: words(row.cells[0]),
              group: `${packageId} · ${page.name}`,
              kind: wording ? "wording" : "token",
              ...(wording ? { keywords: texts.map((at) => words(row.cells[at])) } : {}),
            }),
          ),
        );
      }),
    ),
  );
}

/** A package's exports as its API index shows them (.scratch/one-search 05),
    each landing on its entry there: `/core/api/#useToast`. An export the
    index only refers onwards is found where it leads - a component as its
    page, a type with a table by its props. */
export function exportEntries(packageId: string, index: ApiIndexModel): SearchEntry[] {
  return index.groups.flatMap((group) =>
    group.entries.flatMap((entry): SearchEntry[] =>
      entry.home === undefined
        ? [{ address: `/${packageId}${addressOfPlace(`/${API_INDEX}/${entry.anchor}`)}`, label: entry.name, group: `${packageId} · API index`, kind: "export" }]
        : [],
    ),
  );
}
