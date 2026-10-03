/* The Language page's wording tables (theming-and-wording-reference 04),
   against the running objects: the German column says what `GERMAN_WORDING`
   and the charts' German wording say, and the guard `demo/props.ts` runs
   names a key whose row is gone. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { referenceHtml } from "@umriss-ui/demo/tooling/referenceTable";
import { GERMAN_WORDING } from "../src/lib/language/de";
import { GERMAN_CHARTS_WORDING } from "../../charts/src/wording/de";
import { languageTables, missingAnchors } from "../demo/tooling/languageTables";

const TABLES = languageTables(join(dirname(fileURLToPath(import.meta.url)), ".."));

/** Every row's German cell as plain text, by anchor. */
const german = new Map(TABLES.flatMap((table) => table.groups.flatMap((group) => group.rows.map((row) => [row.anchor, row.cells[2]!.map((span) => span.text).join("")] as const))));

/** A directory's string entries, nested ones with dots. */
function strings(object: object, prefix = ""): [string, string][] {
  return Object.entries(object).flatMap(([key, value]): [string, string][] =>
    typeof value === "string" ? [[`${prefix}${key}`, value]] : value !== null && typeof value === "object" && !Array.isArray(value) ? strings(value, `${prefix}${key}.`) : [],
  );
}

describe("the Language page's wording tables", () => {
  it("show in the German column the text the German wordings carry", () => {
    const expected = [...strings(GERMAN_WORDING).map(([key, text]) => [`wording-${key}`, text]), ...strings(GERMAN_CHARTS_WORDING).map(([key, text]) => [`charts-wording-${key}`, text])];
    expect(expected.length).toBeGreaterThan(200);
    expect(expected.map(([anchor]) => [anchor, german.get(anchor!)])).toEqual(expected);
  });

  it("write the German formats' notation", () => {
    expect(german.get("format-number")).toBe("1.204,5");
    expect(german.get("format-date")).toBe("17.03.2026");
  });

  it("leave the guard nothing to name - and the guard names a row that is gone", () => {
    const html = TABLES.map(referenceHtml).join("");
    expect(missingAnchors(html)).toEqual([]);
    expect(missingAnchors(html.replace(' id="wording-presets.today"', "").replace(' id="charts-wording-empty"', "").replace(' id="format-relative"', ""))).toEqual([
      "wording-presets.today",
      "charts-wording-empty",
      "format-relative",
    ]);
  });
});
