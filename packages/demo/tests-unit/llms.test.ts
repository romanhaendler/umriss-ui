/* The llms.txt generator against a fixture package: one scenario, one page
   with three examples (one with a lead, one importing a world), one
   props table and the page's texts. What is checked is what an agent reading
   the text relies on - every page is there with its link, every example's
   source stands as the demo shows it, the table is complete. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderLlms } from "../src/tooling/llms";
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
        about: ["Read it at a glance.", "One `value`, one limit set."],
        alternatives: [{ when: "A value over time", use: "meter" }],
        keys: [{ key: "Tab", action: "Moves focus to the gauge." }],
        limits: ["No second needle."],
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

const { index, full } = renderLlms({ packageDir: PACKAGE_DIR, outline: OUTLINE, tables: TABLES, worldsDir: join(PACKAGE_DIR, "worlds") });

describe("llms.txt", () => {
  it("names the package, its summary and where the full text is", () => {
    expect(index.startsWith("# @umriss-ui/fixture\n\n> A fixture package for the llms.txt generator.\n")).toBe(true);
    expect(index).toContain("https://example.test/fixture/llms-full.txt");
    expect(index).toContain("`docs/llms-full.md`");
  });

  it("lists the scenarios first, with their lead and a link", () => {
    expect(index).toContain("## Scenarios\n");
    expect(index).toContain("- [Watch a service's latency](https://example.test/fixture/#/scenarios/watch-latency): An on-call engineer keeps it open beside the incident channel.\n");
    expect(index.indexOf("## Scenarios")).toBeLessThan(index.indexOf("## Instruments"));
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

  it("carries each scenario with its callouts, what it is built from, and its source", () => {
    const scenarios = full.slice(full.indexOf("## Scenarios"), full.indexOf("## Instruments"));
    expect(scenarios).toContain("### Watch a service's latency\n\nAn on-call engineer keeps it open beside the incident channel.");
    expect(scenarios).toContain("1. The needle: latency, in ms.\n2. Red above the limit, as the SLA says: 300 ms.");
    expect(scenarios).toContain("Built from: Gauge, Trend.");
    expect(scenarios).toContain('import { SERVICES } from "./operations";');
    expect(scenarios).not.toContain("export const callouts");
    expect(scenarios).not.toContain("export const builtFrom");
  });

  it("prints a world a scenario and an example import once, among the files shown", () => {
    const files = full.slice(full.indexOf("## Files the examples show"));
    expect(files).toContain("### `operations.ts`");
    expect(full.split("export const SERVICES").length - 1).toBe(1);
    expect(full.split("export const READINGS").length - 1).toBe(1);
    expect(full).toContain('import { READINGS } from "./operations";');
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
});
