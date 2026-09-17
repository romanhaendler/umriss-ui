# 03 — `<Area>` and the baseline channel

Status: done

Spec: `.scratch/mixed-series-kinds/spec.md`
Blocked by: 01

## Scope

The first kind that needs somewhere to draw back to. It introduces the second
materialised channel that issue 04 then reuses.

- **A second, optional y channel in materialisation.** A series with a baseline
  materialises two parallel `Float64Array`s; a series without keeps exactly the
  shape it has today, with no second allocation. Two channels only — not a
  general N-channel model.
- **The baseline enters the axis extent.** An area contributes its baseline
  values, or zero when it has no baseline accessor, to the extent of the y axis it
  is bound to. This is computed where axis extents are already computed, from the
  series bound to the axis. Without it, an axis whose data never reaches zero
  crops the foot of the area.
- **An `<Area>` component** registering `kind: "area"`, with its own properties:
  an optional baseline accessor defaulting to zero, a fill opacity, and a stroke
  width for the upper edge.
- **A draw arm** that fills the body between the two channels and strokes the
  upper edge. The fill uses the series colour at the configured opacity; the
  stroke uses it at full opacity, so an area under a line does not swallow it.
- **Gaps interrupt the fill.** An absent y closes the current filled region and
  the next present value starts a new one. A gap is a hole, not a straight line
  across.

## Acceptance

- Unit tests for the second channel: that a series without a baseline allocates
  one channel, that a series with one allocates two, and that both are walked in
  a single pass over the data.
- Unit tests for the extent: that a y axis carrying an area whose values are all
  well above zero nonetheless has an extent reaching zero, and that an explicit
  numeric domain still wins over it.
- An area and a line in one chart, with the line drawn over the area, verified by
  writing the area first in the JSX — that is, by the registration order rule and
  not by any kind-specific reordering.
- A band area between two accessors renders as a shaded band, not as two
  overlapping fills.
- Gaps leave a hole in the fill, asserted at the interaction or screenshot level.
- No existing screenshot baseline moves.

## Notes

The extent rule is the part most likely to be forgotten and the most damaging
when it is. An area whose foot is cropped does not look broken — it looks like a
smaller area — so nothing catches it except the test that asks for it directly.
Write that test before the draw arm.

Keep the fill and the stroke as separate passes over the same channels rather
than one path used twice. The stroke follows only the upper edge; the fill closes
along the lower one. Trying to share a path object between them is how the
baseline ends up stroked.

The default fill opacity is a design decision, not an arbitrary number: it has to
leave a line drawn over the area readable in both themes. Pick it against the
mixed tile in issue 05 rather than in isolation.
