/* The plant-word check over the whole repository (checks/plantWords.ts,
   ADR-0035): no plant word outside the plant world, and no package whose
   examples play in the plant more than a quarter of the time, or with more
   than one plant scenario. It runs with the unit tests, so CI holds it. The
   failure names each file with its lines and words. */

import { expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { checkPlantWords } from "../checks/plantWords";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

it("finds no plant word outside the plant world and no package over the quarter", () => {
  const report = checkPlantWords(ROOT);
  const offenders = report.offenders.map((o) => `${o.file}:${o.line} ${o.word}`);
  expect(offenders, "plant words outside the plant world").toEqual([]);
  expect(report.quarter.map((q) => `${q.pkg} ${q.kind}: ${q.plant} of ${q.total}`), "packages over the plant's share").toEqual([]);
});
