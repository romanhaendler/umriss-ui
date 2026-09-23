# 08 - Limits on the x axis

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 10)

## Scope

- `orientation="x"` without `axisId` binds to the first x axis (default by orientation, not the literal `"y"`).
- An unknown `axisId` on a limit is a DEV invariant, as for series.
- A labelled x limit reserves band space for its label, as y limits do.

## Acceptance

- Unit tests (scene, layout) first.
