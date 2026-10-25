# Recipes in the charts demo: the wishes the parts already answer

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket 22 "The charts' single wishes" (its Answer accepts
the Proposed answer: these wishes are "never" as a feature or need no API, and each becomes an example);
findings `.scratch/shakedown/operator-screens.md` 3 and its wishes (live edge, pens),
`data-science.md` 5, 7 and its statistical views (fit line, density, small multiples, columns),
`charts.md` 7 and its wishes (per month, log scale), `wishes.md` section 1 (pie and donut via `pareto()`);
ADR-0032, ADR-0047, ADR-0048, ADR-0054, ADR-0059.

## Problem Statement

Nine wishes of the shakedown are answered by parts the charts already have, but nothing shows how, so each
persona either gave up or wrote it the hard way:

- **Following the live edge** was built with `setDomain` every second. `setDomain` is reported as the
  reader's change, so it fought a wheel zoom: the zoom was overwritten a second later.
- **A fit line with a band** took about 12 lines of the analyst's own least squares, found by trial.
- **A million points** stay a solid blob, and no example says what reads instead.
- **Small multiples** did not line up: each plot started at a different x, because each y axis autoscaled
  and its labels differed in width.
- **Typed arrays and Arrow** gave "No data" without a word; the working route was `Array.from`, a million
  objects.
- **Per-month bars** needed a hand-written aggregation and string categories.
- **A tag-aware trend** (pens, a scale each, two periods) was assembled piece by piece.
- **A log axis** without minor ticks read in steps of two decades.
- **Shares from `pareto()`** were thought to need the cumulative line and a second axis.

ADR-0032's "Instead" lines and the capability record's "Out" name some of these answers in a sentence. None
of them can be copied.

## Solution

**Each wish becomes an example on the page a reader looks it up from, and each "never" points at it.** No
API is added. Each example's lead says, in one sentence, why this is the application's code and not the
chart's.

| Recipe | Page | What it shows |
|---|---|---|
| Follow the live edge, with pause | Zoom and pan | `setView` follows (not reported); `onViewChange`, then only the reader's, pauses; a "Live" button resumes |
| A fit line with its band | Scatter | own least squares, `Line` for the fit, `Area baseline` for the band |
| Density, not opacity | Scatter | points counted into cells and drawn as a `Matrix`, a 2D histogram |
| Columns instead of rows | Chart | an index array as the rows, `(_, i) => y[i]` on axis and series; `bin` over the column |
| Small multiples on one y domain | Axis | the same `domain` on every `YAxis`, with `syncId`; the plots line up |
| Minor ticks on a log axis | Axis | `log10` in the value, `ticks` for 1-9 per decade, the minors unlabelled |
| A trend with pens | Axis | a `YAxis` per pen, a pen list bound to `hidden` and `toggleSeries`, yesterday as one more line |
| Per month | Bar | the application's six-line `perMonth()`, `Date` rows, month ticks |
| Shares, not counts | Pareto | `<Bar value="share">` on a y axis in percent, no cumulative line |

## User Stories

1. As a control room developer, I want a trend that follows the newest readings, so that the last hour stays
   in view while data arrives.
2. As an operator, I want a zoom or pan of mine to stop the following, so that what I am looking at stays
   still.
3. As an operator, I want one button to go back to following, so that I return to the live edge without
   reloading.
4. As a keyboard user, I want to pause and resume the following with that button, so that I need no pointer
   gesture to stop the view moving.
5. As a data scientist, I want a fit line with a 95 % band built from parts, so that I see which fit and
   which band were chosen, in my code.
6. As a data scientist with a million points, I want them counted into cells and drawn as a matrix, so that
   where the points crowd reads as a number, not as a blob.
7. As a data scientist, I want to draw from typed columns without making an object per row, so that a
   million readings cost two arrays, not a million objects.
8. As a data scientist, I want the columns example to say how to keep the chart in step when the columns
   change, so that a function compared by its text does not keep old values.
9. As a data scientist, I want a histogram over a typed column, so that `bin` and the columns recipe meet.
10. As an analyst with twelve small charts, I want their plot areas to line up and their y axes to read the
    same, so that I compare heights across them.
11. As an engineer with values over six decades, I want a log axis with a tick at every 2, 3, … 9 of a
    decade and a label at each decade, so that it reads like log paper.
12. As an engineer, I want the tooltip of that axis to write the value, not its logarithm, so that the
    reading is the reading.
13. As a control room developer, I want a trend with a scale per pen, so that a temperature and a pressure
    share one time axis without sharing one y axis.
14. As an operator, I want a pen list that hides and shows pens, so that I choose what the trend shows.
15. As an operator, I want yesterday's course of a pen beside today's, so that I compare two periods.
16. As a controller, I want sums per month as bars on `Date` rows, labelled by month, so that I need neither
    string categories nor a helper the library does not ship.
17. As a report author, I want shares of a Pareto as bars on a percent axis, so that a part of a whole reads
    without a pie.
18. As a coding agent, I want each "never" in the capability record and on the pages to point at its
    example, so that the next request for the feature is answered with code.
19. As the maintainer, I want every recipe to be an ordinary example, screenshot and smoke-tested, so that a
    recipe that stops working fails a check.

## Implementation Decisions

- **Examples only.** Each recipe is a whole example file on its page, in the form of the examples that stand:
  its own data in one of the demo's worlds, a `title`, a `lead`, a deterministic generator. No change to the
  library's source; a defect an example finds is fixed only if it is small and named in the commit, and
  recorded under the ticket's `## Comments` otherwise.
- *(agent)* **Pages:** each on the page of the part a reader would look it up from, as the table's pivot
  recipe stands on its Aggregate page. There is no recipes page: the outline has one page per thing a reader
  looks up by name.
- **The "never" lines.** Where the capability record's "Out" or a page's limits name the wish, the line
  points at the example. New "Out" entries name the wishes that were unlisted: a fit line, point opacity,
  column input and a pen trend component, each with its reason from the map's ticket 22 and its example.
- **Follow the live edge.**
  - The x axis is `zoomable`. While following, each arrival calls `setView` with the last hour; `setView`
    is not reported (ADR-0047), so the chart never hears its own following as the reader's.
  - `onViewChange` reports only the reader: it stops the following.
  - *(agent)* One core `Button` toggles between "Pause" and "Live": "Live" sets the view to the edge again
    and resumes.
  - *(agent)* The rows are derived from the clock, a window ending now. The screenshot suite freezes the
    clock, so the picture is one; an interaction test drives the clock.
  - A `follow` in the view, ADR-0047 amended, is not built.
- **Fit line.** Ordinary least squares in the example. The band is the 95 % band of the fitted mean, from
  the standard error at each x; the lead names the normal approximation. The fit and the band are drawn on
  a grid of x values as series-own `data`, beside the `Scatter`'s rows.
- **Density.** The points are counted into a grid of cells and drawn as a `Matrix` with a gradient, the
  counts as `level`. *(agent)* A cell without points has no row and is not drawn; the lead says that the
  ground is zero. It sits on the Scatter page, because that is where a reader with a million points looks.
- **Columns.** Two `Float64Array` columns, an index array as the rows (`Array.from({ length }, (_, i) =>
  i)`), memoised on the columns. Axis and series read `(_, i) => column[i]`. *(agent)* The memo is the
  point the lead makes: a new column gives new rows, and new rows are read again, while a function compared
  by its source text would not be. The tooltip's `datum` is the index. A histogram beside it is
  `bin(column)`. *(agent)* The lead names Arrow's `getChild(name).toArray()` as the way to such a column;
  the demo adds no Arrow dependency.
- **Small multiples.** Six small charts with one `syncId` and the same `domain` on every `YAxis`. Equal
  domains give equal tick labels, so the y bands are equally wide and the plots line up.
- **Log minor ticks.** The value is `Math.log10` of the reading. `ticks` are `log10(m · 10^k)` for m from 1
  to 9, and `tickFormat` writes `10^k` at a whole k and nothing elsewhere. The series' `format` writes
  `10 ** v`, so that the tooltip writes the reading, not the axis' empty label.
- **Pens.**
  - Three pens of one world, each with its own `YAxis`: their unit as its label, two on the left and one on
    the right.
  - *(agent)* **The pen list** is built from core's components, a `Checkbox` per pen with its name, unit and
    its value at the right edge, bound to `hidden` and `toggleSeries`. The charts demo reaches core but not
    the table. The lead says that an application with the table binds a `Table` the same way.
  - Yesterday's course of one pen is one more `Line` with its rows shifted by a day, dashed.
  - *(agent)* The recipe stands on the Axis page in the operations world, not in a scenario: the scenarios
    page already holds five worlds, and a pen trend is a use of axes.
- **Per month.** The application's `perMonth()`, about six lines: readings grouped by local year and month,
  each group summed, its bar at the month's first instant as a `Date`. The month ticks of
  `.scratch/charts-small-additions/` ticket 03 label each bar.
- **Shares.** `<Bar value="share">` on a `YAxis` with `tickFormat={{ style: "percent" }}`, the options form
  of `.scratch/number-formats/` ticket 04. A `pareto()` entry's `share` is 0 to 1.
- **The shell's rules.** Text and buttons in a stage are core's components (`Text`, `Button`, `Checkbox`).
  A page whose stage takes Tab keeps its `keysOf`.

## Testing Decisions

- A good test of a recipe is what the reader of that example sees work. Every example renders in the demo
  smoke test and gets its screenshots in both themes, reviewed as new baselines. A test is added beyond that
  only where the recipe's claim is not visible in a still picture:
  - **Follow:** an interaction test drives the clock. The view follows; a wheel zoom stops it and the view
    stays while rows arrive; "Live" resumes.
  - **Small multiples:** a layout check, tagged `@quick`, asserts that the six plot areas' left edges are
    equal.
  - **Columns:** a jsdom test of the example's chart reads a value at an index through the tooltip, and a
    column replaced by a new one is drawn: the data table shows the new value. In development, no warning
    is logged for it.
  - **Log minor ticks:** a jsdom test reads a labelled decade and an unlabelled minor tick, and the
    tooltip's value written as the reading.
  - **Per month:** a jsdom test reads the month labels under the bars.
  - **Shares:** a jsdom test reads a percent tick label and a share in the tooltip.
- Prior art: the demo smoke test (`demo-smoke.jsdom.test.tsx`), `renderChart` for jsdom charts, the
  interaction suite (`features-interaction.spec.ts`), the Chart page's "Series from long rows", a data-shape
  recipe that already stands.
- **Gates:** `pnpm check:site` (the props gate is untouched: no prop is added), the shell's page rules in
  the browser suite (`ownBase`, `silentPages`).

## Out of Scope

- A `follow` or "live" option in the chart's view (ADR-0047 amended): only if the maintainer wants it as a
  promise.
- A regression, smoothing or model of any kind in the library.
- Point opacity or a fill per point (a scatter is one path and one fill; a fill per point breaks the
  million-point budget).
- Column input to `useChart`, an Arrow adapter, or Arrow as a dependency of the demo.
- A shared-domain prop for small multiples.
- A log scale (ADR-0001, ADR-0032, ADR-0059).
- A pen component, a historian's tags, or a pen list in the library.
- An aggregation helper (the capability record's "Out": what changes the number shown is not the chart's).
- Pie and donut (ADR-0059).
- Drill-down: its example is `.scratch/linked-views/` ticket 06.

## Further Notes

- Three tickets wait on other specs:
  - density (06) on `.scratch/charts-matrix-reading/` ticket 01, because counts are read back only with a
    colour bar;
  - per month (07) on `.scratch/charts-small-additions/` ticket 03, the month ticks;
  - shares (08) on `.scratch/number-formats/` ticket 04, the percent axis.
- Columns (03) waits on `.scratch/charts-small-additions/` ticket 04, `bin` over a typed column.
- `.scratch/chart-range-selection-and-navigator/` ticket 04 adds examples to the Zoom and pan and the Bar
  pages; an example file takes the next free number on its page when it lands.
- `.scratch/root-contract/` ticket 05 renames `ariaLabel`; a recipe uses the name `Chart` takes when it
  lands.
- If `.scratch/dev-warnings/` ticket 03's probe warns on the columns recipe when its columns change, that is
  a defect of the probe (the rows changed too): record it there, do not change the recipe to hide it.
