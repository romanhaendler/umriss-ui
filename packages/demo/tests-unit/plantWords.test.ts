/* The plant-word check against two small repositories: a good one, where the
   plant stays in its world and within a quarter, and a bad one, where it does
   neither. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { checkPlantWords, plantWordsIn } from "../checks/plantWords";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "plantWords");

describe("checkPlantWords", () => {
  it("passes a repository whose plant stays in its world and within a quarter", () => {
    expect(checkPlantWords(join(FIXTURES, "good"))).toEqual({ offenders: [], quarter: [] });
  });

  it("names file, line and word, and every package over the limit", () => {
    expect(checkPlantWords(join(FIXTURES, "bad"))).toEqual({
      offenders: [{ file: "packages/widget/src/index.ts", line: 2, word: "pump" }],
      quarter: [
        { pkg: "widget", kind: "examples", plant: 1, total: 2 },
        { pkg: "widget", kind: "scenarios", plant: 2, total: 2 },
      ],
    });
  });
});

describe("plantWordsIn", () => {
  it("matches whole words, case-insensitively, and phrases across a space", () => {
    expect(plantWordsIn("f.ts", "The Kiln and its SET POINT; kilnTemperature, SHIFT_MINUTES").map((o) => o.word)).toEqual([
      "Kiln",
      "SET POINT",
    ]);
  });

  it("flags the noun shift, but not the key or the verb", () => {
    expect(plantWordsIn("f.ts", "the early shift").map((o) => o.word)).toEqual(["shift"]);
    expect(plantWordsIn("f.ts", "Shift+click, Alt and Shift, rows shift, it shifts by a day, list.shift()")).toEqual([]);
  });
});
