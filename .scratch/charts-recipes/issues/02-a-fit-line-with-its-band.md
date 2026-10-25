# 02 - A fit line with its band

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/charts-recipes/spec.md`

## What to build

An example on the Scatter page, "A fit line with its band": a scatter of measurements with a least-squares
line and its 95 % band, built from parts in about twelve lines (`data-science.md`, statistical views).

- **The fit.** Ordinary least squares in the example. The band is the 95 % band of the fitted mean, from the
  standard error at each x; the lead names the normal approximation.
- **The drawing.** A `Scatter` of the readings; on a grid of x values, as series-own `data`, a `Line` for the
  fit and an `Area` with `baseline` for the band. A `Tooltip`.
- **The lead** says that a regression is a model the analyst chooses (which fit, which band), so it is the
  application's.
- **The record.** A new "Out" entry, "A fit line or regression", with that reason and the example.

## Acceptance criteria

- [ ] The example's screenshots, light and dark, are new baselines and reviewed: the band contains the line,
      and the line runs through the cloud.
- [ ] The example renders in the demo smoke test; `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes.
