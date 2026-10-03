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
    { name: "limit", type: "number", optional: true, deprecated: "Is called `max` now.", description: "The old name of `max`." },
    { name: "onChange", type: "(value: number) => void", optional: true, description: "Called with the value\nthe needle moved to." },
    {
      name: "tone",
      type: '"neutral" | "alarm"',
      optional: true,
      defaultValue: '"neutral"',
      description: "What the needle says, as the **verdict** of a `Limit` - see the [Meter](#/meter).",
      inheritedFrom: "ToneProps",
    },
    {
      name: "max",
      type: "number",
      optional: true,
      defaultValue: "the largest value, else `100`",
      defaultIsPhrase: true,
      description: "Where the scale ends.",
    },
    { name: "rows", type: "readonly T[]", optional: false, description: "Every row, `<b>` and all." },
    { name: "size", type: "GaugeSize", expansion: '"sm" | "md"', optional: true, description: "How tall the gauge stands." },
  ],
};

/* Declared out of every order the table reads in (.scratch/props-table-hygiene, 01). */
const GROUPED: TypeEntry = {
  name: "PickerProps",
  parameter: [],
  omitted: [],
  props: [
    ["className", "string"],
    ["onValueChange", "(value: string) => void"],
    ["aria-label", "string"],
    ["label", "string", "Is `aria-label` now."],
    ["onClick", "() => void"],
    ["value", "string"],
    ["role", "string"],
    ["defaultValue", "string"],
    ["rowStyle", "CSSProperties"],
    ["ariaDescription", "string"],
    ["style", "CSSProperties"],
    ["tone", "string"],
    ["onOpenChange", "(open: boolean) => void"],
  ].map(([name, type, deprecated]) => ({
    name: name!,
    type: type!,
    optional: true,
    description: `The ${name}.`,
    ...(deprecated === undefined ? {} : { deprecated }),
  })),
};

describe("the groups of a table (.scratch/props-table-hygiene)", () => {
  const names = (entry: TypeEntry) => tableModel(entry).groups.map((group) => [group.title, group.rows.map((one) => one.name)]);

  it("reads Main, then Events, Accessibility and Styling - a controlled triple together, the deprecated last", () => {
    expect(names(GROUPED)).toEqual([
      [undefined, ["defaultValue", "value", "onValueChange", "tone", "label"]],
      ["Events", ["onClick", "onOpenChange"]],
      ["Accessibility", ["aria-label", "role", "ariaDescription"]],
      ["Styling", ["className", "rowStyle", "style"]],
    ]);
  });

  it("gives a table of main rows alone no sub-heading", () => {
    const main = { ...GROUPED, props: GROUPED.props.filter((prop) => ["value", "tone", "label"].includes(prop.name)) };
    expect(names(main)).toEqual([[undefined, ["value", "tone", "label"]]]);
    expect(tableHtml(tableModel(main))).not.toContain("<h4");
    expect(tableMarkdown(tableModel(main))).not.toContain("######");
  });

  it("leaves a group out where no row falls into it", () => {
    expect(names({ ...GROUPED, props: GROUPED.props.filter((prop) => prop.name === "style" || prop.name === "onClick") })).toEqual([
      ["Events", ["onClick"]],
      ["Styling", ["style"]],
    ]);
  });
});

interface Row {
  name: string;
  type: string;
  /** The values beneath an alias's name; empty where there are none. */
  expansion: string;
  defaultValue: string;
  required: boolean;
  deprecated: boolean;
}

function htmlFacts(html: string): { heading: string; anchor: string; titles: string[]; groups: Row[][]; closing: string[] } {
  const host = document.createElement("div");
  host.innerHTML = html;
  const heading = host.querySelector("h3")!;
  return {
    heading: heading.textContent!,
    anchor: heading.id,
    titles: [...host.querySelectorAll("h4")].map((h4) => h4.textContent!),
    groups: [...host.querySelectorAll("table")].map((table) =>
      [...table.querySelectorAll("tbody tr")].map((tr) => ({
        name: tr.querySelector("th code")!.textContent!,
        type: tr.querySelector(".apiType")!.textContent!,
        expansion: tr.querySelector(".apiType + br + code")?.textContent ?? "",
        defaultValue: tr.querySelectorAll("td")[1]!.textContent!,
        required: tr.querySelector("th")!.textContent!.endsWith("required"),
        deprecated: tr.querySelectorAll("td")[2]!.textContent!.startsWith("Deprecated "),
      })),
    ),
    closing: [...host.querySelectorAll(":scope > div > p")].map((p) => p.textContent!),
  };
}

/** A Markdown cell as a reader sees it: the inline code unwrapped, the
    escaped pipe a pipe again. */
const unmark = (text: string) => text.trim().replace(/\\\|/g, "|").replace(/`+ ?([^`]+?) ?`+/g, "$1").replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, "$1$2");

function markdownFacts(markdown: string): { heading: string; titles: string[]; groups: Row[][]; closing: string[] } {
  const lines = markdown.split("\n");
  const groups: Row[][] = [];
  for (const line of lines) {
    if (line.startsWith("|---")) groups.push([]);
    else if (line.startsWith("| ") && groups.length > 0 && !line.startsWith("| Prop |")) {
      const [name, typeCell, defaultValue, description] = line.slice(2, -2).split(/ (?<!\\)\| /);
      const [type, expansion] = typeCell!.split("<br>");
      groups.at(-1)!.push({
        name: unmark(name!.replace(/ \*required\*$/, "")),
        type: unmark(type!),
        expansion: expansion === undefined ? "" : unmark(expansion),
        defaultValue: unmark(defaultValue!),
        required: name!.endsWith(" *required*"),
        deprecated: unmark(description!).startsWith("Deprecated "),
      });
    }
  }
  return {
    heading: unmark(lines[0]!.replace(/^#+ /, "")),
    titles: lines.filter((line) => line.startsWith("###### ")).map((line) => line.slice(7)),
    groups,
    closing: lines.filter((line) => line.startsWith("Also ")).map(unmark),
  };
}

describe("one table model, two writers", () => {
  it("write the same groups and rows, in the same order, with the same type, default and required label", () => {
    const model = tableModel(ENTRY);
    const html = htmlFacts(tableHtml(model));
    const markdown = markdownFacts(tableMarkdown(model));
    expect(html.heading).toBe("GaugeProps<T>");
    expect(markdown.heading).toBe(html.heading);
    expect(html.titles).toEqual(["Events"]);
    expect(markdown.titles).toEqual(html.titles);
    expect(markdown.groups).toEqual(html.groups);
    expect(markdown.closing).toEqual(html.closing);
    expect(html.groups.flat().filter((row) => row.required).map((row) => row.name)).toEqual(["value", "rows"]);
    expect(html.groups.flat().find((row) => row.name === "tone")!.defaultValue).toBe('"neutral"');
    expect(html.groups.flat().find((row) => row.name === "value")!.defaultValue).toBe("—");
    expect(html.groups.map((group) => group.map((row) => row.name))).toEqual([["value", "tone", "max", "rows", "size", "limit"], ["onChange"]]);
    expect(html.groups.flat().filter((row) => row.deprecated).map((row) => row.name)).toEqual(["limit"]);
    expect(html.groups.flat().find((row) => row.name === "max")!.defaultValue).toBe("the largest value, else 100");
    expect(html.groups.flat().find((row) => row.name === "size")).toMatchObject({ type: "GaugeSize", expansion: '"sm" | "md"' });
    expect(html.groups.flat().filter((row) => row.expansion !== "").map((row) => row.name)).toEqual(["size"]);
  });

  it("write the four groups alike, each secondary one under its sub-heading", () => {
    const model = tableModel(GROUPED);
    const html = htmlFacts(tableHtml(model));
    const markdown = markdownFacts(tableMarkdown(model));
    expect(html.titles).toEqual(["Events", "Accessibility", "Styling"]);
    expect(markdown.titles).toEqual(html.titles);
    expect(markdown.groups).toEqual(html.groups);
  });

  it("sets a deprecated prop last, with the badge and the tag's sentence before its description", () => {
    const model = tableModel(ENTRY);
    expect(tableHtml(model)).toContain(
      '<td><span class="apiDeprecated"><span class="apiBadge">Deprecated</span> Is called <code>max</code> now.</span> The old name of <code>max</code>.</td></tr></tbody>',
    );
    expect(tableMarkdown(model)).toMatch(/\| \*Deprecated\* Is called `max` now\. The old name of `max`\. \|$/m);
  });

  it("writes a default as code, and a phrase as prose", () => {
    const model = tableModel(ENTRY);
    expect(tableHtml(model)).toContain('<td><code>&quot;neutral&quot;</code></td>');
    expect(tableHtml(model)).toContain("<td>the largest value, else <code>100</code></td>");
    expect(tableMarkdown(model)).toContain("| `number` | the largest value, else `100` | Where the scale ends. |");
  });

  it("writes an alias's values on the line beneath its name", () => {
    const model = tableModel(ENTRY);
    expect(tableHtml(model)).toContain('<td><code class="apiType">GaugeSize</code><br><code>&quot;sm&quot; | &quot;md&quot;</code></td>');
    expect(tableMarkdown(model)).toContain('| `GaugeSize`<br>`"sm" \\| "md"` |');
  });

  it("anchors the heading at #type-<Name>", () => {
    expect(htmlFacts(tableHtml(tableModel(ENTRY))).anchor).toBe("type-GaugeProps");
  });

  it("closes with the parts that have a table of their own and the inherited element", () => {
    expect(htmlFacts(tableHtml(tableModel(ENTRY))).closing).toEqual([
      "Also every prop of LimitProps, ToneProps and SizeProps.",
      "Also takes every attribute of <div> – without title, color.",
    ]);
  });

  it("reads `required` as a label in both", () => {
    const model = tableModel(ENTRY);
    expect(tableHtml(model)).toContain('<code>value</code><span class="apiBadge">required</span>');
    expect(tableMarkdown(model)).toContain("| `value` *required* | `number` |");
  });

  it("writes a description's marks in each medium, and escapes markup in the HTML", () => {
    const model = tableModel(ENTRY);
    const html = tableHtml(model);
    expect(html).toContain('as the <strong>verdict</strong> of a <code>Limit</code> - see the <a href="../meter/">Meter</a>.');
    expect(html).toContain("<code>&lt;b&gt;</code>");
    expect(html).not.toContain("<b>");
    expect(tableMarkdown(model)).toContain("as the **verdict** of a `Limit` - see the [Meter](#/meter). From `ToneProps`. |");
  });

  it("says so where a type declares no props of its own", () => {
    const empty = tableModel({ ...ENTRY, props: [], alsoTakes: [], inherits: undefined });
    expect(tableHtml(empty)).toContain('<p class="apiInherited">Declares no props of its own.</p>');
    expect(tableMarkdown(empty)).toContain("Declares no props of its own.");
  });

  it("joins a page's tables into one API section", () => {
    const models = [tableModel(ENTRY), tableModel({ ...ENTRY, name: "MeterProps" })];
    expect(apiHtml(models)).toBe(models.map(tableHtml).join(""));
  });
});
