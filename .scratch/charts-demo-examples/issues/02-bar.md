# 02 - Bar

Status: done
Type: task

Spec: `.scratch/charts-demo-examples/spec.md`

## Scope

- `01-per-shift`: scrap per shift as one bar series, shifts as numeric positions with a naming `tickFormat` (ADR-0002 in practice).
- `02-grouped`: two series side by side with `barWidth` and `color`.
- `03-deviation`: deviation from plan, positive and negative - the foot at 0 in the middle of the axis. If negative bars do not draw correctly, record it as a finding and leave the example out until `charts-fixes` has it.
- Remove `bar` from `WITHOUT_AN_EXAMPLE`.

## Acceptance

- Smoke test green; pictures renewed, count stated.

## Delivery

- `demo/examples/Bar/01-per-shift.tsx` - scrap per shift over three days, the
  nine shifts as positions 0-8 with explicit `ticks` and a naming `tickFormat`
  (ADR-0002 in practice).
- `demo/examples/Bar/02-grouped.tsx` - planned and made per working day, both
  series with `barWidth={0.7}` (a group shares one fraction; different values
  would be the DEV warning), the plan with a `color` of its own.
- `demo/examples/Bar/03-deviation.tsx` - made minus planned, computed in the
  accessor; negative bars draw correctly, the foot stands at 0 in the middle of
  the axis, so the example is in.
- `demo/data.ts`: `scrapPerShift()` and `planAndActual()`.
- `bar` left `WITHOUT_AN_EXAMPLE`.
- Screenshots: 6 new pictures (3 examples × light/dark); the page head is
  unchanged.
- Finding 15 in `.scratch/charts-review/spec.md`: `color` reaches the canvas
  unresolved, so a token or `light-dark()` colour draws nothing - the plan bar
  carries a literal instead.
