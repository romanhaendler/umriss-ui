/* A reference table: one model, two writers, as the props tables have them
   (`apiTable.ts`) - for the tables a page carries beside its API, such as the
   Language page's wording (.scratch/theming-and-wording-reference).

   The model is a section of its own: a title, a sentence, then groups of rows
   under the same columns, every row with an anchor a link can name. The HTML
   is what the app mounts and the prerendered page carries; the Markdown is
   the llms text's. The section's heading is the page's, in both media, as the
   API section's is.

   Pure, and without Vite, React or Node: it runs in the browser and in the
   generator alike, which is why the import carries its extension. */

import { escape, markdownCell, spansHtml, spansMarkdown } from "./apiTable.ts";
import type { Span } from "./apiTable.ts";

export interface ReferenceRow {
  /** The row's id: `wording-noMatches`. */
  anchor: string;
  /** One run of pieces per column; the first is the row's header. */
  cells: readonly (readonly Span[])[];
}

export interface ReferenceGroup {
  /** A sub-heading above the group's table - none for a table of one group. */
  title?: string;
  /** Paragraphs between the sub-heading and the table - a stylesheet
      section's own text above its tokens. */
  note?: readonly (readonly Span[])[];
  rows: readonly ReferenceRow[];
}

export interface ReferenceTable {
  /** The section's heading: `Wording`. */
  title: string;
  /** The heading's id: `wording`. */
  anchor: string;
  /** The sentence before the tables. */
  lead: readonly Span[];
  columns: readonly string[];
  groups: readonly ReferenceGroup[];
}

/** The section's body as HTML - no whitespace between the elements, as
    React writes it. A cell carries its column's name for a phone, where the
    table stands as one block a row. */
export function referenceHtml(table: ReferenceTable): string {
  const head = `<thead><tr>${table.columns.map((column) => `<th scope="col">${escape(column)}</th>`).join("")}</tr></thead>`;
  return (
    `<p class="apiInherited">${spansHtml(table.lead)}</p>` +
    table.groups
      .map(
        (group) =>
          '<div class="apiBlock">' +
          (group.title === undefined ? "" : `<h3 class="apiTitle">${escape(group.title)}</h3>`) +
          (group.note ?? []).map((paragraph) => `<p class="apiInherited">${spansHtml(paragraph)}</p>`).join("") +
          `<div class="apiRole"><table class="apiTable referenceTable" aria-label="${escape(group.title === undefined ? table.title : `${table.title}: ${group.title}`)}">${head}<tbody>` +
          group.rows
            .map(
              (row) =>
                `<tr id="${escape(row.anchor)}">` +
                row.cells.map((cell, i) => (i === 0 ? `<th scope="row">${spansHtml(cell)}</th>` : `<td data-label="${escape(table.columns[i] ?? "")}">${spansHtml(cell)}</td>`)).join("") +
                "</tr>",
            )
            .join("") +
          "</tbody></table></div></div>",
      )
      .join("")
  );
}

/** The section's body as Markdown, a group's heading one level below the
    section's. */
export function referenceMarkdown(table: ReferenceTable): string {
  const lines = [spansMarkdown(table.lead)];
  for (const group of table.groups) {
    if (group.title !== undefined) lines.push("", `##### ${group.title}`);
    for (const paragraph of group.note ?? []) lines.push("", spansMarkdown(paragraph));
    lines.push("", `| ${table.columns.join(" | ")} |`, `|${table.columns.map(() => "---|").join("")}`);
    for (const row of group.rows) lines.push(`| ${row.cells.map((cell) => markdownCell(spansMarkdown(cell))).join(" | ")} |`);
  }
  return lines.join("\n");
}
