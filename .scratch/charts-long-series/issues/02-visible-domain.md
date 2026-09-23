# 02 - Visible domain

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/charts-long-series/spec.md` - row 02 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `YAxis domain="visible"`; `AxisConfig.domain` gained the value, `XAxisProps`
  and `YAxisProps` now declare `domain` each (the x axis without it).
- Pure: `visibleExtent(series, from, to)` in `materialize.ts` - a binary search
  (`lowerBound`, new in `hit.ts`) to the first point, then the window only; y
  and a baseline channel, gaps left out. The scene's `axisExtent` uses it for a
  y axis on `"visible"` when the series' x axis has a fixed domain; otherwise
  the series' whole extent, which is what a `"nice"`/`"data"` x domain shows.
  A fixed foot (area, bar) is added as in materialisation; state bands and
  cells keep their extent; hidden series and limits as before. The layout
  widens the result as `"nice"` does.
- Tests first: 4 in `materialize.test.ts`, 4 in `scene.test.ts` (window, not
  fixed, foot + hidden + limit, following a new x domain), red before the
  code.
- Example `Axis/06-visible-domain.tsx` - the week opened on Wednesday's burner
  trip, zoomable; 2 new screenshots.
