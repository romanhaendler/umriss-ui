# 02 - Value format per series

Status: done
Type: task

Spec: `.scratch/charts-essentials/spec.md` - row 02 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `SeriesBase.format?: (value: number) => string`; the prop on `Line`,
  `Area`, `Bar`, `Scatter`, `Matrix` and `ControlChart`. Compared by source
  text in `updateSeries`, like an accessor.
- `scene.tooltipRow`: series `format`, then the y axis' `tickFormat`, then
  `formatValue`. A matrix' value (the value channel) takes `format`, then the
  default - the y axis writes its row.
- `ControlChart` passes `format` to its line and - beyond the spec's wording -
  to the scatter of violations, which shows the same values.
- Deviation: not on `StateBand`. Its tooltip writes the state's label; a
  number format would never be called.
- Tests first: two in `tooltipFormat.jsdom.test.tsx`, one in
  `controlChartText.jsdom.test.tsx` (Line and Scatter wrapped to record their
  props).
- Example `Tooltip/04-value-format.tsx` (furnace in °C, power draw in kW, two y
  axes, on the new time axis): 2 new screenshots. One renewed:
  `tooltip--x-or-nearest` dark, which failed three runs in a row after the page
  grew by an example (sub-pixel shift, docs/testing.md); the picture is
  unchanged to the eye.
