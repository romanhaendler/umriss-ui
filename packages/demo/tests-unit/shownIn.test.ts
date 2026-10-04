/* Which example shows which row (.scratch/props-to-examples), against a
   fixture package: one example for each kind of use, a page that shows
   another page's prop, and a scenario. What is checked is what a reader of a
   row sees - the examples it names and their order - never how the scan
   walks the tree. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readProps } from "../src/tooling/propsReader";
import { exampleFaults, shownIn } from "../src/tooling/shownIn";
import { generateProps, sourceFiles } from "../src/tooling/props";
import type { Rubric } from "../src/outline";

const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "shown");

const page = (id: string, name: string, types: string[]) => ({ id, name, sentence: `${name}.`, types, exports: [] });
/* Panel stands before Dial, so that "own page first" is seen to beat the
   outline's order. */
const OUTLINE: readonly Rubric[] = [
  {
    id: "instruments",
    name: "Instruments",
    sentence: "What a value is read on.",
    pages: [
      page("panel", "Panel", ["PanelProps"]),
      page("dial", "Dial", ["DialProps"]),
      page("slider", "Slider", ["SliderProps"]),
      page("meter", "Meter", ["MeterOptions", "MeterHandle"]),
    ],
  },
];

const { declaredAt } = readProps(sourceFiles(join(PACKAGE_DIR, "src")), OUTLINE[0]!.pages.flatMap((one) => one.types));
const shown = shownIn(join(PACKAGE_DIR, "demo"), OUTLINE, declaredAt);
/** A row's examples as `page/example`. */
const at = (row: string) => (shown[row] ?? []).map((one) => `${one.page}/${one.example}`);

describe("what an example uses", () => {
  it("counts a JSX attribute for the prop it resolves to", () => {
    expect(at("DialProps.tone")).toEqual(["dial/basic"]);
  });

  it("counts JSX children as `children`", () => {
    expect(at("PanelProps.children")).toContain("panel/in-a-panel");
    expect(at("PanelProps.heading")).toEqual([]);
  });

  it("counts a property of an object literal by its contextual type", () => {
    expect(at("MeterOptions.unit")).toEqual(["meter/readings"]);
    expect(at("MeterOptions.keep")).toEqual([]);
  });

  it("counts a property of an object literal a callback maps into the array a prop takes", () => {
    expect(at("PanelMark.at")).toEqual(["panel/in-a-panel"]);
    expect(at("PanelMark.note")).toEqual([]);
  });

  it("counts a property access on an output type", () => {
    expect(at("MeterHandle.latest")).toEqual(["meter/readings"]);
    expect(at("MeterHandle.reset")).toEqual([]);
  });

  it("counts a spread for the props its own type carries, and a loose object's for none", () => {
    expect(at("DialProps.size")).toEqual(["dial/spread"]);
    expect(at("DialProps.label")).toEqual([]);
  });

  it("keeps two props of one name apart", () => {
    expect(at("SliderProps.value")).toEqual([]);
    expect(at("SliderProps.step")).toEqual(["slider/steps"]);
  });

  it("covers an inherited row by a use of the prop it inherits, in either table", () => {
    expect(at("DialProps.id")).toEqual(["dial/basic"]);
    expect(at("SliderProps.id")).toEqual(["dial/basic"]);
  });
});

describe("what a configurator sets", () => {
  it("counts its controls and its text, first on its page", () => {
    expect(at("PanelProps.framed")).toEqual(["panel/configurator-panel"]);
    expect(at("PanelProps.children")).toEqual(["panel/configurator-panel", "panel/in-a-panel"]);
  });

  it("counts them against the component it names, and its required props too", () => {
    expect(at("DialProps.unit")).toEqual(["slider/configurator-slider"]);
    expect(shown["DialProps.unit"]![0]).toEqual({ page: "slider", example: "configurator-slider", title: "Configurator", pageName: "Slider" });
    expect(at("DialProps.value")).toContain("slider/configurator-slider");
  });
});

describe("the order of a row's examples", () => {
  it("is its own page, the other pages in the outline's order, then the scenarios", () => {
    expect(at("DialProps.value")).toEqual(["dial/basic", "dial/spread", "panel/in-a-panel", "slider/configurator-slider", "slider/steps", "meter/readings", "scenarios/watch-pressure"]);
  });

  it("carries each example's title and its page's name", () => {
    expect(shown["DialProps.value"]![2]).toEqual({ page: "panel", example: "in-a-panel", title: "In a panel", pageName: "Panel" });
    expect(shown["DialProps.value"]!.at(-1)).toEqual({ page: "scenarios", example: "watch-pressure", title: "Watch the pressure", pageName: "Scenarios" });
  });

  it("is the same on every run", () => {
    expect(JSON.stringify(shownIn(join(PACKAGE_DIR, "demo"), OUTLINE, declaredAt))).toBe(JSON.stringify(shown));
  });
});

/* The rows no example of the fixture uses. */
const UNSHOWN = ["PanelProps.heading", "PanelMark.note", "DialProps.label", "SliderProps.value", "MeterOptions.keep", "MeterHandle.reset"];
const rows = Object.keys(declaredAt);
const listed = (names: readonly string[]) => Object.fromEntries(names.map((name) => [name, "not shown yet"]));

describe("the gate on examples", () => {
  it("passes a list that holds exactly the rows shown nowhere", () => {
    expect(exampleFaults(rows, shown, listed(UNSHOWN))).toEqual({ unshown: [], stale: [], unknown: [] });
  });

  it("names every row without a use that is not on the list", () => {
    expect([...exampleFaults(rows, shown, listed(["DialProps.label"])).unshown].sort()).toEqual(UNSHOWN.filter((row) => row !== "DialProps.label").sort());
  });

  it("names an entry whose row an example now uses as stale", () => {
    expect(exampleFaults(rows, shown, listed([...UNSHOWN, "DialProps.tone"])).stale).toEqual(["DialProps.tone"]);
  });

  it("names an entry whose row does not exist", () => {
    expect(exampleFaults(rows, shown, listed([...UNSHOWN, "DialProps.colour", "Gauge.value"])).unknown).toEqual(["DialProps.colour", "Gauge.value"]);
  });
});

describe("generateProps", () => {
  afterEach(() => vi.restoreAllMocks());

  /* The fixture's `demo/unshown.json` lists one row rightly, one that an
     example uses and one that does not exist. */
  it("stops at all three kinds in one run and names every offender of the tables the pages list", () => {
    let written = "";
    vi.spyOn(process.stderr, "write").mockImplementation((text) => {
      written += String(text);
      return true;
    });
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit ${code}`);
    });

    expect(() => generateProps({ packageName: PACKAGE_DIR, outline: OUTLINE })).toThrow("exit 1");
    expect(written).not.toContain("without JSDoc");
    expect(written).toContain("4 props without an example:\n");
    /* `PanelMark` is a definition, not a table a page lists. */
    expect(written).not.toContain("PanelMark.note");
    for (const row of ["DialProps.label", "SliderProps.value", "MeterOptions.keep", "MeterHandle.reset"]) expect(written).toContain(`  ${row}\n`);
    expect(written).not.toContain("  PanelProps.heading\n");
    expect(written).toContain("1 entry of demo/unshown.json is shown now - stale, remove it:\n  DialProps.tone\n");
    expect(written).toContain("1 entry of demo/unshown.json names no row:\n  DialProps.colour\n");
  });
});
