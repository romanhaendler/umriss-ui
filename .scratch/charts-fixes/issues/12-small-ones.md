# 12 - Small ones

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 14)

## Scope

- `Chart.height` JSDoc states the default 300.
- `matrixBuckets` computed once per materialisation, not per series redraw.
- The hover path: remove the per-move allocations in `scene.ts` hit/tooltip assembly, or correct the R-5.4 comment - whichever the benchmark shows is honest.
- `sigma` 0 (a constant reference window): no outliers, and a DEV warning that the limits are degenerate.

## Acceptance

- Unit test for `sigma` 0; benchmark figures in `capabilities.md` re-measured if the hover path changed.
