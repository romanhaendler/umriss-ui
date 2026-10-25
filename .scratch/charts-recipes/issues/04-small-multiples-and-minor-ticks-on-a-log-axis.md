# 04 - Small multiples on one y domain, and minor ticks on a log axis

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/charts-recipes/spec.md`

## What to build

Two examples on the Axis page.

- **"Small multiples on one y domain".** Six small charts with one `syncId` and the same `domain` on every
  `YAxis` (`data-science.md` 7). The lead says why they line up: equal domains give equal tick labels, so the
  y bands are equally wide.
- **"Values over decades".** A course over six decades:
  - the value is `Math.log10` of the reading;
  - the y axis' `ticks` are `log10(m · 10^k)` for m from 1 to 9;
  - its `tickFormat` writes `10^k` at a whole k and nothing elsewhere;
  - the series' `format` writes `10 ** v`, so the tooltip writes the reading (`charts.md`, the log wish).

  The lead names ADR-0001 and ADR-0032.
- **If an empty tick label** leaves a gap in the band or misplaces a grid line, record it under
  `## Comments` and keep the recipe; do not change the axis here.
- **The record.** The "Out" entry "Log scale" points at the decades example.

## Acceptance criteria

- [ ] A layout check tagged `@quick`: the six plot areas' left edges are equal.
- [ ] A jsdom test of the decades chart: a decade's tick reads `10^3` in its format, a minor tick has no label,
      and the tooltip writes the reading, not its logarithm.
- [ ] Both examples' screenshots, light and dark, are new baselines and reviewed.
- [ ] Both render in the demo smoke test; `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes.
