# 06 - tone and dash where they fit

Status: done
Type: task

Spec: `.scratch/charts-essentials/spec.md` - row 06 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `tone` on `Area` and `Bar` - `SeriesBase.tone` and the scene's `colorFor`
  already carried it for every kind that takes a palette colour; only the
  props were missing. `ControlChart tone` goes to its line; the violations
  stay `"alarm"`.
- `Area dash` → `AreaSeriesConfig.dash` → `AreaDrawItem.dash`, compared in
  `ownFieldsEqual`. `drawArea` dashes the outline only; the fill and the
  stroke of a lone point stay solid.
- Q13: the size props now all name their unit - Area `strokeWidth` (CSS
  pixels), `dash` (CSS pixels), `fillOpacity` (0 to 1), `LimitBand to`
  (domain units); Line, Scatter, Bar, StateBand, LimitLine and Chart already
  did.
- Tests first: `draw.test.ts` (the outline's dash), new `tone.jsdom.test.tsx`
  (the legend chip of a toned area, bar and control chart). No screenshot:
  the unit tests prove both, and neither changes a picture of today's
  examples.
