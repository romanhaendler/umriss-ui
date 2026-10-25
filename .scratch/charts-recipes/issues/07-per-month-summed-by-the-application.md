# 07 - Per month, summed by the application

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/charts-small-additions/issues/03-month-ticks-under-monthly-bars.md`
Spec: `.scratch/charts-recipes/spec.md`

## What to build

An example on the Bar page, "Per month": daily readings summed into months by the application's own
`perMonth()`, about six lines, and drawn as bars on `Date` rows, each labelled by its month (`charts.md` 7
and its wish).

- **`perMonth()`** groups by local year and month, sums each group, and places its bar at the month's first
  instant as a `Date`.
- **The axis** is a time axis; the month ticks of charts-small-additions 03 label each bar.
- **The lead** says that aggregation is the application's: what changes the number shown is not the chart's
  to decide.
- **The record.** The "Out" entry "Aggregation" points at the example.

## Acceptance criteria

- [ ] A jsdom test of the example's chart: the tick labels name the months, one per bar.
- [ ] The example's screenshots, light and dark, are new baselines and reviewed.
- [ ] The example renders in the demo smoke test; `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes.
