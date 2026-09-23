# 06 - Isolated points

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 8, Q23)

## Scope

- A Line point with a gap (or the edge) on both sides always gets a marker, whatever the point count; only `markers="never"` suppresses it.
- An Area point with gaps on both sides is drawn as a vertical stroke from baseline to value.

## Acceptance

- Unit test (draw, against a recording context) first: a lone point in 1,000 produces a marker; with `never` none.
- A screenshot shows it (the gap example of `Line/02-multi-series`, or a new point in `Area/02-corridor`).

## Delivery

Finding confirmed: `tests-unit/draw.test.ts` draws against a recording context
(Path2D and the 2D context record what is done to them) - a lone point in a
thousand got no marker, and an area drew nothing for it; both failed first.

`draw.ts`: a line item carries the `markers` prop as it is, and the draw loop
decides - every point up to 60 (`MARKER_LIMIT` moved here from the scene),
above that only a point with a gap or the edge on both sides, nothing for
`never`. An area section of one point goes into a path of its own and is
stroked from its foot (the baseline, or its `y0`) to its value, at least 1 px
wide even where `strokeWidth` is 0.

Screenshot: series D of `Line/02-multi-series` got one reading in the middle of
its gap (`demo/data.ts`, `series(…, gap = true)`, used by that example only).
2 pictures renewed (`line--multi-series`, light and dark), viewed - the marker
stands in the gap. They had to be renewed with `--update-snapshots=all`: a
marker is ~30 px, below the 0.001 bound, so the old picture still passed. The
unit test is what guards it, not the picture.
