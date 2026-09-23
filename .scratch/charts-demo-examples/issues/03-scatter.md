# 03 - Scatter

Status: done
Type: task

Spec: `.scratch/charts-demo-examples/spec.md`

## Scope

- `01-measurements`: sampled measurements (e.g. wall thickness) with `radius`, no connecting line.
- `02-over-a-course`: a `Line` of the set point and outliers as a `Scatter` with `tone` over it - the samples read against the course.
- Remove `scatter` from `WITHOUT_AN_EXAMPLE`.

## Acceptance

- Smoke test green; pictures renewed, count stated.

## Delivery

- `demo/examples/Scatter/01-measurements.tsx` - wall thickness sampled by hand
  at irregular times, `radius={4}`, no line, tooltip `nearest`.
- `demo/examples/Scatter/02-over-a-course.tsx` - fill weights against a dashed
  set point `Line` that changes with the product at eleven; samples within
  tolerance as one `Scatter`, those outside as a second one with
  `tone="alarm"`. The two channels never both carry a value.
- `demo/data.ts`: `wallThickness()` and `fillWeights()`.
- `scatter` left `WITHOUT_AN_EXAMPLE`; `docs/capabilities.md` points Scatter's
  path, `radius` and a new `tone` row at these pictures - and, left over from
  02, Bar's `barWidth`, grouping and foot rows at `grouped` and `deviation`.
- Screenshots: 4 new pictures (2 examples × light/dark); the page head is
  unchanged.
- Nothing new snagged. The set point rises diagonally over one sample interval
  instead of stepping - that is the missing step line (Q22), already a finding.
