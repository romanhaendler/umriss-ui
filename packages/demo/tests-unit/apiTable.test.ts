// @vitest-environment jsdom
/* One props table, two writers (.scratch/types-without-holes, 01): the HTML the
   app mounts and the prerendered page carries, and the Markdown of the llms
   text. Both are written from one model, and this holds them to it - a change
   to one writer fails here until the other follows.

   What is compared is what a reader takes from a table: its rows in their
   order, each with its type text, default and required label, and the
   sentences that close it. The HTML is read through the DOM, the Markdown
   through its table syntax. */

import { describe, expect, it } from "vitest";
import { apiHtml, tableHtml, tableMarkdown, tableModel } from "../src/tooling/apiTable";
import type { TypeEntry } from "../src/tooling/tables";

const ENTRY: TypeEntry = {
  name: "GaugeProps",
  parameter: ["T"],
  inherits: "<div>",
  omitted: ["title", "color"],
  alsoTakes: ["LimitProps", "ToneProps", "SizeProps"],
  props: [
    { name: "value", type: "number", optional: false, description: "The value the needle points at." },
    { name: "onChange", type: "(value: number) => void", optional: true, description: "Called with the value\nthe needle moved to." },
    {
      name: "tone",
      type: '"neutral" | "alarm"',
      optional: true,
      defaultValue: '"neutral"',
      description: "What the needle says, as the **verdict** of a `Limit` - see the [Meter](#/meter).",
      inheritedFrom: "ToneProps",
    },
    { name: "rows", type: "readonly T[]", optional: false, description: "Every row, `<b>` and all." },
  ],
};

interface Row {
  name: string;
  type: string;
  defaultValue: string;
  required: boolean;
}

function htmlFacts(html: string): { heading: string; anchor: string; groups: Row[][]; closing: string[] } {
  const host = document.createElement("div");
  host.innerHTML = html;
  const heading = host.querySelector("h3")!;
  return {
    heading: heading.textContent!,
    anchor: heading.id,
    groups: [...host.querySelectorAll("table")].map((table) =>
      [...table.querySelectorAll("tbody tr")].map((tr) => ({
        name: tr.querySelector("th code")!.textContent!,
        type: tr.querySelector(".apiType")!.textContent!,
        defaultValue: tr.querySelectorAll("td")[1]!.textContent!,
        required: tr.querySelector("th")!.textContent!.endsWith("required"),
      })),
    ),
    closing: [...host.querySelectorAll(":scope > div > p")].map((p) => p.textContent!),
  };
}

/** A Markdown cell as a reader sees it: the inline code unwrapped, the
    escaped pipe a pipe again. */
const unmark = (text: string) => text.trim().replace(/\\\|/g, "|").replace(/`+ ?([^`]+?) ?`+/g, "$1").replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, "$1$2");

function markdownFacts(markdown: string): { heading: string; groups: Row[][]; closing: string[] } {
  const lines = markdown.split("\n");
  const groups: Row[][] = [];
  for (const line of lines) {
    if (line.startsWith("|---")) groups.push([]);
    else if (line.startsWith("| ") && groups.length > 0 && !line.startsWith("| Prop |")) {
      const [name, type, defaultValue] = line.slice(2, -2).split(/ (?<!\\)\| /);
      groups.at(-1)!.push({
        name: unmark(name!.replace(/ \*required\*$/, "")),
        type: unmark(type!),
        defaultValue: unmark(defaultValue!),
        required: name!.endsWith(" *required*"),
      });
    }
  }
  return {
    heading: unmark(lines[0]!.replace(/^#+ /, "")),
    groups,
    closing: lines.filter((line) => line.startsWith("Also ")).map(unmark),
  };
}

describe("one table model, two writers", () => {
  for (const eventsApart of [false, true]) {
    it(`write the same rows, in the same order, with the same type, default and required label${eventsApart ? " - events apart" : ""}`, () => {
      const model = tableModel(ENTRY, eventsApart);
      const html = htmlFacts(tableHtml(model));
      const markdown = markdownFacts(tableMarkdown(model));
      expect(html.heading).toBe("GaugeProps<T>");
      expect(markdown.heading).toBe(html.heading);
      expect(markdown.groups).toEqual(html.groups);
      expect(markdown.closing).toEqual(html.closing);
      expect(html.groups.flat().filter((row) => row.required).map((row) => row.name)).toEqual(["value", "rows"]);
      expect(html.groups.flat().find((row) => row.name === "tone")!.defaultValue).toBe('"neutral"');
      expect(html.groups.flat().find((row) => row.name === "value")!.defaultValue).toBe("—");
      expect(html.groups.map((group) => group.map((row) => row.name))).toEqual(
        eventsApart ? [["value", "tone", "rows"], ["onChange"]] : [["value", "onChange", "tone", "rows"]],
      );
    });
  }

  it("anchors the heading at #type-<Name>", () => {
    expect(htmlFacts(tableHtml(tableModel(ENTRY, false))).anchor).toBe("type-GaugeProps");
  });

  it("closes with the parts that have a table of their own and the inherited element", () => {
    expect(htmlFacts(tableHtml(tableModel(ENTRY, false))).closing).toEqual([
      "Also every prop of LimitProps, ToneProps and SizeProps.",
      "Also takes every attribute of <div> – without title, color.",
    ]);
  });

  it("reads `required` as a label in both", () => {
    const model = tableModel(ENTRY, false);
    expect(tableHtml(model)).toContain('<code>value</code><span class="apiBadge">required</span>');
    expect(tableMarkdown(model)).toContain("| `value` *required* | `number` |");
  });

  it("writes a description's marks in each medium, and escapes markup in the HTML", () => {
    const model = tableModel(ENTRY, false);
    const html = tableHtml(model);
    expect(html).toContain('as the <strong>verdict</strong> of a <code>Limit</code> - see the <a href="../meter/">Meter</a>.');
    expect(html).toContain("<code>&lt;b&gt;</code>");
    expect(html).not.toContain("<b>");
    expect(tableMarkdown(model)).toContain("as the **verdict** of a `Limit` - see the [Meter](#/meter). From `ToneProps`. |");
  });

  it("says so where a type declares no props of its own", () => {
    const empty = tableModel({ ...ENTRY, props: [], alsoTakes: [], inherits: undefined }, false);
    expect(tableHtml(empty)).toContain('<p class="apiInherited">Declares no props of its own.</p>');
    expect(tableMarkdown(empty)).toContain("Declares no props of its own.");
  });

  it("joins a page's tables into one API section", () => {
    const models = [tableModel(ENTRY, false), tableModel({ ...ENTRY, name: "MeterProps" }, false)];
    expect(apiHtml(models)).toBe(models.map(tableHtml).join(""));
  });
});
