# 04 - StateBand

Status: done
Type: task

Spec: `.scratch/charts-demo-examples/spec.md`

## Scope

- `01-shift`: the states of one machine over a shift (`PLANT_STATES`, `shift()`), default lane (no `laneFrom`/`laneTo`), legend of states.
- `02-under-a-course`: a StateBand as its own lane under a process curve, on a second y axis - where the state explains the curve.
- Remove `stateband` from `WITHOUT_AN_EXAMPLE`.

## Acceptance

- Smoke test green; pictures renewed, count stated.

## Delivery

- `demo/examples/StateBand/01-shift.tsx` - Furnace 1 over a shift out of
  `shiftData` (`shift()`, `PLANT_STATES`), default lane: no `laneFrom`/`laneTo`,
  the band fills a y axis `[0, 1]` whose single tick names the machine; legend
  of the states.
- `demo/examples/StateBand/02-under-a-course.tsx` - the furnace temperature
  above the furnace's state, the band as the bottom unit of five on a second y
  axis on the right. The fault at the start of the shift lies under the climb.
- No new generator: both use the existing `shiftData`, unchanged (Q4 keeps
  existing data untouched; the ticket named `shift()`).
- `stateband` left `WITHOUT_AN_EXAMPLE`; `docs/capabilities.md` names the
  default lane as a row of its own and points the lane, legend and rendering
  rows at the new pictures.
- Screenshots: 4 new pictures (2 examples × light/dark); the page head is
  unchanged.
- Finding 16 in `.scratch/charts-review/spec.md`: the last segment runs to the
  end of the nice x domain, so both pictures show "Maintenance" for an hour and
  a half after the last report. Left visible, not worked around.
