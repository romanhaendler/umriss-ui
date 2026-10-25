# 06 - Density instead of opacity

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/charts-matrix-reading/issues/01-a-colour-bar-in-the-legend.md`
Spec: `.scratch/charts-recipes/spec.md`

## What to build

An example on the Scatter page, "Where the points crowd": 200,000 points counted into a grid of cells and
drawn as a `Matrix`, the counts as `level` across a gradient, read back by its colour bar
(`data-science.md`, the 1M scatter).

- **The counting** is the example's, a few lines: each point into its cell, a row per cell with points, the
  cell's centre as its position. A cell without points has no row and is not drawn; the lead says that the
  ground is zero.
- **The lead** says why opacity is not offered: a scatter is one path and one fill, translucency does not
  accumulate on it, and a fill per point breaks the million-point budget. It calls the matrix a 2D
  histogram, as `bin` is for `Bar` (ADR-0054).
- **The record.** A new "Out" entry, "Point opacity", with that reason and the example.

## Acceptance criteria

- [ ] The example's screenshots, light and dark, are new baselines and reviewed: the colour bar names the
      counts' range.
- [ ] The example renders in the demo smoke test; `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes.
