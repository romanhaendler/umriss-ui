/* The browser floors are derived from the source: every construct the packages'
   `src` uses that postdates the baseline has a row in the table, and every
   document that states a floor states the derived one. */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { FEATURES, floors, otherFloors, scan, statesFloor, unknown, type Feature } from "../src/tooling/browserFloors";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PACKAGES = ["core", "charts", "table", "schedule", "calculation", "dashboard", "alarms"];

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));
}
const src = PACKAGES.flatMap((p) => files(join(ROOT, "packages", p, "src")));
const read = (list: string[]) => list.map((f) => readFileSync(f, "utf8")).join("\n");
const found = scan(
  read(src.filter((f) => f.endsWith(".css"))),
  read(src.filter((f) => /\.tsx?$/.test(f))),
);

/* Where a floor may be written: the root README states it in full, the others repeat it or point there. */
const DOCUMENTS = [
  "README.md",
  "packages/core/README.md",
  "packages/charts/README.md",
  "packages/core/demo/outline.ts",
  "skills/umriss-ui/SKILL.md",
];

describe("the source", () => {
  it("uses no construct after the baseline that the table does not know", () => {
    expect(unknown(found)).toEqual([]);
  });

  it("uses every row of the table", () => {
    expect(FEATURES.filter((f) => !f.names.some((n) => found.has(n))).map((f) => f.names[0])).toEqual([]);
  });

  it("has an address of the compatibility data for each row", () => {
    for (const f of FEATURES) expect(f.source).toMatch(/^https:\/\/(developer\.mozilla\.org|drafts\.csswg\.org)\//);
  });
});

describe("the scan", () => {
  it("finds an unknown at-rule, function, selector, property, unit and API", () => {
    const css = "@scope (.a) {\n .a {\n width: 10dvh;\n color: foo-bar(1);\n anchor-name: --x;\n }\n .b:nth-of-type(2n)::view-transition-old(x) {\n top: 0;\n }\n}";
    expect(unknown(scan(css, "el.toSorted(); a.structuredClone"))).toEqual(
      ["::view-transition-old", "@scope", "foo-bar()", "prop:anchor-name", "structuredClone", "toSorted", ":nth-of-type"].sort(),
    );
  });

  it("is quiet about the baseline and about a row", () => {
    expect(unknown(scan(".a:hover { color: light-dark(red, blue); display: flex; } @media (min-width: 1px) { .a { gap: 1px; } }", ""))).toEqual([]);
  });
});

describe("the floors", () => {
  const derived = floors(found);

  it("are the highest first version of each browser over the rows the source uses", () => {
    expect(derived).toEqual({ chrome: 125, firefox: 121, safari: 17.5 });
  });

  it("ignore a refinement and count a construct only where the source uses it", () => {
    const rows: Feature[] = [
      { names: ["a"], raises: true, chrome: 100, firefox: 90, safari: 15, source: "" },
      { names: ["b"], raises: false, chrome: 130, firefox: null, safari: null, source: "" },
      { names: ["c"], raises: true, chrome: 140, firefox: 140, safari: 140, source: "" },
    ];
    expect(floors(new Set(["a", "b"]), rows)).toEqual({ chrome: 100, firefox: 90, safari: 15 });
  });

  it.each(DOCUMENTS)("are the only ones %s states", (doc) => {
    const text = readFileSync(join(ROOT, doc), "utf8");
    expect(otherFloors(text, derived)).toEqual([]);
  });

  it("are stated in full by the root README", () => {
    expect(statesFloor(readFileSync(join(ROOT, "README.md"), "utf8"))).toBe(true);
  });

  it("are not those of a document that states another", () => {
    expect(otherFloors('Chrome 123, Firefox 121, Safari 17.5 or newer; build.cssTarget "chrome123"; "safari >= 17.4"', derived)).toEqual(["chrome 123", "chrome 123", "safari 17.4"]);
  });
});
