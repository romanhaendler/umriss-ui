/* The llms.txt generator against a fixture package: one page, three examples
   (one a demonstration that shows a file beside itself), one props table and
   one "Why it is like this". What is checked is what an agent reading the text
   relies on - every page is there with its link, every example's source stands
   as the demo shows it, the table is complete, and the why page reads as prose. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderLlms, whyMarkdown } from "../src/tooling/llms";
import type { Rubric } from "../src/outline";
import type { TypeEntry } from "../src/tooling/tables";

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
        sentence: "One value as a needle.",
        types: ["GaugeProps"],
        exports: ["Gauge"],
      },
      { id: "meter", name: "Meter", sentence: "One value as a bar.", types: [], exports: ["Meter"] },
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

const { index, full } = renderLlms({ packageDir: PACKAGE_DIR, outline: OUTLINE, tables: TABLES });

describe("llms.txt", () => {
  it("names the package, its summary and where the full text is", () => {
    expect(index.startsWith("# @umriss-ui/fixture\n\n> A fixture package for the llms.txt generator.\n")).toBe(true);
    expect(index).toContain("https://example.test/fixture/llms-full.txt");
    expect(index).toContain("`docs/llms-full.md`");
  });

  it("lists every page under its rubric, with one line and a link", () => {
    expect(index).toContain("## Instruments\n\nWhat a value is read on.\n\n");
    expect(index).toContain("- [Gauge](https://example.test/fixture/#/gauge): One value as a needle.\n");
    expect(index).toContain("- [Meter](https://example.test/fixture/#/meter): One value as a bar.\n");
  });
});

describe("llms-full.txt", () => {
  it("heads every page with its sentence and import line", () => {
    expect(full).toContain("### Gauge\n\nOne value as a needle.\n\n```ts\nimport { Gauge } from \"@umriss-ui/fixture\";\n```\n");
  });

  it("carries every example's source as the demo shows it - title gone, package name in", () => {
    expect(full).toContain("##### A basic gauge\n");
    expect(full).toContain('import { Gauge } from "@umriss-ui/fixture";\n\nexport default function Basic()');
    expect(full).not.toContain("../../../src");
    expect(full).not.toContain("export const title");
  });

  it("runs the examples in the demo's order, the demonstration last", () => {
    const at = (title: string) => full.indexOf(`##### ${title}\n`);
    expect(at("A basic gauge")).toBeLessThan(at("Compact"));
    expect(at("Compact")).toBeLessThan(at("The whole plant"));
  });

  it("names a file shown beside an example and prints it once, at the end", () => {
    expect(full).not.toContain("export const shows");
    expect(full).toContain("`data.ts`");
    expect(full.split("export const READINGS").length - 1).toBe(1);
    expect(full.indexOf("export const READINGS")).toBeGreaterThan(full.indexOf("## Files the examples show"));
  });

  it("writes the props table with every row, escaped for Markdown", () => {
    expect(full).toContain("##### `GaugeProps`\n\n| Prop | Type | Default | Description |\n|---|---|---|---|\n");
    expect(full).toContain("| `value` (required) | `number` | — | The value the needle points at. |\n");
    expect(full).toContain('| `tone` | `"neutral" \\| "alarm"` | `"neutral"` | What the needle says. |\n');
    expect(full).toContain("Also takes every attribute of `<div>` – without `title`.");
  });

  it("says so where a page has no example and no table", () => {
    const meter = full.slice(full.indexOf("### Meter"));
    expect(meter).toContain("There is no example for this page yet.");
    expect(meter).not.toContain("#### API");
  });

  it("adds what the package exports and no page names, with its declaration", () => {
    const rest = full.slice(full.indexOf("## The rest of the API"));
    expect(rest).toContain("### `GAUGE_RANGE`");
    expect(rest).toContain("/** The range every gauge spans - exported, and named on no page. */\nconst GAUGE_RANGE: readonly [0, 100];");
    expect(rest).toContain("function fraction(value: number): number;");
    /* On a page already, so not again - and the demo's data is not the package's. */
    expect(rest).not.toContain("### `Gauge`");
    expect(full.indexOf("## The rest of the API")).toBeLessThan(full.indexOf("## Files the examples show"));
  });

  it("carries the why page as prose", () => {
    expect(full).toContain("#### Why it is like this\n\n##### A needle, not a number\n");
  });
});

describe("whyMarkdown", () => {
  const md = whyMarkdown(
    `export default function W() {
  return (
    <>
      <h3>A needle, not a number</h3>
      <p>
        A <code>Gauge</code> is read at a glance &ndash; the needle&apos;s angle
        says <strong>more</strong> than the digits, see{" "}
        <a href="#/meter">Meter</a> and <em>the ADR</em>.
      </p>
      <ul>
        <li>One value.</li>
        <li>One limit set.</li>
      </ul>
    </>
  );
}`,
    { heading: "#####", base: "https://example.test/fixture/" },
  );

  it("joins the lines of a paragraph the way JSX does, and decodes entities", () => {
    expect(md).toContain(
      "A `Gauge` is read at a glance – the needle's angle says **more** than the digits, see [Meter](https://example.test/fixture/#/meter) and *the ADR*.",
    );
  });

  it("turns headings and lists into Markdown", () => {
    expect(md.startsWith("##### A needle, not a number\n\n")).toBe(true);
    expect(md).toContain("- One value.\n- One limit set.");
  });

  it("refuses what it cannot write rather than dropping it", () => {
    expect(() => whyMarkdown("export default () => <p>{value}</p>;", { heading: "#####", base: "" })).toThrow(/value/);
    expect(() => whyMarkdown("export default () => <table />;", { heading: "#####", base: "" })).toThrow(/<table>/);
  });
});
