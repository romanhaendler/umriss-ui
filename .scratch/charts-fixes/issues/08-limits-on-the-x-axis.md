# 08 - Limits on the x axis

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 10)

## Scope

- `orientation="x"` without `axisId` binds to the first x axis (default by orientation, not the literal `"y"`).
- An unknown `axisId` on a limit is a DEV invariant, as for series.
- A labelled x limit reserves band space for its label, as y limits do.

## Acceptance

- Unit tests (scene, layout) first.

## Delivery

Default axis and validation - finding confirmed, both tests failed first:
`tests-unit/limitLine.test.tsx` (the registration caught at `useLimit`) saw
`axisId` "y" for `orientation="x"`; `scene.test.ts` saw `validate()` pass a
limit on an unknown axis. `LimitLine.tsx`: `axisId` defaults to the
orientation ("x" is the default id of `XAxis`, as of a series' `xAxisId`).
`scene.ts` `validate()`: an unknown limit axis is an invariant, as for series.

Band space - **finding does not hold**. A y limit's label stands beside the
ticks and needs width; an x limit's label stands in the row of the tick labels
(`AxesHtml.tsx`), and every x band holds that row. `layout.test.ts` holds what
makes it fit: `.uc-limit-label` has the tick label's font size and line height.
Closed with that test, no layout change. Not in scope and left: an x label
starts at its line and is not clamped at the container's right edge, as tick
labels are.

No picture affected (no demo example has an x limit).
