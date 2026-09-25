/* Reading examples and scenarios out of the globs: the lead, the scenario's
   lists, a world shown beside its importer, and the addresses of the
   scenarios page. */

import { describe, expect, it } from "vitest";
import { readExamples, readScenarios } from "../src/tooling/examples";
import { addresses } from "../src/outline";
import type { Rubric } from "../src/outline";

const OUTLINE: readonly Rubric[] = [
  {
    id: "values",
    name: "Values",
    sentence: "What a value is read on.",
    pages: [{ id: "gauge", name: "Gauge", sentence: "One value.", types: [], exports: ["Gauge"] }],
  },
];
const { ALL_PAGES, placeOf, addressOf, fromAddress } = addresses(OUTLINE);
const Screen = () => null;
const WORLDS = { "../../demo/src/worlds/operations.ts": "export const SERVICES = [];\n" };
const options = { pages: ALL_PAGES, packageName: "@umriss-ui/fixture", worlds: WORLDS };

describe("readExamples", () => {
  const path = "./examples/Gauge/01-basic.tsx";
  const source = [
    'import { Gauge } from "../../../src";',
    'import { SERVICES } from "@umriss-ui/demo/worlds/operations";',
    "",
    'export const title = "A basic gauge";',
    "",
    'export const lead = "Pass the `value`.";',
    "",
    "export default function Basic() {}",
    "",
  ].join("\n");
  const [example] = readExamples(
    { [path]: { default: Screen, title: "A basic gauge", lead: "Pass the `value`." } },
    { [path]: source },
    options,
  );

  it("reads the lead, and leaves it out of the shown source", () => {
    expect(example!.lead).toBe("Pass the `value`.");
    expect(example!.source).not.toContain("export const lead");
  });

  it("shows an imported world beside the example, imported from there", () => {
    expect(example!.files.map((file) => file.name)).toEqual(["01-basic.tsx", "operations.ts"]);
    expect(example!.source).toContain('import { SERVICES } from "./operations";');
    expect(example!.source).toContain('import { Gauge } from "@umriss-ui/fixture";');
  });

  it("has no lead where the file exports none", () => {
    const [bare] = readExamples(
      { [path]: { default: Screen, title: "A basic gauge" } },
      { [path]: 'export const title = "A basic gauge";\n' },
      options,
    );
    expect(bare!.lead).toBeUndefined();
  });

  it("refuses a world the demo does not read", () => {
    expect(() =>
      readExamples(
        { [path]: { default: Screen, title: "A basic gauge" } },
        { [path]: 'import { X } from "@umriss-ui/demo/worlds/nowhere";\nexport const title = "A basic gauge";\n' },
        options,
      ),
    ).toThrow(/nowhere/);
  });
});

describe("readScenarios", () => {
  const path = "./scenarios/02-watch.tsx";
  const module = {
    default: Screen,
    title: "Watch latency",
    lead: "An on-call engineer.",
    callouts: ["The needle."],
    builtFrom: ["gauge", { name: "Trend", page: "@umriss-ui/charts#trend" }],
  };
  const source = 'export const title = "Watch latency";\nexport const lead = "An on-call engineer.";\nexport const callouts = ["The needle."];\nexport const builtFrom = ["gauge"];\n\nexport default function Watch() {}\n';
  const read = (overrides: object) => readScenarios({ [path]: { ...module, ...overrides } }, { [path]: source }, options);

  it("reads the anchor, the order and the lists, and shows none of them in the source", () => {
    const [scenario] = read({});
    expect(scenario).toMatchObject({ id: "watch", rank: 2, title: "Watch latency", lead: "An on-call engineer.", callouts: ["The needle."] });
    expect(scenario!.builtFrom).toHaveLength(2);
    expect(scenario!.files[0]!.source).toBe("export default function Watch() {}\n");
  });

  it("orders by the number in the file name", () => {
    const first = "./scenarios/01-first.tsx";
    const found = readScenarios({ [path]: module, [first]: module }, { [path]: source, [first]: source }, options);
    expect(found.map((one) => one.id)).toEqual(["first", "watch"]);
  });

  it("refuses a scenario without a lead, or built from nothing", () => {
    expect(() => read({ lead: undefined })).toThrow(/lead/);
    expect(() => read({ builtFrom: [] })).toThrow(/builtFrom/);
  });

  it("refuses a page this demo does not have, and a neighbour's page not written as one", () => {
    expect(() => read({ builtFrom: ["trend"] })).toThrow(/trend/);
    expect(() => read({ builtFrom: [{ name: "Trend", page: "trend" }] })).toThrow(/Trend/);
  });
});

describe("the scenarios page's addresses", () => {
  it("stands at the front, a scenario under /scenarios/", () => {
    expect(placeOf("scenarios")).toBe("");
    expect(addressOf("scenarios", "watch")).toBe("/#/scenarios/watch");
  });

  it("reads a scenario's address back as no page with the scenario as its example", () => {
    expect(fromAddress("#/scenarios/watch")).toEqual({ example: "watch" });
    expect(fromAddress("#/scenarios")).toEqual({});
    expect(fromAddress("#/gauge").page?.id).toBe("gauge");
  });
});
