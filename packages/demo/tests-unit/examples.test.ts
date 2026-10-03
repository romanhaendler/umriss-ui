/* Reading examples and scenarios out of the globs: the lead, the scenario's
   lists, the package name in the shown source, and the addresses of the
   scenarios page. */

import { describe, expect, it } from "vitest";
import { readExamples, readScenarios } from "../src/tooling/examples";
import { addressOfPlace, addresses, placeOfLocation, twinOfPlace } from "../src/outline";
import type { Page, Rubric } from "../src/outline";

const OUTLINE: readonly Rubric[] = [
  {
    id: "values",
    name: "Values",
    sentence: "What a value is read on.",
    pages: [{ id: "gauge", name: "Gauge", sentence: "One value.", types: [], exports: ["Gauge"] }],
  },
];
const { ALL_PAGES, placeOf, addressOf, fromPlace } = addresses(OUTLINE);
const Screen = () => null;
const options = { pages: ALL_PAGES, packageName: "@umriss-ui/fixture" };

describe("readExamples", () => {
  const path = "./examples/Gauge/01-basic.tsx";
  const source = [
    'import { Gauge } from "../../../src";',
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

  it("shows the package's name where the example imports its source", () => {
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
    expect(scenario!.source).toBe("export default function Watch() {}\n");
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
  it("stands at the front, a scenario as an anchor on it", () => {
    expect(placeOf("scenarios")).toBe("");
    expect(addressOf("scenarios")).toBe("/");
    expect(addressOf("scenarios", "watch")).toBe("/#watch");
  });

  it("reads a scenario's address back as no page with the scenario as its example", () => {
    expect(fromPlace("/scenarios/watch")).toEqual({ example: "watch" });
    expect(fromPlace("/scenarios")).toEqual({});
    expect(fromPlace("/gauge").page?.id).toBe("gauge");
  });
});

describe("a page's address is a path (ADR-0037)", () => {
  it("names the page as a directory, an example as an anchor on it", () => {
    expect(addressOf("gauge")).toBe("/gauge/");
    expect(addressOf("gauge", "basic")).toBe("/gauge/#basic");
  });

  it("reads the location back into the place it came from", () => {
    expect(placeOfLocation("/gauge/", "")).toBe("/gauge");
    expect(placeOfLocation("/gauge/", "#basic")).toBe("/gauge/basic");
    expect(placeOfLocation("/gauge", "")).toBe("/gauge");
    expect(placeOfLocation("/", "")).toBe("");
    expect(placeOfLocation("/", "#watch")).toBe("/scenarios/watch");
  });

  it("turns a text's `#/page` and `#/page/example` into their addresses", () => {
    expect(addressOfPlace("#/gauge")).toBe("/gauge/");
    expect(addressOfPlace("#/gauge/basic")).toBe("/gauge/#basic");
    expect(addressOfPlace("#/scenarios/watch")).toBe("/#watch");
    expect(addressOfPlace("")).toBe("/");
  });

  it("gives every page, and the scenarios page, the address of its Markdown twin", () => {
    expect(twinOfPlace("/gauge")).toBe("/gauge.md");
    expect(twinOfPlace("#/gauge/basic")).toBe("/gauge.md");
    expect(twinOfPlace("")).toBe("/index.md");
    expect(twinOfPlace("/scenarios/watch")).toBe("/index.md");
  });

  it("still reads an old hash address, so old links land", () => {
    expect(placeOfLocation("/", "#/gauge/basic")).toBe("/gauge/basic");
    expect(placeOfLocation("/", "#/scenarios/watch")).toBe("/scenarios/watch");
  });

  it("round-trips every address through the location", () => {
    for (const [pageId, exampleId] of [["gauge"], ["gauge", "basic"], ["scenarios", "watch"]] as const) {
      const url = new URL(addressOf(pageId, exampleId), "https://example.test");
      expect(placeOfLocation(url.pathname, url.hash)).toBe(placeOf(pageId, exampleId));
    }
  });
});

describe("a moved page id forwards to its current page", () => {
  const moved = addresses(OUTLINE, { meter: "gauge" });

  it("reads the old id as the current page, keeping the example, and says it moved", () => {
    expect(moved.fromPlace("/meter").page?.id).toBe("gauge");
    expect(moved.fromPlace("/meter")).toMatchObject({ moved: true });
    expect(moved.fromPlace("/meter/basic")).toMatchObject({ example: "basic", moved: true });
    expect(moved.fromPlace("/meter/basic").page?.id).toBe("gauge");
    expect(moved.fromPlace("/gauge/basic").moved).toBeUndefined();
    expect(addressOfPlace(moved.placeOf("gauge", "basic"))).toBe("/gauge/#basic");
  });

  it("refuses an old id that is a current page, or a current id that is none, naming the id", () => {
    expect(() => addresses(OUTLINE, { gauge: "gauge" })).toThrow(/`gauge`/);
    expect(() => addresses(OUTLINE, { meter: "dial" })).toThrow(/`dial`/);
  });
});

describe("the pages whose keys apply on a page (`keysOf`)", () => {
  const withKeys = (keysOf: readonly unknown[]): readonly Rubric[] => [
    {
      ...OUTLINE[0]!,
      pages: [
        { id: "gauge", name: "Gauge", sentence: "One value.", keys: [{ key: "Tab", action: "Moves focus." }], types: [], exports: ["Gauge"] },
        { id: "meter", name: "Meter", sentence: "One bar.", keysOf: keysOf as Page["keysOf"], types: [], exports: ["Meter"] },
      ],
    },
  ];

  it("takes a page of this demo with a keyboard table, and a neighbour's page as `{ name, page }`", () => {
    expect(() => addresses(withKeys(["gauge", { name: "Select", page: "@umriss-ui/core#select" }]))).not.toThrow();
  });

  it("refuses an unknown id at load time, naming the outline's file and the id", () => {
    expect(() => addresses(withKeys(["dial"]))).toThrow(/demo\/outline\.ts.*`meter`.*"dial"/);
  });

  it("refuses a page without a keyboard table, and a neighbour's page not written as one", () => {
    expect(() => addresses(withKeys(["meter"]))).toThrow(/"meter"/);
    expect(() => addresses(withKeys([{ name: "Select", page: "select" }]))).toThrow(/Select/);
  });
});
