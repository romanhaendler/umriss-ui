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
  "packages/core/demo/examples/Accordion/01-one-section-at-a-time.tsx",
  "packages/core/demo/examples/Accordion/02-several-open.tsx",
  "packages/core/demo/examples/Accordion/04-machine-settings.tsx",
  "packages/core/demo/examples/Breadcrumb/01-where-a-page-stands.tsx",
  "packages/core/demo/examples/Breadcrumb/02-routing-is-yours.tsx",
  "packages/core/demo/examples/Breadcrumb/03-folded-when-narrow.tsx",
  "packages/core/demo/examples/Breadcrumb/04-a-plant-browser.tsx",
  "packages/core/demo/examples/CommandPalette/01-commands.tsx",
  "packages/core/demo/examples/DateRangePicker/02-presets.tsx",
  "packages/core/demo/examples/DateTimeRangePicker/01-shift-window.tsx",
  "packages/core/demo/examples/Drawer/03-beside-a-process-picture.tsx",
  "packages/core/demo/examples/FileInput/02-several-files.tsx",
  "packages/core/demo/examples/FileInput/03-controlled-in-a-form.tsx",
  "packages/core/demo/examples/ProgressBar/01-how-far.tsx",
  "packages/core/demo/examples/ProgressBar/03-a-batch-in-steps.tsx",
  "packages/core/demo/examples/Slider/01-a-setpoint.tsx",
  "packages/core/demo/examples/Slider/02-format-and-marks.tsx",
  "packages/core/demo/examples/Splitter/02-trend-above-alarms.tsx",
  "packages/core/demo/examples/Splitter/04-a-line-screen.tsx",
  "packages/core/demo/examples/Stack-and-Grid/02-grid.tsx",
  "packages/core/demo/examples/Stat/01-value-against-limits.tsx",
  "packages/core/demo/examples/Stat/02-the-fourth-outcome.tsx",
  "packages/core/demo/examples/Stat/04-freshness.tsx",
  "packages/core/demo/examples/Stepper/02-failed-and-in-a-column.tsx",
  "packages/core/demo/examples/Stepper/03-moving-on-is-yours.tsx",
  "packages/core/demo/examples/Stepper/04-a-changeover.tsx",
  "packages/core/demo/examples/Switch/03-hand-or-automatic.tsx",
  "packages/core/demo/examples/Switch/04-functions-of-a-line.tsx",
  "packages/core/demo/outline.ts",
  "packages/demo/src/worlds/controlling.ts",
  "packages/demo/src/worlds/logistics.ts",
  "packages/demo/src/worlds/operations.ts",
  "packages/schedule/demo/outline.ts",
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
