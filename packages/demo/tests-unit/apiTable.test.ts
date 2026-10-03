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
import { apiHtml, apiMarkdown, apiSection, previewOf, tableHtml, tableMarkdown, tableModel } from "../src/tooling/apiTable";
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

/** GROUPED with main rows added until it has `count` rows. */
const grown = (count: number): TypeEntry => ({
  ...GROUPED,
  props: [
    ...GROUPED.props,
    ...Array.from({ length: count - GROUPED.props.length }, (_, i) => ({ name: `extra${i}`, type: "string", optional: true, description: "More." })),
  ],
});

describe("folding a long table (.scratch/props-table-hygiene, 02)", () => {
  const fold = (count: number) => {
    const host = document.createElement("div");
    host.innerHTML = tableHtml(tableModel(grown(count)));
    return host;
  };

  it("folds the secondary groups of a table over 15 rows, closed, the summary naming group and count", () => {
    const host = fold(16);
    const folds = [...host.querySelectorAll("details")];
    expect(folds.map((one) => [one.open, one.querySelector(":scope > summary")!.textContent])).toEqual([
      [false, "Events · 2"],
      [false, "Accessibility · 3"],
      [false, "Styling · 3"],
    ]);
    /* Everything is in the HTML either way; the main group never folds. */
    expect(host.querySelectorAll("tbody tr")).toHaveLength(16);
    expect(host.querySelector('table[aria-label="PickerProps: props"]')!.closest("details")).toBeNull();
    expect(host.querySelector("h4")).toBeNull();
  });

  it("leaves a table of 15 rows open and plain", () => {
    const host = fold(15);
    expect(host.querySelector("details")).toBeNull();
    expect([...host.querySelectorAll("h4")].map((h4) => h4.textContent)).toEqual(["Events", "Accessibility", "Styling"]);
  });

  it("writes every group of a long table as a sub-heading with its rows in the Markdown", () => {
    const model = tableModel(grown(16));
    const html = htmlFacts(tableHtml(model));
    const markdown = markdownFacts(tableMarkdown(model));
    expect(markdown.titles).toEqual(["Events", "Accessibility", "Styling"]);
    expect(markdown.titles).toEqual(html.titles);
    expect(markdown.groups).toEqual(html.groups);
  });

  it("anchors every row at #<Type>-<prop>, so that an address can name it", () => {
    expect([...fold(16).querySelectorAll("tbody tr")].map((tr) => tr.id).slice(0, 3)).toEqual([
      "PickerProps-defaultValue",
      "PickerProps-value",
      "PickerProps-onValueChange",
    ]);
  });
});

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
    /* A folded group names itself in its summary, with its count. */
    titles: [...host.querySelectorAll("h4, summary")].map((title) => title.textContent!.replace(/ · \d+$/, "")),
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
    expect(tableHtml(model)).toContain('<code>value</code></a><span class="apiBadge">required</span>');
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

describe("long unions and the preview of a definition (.scratch/a11y-and-finish, 07)", () => {
  const UNIONS: TypeEntry = {
    name: "SwitchProps",
    parameter: [],
    omitted: [],
    props: [
      { name: "tone", type: '"quiet" | "loud" | "alarm"', optional: true, description: "Three, written out." },
      { name: "pair", type: '"on" | "off"', optional: true, description: "Two." },
      { name: "variant", type: "SwitchVariant", expansion: '"a" | "b" | "c"', references: ["SwitchVariant"], optional: true, description: "An alias." },
      { name: "mixed", type: "readonly Reading[] | Record<string, 1 | 2> | null", references: ["Reading"], optional: true, description: "Nested." },
      { name: "onPick", type: '(value: "a" | "b" | "c") => void', optional: true, description: "A function." },
      { name: "label", type: '"a|b" | "c" | `d${"|"}e`', optional: true, description: "Pipes in strings." },
    ],
  };
  const LINKS = (name: string) => `#type-${name}`;
  const cell = (prop: string) => {
    const host = document.createElement("div");
    host.innerHTML = tableHtml(tableModel(UNIONS, LINKS));
    return host.querySelector(`[id="SwitchProps-${prop}"] td`)!.innerHTML;
  };

  it("breaks a union of more than two members one member a line, each line starting with |", () => {
    expect(cell("tone")).toBe('<code class="apiType">| "quiet"<br>| "loud"<br>| "alarm"</code>');
    expect(cell("variant")).toBe('<code class="apiType"><a href="#type-SwitchVariant">SwitchVariant</a></code><br><code>| "a"<br>| "b"<br>| "c"</code>');
    expect(cell("mixed")).toBe('<code class="apiType">| readonly <a href="#type-Reading">Reading</a>[]<br>| Record&lt;string, 1 | 2&gt;<br>| null</code>');
    expect(cell("label")).toBe('<code class="apiType">| "a|b"<br>| "c"<br>| `d${"|"}e`</code>');
  });

  it("leaves a union of two and a function whose parts are unions on one line", () => {
    expect(cell("pair")).toBe('<code class="apiType">"on" | "off"</code>');
    expect(cell("onPick")).toBe('<code class="apiType">(value: "a" | "b" | "c") =&gt; void</code>');
  });

  it("keeps the Markdown cell on one line", () => {
    const markdown = tableMarkdown(tableModel(UNIONS, LINKS));
    expect(markdown).toContain('| `tone` | `"quiet" \\| "loud" \\| "alarm"` |');
    expect(markdown).toContain('| `variant` | [`SwitchVariant`](#type-SwitchVariant)<br>`"a" \\| "b" \\| "c"` |');
  });

  const definition = (entry: Partial<TypeEntry> & Pick<TypeEntry, "definition">) =>
    apiSection({ id: "switch", types: ["Host"] }, [{ id: "switch", types: ["Host"] }], {
      Host: { name: "Host", parameter: [], omitted: [], props: [{ name: "x", type: "Shown", references: ["Shown"], optional: true, description: "X." }] },
      Shown: { name: "Shown", parameter: [], omitted: [], props: [], ...entry },
    }).definitions[0]!;

  it("previews a declaration as it stands, and writes an alias's values beneath it in the block", () => {
    const size = definition({ definition: { description: "A size.", declaration: "type Shown = ControlSize;", expansion: '"sm" | "md"' } });
    expect(previewOf(size)).toBe("type Shown = ControlSize;");
    expect(size.expansion).toBe('"sm" | "md"');
    expect(tableHtml(size, 4)).toContain('</pre><p class="apiInherited">Resolves to <code>&quot;sm&quot; | &quot;md&quot;</code>.</p>');
    expect(tableMarkdown(size, 6)).toContain('```ts\ntype Shown = ControlSize;\n```\n\nResolves to `"sm" | "md"`.');
  });

  it("previews members as an object type, and cuts at twelve lines with an ellipsis", () => {
    const props = Array.from({ length: 14 }, (_, i) => ({ name: `m${i}`, type: "number", optional: i > 0, description: "M." }));
    const preview = previewOf(definition({ props, definition: { description: "Members." } })).split("\n");
    expect(preview).toHaveLength(12);
    expect(preview.slice(0, 3)).toEqual(["{", "  m0: number;", "  m1?: number;"]);
    expect(preview.at(-1)).toBe("…");
    expect(previewOf(definition({ props: props.slice(0, 2), definition: { description: "Members." } }))).toBe("{\n  m0: number;\n  m1?: number;\n}");
  });
});

/* Every row names the examples that show it (.scratch/props-to-examples). */
describe("Shown in", () => {
  const shown = (page: string, example: string, title: string, pageName: string) => ({ page, example, title, pageName });
  const DIAL: TypeEntry = {
    name: "DialProps",
    parameter: [],
    omitted: [],
    props: [
      {
        name: "value",
        type: "number",
        optional: false,
        description: "The value.",
        shownIn: [
          shown("dial", "basic", "A basic dial", "Dial"),
          shown("panel", "in-a-panel", "In a panel", "Panel"),
          shown("scenarios", "watch", "Watch the pressure", "Scenarios"),
          shown("meter", "readings", "Readings", "Meter"),
        ],
      },
      { name: "tone", type: "string", optional: true, description: "Red or not." },
    ],
  };
  const html = document.createElement("div");
  html.innerHTML = tableHtml(tableModel(DIAL, undefined, "dial"));
  const markdown = tableMarkdown(tableModel(DIAL, undefined, "dial"));
  const cell = (id: string) => html.querySelector(`[id="${id}"] td:last-child`)!;

  it("names three examples as links and counts the rest, in the HTML", () => {
    const line = cell("DialProps-value").querySelector(".apiShown")!;
    expect(line.textContent).toBe("Shown in: A basic dial, In a panel (Panel), Watch the pressure (Scenarios) and 1 more");
    expect([...line.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(["../dial/#basic", "../panel/#in-a-panel", "../#watch"]);
  });

  it("writes the same line in the Markdown", () => {
    expect(markdown).toContain(
      "The value.<br>Shown in: [A basic dial](#/dial/basic), [In a panel (Panel)](#/panel/in-a-panel), [Watch the pressure (Scenarios)](#/scenarios/watch) and 1 more |",
    );
  });

  it("puts the examples of the page the table stands on first", () => {
    const elsewhere = tableModel(DIAL, undefined, "panel").groups[0]!.rows[0]!.shownIn!;
    expect(elsewhere.filter((span) => span.kind === "link").map((span) => span.text)).toEqual(["In a panel", "A basic dial (Dial)", "Watch the pressure (Scenarios)"]);
  });

  it("shows no line for a row no example uses", () => {
    expect(cell("DialProps-tone").querySelector(".apiShown")).toBeNull();
    expect(markdown).toContain("| Red or not. |");
  });

  it("makes a row's name the link to its own anchor", () => {
    const name = html.querySelector('[id="DialProps-value"] th a')!;
    expect(name.getAttribute("href")).toBe("#DialProps-value");
    expect(name.textContent).toBe("value");
  });
});
