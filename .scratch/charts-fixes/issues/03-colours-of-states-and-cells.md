# 03 - Colours of states and cells

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bugs 3, 5, 14 palette)

## Scope

- Matrix: no palette colour in legend or tooltip; its legend entry shows the gradient or the limit set's colours, its tooltip chip the cell's colour.
- StateBand and Matrix take no place in the palette - the next Line gets `--uc-series-1`, not a later one.
- Legend hover on a state shared by several StateBands highlights all of them.

## Acceptance

- Unit tests (scene) first for all three; screenshots of affected examples renewed, count stated.
