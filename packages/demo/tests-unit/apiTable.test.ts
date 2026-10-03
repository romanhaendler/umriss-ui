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
import { apiHtml, apiMarkdown, apiSection, tableHtml, tableMarkdown, tableModel } from "../src/tooling/apiTable";
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
    { name: "rows", type: "readonly Reading<T>[]", references: ["Reading"], optional: false, description: "Every row, `<b>` and all." },
    { name: "size", type: "GaugeSize", expansion: '"sm" | "md"', references: ["GaugeSize"], optional: true, description: "How tall the gauge stands." },
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

/** `GaugeSize` is defined on the page, `Reading` has a table on the Meter's. */
const LINK_OF = (name: string) => (name === "GaugeSize" ? "#type-GaugeSize" : `#/meter/type-${name}`);

interface Row {
  name: string;
  type: string;
  /** Where the names in the type lead, as `page#anchor` (`#anchor` on the page itself). */
  links: string[];
  /** The values beneath an alias's name; empty where there are none. */
  expansion: string;
  defaultValue: string;
  required: boolean;
  deprecated: boolean;
}

/** An address the HTML writes (`../meter/#type-X`) and a place the Markdown
    writes (`#/meter/type-X`) as one form: `meter#type-X`. */
const target = (href: string) => href.replace(/^\.\.\/([^/]+)\/#/, "$1#").replace(/^#\/([^/]+)\//, "$1#");

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
        links: [...tr.querySelectorAll(".apiType a")].map((a) => target(a.getAttribute("href")!)),
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
const unmark = (text: string) =>
  text
    .trim()
    .replace(/\\\|/g, "|")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    /* A space is stripped where one stands on each side, as GFM does. */
    .replace(/(`+)(?: ([^`]+) |([^`]+))\1/g, "$2$3")
    .replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, "$1$2");

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
        links: [...type!.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => target(match[1]!)),
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
  it("write the same groups and rows, in the same order, with the same type, links, default and required label", () => {
    const model = tableModel(ENTRY, LINK_OF);
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
    expect(html.groups.flat().find((row) => row.name === "rows")).toMatchObject({ type: "readonly Reading<T>[]", links: ["meter#type-Reading"] });
    expect(html.groups.flat().find((row) => row.name === "size")!.links).toEqual(["#type-GaugeSize"]);
  });

  it("write the four groups alike, each secondary one under its sub-heading", () => {
    const model = tableModel(GROUPED);
    const html = htmlFacts(tableHtml(model));
    const markdown = markdownFacts(tableMarkdown(model));
    expect(html.titles).toEqual(["Events", "Accessibility", "Styling"]);
    expect(markdown.titles).toEqual(html.titles);
    expect(markdown.groups).toEqual(html.groups);
  });

  it("links a name inside the type's code, in each medium", () => {
    const model = tableModel(ENTRY, LINK_OF);
    expect(tableHtml(model)).toContain('<code class="apiType">readonly <a href="../meter/#type-Reading">Reading</a>&lt;T&gt;[]</code>');
    expect(tableMarkdown(model)).toContain("| `readonly `[`Reading`](#/meter/type-Reading)`<T>[]` |");
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
    expect(apiHtml({ tables: models, definitions: [] })).toBe(models.map((model) => tableHtml(model)).join(""));
  });
});

describe("Types on this page", () => {
  const ENTRIES: Record<string, TypeEntry> = {
    GaugeProps: ENTRY,
    Reading: { name: "Reading", parameter: ["T"], omitted: [], props: [{ name: "at", type: "T", optional: false, description: "When." }] },
    GaugeSize: {
      name: "GaugeSize",
      parameter: [],
      omitted: [],
      props: [],
      definition: { description: "How tall a `Gauge` stands.", declaration: "type GaugeSize = Size;", references: ["Size"] },
    },
    Size: {
      name: "Size",
      parameter: [],
      omitted: [],
      props: [{ name: "rem", type: "number", optional: false, description: "In rem." }],
      definition: { description: "A size.", from: "@umriss-ui/core" },
    },
  };
  const PAGES = [
    { id: "gauge", types: ["GaugeProps"] },
    { id: "meter", types: ["Reading"] },
  ];
  const section = apiSection(PAGES[0]!, PAGES, ENTRIES);

  it("defines what the tables name and what the definitions name, and links what has a table", () => {
    expect(section.definitions.map((one) => one.name)).toEqual(["GaugeSize", "Size"]);
    expect(section.definitions[0]!.declaration).toEqual([
      { kind: "text", text: "type GaugeSize = " },
      { kind: "link", text: "Size", href: "#type-Size" },
      { kind: "text", text: ";" },
    ]);
  });

  it("writes the same definitions, in the same order, in each medium", () => {
    const host = document.createElement("div");
    host.innerHTML = apiHtml(section);
    const block = host.querySelector(".apiDefinitions")!;
    expect(block.querySelector("h3")!.textContent).toBe("Types on this page");
    const html = [...block.querySelectorAll("h4")].map((h) => [h.id, h.textContent]);
    expect(html).toEqual([
      ["type-GaugeSize", "GaugeSize"],
      ["type-Size", "Size"],
    ]);
    const markdown = apiMarkdown(section).join("\n\n");
    expect([...markdown.matchAll(/^###### `([^`]+)`$/gm)].map((match) => [`type-${match[1]}`, match[1]])).toEqual(html);
    expect(markdown).toContain("##### Types on this page");
    expect(markdown).toContain("###### `GaugeSize`\n\nHow tall a `Gauge` stands.\n\n```ts\ntype GaugeSize = Size;\n```");
    expect(markdown).toContain("###### `Size`\n\nFrom `@umriss-ui/core`.\n\nA size.\n\n| Prop | Type | Default | Description |");
    expect(host.innerHTML).toContain('<pre class="apiDeclaration"><code>type GaugeSize = <a href="#type-Size">Size</a>;</code></pre>');
    expect(host.innerHTML).toContain('<p class="apiInherited">From <code>@umriss-ui/core</code>.</p><p class="apiProse">A size.</p>');
  });

  it("stops the generator at a name with neither a table nor a definition", () => {
    const without = Object.fromEntries(Object.entries(ENTRIES).filter(([name]) => name !== "Size"));
    expect(() => apiSection(PAGES[0]!, PAGES, without)).toThrow("`Size` is named on the page `gauge` and has neither a table nor a definition.");
  });

  it("leaves the block out where nothing needs defining", () => {
    expect(apiHtml(apiSection(PAGES[1]!, PAGES, ENTRIES))).not.toContain("Types on this page");
  });
});
