/* Which example shows which row (.scratch/props-to-examples), against a
   fixture package: one example for each kind of use, a page that shows
   another page's prop, and a scenario. What is checked is what a reader of a
   row sees - the examples it names and their order - never how the scan
   walks the tree. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readProps } from "../src/tooling/propsReader";
import { shownIn } from "../src/tooling/shownIn";
import { sourceFiles } from "../src/tooling/props";
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
    expect(at("PanelProps.children")).toEqual(["panel/in-a-panel"]);
    expect(at("PanelProps.heading")).toEqual([]);
  });

  it("counts a property of an object literal by its contextual type", () => {
    expect(at("MeterOptions.unit")).toEqual(["meter/readings"]);
    expect(at("MeterOptions.keep")).toEqual([]);
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

describe("the order of a row's examples", () => {
  it("is its own page, the other pages in the outline's order, then the scenarios", () => {
    expect(at("DialProps.value")).toEqual(["dial/basic", "dial/spread", "panel/in-a-panel", "slider/steps", "meter/readings", "scenarios/watch-pressure"]);
  });

  it("carries each example's title and its page's name", () => {
    expect(shown["DialProps.value"]![2]).toEqual({ page: "panel", example: "in-a-panel", title: "In a panel", pageName: "Panel" });
    expect(shown["DialProps.value"]!.at(-1)).toEqual({ page: "scenarios", example: "watch-pressure", title: "Watch the pressure", pageName: "Scenarios" });
  });

  it("is the same on every run", () => {
    expect(JSON.stringify(shownIn(join(PACKAGE_DIR, "demo"), OUTLINE, declaredAt))).toBe(JSON.stringify(shown));
  });
});
