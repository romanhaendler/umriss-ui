/* The llms.txt generator against a fixture package: one scenario, one page
   with three examples (one with a lead, one with its own data), one
   props table and the page's texts. What is checked is what an agent reading
   the text relies on - every page is there with its link, every example's
   source stands as the demo shows it, the table is complete. */

import { describe, expect, it, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderLlms } from "../src/tooling/llms";
import { apiHtml, apiSection, propsOnPage } from "../src/tooling/apiTable";
import { apiIndexRubric, type Page, type Rubric } from "../src/outline";
import type { TypeEntry } from "../src/tooling/tables";

/* The fixture stands in the one list of packages as a sixth, starting at its
   Meter - so that the landing's "Start with" is seen to come from the list. */
vi.mock("../src/packages", async (importOriginal) => {
  const { PACKAGES } = await importOriginal<typeof import("../src/packages")>();
  return {
    PACKAGES: [
      ...PACKAGES,
      { id: "fixture", name: "Fixture", npm: "@umriss-ui/fixture", role: "A fixture", start: "meter" },
    ],
  };
});

const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "llms");

const OUTLINE: readonly Rubric[] = [
  {
    id: "instruments",
    name: "Instruments",
    sentence: "What a value is read on.",
    pages: [
      {
        id: "gauge",
        name: "Gauge",
        sentence: "One value as a needle (also called a `dial`), beside the [Meter](#/meter) and its [first example](#/meter/basic).",
        about: ["Read it at a glance.", "One `value`, one limit set."],
        alternatives: [{ when: "A value over time", use: "meter" }],
        keys: [{ key: "Tab", action: "Moves focus to the gauge." }],
        keysOf: [{ name: "Select", page: "@umriss-ui/core#select" }],
        accessibility: ["An `img` named by its `ariaLabel`.", "A new reading is announced politely."],
        limits: ["No second needle."],
        types: ["GaugeProps"],
        exports: ["Gauge"],
        installs: true,
      },
      { id: "meter", name: "Meter", sentence: "One value as a bar.", keysOf: ["gauge"], types: [], exports: ["Meter"] },
    ],
  },
];

const TABLES: Record<string, TypeEntry> = {
  GaugeProps: {
    name: "GaugeProps",
    parameter: [],
    inherits: "<div>",
    omitted: ["title"],
    props: [
      { name: "value", type: "number", optional: false, description: "The value the needle points at." },
      {
        name: "tone",
        type: '"neutral" | "alarm"',
        optional: true,
        defaultValue: '"neutral"',
        description: "What the needle\nsays.",
      },
    ],
  },
};

const { index, full, pages, twins } = renderLlms({ packageDir: PACKAGE_DIR, outline: OUTLINE, tables: TABLES });
/** The Gauge page's tables, as the app mounts them. */
const API = apiHtml(apiSection(OUTLINE[0]!.pages[0]!, OUTLINE[0]!.pages, TABLES));

describe("llms.txt", () => {
  it("names the package, its summary and where the full text is", () => {
    expect(index.startsWith("# @umriss-ui/fixture\n\n> A fixture package for the llms.txt generator.\n")).toBe(true);
    expect(index).toContain("https://example.test/fixture/llms-full.txt");
    expect(index).toContain("`docs/llms-full.md`");
  });

  it("says how to install it with the command derived from the manifest, peers and all", () => {
    expect(index).toContain("Install with `npm install @umriss-ui/fixture @umriss-ui/core`.");
    expect(full).toContain("Install with `npm install @umriss-ui/fixture @umriss-ui/core`.");
  });

  it("lists the scenarios first, with their lead and a link to the scenarios page's twin", () => {
    expect(index).toContain("## Scenarios\n");
    expect(index).toContain("- [Watch a service's latency](https://example.test/fixture/index.md): An on-call engineer keeps it open beside the incident channel.\n");
    expect(index.indexOf("## Scenarios")).toBeLessThan(index.indexOf("## Instruments"));
  });

  it("lists every page under its rubric, with one line and a link to its twin", () => {
    expect(index).toContain("## Instruments\n\nWhat a value is read on.\n\n");
    expect(index).toContain("- [Gauge](https://example.test/fixture/gauge.md): One value as a needle (also called a `dial`), beside the [Meter](#/meter) and its [first example](#/meter/basic).\n");
    expect(index).toContain("- [Meter](https://example.test/fixture/meter.md): One value as a bar.\n");
    expect(index).not.toMatch(/\]\(https:\/\/example\.test\/fixture\/[a-z-]*\/?\)/);
  });
});

describe("llms-full.txt", () => {
  it("heads every page with its sentence and import line", () => {
    expect(full).toContain("### Gauge\n\nOne value as a needle (also called a `dial`), beside the [Meter](#/meter) and its [first example](#/meter/basic).\n\n```ts\nimport { Gauge } from \"@umriss-ui/fixture\";\n```\n");
  });

  it("sets the install command under the import line of the page that installs, and of no other", () => {
    expect(full).toContain('import { Gauge } from "@umriss-ui/fixture";\n```\n\n```sh\nnpm install @umriss-ui/fixture @umriss-ui/core\n```\n');
    expect(full.slice(full.indexOf("### Meter"))).not.toContain("```sh");
  });

  it("carries every example's source as the demo shows it - title gone, package name in", () => {
    expect(full).toContain("##### A basic gauge\n");
    expect(full).toContain('import { Gauge } from "@umriss-ui/fixture";\n\nexport default function Basic()');
    expect(full).not.toContain("../../../src");
    expect(full).not.toContain("export const title");
  });

  it("runs the examples in the demo's order", () => {
    const at = (title: string) => full.indexOf(`##### ${title}\n`);
    expect(at("A basic gauge")).toBeLessThan(at("Show several readings"));
    expect(at("Show several readings")).toBeLessThan(at("Compact"));
  });

  it("puts an example's lead between its title and its source, and not in the source", () => {
    expect(full).toContain("##### A basic gauge\n\nPass the `value`; the needle points at it.\n\n```tsx\n");
    expect(full).not.toContain("export const lead");
  });

  it("carries the page's about, alternatives, keyboard and known limits", () => {
    const gauge = full.slice(full.indexOf("### Gauge"), full.indexOf("### Meter"));
    expect(gauge).toContain("Read it at a glance.\n\nOne `value`, one limit set.");
    expect(gauge).toContain("#### When to use something else\n\n- A value over time → Meter");
    expect(gauge).toContain("#### Keyboard\n\n| Key | Action |\n|---|---|\n| `Tab` | Moves focus to the gauge. |");
    expect(gauge).toContain("#### Known limits\n\n- No second needle.");
    expect(gauge.indexOf("#### API")).toBeLessThan(gauge.indexOf("#### Known limits"));
  });

  it("names under the keyboard table the pages whose keys apply, each linked to its Keyboard section, and the accessibility after it", () => {
    const gauge = full.slice(full.indexOf("### Gauge"), full.indexOf("### Meter"));
    expect(gauge).toContain(
      "| `Tab` | Moves focus to the gauge. |\n\nThe keys of [Select](https://example.test/core/select/#keyboard-select) apply here.\n\n#### Accessibility\n\nAn `img` named by its `ariaLabel`.\n\nA new reading is announced politely.\n\n#### API",
    );
    /* A page with no table of its own has the section all the same. */
    const meter = full.slice(full.indexOf("### Meter"));
    expect(meter).toContain("#### Keyboard\n\nThe keys of [Gauge](#/gauge/keyboard-gauge) apply here.\n");
    expect(meter).not.toContain("#### Accessibility");
  });

  it("carries each scenario with its callouts, what it is built from, and its source", () => {
    const scenarios = full.slice(full.indexOf("## Scenarios"), full.indexOf("## Instruments"));
    expect(scenarios).toContain("### Watch a service's latency\n\nAn on-call engineer keeps it open beside the incident channel.");
    expect(scenarios).toContain("1. The needle: latency, in ms.\n2. Red above the limit, as the SLA says: 300 ms.");
    expect(scenarios).toContain("Built from: Gauge, Trend.");
    expect(scenarios).toContain('const SERVICES = [{ name: "checkout", latency: 120 }];');
    expect(scenarios).not.toContain("export const callouts");
    expect(scenarios).not.toContain("export const builtFrom");
  });

  it("writes the props table with every row, escaped for Markdown", () => {
    expect(full).toContain("##### `GaugeProps`\n\n| Prop | Type | Default | Description |\n|---|---|---|---|\n");
    expect(full).toContain("| `value` *required* | `number` | — | The value the needle points at. |\n");
    expect(full).toContain('| `tone` | `"neutral" \\| "alarm"` | `"neutral"` | What the needle says. |\n');
    expect(full).toContain("Also takes every attribute of `<div>` – without `title`.");
  });

  it("says so where a page has no example and no table", () => {
    const meter = full.slice(full.indexOf("### Meter"));
    expect(meter).toContain("There is no example for this page yet.");
    expect(meter).not.toContain("#### API");
  });

  it("adds no appendix: what no page names stands on the API index alone (ADR-0044)", () => {
    expect(full).not.toContain("## The rest of the API");
    expect(full).not.toContain("GAUGE_RANGE");
  });
});

describe("the site's pages (ADR-0037)", () => {
  const byPath = new Map(pages.map((one) => [one.path, one]));

  it("has one per page of the outline, and the front page", () => {
    expect([...byPath.keys()].sort()).toEqual(["", "gauge/", "meter/"]);
  });

  it("titles a page by the formula and describes it by its sentence, as plain text", () => {
    const gauge = byPath.get("gauge/")!;
    expect(gauge.title).toBe("Gauge – React component · @umriss-ui/fixture");
    expect(gauge.description).toBe("One value as a needle (also called a dial), beside the Meter and its first example.");
    expect(gauge.url).toBe("https://example.test/fixture/gauge/");
  });

  it("carries the page's text, its examples' source and its table as HTML", () => {
    const html = byPath.get("gauge/")!.html;
    expect(html).toMatch(/^<h1>Gauge<\/h1>/);
    expect(html).toContain("<code>dial</code>");
    expect(html).toContain('<a href="https://example.test/fixture/meter/">Meter</a>');
    expect(html).toContain('<a href="https://example.test/fixture/meter/#basic">first example</a>');
    expect(html).toContain("The value the needle points at.");
    expect(html).toContain("<pre><code");
    expect(html).not.toContain("#/");
  });

  it("anchors the Keyboard and Accessibility sections as the app does, and links the keys of other pages there", () => {
    const gauge = byPath.get("gauge/")!.html;
    expect(gauge).toContain('<h2 id="keyboard-gauge">Keyboard</h2>');
    expect(gauge).toContain('<h2 id="accessibility-gauge">Accessibility</h2>');
    expect(gauge).toContain('<a href="https://example.test/core/select/#keyboard-select">Select</a>');
    expect(byPath.get("meter/")!.html).toContain('<a href="https://example.test/fixture/gauge/#keyboard-gauge">Gauge</a>');
  });

  it("carries the install command as text on the page that installs", () => {
    expect(byPath.get("gauge/")!.html).toContain('<pre><code class="language-sh">npm install @umriss-ui/fixture @umriss-ui/core\n</code></pre>');
  });

  it("links every page from every page", () => {
    for (const one of pages) {
      expect(one.html).toContain('href="https://example.test/fixture/gauge/"');
      expect(one.html).toContain('href="https://example.test/fixture/meter/"');
    }
  });

  it("gives each example's heading its id, so that its address points at it", () => {
    for (const one of pages.filter((page) => page.path === "gauge/")) {
      expect(one.html).toMatch(/<h3 id="[a-z-]+">/);
    }
    expect(byPath.get("")!.html).toContain('<h3 id="watch-latency">');
  });

  it("puts the scenarios and the pages on the front page", () => {
    const front = byPath.get("")!;
    expect(front.title).toBe("@umriss-ui/fixture – A fixture package for the llms.txt generator.");
    expect(front.html).toContain("Watch a service&#39;s latency");
    expect(front.url).toBe("https://example.test/fixture/");
  });

  it("heads the front page with the npm name, the install command as a block and where to start", () => {
    const html = byPath.get("")!.html;
    expect(html).toMatch(/^<h1>@umriss-ui\/fixture<\/h1>/);
    expect(html).toContain('<pre><code class="language-sh">npm install @umriss-ui/fixture @umriss-ui/core\n</code></pre>');
    expect(html).toContain('<a href="https://example.test/fixture/meter/">Start with Meter →</a>');
  });

  it("carries in its API section the HTML the app mounts, from the same model", () => {
    expect(byPath.get("gauge/")!.html).toContain(`<h2>API</h2>\n<div class="apiTables">${API}</div>\n<h2>Known limits</h2>`);
  });

  it("escapes markup written in a text instead of passing it through", () => {
    /* The API section is written as HTML on purpose; everything around it
       comes from texts. */
    expect(pages.map((one) => one.html.replace(`<div class="apiTables">${API}</div>`, "")).join("")).not.toMatch(/<(div|script)[ >]/);
  });

  it("forwards a moved page id from its old address to its page, and declares no other", () => {
    const { pages: moved, forwarders } = renderLlms({ packageDir: PACKAGE_DIR, outline: OUTLINE, tables: TABLES, moved: { dial: "gauge" } });
    expect(forwarders).toEqual([
      { url: "https://example.test/fixture/dial/", to: "https://example.test/fixture/gauge/", title: "Gauge – React component · @umriss-ui/fixture" },
    ]);
    expect(moved.map((one) => one.path)).not.toContain("dial/");
    expect(renderLlms({ packageDir: PACKAGE_DIR, outline: OUTLINE, tables: TABLES }).forwarders).toEqual([]);
  });
});

describe("the pages' Markdown twins (.scratch/pages-as-markdown)", () => {
  const byPath = new Map(twins.map((one) => [one.path, one.text]));
  /** The header every twin carries under its name. */
  const header = (page: string) =>
    `> Package \`@umriss-ui/fixture\`, version 1.2.3. Demo page: <https://example.test/fixture/${page}>. Every page in one line: [llms.txt](https://example.test/fixture/llms.txt); every page in full: [llms-full.txt](https://example.test/fixture/llms-full.txt).`;
  /** A page's cut of the full text as its twin carries it: the headings
      lifted by two levels, the texts' `#/page` links absolute. */
  const asTwin = (cut: string) =>
    cut
      .replace(/^(#{3,6}) /gm, (_, marks: string) => `${"#".repeat(marks.length - 2)} `)
      .replaceAll("](#/meter/basic)", "](https://example.test/fixture/meter/#basic)")
      .replaceAll("](#/gauge/keyboard-gauge)", "](https://example.test/fixture/gauge/#keyboard-gauge)")
      .replaceAll("](#/meter)", "](https://example.test/fixture/meter/)");

  it("has one per page of the outline, and one for the scenarios page", () => {
    expect([...byPath.keys()].sort()).toEqual(["gauge.md", "index.md", "meter.md"]);
  });

  it("is the page's cut of the full text, lifted so that the page's name is the `#`, with the header under it", () => {
    const gauge = asTwin(full.slice(full.indexOf("### Gauge"), full.indexOf("\n### Meter")).trimEnd());
    expect(byPath.get("gauge.md")).toBe(`# Gauge\n\n${header("gauge/")}\n${gauge.slice("# Gauge\n".length)}\n`);
    const meter = asTwin(full.slice(full.indexOf("### Meter")).trimEnd());
    expect(byPath.get("meter.md")).toBe(`# Meter\n\n${header("meter/")}\n${meter.slice("# Meter\n".length)}\n`);
  });

  it("keeps the examples' source, the props table and the demo page line", () => {
    const gauge = byPath.get("gauge.md")!;
    expect(gauge).toContain("### A basic gauge\n\nPass the `value`; the needle points at it.\n\n```tsx\n");
    expect(gauge).toContain("| `value` *required* | `number` | — | The value the needle points at. |\n");
    expect(gauge).toContain("Demo page: https://example.test/fixture/gauge/\n");
  });

  it("links absolutely, and leaves out the list of every page", () => {
    for (const [path, text] of byPath) {
      expect(text, path).not.toMatch(/\]\((?!https:\/\/)/);
      expect(text, path).not.toContain("Every page of");
    }
  });

  it("gives the scenarios page the scenarios' cut under the package's name", () => {
    const scenarios = full.slice(full.indexOf("## Scenarios"), full.indexOf("\n## Instruments")).trimEnd();
    expect(byPath.get("index.md")).toBe(
      `# @umriss-ui/fixture\n\n${header("")}\n\nA fixture package for the llms.txt generator.\n\n\`\`\`sh\nnpm install @umriss-ui/fixture @umriss-ui/core\n\`\`\`\n\n[Start with Meter →](https://example.test/fixture/meter/)\n\n${scenarios}\n`,
    );
  });

  it("is named on every site page, which announces it", () => {
    expect(pages.map((one) => [one.path, one.twin])).toEqual([
      ["", "https://example.test/fixture/index.md"],
      ["gauge/", "https://example.test/fixture/gauge.md"],
      ["meter/", "https://example.test/fixture/meter.md"],
    ]);
  });
});

describe("Types on this page (.scratch/types-without-holes)", () => {
  /* The Gauge names `Limit`, which has no table: it is defined on the Gauge's
     page, and so is `Bound`, which only `Limit` names. `Bound` names the
     Meter's props, which have a table on the Meter's page - a link, not a
     definition. A row's type also names `fraction` as text, with no table and
     no definition. */
  const outline: readonly Rubric[] = [
    { ...OUTLINE[0]!, pages: [OUTLINE[0]!.pages[0]!, { ...OUTLINE[0]!.pages[1]!, types: ["MeterProps"] }] },
  ];
  const tables: Record<string, TypeEntry> = {
    GaugeProps: {
      ...TABLES.GaugeProps!,
      props: [
        ...TABLES.GaugeProps!.props,
        { name: "limit", type: "Limit | null", references: ["Limit"], optional: true, description: "Where the needle turns red." },
        { name: "scale", type: "typeof fraction", optional: true, description: "How a value becomes an angle." },
      ],
    },
    MeterProps: { name: "MeterProps", parameter: [], omitted: [], props: [{ name: "value", type: "number", optional: false, description: "The value." }] },
    Limit: {
      name: "Limit",
      parameter: [],
      omitted: [],
      props: [],
      definition: { description: "A limit and the side it holds.", declaration: "type Limit = { bound: Bound };", references: ["Bound"] },
    },
    Bound: {
      name: "Bound",
      parameter: [],
      omitted: [],
      props: [{ name: "meter", type: "MeterProps", references: ["MeterProps"], optional: false, description: "Where it is shown." }],
      definition: { description: "One end of a limit.", from: "@umriss-ui/core" },
    },
  };
  const { full: text, pages: sitePages, twins: twinTexts } = renderLlms({ packageDir: PACKAGE_DIR, outline, tables });
  const gauge = text.slice(text.indexOf("### Gauge"), text.indexOf("### Meter"));
  const gaugeHtml = sitePages.find((one) => one.path === "gauge/")!.html;

  it("defines a type the page names and no table is, after the tables", () => {
    expect(gauge).toContain("| `limit` | [`Limit`](#type-Limit)` \\| null` |");
    expect(gauge).toContain("##### Types on this page\n\n###### `Limit`\n\nA limit and the side it holds.\n\n```ts\ntype Limit = { bound: Bound };\n```");
    expect(gauge.indexOf("##### `GaugeProps`")).toBeLessThan(gauge.indexOf("##### Types on this page"));
    expect(gauge.indexOf("##### Types on this page")).toBeLessThan(gauge.indexOf("#### Known limits"));
  });

  it("defines a type only a definition names, with its package, and stops at a type with a table", () => {
    expect(gauge).toContain("###### `Bound`\n\nFrom `@umriss-ui/core`.\n\nOne end of a limit.\n\n| Prop | Type | Default | Description |");
    expect(gauge).toContain("| `meter` *required* | [`MeterProps`](#/meter/type-MeterProps) |");
    expect(gauge).not.toContain("###### `MeterProps`");
  });

  it("carries the definitions and their links in the prerendered HTML", () => {
    expect(gaugeHtml).toContain('<a href="#type-Limit">Limit</a>');
    expect(gaugeHtml).toContain('<h4 class="apiTitle" id="type-Limit">');
    expect(gaugeHtml).toContain('<a href="../meter/#type-MeterProps">MeterProps</a>');
    expect(sitePages.find((one) => one.path === "meter/")!.html).toContain('id="type-MeterProps"');
  });

  it("carries no preview of a definition: the prerendered page and the twin have the link (.scratch/a11y-and-finish, 07)", () => {
    const twin = twinTexts.find((one) => one.path === "gauge.md")!.text;
    for (const written of [gaugeHtml, twin]) {
      expect(written).not.toContain("tooltip");
      expect(written).not.toContain("apiPreview");
    }
  });

  it("makes a twin's links to a definition absolute, at the page's anchor", () => {
    const twin = twinTexts.find((one) => one.path === "gauge.md")!.text;
    expect(twin).toContain("[`Limit`](https://example.test/fixture/gauge/#type-Limit)");
    expect(twin).toContain("[`MeterProps`](https://example.test/fixture/meter/#type-MeterProps)");
  });

});

/* A page without a table of its own shows the rows its examples use
   (.scratch/props-to-examples, 02). */
describe("Props on this page", () => {
  const SHOWN: Record<string, TypeEntry> = {
    GaugeProps: {
      ...TABLES.GaugeProps!,
      props: TABLES.GaugeProps!.props.map((prop) =>
        prop.name === "tone" ? { ...prop, shownIn: [{ page: "meter", example: "basic", title: "A basic meter", pageName: "Meter" }] } : prop,
      ),
    },
  };
  const rendered = renderLlms({ packageDir: PACKAGE_DIR, outline: OUTLINE, tables: SHOWN });
  const [gauge, meter] = OUTLINE[0]!.pages;

  it("stands where the API would, in the full text and on the prerendered page alike", () => {
    const text = rendered.full.slice(rendered.full.indexOf("### Meter"));
    expect(text).toContain("#### Props on this page\n\nFrom `GaugeProps` — the full table stands on [Gauge](#/gauge/type-GaugeProps).\n\n| Prop |");
    expect(text).toContain('| [`tone`](#/gauge/GaugeProps-tone) | `"neutral" \\| "alarm"` |');
    expect(text).not.toContain("`value`");
    const cut = apiHtml({ tables: propsOnPage(meter!, OUTLINE[0]!.pages, SHOWN), definitions: [] });
    expect(rendered.pages.find((one) => one.path === "meter/")!.html).toContain(`<h2 id="props-meter">Props on this page</h2>\n<div class="apiTables">${cut}</div>`);
  });

  it("is not on a page with a table of its own", () => {
    expect(propsOnPage(gauge!, OUTLINE[0]!.pages, SHOWN)).toEqual([]);
    expect(rendered.full.slice(rendered.full.indexOf("### Gauge"), rendered.full.indexOf("### Meter"))).not.toContain("Props on this page");
  });
});

describe("the API index (.scratch/api-index, ADR-0044)", () => {
  /* The fixture's outline with the index as its last rubric. The fixture
     exports a component with a page (`Gauge`) and one without
     (`GaugeNeedle`), a hook with its tags, a function, two constants - one
     deprecated - and two types, one with a table and one without; and a
     German wording as the subpath `wording/de`. */
  const [gauge, meter] = OUTLINE[0]!.pages as [Page, Page];
  const outline: readonly Rubric[] = [
    { ...OUTLINE[0]!, pages: [gauge, { ...meter, sentence: "One value as a bar; `fraction` says how full, and [`fraction`](#/gauge) stays." }] },
    apiIndexRubric("@umriss-ui/fixture", { GERMAN_GAUGE_WORDING: "the table [Wording](#/gauge/wording) on the Gauge page" }),
  ];
  const tables: Record<string, TypeEntry> = {
    ...TABLES,
    GaugeTone: {
      name: "GaugeTone",
      parameter: [],
      omitted: [],
      props: [],
      definition: { description: "What the needle says.", declaration: 'type GaugeTone = "neutral" | "alarm";' },
    },
  };
  const { full: text, index: llmsIndex, pages: sitePages, twins: twinTexts, apiIndex, search } = renderLlms({ packageDir: PACKAGE_DIR, outline, tables });
  const page = text.slice(text.indexOf("### API index"));
  /** One entry of the index's text, up to the next heading of its level. */
  const entry = (name: string) => {
    const from = page.indexOf(`##### \`${name}\`\n`);
    const next = page.indexOf("\n####", from + 1);
    return page.slice(from, next === -1 ? undefined : next + 1);
  };
  const html = sitePages.find((one) => one.path === "api/")!.html;

  it("groups every export by what it is, alphabetical within a group", () => {
    expect(apiIndex!.groups.map((group) => [group.title, group.entries.map((one) => one.name)])).toEqual([
      ["Components", ["Gauge", "GaugeNeedle"]],
      ["Hooks", ["useGauge"]],
      ["Functions", ["fraction"]],
      ["Constants", ["GAUGE_RANGE", "RANGE"]],
      ["Types", ["GaugeProps", "GaugeTone"]],
      ["@umriss-ui/fixture/wording/de", ["GERMAN_GAUGE_WORDING"]],
    ]);
    expect(page.indexOf("#### Components")).toBeLessThan(page.indexOf("#### Hooks"));
    expect(page.indexOf("#### Constants")).toBeLessThan(page.indexOf("#### Types"));
  });

  it("links a component with a page there, with the page's lede, and shows one without a page as a function", () => {
    expect(entry("Gauge")).toContain("[Gauge](#/gauge) – One value as a needle (also called a `dial`)");
    expect(entry("Gauge")).not.toContain("```");
    expect(entry("GaugeNeedle")).toContain("The needle alone, for a gauge of your own.\n\n```ts\nfunction GaugeNeedle(");
  });

  it("shows a hook's comment, its tags as a list and its declaration, the library's types in it linked", () => {
    expect(entry("useGauge")).toContain(
      "Follows a value as it moves.\n\n- `initial` – The value it starts at.\n- Returns The value now, and what the needle says of it.\n\n```ts\nfunction useGauge(initial: number): {",
    );
    expect(html).toContain('<a href="#type-GaugeTone">GaugeTone</a>');
  });

  it("links a type with a table to it, and defines one without a table as a page does", () => {
    expect(entry("GaugeProps")).toContain("Its table stands on [Gauge](#/gauge/type-GaugeProps).");
    expect(entry("GaugeTone").trimEnd()).toBe('##### `GaugeTone`\n\nWhat the needle says.\n\n```ts\ntype GaugeTone = "neutral" | "alarm";\n```');
  });

  it("names the pages that mention an export in code - import line, examples, scenarios - and not their tables", () => {
    expect(entry("Gauge")).toContain("Used on [Scenarios](#/) and [Gauge](#/gauge).");
    /* The Gauge page's table is `GaugeProps`; its text never names it. */
    expect(entry("GaugeProps")).not.toContain("Used on");
    expect(entry("fraction")).toContain("Used on [Meter](#/meter).");
  });

  it("marks a deprecated export as a deprecated prop is marked", () => {
    expect(entry("RANGE")).toContain("*Deprecated* Read `GAUGE_RANGE` instead.");
    expect(html).toContain('<p class="apiProse apiDeprecated"><span class="apiBadge">Deprecated</span> Read <code>GAUGE_RANGE</code> instead.</p>');
  });

  it("groups a subpath's exports under its import path, after the main entry's groups", () => {
    expect(page.indexOf("#### Types")).toBeLessThan(page.indexOf("#### @umriss-ui/fixture/wording/de\n\n##### `GERMAN_GAUGE_WORDING`"));
    expect(html).toContain('<h2 class="sectionTitle" id="group-wording-de">@umriss-ui/fixture/wording/de</h2>');
    expect(entry("GERMAN_GAUGE_WORDING")).toContain("The gauge's words in German.\n\n");
    expect(entry("GERMAN_GAUGE_WORDING")).toContain("```ts\nconst GERMAN_GAUGE_WORDING: ");
  });

  it("links a hook or a function a page's text names as code to its entry, and leaves a link as it is", () => {
    expect(text).toContain("### Meter\n\nOne value as a bar; [`fraction`](#/api/fraction) says how full, and [`fraction`](#/gauge) stays.");
    expect(sitePages.find((one) => one.path === "meter/")!.html).toContain('<a href="https://example.test/fixture/api/#fraction"><code>fraction</code></a> says how full');
    expect(twinTexts.find((one) => one.path === "meter.md")!.text).toContain("[`fraction`](https://example.test/fixture/api/#fraction)");
    expect([...apiIndex!.linked].sort()).toEqual(["fraction", "useGauge"]);
  });

  it("leads from a wording directory to the table of its entries", () => {
    expect(entry("GERMAN_GAUGE_WORDING")).toContain("Every entry, with its value, stands in the table [Wording](#/gauge/wording) on the Gauge page.");
    expect(html).toContain('stands in the table <a href="../gauge/#wording">Wording</a> on the Gauge page.');
  });

  it("anchors every export on the prerendered page: a value at its name, a type at type-<Name>", () => {
    expect([...apiIndex!.anchors].sort()).toEqual([
      "GAUGE_RANGE",
      "GERMAN_GAUGE_WORDING",
      "Gauge",
      "GaugeNeedle",
      "RANGE",
      "fraction",
      "type-GaugeProps",
      "type-GaugeTone",
      "useGauge",
    ]);
    for (const anchor of apiIndex!.anchors) expect(html, anchor).toContain(`id="${anchor}"`);
    expect(html).toMatch(/^<h1>API index<\/h1>/);
    expect(html).toContain('<h2 class="sectionTitle" id="group-hooks">Hooks</h2>');
  });

  it("is a page like any other: last in the outline, in llms.txt, with its twin and without an import line", () => {
    expect(llmsIndex).toContain("## API index\n\nEvery name the package exports, in one place.\n\n- [API index](https://example.test/fixture/api.md): ");
    expect(page).toMatch(/^### API index\n\nEverything `@umriss-ui\/fixture` exports, with its signature\. A component's props stand on its own page\.\n\nDemo page: [^\n]+\n\n#### Components\n/);
    expect(twinTexts.find((one) => one.path === "api.md")!.text).toContain("[Gauge](https://example.test/fixture/gauge/#type-GaugeProps)");
  });

  it("takes the place of the appendix", () => {
    expect(text).not.toContain("## The rest of the API");
  });

  /* .scratch/one-search 05: what only the index shows is found there; the
     Gauge as its page and `GaugeProps` by its props are found elsewhere. */
  it("puts every export it alone shows in the search, landing on its entry", () => {
    const exports = search.filter((one) => one.kind === "export");
    expect(exports.map(({ label, group, address }) => [label, group, address])).toEqual([
      ["GaugeNeedle", "fixture · API index", "/fixture/api/#GaugeNeedle"],
      ["useGauge", "fixture · API index", "/fixture/api/#useGauge"],
      ["fraction", "fixture · API index", "/fixture/api/#fraction"],
      ["GAUGE_RANGE", "fixture · API index", "/fixture/api/#GAUGE_RANGE"],
      ["RANGE", "fixture · API index", "/fixture/api/#RANGE"],
      ["GaugeTone", "fixture · API index", "/fixture/api/#type-GaugeTone"],
      ["GERMAN_GAUGE_WORDING", "fixture · API index", "/fixture/api/#GERMAN_GAUGE_WORDING"],
    ]);
    for (const { address } of exports) expect(html, address).toContain(`id="${address.split("#")[1]}"`);
  });
});
