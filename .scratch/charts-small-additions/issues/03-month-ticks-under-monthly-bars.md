# 03 - Month ticks under monthly bars

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/charts-small-additions/spec.md`

## What to build

A controller draws one `Bar` per month on `Date` rows, and the x axis labels the months, one under each bar,
instead of weeks that no bar stands on (`charts.md` 7).

- **The rule.** On a time axis that carries a `Bar` or `BoxPlot` series, the chosen tick step is never
  shorter than the bars' **Step** (the smallest their group measures). Shorter candidates of the time step
  table are skipped, and `tickCount` chooses among the rest. Nominal lengths need no tolerance: a unit's
  shortest real distance is never longer than its nominal length.
- **On boundaries.** The ticks stand on the unit's local boundaries, as every time tick does. `Bar`'s doc
  comment says that a period's bar at the period's first instant gets its tick at its centre.
- **Untouched.** A time axis carrying no bars or boxes, a working-time axis, explicit `ticks`, and
  `tickFormat`.
- **The example.** The Bar page gets monthly bars on `Date` rows, or an existing example on `Date` rows
  shows them.
- **Docs.** The capability record's Bar and time axis rows, and the changelog under "Changed" (a picture
  changes) with its migration line: explicit `ticks` restore the old ticks.

## Acceptance criteria

- [ ] Pure tests on the step choice: twelve monthly bars give month ticks, across a February and a clock
      change; daily bars over a week never give hour ticks; weekly bars give ticks of at least seven days;
      a line alone on the same rows keeps its ticks; explicit `ticks` win.
- [ ] A mounted test: monthly bars' tick labels name the months.
- [ ] Screenshots that change (bars on a time axis) are reviewed and named in the commit; no other changes.
- [ ] `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes.
