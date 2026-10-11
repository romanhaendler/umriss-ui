# A histogram is a helper for Bar, not a chart kind, and its last bin is closed

Status: accepted
Date:   2026-10

A histogram needs its counting done before the chart. `Bar` already draws on a
numeric x axis (ADR-0002), so only the arithmetic was missing - the way
`pareto()` is the arithmetic of a Pareto chart.

**A histogram is `bin()`, a function that returns rows for `Bar`; there is no
`Histogram` component and no renderer. The last bin is closed, so the greatest
value is counted.** Values go in, `{ from, to, x, count }` comes out, and `x`
is the bin's middle, where the bar stands. Like `pareto.ts`, it knows nothing
of the DOM or the scene. The `Bar` measures its step from the smallest distance
in x, which is the bin width, and the example sets `barWidth={0.94}` so that
neighbours nearly touch.

- **Overloaded, not one fixed row shape.** `bin(values, options?)` and
  `bin(rows, value, options?)`: unlike `pareto`, a histogram's input is nearly
  always a bare column.
- **A value on an edge is in the bin that edge starts, `[from, to)`;** the last
  bin also holds its upper edge.
- **Nice edges without a `domain`,** the multiples of the width, on the 1-2-5
  grid of the ticks (`tickStep`); `count` is a target there, and exact with a
  `domain`. `width` wins over `count`; with neither, `count` is 10.
- **A given `domain` is taken as it is,** not widened. Values outside it are
  left out, not clamped into the end bins. Values that are not finite are
  skipped, as a gap is on a chart.
- **Mistakes** (`width <= 0`, `count < 1`, more than 10 000 bins) are an
  `invariant` in development and silent in production, like the rest of the
  package.

## Considered Options

- **A bin of its own for the maximum.** It would keep `[from, to)` whole, but
  it draws an empty-looking bin past 100 for every share that reaches 100.
  Weighed and left; d3 closes the last bin as well.
- **A `Histogram` component or chart kind,** density curves, unequal bin
  widths, the rules of Sturges and Freedman, stacked or grouped histograms.
  Not built; a group is binned on its own and drawn with several `Bar`s.
- **Clamping outside values into the end bins.** It makes the end bins lie
  about what lies in them.

## Consequences

- Integer data at width 1 collapses its maximum into the last bin: `1, 2`
  gives one bin `[1, 2]`. This is the one rule most likely to surprise, and it
  is the price of not losing the maximum.
- `count` means something different with and without a `domain`.
- `bin` has no page of its own: it is exported from `@umriss-ui/charts` and
  shown on the Bar page.
