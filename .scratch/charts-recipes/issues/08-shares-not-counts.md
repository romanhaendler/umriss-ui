# 08 - Shares, not counts

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/number-formats/issues/04-a-chart-takes-the-same-options.md`
Spec: `.scratch/charts-recipes/spec.md`

## What to build

An example on the Pareto page, "Shares, not counts": the shares of a `pareto()` as bars on a percent axis,
without the cumulative line or a second axis. It says what a pie would have said (`wishes.md` section 1).

- **The chart.** `<Bar value="share">` on a `YAxis` with `tickFormat={{ style: "percent" }}`, the options
  form of number-formats 04. A `pareto()` entry's `share` runs from 0 to 1.
- **The lead** says that a share reads better from sorted bars than from a pie (ADR-0059).
- **The record.** The "Out" entry "Pie, donut, radar, candle" and the Chart page's limits line point at the
  example.

## Acceptance criteria

- [ ] A jsdom test of the example's chart: a y tick reads "20%", and the tooltip writes an entry's share in
      percent.
- [ ] The example's screenshots, light and dark, are new baselines and reviewed.
- [ ] The example renders in the demo smoke test; `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes.
