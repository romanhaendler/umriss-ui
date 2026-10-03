// @vitest-environment jsdom
/* The wording tables (.scratch/theming-and-wording-reference, 04): an
   interface and two objects in, the rows a reader sees out - and those rows
   the same in the HTML the page mounts and in the Markdown of the llms text. */

import { describe, expect, it } from "vitest";
import { readEntries, readTexts, wordingTable } from "../src/tooling/wordingTable";
import { referenceHtml, referenceMarkdown, type ReferenceTable } from "../src/tooling/referenceTable";

const ENGLISH = `
/** Everything said. */
export interface Words {
  /** The cross in the field. */
  clearInput: string;
  /* -------- Lists ------------------------------------------------- */
  /** The count, \`count\` already a number. */
  selected: (count: number, formatted?: string) => string;
  noMatches: string;
  /** The quick picks. */
  presets: {
    today: string;
    /** The day before. */
    yesterday: string;
  };
  weekdays: readonly string[];
}

export const ENGLISH_WORDS: Words = {
  clearInput: "Clear input",
  selected: (count) =>
    \`\${count} selected\`,
  noMatches: "No matches",
  presets: { today: "Today", yesterday: "Yesterday" },
  weekdays: ["Mon", "Tue"],
};
`;

const GERMAN = `
import type { Words } from "./words";
export const GERMAN_WORDS: Words = {
  clearInput: "Eingabe leeren",
  selected: (count) => \`\${count} gewählt\`,
  noMatches: "Keine Treffer",
  presets: { today: "Heute", yesterday: "Gestern" },
  weekdays: ["Mo", "Di"],
};
`;

const TABLE = wordingTable({
  title: "Wording",
  anchor: "wording",
  lead: "Every entry.",
  entries: readEntries(ENGLISH, "Words"),
  english: readTexts(ENGLISH, "ENGLISH_WORDS"),
  german: readTexts(GERMAN, "GERMAN_WORDS"),
});

/** A row as a reader takes it: anchor, then each cell's text. */
const rows = (table: ReferenceTable) => table.groups.flatMap((group) => group.rows.map((row) => [row.anchor, ...row.cells.map((cell) => cell.map((span) => span.text).join(""))]));

describe("the wording reader", () => {
  it("writes a string entry as its text, with the comment the interface carries", () => {
    expect(rows(TABLE)[0]).toEqual(["wording-clearInput", "clearInput", "Clear input", "Eingabe leeren", "The cross in the field."]);
  });

  it("writes a function entry as its key with the interface's parameters and its body as code", () => {
    const row = TABLE.groups[1]!.rows[0]!;
    expect(row.anchor).toBe("wording-selected");
    expect(row.cells[0]).toEqual([{ kind: "code", text: "selected(count, formatted)" }]);
    expect(row.cells[1]).toEqual([{ kind: "code", text: "`${count} selected`" }]);
    expect(row.cells[2]).toEqual([{ kind: "code", text: "`${count} gewählt`" }]);
    expect(row.cells[3]).toEqual([{ kind: "text", text: "The count, " }, { kind: "code", text: "count" }, { kind: "text", text: " already a number." }]);
  });

  it("flattens a nested entry with dots, its own comment before its parent's", () => {
    expect(rows(TABLE).filter(([anchor]) => anchor!.includes("presets"))).toEqual([
      ["wording-presets.today", "presets.today", "Today", "Heute", "The quick picks."],
      ["wording-presets.yesterday", "presets.yesterday", "Yesterday", "Gestern", "The day before."],
    ]);
  });

  it("groups by the interface's section comments", () => {
    expect(TABLE.groups.map((group) => [group.title?.map((span) => span.text).join(""), group.rows.length])).toEqual([
      [undefined, 1],
      ["Lists", 5],
    ]);
  });

  it("writes a dash for an entry without a comment, and any other value as written", () => {
    expect(rows(TABLE).find(([anchor]) => anchor === "wording-noMatches")!.at(-1)).toBe("—");
    expect(rows(TABLE).find(([anchor]) => anchor === "wording-weekdays")!.slice(2, 4)).toEqual(['["Mon", "Tue"]', '["Mo", "Di"]']);
  });

  it("stops at an entry one of the objects does not carry", () => {
    expect(() =>
      wordingTable({ title: "Wording", anchor: "wording", lead: "", entries: readEntries(ENGLISH, "Words"), english: readTexts(ENGLISH, "ENGLISH_WORDS"), german: new Map() }),
    ).toThrow("`clearInput` has no German text");
  });
});

describe("one reference table, two writers", () => {
  it("write the same rows in the same order, each row anchored in the HTML", () => {
    const host = document.createElement("div");
    host.innerHTML = referenceHtml(TABLE);
    const html = [...host.querySelectorAll("tbody tr")].map((tr) => [tr.id, ...[...tr.children].map((cell) => cell.textContent)]);
    expect(html).toEqual(rows(TABLE));
    expect([...host.querySelectorAll("h3")].map((h) => h.textContent)).toEqual(["Lists"]);

    /* A cell as a reader sees it: a code span with backticks inside unwrapped
       whole, the others one by one. */
    const unmark = (cell: string) => {
      const fenced = /^(`{2,}) (.*) \1$/.exec(cell.replace(/\\\|/g, "|"));
      return fenced === null ? cell.replace(/\\\|/g, "|").replace(/`([^`]+)`/g, "$1") : fenced[2];
    };
    const markdown = referenceMarkdown(TABLE)
      .split("\n")
      .filter((line) => line.startsWith("| ") && !line.startsWith("| Key |"))
      .map((line) => line.slice(2, -2).split(/ (?<!\\)\| /).map(unmark));
    expect(markdown).toEqual(html.map(([, ...cells]) => cells));
    expect(referenceMarkdown(TABLE)).toContain("##### Lists");
  });
});
