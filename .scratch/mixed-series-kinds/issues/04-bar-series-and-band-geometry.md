# 04 — `<Bar>` and bar geometry

Status: done

Spec: `.scratch/mixed-series-kinds/spec.md`
Blocked by: 01, 03

## Scope

The kind that makes the seam a real seam. Read ADR-0002 before starting: bars sit
on the numeric x axis, and there is no band scale.

- **A pure module for bar geometry**, following the pattern the tick, hit and
  materialisation modules set. It carries two calculations:
  - the **step** — the smallest distance between two consecutive x values of a
    series, in domain units, derived in one pass over the x channel while its
    sortedness is already assumed;
  - the mapping from a step, a width fraction, a group size and a group index to
    an offset and a width in domain units.
- **Grouping.** A bar series learns how many bar series share its x axis and its
  own index among them, in registration order. Each takes that share of the step.
  One bar series is the degenerate case: one group member, centred on its x value.
- **A `<Bar>` component** registering `kind: "bar"`, with one own property: the
  width fraction of the step, defaulting to a little under full so neighbouring
  bars do not touch.
- **The baseline from issue 03 applies:** a bar's foot is zero, zero enters the y
  axis extent, and a bar is drawn between the baseline channel and the y channel.
- **A draw arm** emitting rectangles in one batched path per series, one fill.
  Same discipline as every other arm: the kind switch is outside the loop and the
  arithmetic inside is inlined against the affine coefficients.
- **Gaps omit their bar.**
- **The hover marker sits at the top of the bar**, which is the series' data
  point, so no bar-specific marker rule is needed — but assert it, because a
  marker at the foot would be the natural consequence of getting the channels the
  wrong way round.

## Acceptance

- Unit tests for the pure module, asserting the arithmetic rather than the
  picture, and covering the cases with no visual intuition behind them:
  - regularly spaced x values;
  - irregularly spaced x values, where the step is the smallest gap and the wide
    parts of the chart show gaps between bars — correct, per ADR-0002;
  - a single data point, where there is no gap to derive a step from;
  - all x values equal, the degenerate step of zero;
  - one group member, centred on its x value;
  - two and three group members, verifying that the group is centred on the x
    value as a whole and that the members do not overlap or leave an uneven edge.
- Scene-level tests that a bar series learns the right group size and group index
  from the other bar series registered against its x axis, and that a bar bound to
  a different x axis is not counted into the group.
- A bar series and a line series in one chart with the bars behind, by JSX order.
- Two bar series on one x axis sit side by side, with neither hidden.
- A y axis carrying only bars whose values are all well above zero still reaches
  zero.
- No existing screenshot baseline moves.

## Notes

This is the issue where the spec's awkward decisions come home. Every one of them
— the step, the grouping, the baseline extent, the affine contract — exists
because of bars, and all of them are in the pure module or already landed.

Derive the step during materialisation, in the pass that already walks the x
channel and already assumes sortedness. A second pass, or a recomputation per
frame, is both slower and a second place for the sortedness assumption to live.

The degenerate cases are not hypothetical: a live chart starts with one point,
and a single-value bar chart is a normal thing to draw. Decide what a bar's width
is when there is no step to take a fraction of, and write that decision into the
test rather than leaving it to whatever the arithmetic happens to produce.

Group centring is the detail most easily got wrong and least visible when it is:
the whole group is centred on the x value, not the first member. With two members
and no centring, every bar sits half a step to the right of its own tick, and the
chart still looks plausible.
