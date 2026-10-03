/* The search fragment against the fixture package (.scratch/one-search 02):
   one entry per page, scenario and example, each with the address a page of
   the site carries - the path a prerendered page and the anchor on it. A find
   that lands on nothing is the one defect a reader cannot work around. */

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
      { id: "gauge", name: "Gauge", sentence: "One value as a needle (also called a `dial`), beside the [Meter](#/meter).", types: [], exports: ["Gauge"] },
      { id: "meter", name: "Meter", sentence: "One value as a bar.", types: [], exports: ["Meter"] },
    ],
  },
];

const { pages, search } = renderLlms({ packageDir: PACKAGE_DIR, outline: OUTLINE, tables: {} });

describe("the search fragment", () => {
  it("holds the front page, every scenario, every page and every example, in that order", () => {
    expect(search.map(({ kind, label, group }) => [kind, label, group])).toEqual([
      ["page", "Scenarios", "fixture · Scenarios"],
      ["scenario", "Watch a service's latency", "fixture · Scenarios"],
      ["page", "Gauge", "fixture · Instruments"],
      ["page", "Meter", "fixture · Instruments"],
      ["example", "A basic gauge", "fixture · Gauge"],
      ["example", "Show several readings", "fixture · Gauge"],
      ["example", "Compact", "fixture · Gauge"],
    ]);
  });

  it("lands every entry on a page of the site and an anchor that page carries", () => {
    expect(search.map((entry) => entry.address)).toEqual([
      "/fixture/",
      "/fixture/#watch-latency",
      "/fixture/gauge/",
      "/fixture/meter/",
      "/fixture/gauge/#basic",
      "/fixture/gauge/#readings",
      "/fixture/gauge/#compact",
    ]);
    for (const { address } of search) {
      const [path, anchor] = address.replace(/^\/fixture\//, "").split("#");
      const page = pages.find((one) => one.path === path);
      expect(page, address).toBeDefined();
      if (anchor !== undefined) expect(page!.html, address).toContain(`id="${anchor}"`);
    }
  });

  it("finds a page by its lede and an example by its lead, as plain text", () => {
    expect(search.find((entry) => entry.label === "Gauge")?.keywords).toEqual(["One value as a needle (also called a dial), beside the Meter."]);
    expect(search.find((entry) => entry.label === "A basic gauge")?.keywords).toEqual(["Pass the value; the needle points at it."]);
    expect(search.find((entry) => entry.label === "Compact")).not.toHaveProperty("keywords");
  });
});

/* Tokens and wording keys (.scratch/one-search 06): every row of a page's
   reference tables, landing on the row. A table with an English and a German
   column is a wording table, and its texts are the keywords - so that a
   string seen on screen, in either language, finds the key behind it. */
const code = (text: string) => [{ kind: "code" as const, text }];
const word = (text: string) => [{ kind: "text" as const, text }];
const referenced = renderLlms({
  packageDir: PACKAGE_DIR,
  outline: OUTLINE,
  tables: {},
  references: {
    gauge: [
      {
        title: "Tokens",
        anchor: "tokens",
        lead: word("Every token."),
        columns: ["Token", "Light", "Dark", "Description"],
        groups: [
          {
            rows: [
              {
                anchor: "token-u-color-accent",
                cells: [code("--u-color-accent"), [{ kind: "swatch", text: "#06c", scheme: "light" }, ...code("#06c")], code("#4af"), word("The accent.")],
              },
            ],
          },
        ],
      },
      {
        title: "Wording",
        anchor: "wording",
        lead: word("Every entry."),
        columns: ["Key", "English", "German", "Description"],
        groups: [
          { rows: [{ anchor: "wording-noMatches", cells: [code("noMatches"), word("No matches"), word("Keine Treffer"), word("—")] }] },
          { title: word("Presets"), rows: [{ anchor: "wording-presets.today", cells: [code("presets.today"), word("Today"), word("Heute"), word("—")] }] },
        ],
      },
    ],
  },
});

describe("the search fragment's tokens and wording keys", () => {
  const rows = referenced.search.filter((entry) => entry.kind === "token" || entry.kind === "wording");

  it("holds one entry per row, under its package and page, after the examples", () => {
    expect(rows.map(({ kind, label, group, address }) => [kind, label, group, address])).toEqual([
      ["token", "--u-color-accent", "fixture · Gauge", "/fixture/gauge/#token-u-color-accent"],
      ["wording", "noMatches", "fixture · Gauge", "/fixture/gauge/#wording-noMatches"],
      ["wording", "presets.today", "fixture · Gauge", "/fixture/gauge/#wording-presets.today"],
    ]);
    expect(referenced.search.slice(0, -3).map((entry) => entry.kind)).not.toContain("token");
  });

  it("finds a wording key by its English and its German text; a token by its name alone", () => {
    expect(rows.find((entry) => entry.label === "noMatches")?.keywords).toEqual(["No matches", "Keine Treffer"]);
    expect(rows.find((entry) => entry.label === "--u-color-accent")).not.toHaveProperty("keywords");
  });

  it("lands every row's entry on an anchor its prerendered page carries", () => {
    const gauge = referenced.pages.find((one) => one.path === "gauge/")!;
    for (const { address } of rows) expect(gauge.html, address).toContain(`id="${address.split("#")[1]}"`);
  });
});

/* Props (.scratch/one-search 04): one find per row of a page's props table,
   under the type that declares it, at the row's own anchor. */
describe("the props in the search fragment", () => {
  const outline: readonly Rubric[] = [
    {
      ...OUTLINE[0]!,
      pages: [
        { ...OUTLINE[0]!.pages[0]!, types: ["GaugeProps"] },
        /* The Meter shows the Gauge's table too: its props are found once, on
           the Gauge's page. */
        { ...OUTLINE[0]!.pages[1]!, types: ["MeterProps", "GaugeProps"] },
      ],
    },
  ];
  const tables: Record<string, TypeEntry> = {
    GaugeProps: {
      name: "GaugeProps",
      parameter: [],
      omitted: [],
      props: [
        { name: "value", type: "number", optional: false, description: "The value the needle points at." },
        { name: "tone", type: '"neutral" | "alarm"', optional: true, description: "What the needle says." },
      ],
    },
    MeterProps: {
      name: "MeterProps",
      parameter: [],
      omitted: [],
      props: [
        { name: "max", type: "number", optional: true, description: "The full bar." },
        /* Declared by the Gauge, whose table has it: found there. */
        { name: "value", type: "number", optional: false, description: "The value.", inheritedFrom: "GaugeProps" },
        /* Declared by a type with no table: found here, where it stands. */
        { name: "unit", type: "string", optional: true, description: "After the value.", inheritedFrom: "UnitProps" },
      ],
    },
  };
  const rendered = renderLlms({ packageDir: PACKAGE_DIR, outline, tables });
  const props = rendered.search.filter((entry) => entry.kind === "prop");

  it("holds every row once, under the type that declares it, at the row's anchor", () => {
    expect(props.map(({ address, label, group }) => [address, label, group])).toEqual([
      ["/fixture/gauge/#GaugeProps-value", "value", "fixture · GaugeProps"],
      ["/fixture/gauge/#GaugeProps-tone", "tone", "fixture · GaugeProps"],
      ["/fixture/meter/#MeterProps-max", "max", "fixture · MeterProps"],
      ["/fixture/meter/#MeterProps-unit", "unit", "fixture · MeterProps"],
    ]);
  });

  it("lands every prop on its row of the prerendered page", () => {
    for (const { address } of props) {
      const [path, anchor] = address.replace(/^\/fixture\//, "").split("#");
      expect(rendered.pages.find((one) => one.path === path)?.html, address).toContain(`<tr id="${anchor}"`);
    }
  });
});
