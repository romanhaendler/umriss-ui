# 10 - Hit testing

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 13)

## Scope

- `"nearest"`: a band or cell hit counts only when no point lies within the snap distance; points win.
- A chart of bands or cells only: crosshair and tooltip anchor at the pointer's x, not the segment start.
- `"nearest"` over a Scatter measures the pixel distance in x **and** y.

## Acceptance

- Unit tests (hit, scene) first for each; interaction test for the scatter case.
