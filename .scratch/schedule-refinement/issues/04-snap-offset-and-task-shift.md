# 04 — Shift raster and task shift

Status: done
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 17–19, 35–36, 47, 50)

## Scope

- `snap` accepts `{ step, offset }`.
- `shiftTask(subtasks, task, by)` returns move intents; the demonstration's context menu offers it.

## Acceptance

- `snap.test.ts` and `shiftTask.test.ts`; browser tests for a drag on a shift raster and the demonstration's task shift.

## Comments

**Delivered.**

- `snap` accepts a `SnapRaster` (`{ step, offset }`); the offset is measured
  from local midnight, so shifts at 06:00, 14:00, 22:00 are eight hours offset
  by six. A number and `"ticks"` keep their meaning. `snap.test.ts` grew five
  cases, written first, including the reach back across midnight and summer
  time.
- `shiftTask(subtasks, task, by)` returns one move intent per stop;
  `shiftTask.test.ts`, 3 cases, written first. The demonstration's context menu
  offers "The whole order later by a quarter hour".
- **A bug found on the way:** after a drop the hover was not read anew, so the
  tooltip named the times the subtask had before the move until the pointer
  moved again. `refreshHover()` reads it where the pointer already is whenever
  the data changed, and reports nothing - no interaction happened. The hover key
  now comes from one function instead of two copies.
- Browser: a drag on the shift raster lands on 14:00 although the pointer asks
  for 16:00; the demonstration shifts all three stops. 123 green.
- **Baselines moved, named here:** `example-intent--snapping` (the upper
  schedule is the shift raster now, and its lane header says so) and
  `page-ripple` (the page's import line gained `shiftTask`), both themes.
