# 02 - Bar

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-demo-examples/spec.md`

## Scope

- `01-per-shift`: scrap per shift as one bar series, shifts as numeric positions with a naming `tickFormat` (ADR-0002 in practice).
- `02-grouped`: two series side by side with `barWidth` and `color`.
- `03-deviation`: deviation from plan, positive and negative - the foot at 0 in the middle of the axis. If negative bars do not draw correctly, record it as a finding and leave the example out until `charts-fixes` has it.
- Remove `bar` from `WITHOUT_AN_EXAMPLE`.

## Acceptance

- Smoke test green; pictures renewed, count stated.
