# 02 — The limit line and the limit band

Status: done

Spec: `.scratch/judging-values/spec.md`
Blocked by: 01

## Scope

Putting the most important number on the chart onto the chart.

- **`<Limit>`** draws one boundary at a domain value on a named axis, with a
  severity and an optional label. **`<LimitBand>`** fills the region between two
  values on one axis. Both register with the scene the way a series does, through
  the existing registration hooks.
- **Neither is a series.** No accessor, no data, no legend entry by default, not
  hit-testable, not in the tooltip.
- **A band paints beneath every series; a line paints above every series.**
  Different objects, different answers: a filled region behind a curve is ground,
  a single line is a landmark. Both stay beneath the overlay layer so the
  crosshair remains on top.
- **Both take part in their axis' extent by default**, with a prop to opt out. The
  default is the safe failure: an excluded limit produces a chart that looks
  correct and is missing its most important line, and nobody notices until the day
  it matters. An included one produces a visibly squashed plot, which the author
  fixes in a minute.
- **A label renders in the axis band, in HTML**, in the layer the axis ticks
  already occupy. No text is drawn to canvas.

## Acceptance

- Scene unit tests: a limit widens its axis' domain when it lies outside the data,
  and does not when told not to. Assert both directions — outside above and
  outside below.
- Scene unit tests: a limit on an axis with no series does not crash the extent
  calculation. A chart whose only content is its limits is degenerate, not
  illegal.
- Scene unit tests: limits do not appear in the legend and do not appear in a
  tooltip hit.
- A screenshot proves the painting order: an area series over a band shows the
  band through nothing, and a limit line over the same area series is visible.
  This is the one claim only a picture can make.
- No existing screenshot baseline moves.

## Notes

The painting-order decision is the one to get right and the one most likely to be
simplified into "limits go on top" or "limits go underneath". Both single answers
are wrong for one of the two objects, and the wrongness is invisible until
someone puts an area series in the same chart — which is the ordinary case, since
mixed kinds shipped.

The extent default will feel wrong the first time it squashes a demo. It is still
right. Note the prop in the demo rather than changing the default.
