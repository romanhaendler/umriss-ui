# 02 - Error bars from a thin bar and a scatter

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-a-bar-from-one-value-to-another-and-the-waterfall.md`
Spec: `.scratch/charts-floating-bar/spec.md`

## What to build

A data scientist shows a mean per batch with its 95 % interval: `<Bar value="upper" baseline="lower"
barWidth={0.08} name="95 % interval" />` and `<Scatter value="mean" name="Mean" />`. The tooltip names the
interval's two bounds and the mean, and never says "quartile" (`data-science.md`, statistical views).

- **The example.** "Error bars" on the Bar page: a dozen batches, a mean and an interval computed in the
  example from the readings (the application's statistics, a few lines), a thin floating bar and a scatter.
  Its lead says that a confidence band along a course is an `Area` with a `baseline`, and that range bars
  (a minimum to a maximum per hour) are the same bar.
- **Nothing new in the library.** If the example shows a defect of ticket 01 (the bar too thin to see at
  its group's step, the scatter not centred on it), fix it there and say so in the commit. If the example
  cannot be made to read right, record why under `## Comments`; a whisker mark of its own would be a kind
  (ADR-0059) and is not built here.
- **The capability record** names error bars and range bars under Bar.

## Acceptance criteria

- [ ] A jsdom test of the example's chart: the tooltip at a batch names "95 % interval" with both bounds and
      "Mean" with its value; no text contains "quartile".
- [ ] The example's screenshots, light and dark, are new baselines and reviewed: every interval is visible
      and the mean's point stands on it.
- [ ] `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes.
