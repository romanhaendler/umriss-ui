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
  "packages/charts/demo/examples/Chart/03-empty.tsx",
  "packages/charts/demo/outline.ts",
  "packages/charts/src/Line.tsx",
  "packages/charts/src/scene.ts",
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
  "packages/core/demo/examples/UmrissProvider/01-the-second-language.tsx",
  "packages/core/demo/examples/UmrissProvider/02-entry-by-entry.tsx",
  "packages/core/demo/outline.ts",
  "packages/demo/src/worlds/controlling.ts",
  "packages/demo/src/worlds/logistics.ts",
  "packages/demo/src/worlds/operations.ts",
  "packages/schedule/demo/examples/Appearances/03-muted.tsx",
  "packages/schedule/demo/examples/Appearances/06-combinations.tsx",
  "packages/schedule/demo/examples/Bar-labels/01-bar-labels.tsx",
  "packages/schedule/demo/examples/Dependencies/01-anchors.tsx",
  "packages/schedule/demo/examples/Dependencies/02-attach.tsx",
  "packages/schedule/demo/examples/Dependencies/03-ends.tsx",
  "packages/schedule/demo/examples/Handle/01-handle.tsx",
  "packages/schedule/demo/examples/Interactions/01-interactions.tsx",
  "packages/schedule/demo/examples/Lane-groups/01-a-group.tsx",
  "packages/schedule/demo/examples/Lane-groups/02-nesting.tsx",
  "packages/schedule/demo/examples/Lane-groups/03-controlled.tsx",
  "packages/schedule/demo/examples/Lane-groups/04-the-miniature.tsx",
  "packages/schedule/demo/examples/Linked-schedules/01-in-step.tsx",
  "packages/schedule/demo/examples/Move-and-lane/01-move-and-lane.tsx",
  "packages/schedule/demo/examples/Now-line/01-now-line.tsx",
  "packages/schedule/demo/examples/Pan-and-zoom/01-pan-and-zoom.tsx",
  "packages/schedule/demo/examples/Ripple/01-cascade.tsx",
  "packages/schedule/demo/examples/Routes/01-routes.tsx",
  "packages/schedule/demo/examples/Schedule/01-first-schedule.tsx",
  "packages/schedule/demo/examples/Selection/01-selection.tsx",
  "packages/schedule/demo/examples/Snapping/01-snapping.tsx",
  "packages/schedule/demo/examples/Subtasks/01-lead-in-and-lead-out.tsx",
  "packages/schedule/demo/examples/Time-axis/01-working-calendar.tsx",
  "packages/schedule/demo/examples/Tooltip/01-tooltip.tsx",
  "packages/schedule/demo/examples/Tooltip/02-own-tooltip.tsx",
  "packages/schedule/demo/examples/Where-it-may-go/01-within.tsx",
  "packages/schedule/demo/examples/findings/01-as-data.tsx",
  "packages/schedule/demo/outline.ts",
  "packages/schedule/src/Schedule.tsx",
  "packages/schedule/src/appearance.ts",
  "packages/schedule/src/context.ts",
  "packages/schedule/src/parts.tsx",
  "packages/schedule/src/refusal.ts",
  "packages/schedule/src/ripple.ts",
  "packages/schedule/src/rows.ts",
  "packages/schedule/src/sceneDraw.ts",
  "packages/schedule/src/sceneGestures.ts",
  "packages/schedule/src/sceneView.ts",
  "packages/schedule/src/snap.ts",
  "packages/schedule/src/timeAxis.ts",
  "packages/schedule/src/walk.ts",
  "packages/table/demo/examples/Aggregate/02-sum-and-average.tsx",
  "packages/table/demo/examples/Aggregate/04-range-of-dates.tsx",
  "packages/table/demo/examples/Aggregate/05-count-and-distinct.tsx",
  "packages/table/demo/examples/Aggregate/08-never-an-average-of-averages.tsx",
  "packages/table/demo/examples/Aggregate/09-own-aggregate.tsx",
  "packages/table/demo/examples/Aggregate/10-worst-verdict.tsx",
  "packages/table/demo/examples/AlarmList/01-lifecycle.tsx",
  "packages/table/demo/examples/AlarmList/03-hidden-from-operation.tsx",
  "packages/table/demo/examples/Column/03-presentation.tsx",
  "packages/table/demo/examples/Column/06-format.tsx",
  "packages/table/demo/examples/Column/07-footer.tsx",
  "packages/table/demo/examples/Column/09-width.tsx",
  "packages/table/demo/examples/Column/13-pinned-both-sides.tsx",
  "packages/table/demo/examples/Filter/02-range-filter.tsx",
  "packages/table/demo/examples/Filter/05-conditions-from-outside.tsx",
  "packages/table/demo/examples/Grouping/02-nothing-declared.tsx",
  "packages/table/demo/examples/Grouping/07-two-levels.tsx",
  "packages/table/demo/examples/Grouping/08-three-levels.tsx",
  "packages/table/demo/examples/Grouping/09-a-key-that-is-no-column.tsx",
  "packages/table/demo/examples/Grouping/10-groups-by-their-aggregate.tsx",
  "packages/table/demo/examples/Grouping/11-the-overview.tsx",
  "packages/table/demo/examples/Grouping/15-twenty-thousand-rows.tsx",
  "packages/table/demo/examples/Grouping/17-the-shift-report.tsx",
  "packages/table/demo/examples/Grouping/18-compact-and-long-values.tsx",
  "packages/table/demo/examples/Table/03-sticky-parts.tsx",
  "packages/table/demo/examples/Table/04-density.tsx",
  "packages/table/demo/examples/Table/08-virtualisation.tsx",
  "packages/table/demo/examples/Table/10-pre-filter.tsx",
  "packages/table/demo/examples/Table/11-grid-mode.tsx",
  "packages/table/demo/examples/Table/12-comments-column.tsx",
  "packages/table/demo/examples/Table/13-setpoint-list.tsx",
  "packages/table/demo/examples/Table/14-the-whole-grid.tsx",
  "packages/table/demo/examples/VerdictColumn/02-sorting.tsx",
  "packages/table/demo/scenarios/01-work-through-orders.tsx",
];
const PENDING_QUARTER: readonly string[] = [
  "charts examples",
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
