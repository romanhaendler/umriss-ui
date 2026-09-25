/* The plant-word check over the whole repository (checks/plantWords.ts), as a
   ratchet: the demos are still full of plant examples, and the demo-rework
   scenario and page tickets (09-28) rewrite them. Until then PENDING names
   every file that offends today and PENDING_QUARTER every package over the
   quarter limit. The test fails on an offender that is not pending - the frame
   creeping back - and on a pending entry that no longer offends, so both lists
   only shrink. Each rework ticket deletes its lines; when the rework ends both
   lists are empty.

   Regenerating, after a merge that moved or renamed files:

     PLANT_WORDS_PRINT=1 pnpm --filter @umriss-ui/demo exec vitest run tests-unit/plantWords.repo.test.ts --reporter=verbose

   prints both lists in this file's format (the verbose reporter shows the
   output of a passing test too); paste them over the ones below. */

import { expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { checkPlantWords } from "../checks/plantWords";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const PENDING: readonly string[] = [
  "packages/core/demo/examples/CommandPalette/01-commands.tsx",
  "packages/core/demo/examples/Drawer/03-beside-a-process-picture.tsx",
  "packages/core/demo/examples/ProgressBar/01-how-far.tsx",
  "packages/core/demo/examples/ProgressBar/03-a-batch-in-steps.tsx",
  "packages/core/demo/examples/Stat/01-value-against-limits.tsx",
  "packages/core/demo/examples/Stat/02-the-fourth-outcome.tsx",
  "packages/core/demo/examples/Stat/04-freshness.tsx",
  "packages/demo/src/worlds/controlling.ts",
  "packages/demo/src/worlds/logistics.ts",
  "packages/demo/src/worlds/operations.ts",
];
const PENDING_QUARTER: readonly string[] = [
];

it("finds no plant word outside the plant world and no package over the quarter, but what is pending", () => {
  const report = checkPlantWords(ROOT);
  const offending = [...new Set(report.offenders.map((o) => o.file))].sort();
  const over = report.quarter.map((q) => `${q.pkg} ${q.kind}`).sort();
  if (process.env.PLANT_WORDS_PRINT) {
    const list = (items: string[]) => items.map((i) => `  ${JSON.stringify(i)},\n`).join("");
    console.log(`const PENDING: readonly string[] = [\n${list(offending)}];\n\nconst PENDING_QUARTER: readonly string[] = [\n${list(over)}];`);
  }
  const words = (file: string) =>
    `${file}: ${report.offenders
      .filter((o) => o.file === file)
      .map((o) => `${o.line} ${o.word}`)
      .join(", ")}`;
  expect(offending.filter((f) => !PENDING.includes(f)).map(words), "plant words outside the plant world").toEqual([]);
  expect(PENDING.filter((f) => !offending.includes(f)), "pending files that are clean now - delete them from PENDING").toEqual([]);
  expect(over.filter((q) => !PENDING_QUARTER.includes(q)), "packages over the quarter limit").toEqual([]);
  expect(PENDING_QUARTER.filter((q) => !over.includes(q)), "pending packages within the limit now - delete them").toEqual([]);
});
