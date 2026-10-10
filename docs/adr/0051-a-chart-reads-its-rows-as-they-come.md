# A chart reads its rows as they come

Status: accepted, supersedes ADR-0002 and ADR-0032 in one consequence each
Date:   2026-10

ADR-0002 put bars on the numeric x axis and named the price: no categorical
axis. A caller with rows that name a category - a cost centre, a service, a
weekday - computed a position for every row, listed every position again as
`ticks`, and wrote a `tickFormat` that looked the name up by it. 22 of the 71
examples and scenarios of the charts demo carried that idiom, and the
maintainer read them as a library that needs too many functions before a bar
stands (`.scratch/chart-rows-as-they-come/spec.md`).

The research of October 2026 (`docs/research/chart-data-input-2026-10/`) looked
at seventeen libraries. None asks a caller for an index, a tick list and a
lookup; every one takes the category value itself. And the libraries built for
speed do not use a band scale to do it: ECharts, Chart.js and Highcharts keep
a category as a whole number in front of a linear scale. The reason ADR-0002
gave for leaving the work with the caller - a second hit model, a second path
from domain to pixel - does not arise.

**A category is a value. The x axis reads a string from the row, and the
library keeps the map from category to place.** Each distinct category gets a
whole-number position, written into the x channel in materialisation, as
working time is written there (ADR-0001). Scale, step, hit-testing, stacking,
zoom and downsampling read numbers and do not change.

- **The type of the value decides what kind an axis is, never its content.**
  The first value read that is a place decides: a string makes a category
  axis, a number a numeric one. `"2024"` is a category, `2024` a number. No
  heuristic looks at what a value resembles - the libraries that guess name
  that as their commonest trap.
- **One kind per axis.** A number on a category axis is no place, nor a
  category on a numeric one; DEV names the series that brings the other kind.
- **The order is the rows' order.** Categories stand in the order of first
  occurrence, the series taken in registration order, the hidden ones
  included - hiding a series moves no category.
- **Row order is free on a category axis.** The series is held in axis order
  whatever order its rows came in; a hit and a `value` function's `index`
  still refer to the caller's row. On a numeric or time axis the rows stay
  sorted by the caller (R-2.6), as a control chart's baseline is an index
  range of the rows as given.
- **The category is its label,** under the tick, in the tooltip, the readout,
  the summary and the data table - one path for all of them. `tickFormat`,
  `ticks` and `tickCount` keep their job on a numeric axis and do not apply to
  a category axis.
- **A category axis spans its places with half a step at either end,** whatever
  kind of series stands on it. Its view is spans in places.
- **Nothing is taken away.** Numeric positions with named ticks remain a
  numeric axis; some axes are one.

## What it supersedes

- ADR-0002 stands in its title and its architecture: bars sit on a numeric
  axis, there is no band scale. Its consequence "labelled categories must be
  supplied as numeric positions with a `tickFormat` that names them" falls.
- ADR-0032 keeps "no log scale" and no band scale. Its "for categories, their
  index on x" falls.

## Considered Options

- **A band scale.** A second scale kind, a second hit model and a second
  domain-to-pixel path for what a map in front of the affine scale does.
- **Declaring the kind** (`type="category"`), as ECharts and Highcharts ask.
  The row's type already says it, and TypeScript shows it at the call site; a
  declaration would be a second statement of the same fact.
- **Guessing from the content,** as Observable Plot does. It turns years into
  numbers and numeric-looking keys into positions, silently.
- **Sorting numeric rows as well.** Left with the caller; see the spec's "Out
  of Scope".

## Consequences

- The examples that named categories through positions move, and are the
  proof; the work stands in `.scratch/chart-rows-as-they-come/`.
- `categories` and `categoryLabel` on the axis, categories on y and instants
  as `Date` or ISO string follow in the same work, under this decision.
- The glossary gains **Category** and **Category axis**.
