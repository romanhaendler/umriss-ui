# 01 - Area

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-demo-examples/spec.md`

## Scope

- `01-filled`: one area filled down to 0 - e.g. power draw of a line over a shift; shows `fillOpacity` and `strokeWidth` set explicitly.
- `02-corridor`: a corridor between two channels (`baseline` accessor) with a gap, and the measured temperature as a `Line` inside it - the baseline is a channel, not a second series.
- Remove `area` from `WITHOUT_AN_EXAMPLE`.

## Acceptance

- Smoke test green; pictures light and dark renewed, count stated.
- `docs/capabilities.md`: Area `fillOpacity`/`strokeWidth` now point at these screenshots instead of `mixed`.
