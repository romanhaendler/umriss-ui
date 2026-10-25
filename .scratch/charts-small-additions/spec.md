# Small charts additions: a side legend, a gap threshold, month ticks under bars, `bin` over a column

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket 22 "The charts' single wishes" (its Answer accepts
the Proposed answer, which holds every decision below that is not marked *(agent)*); findings
`.scratch/shakedown/design-family.md` (legend left or right), `charts.md` 7 and its wish (month ticks),
`data-science.md` 8 and its statistical views (gap threshold, `bin` over a `Float64Array`).

## Problem Statement

Four small things a chart cannot do, each met by one persona of the shakedown:

- **A legend beside the plot.** `Legend placement` is `top` or `bottom`. A trend with many series reads best
  with the names in a column beside the plot, and the design persona gave up on it.
- **A silence drawn as a reading.** A line or an area bridges a stretch without rows with a straight
  stroke: an hour in which nothing was measured looks like a steady climb. Only a row with a missing value
  makes a **Gap** today, and a historian that simply sends nothing during an outage has no such row.
- **Bars without labels.** Bars on `Date` rows, one per month, get weekly ticks: the axis labels days that
  no bar stands on, and no bar carries its month. Per-month bars need string categories today.
- **`bin` refuses a column.** `bin(values)` counts a `Float64Array` correctly, but its types refuse one, so a
  histogram over a typed column needs a copy or a cast.

## Solution

Each is a prop or a rule, cheap to keep, and none needs an ADR.

- **A side legend.** `Legend placement` also takes `"left"` and `"right"`. The entries stand in a column
  beside the plot, as wide as the longest one up to a cap; a longer name wraps. Below a chart width at which
  the plot would be squeezed, the side legend stands above the plot, as `top` does.
- **`maxGap`.** `Line` and `Area` take `maxGap`, in the units of their x axis (milliseconds on a time axis).
  A step between two readings longer than it is a **Gap**: the line breaks, the area closes on both sides.
  Off by default, because a historian's compressed data holds across silence.
- **Ticks no finer than the bars.** A time axis that carries bars or boxes never ticks finer than their
  **Step**, and its ticks stand on that unit's boundaries. Monthly bars get month ticks, each labelling a
  bar. Explicit `ticks` stay the way out.
- **`bin` over `ArrayLike<number>`.** The values form of `bin` takes any array-like of numbers: a typed
  array, a plain array, an Arrow column's `toArray()`.

## User Stories

1. As a dashboard designer, I want the legend to the right of the plot, so that a trend with eight series
   lists its names in one column instead of three wrapped lines above it.
2. As a dashboard designer, I want the legend to the left of the plot, so that the names stand where the eye
   starts reading.
3. As a dashboard designer, I want a side legend to be as narrow as its names allow, so that the plot keeps
   most of the width.
4. As a dashboard designer, I want a long series name in a side legend to wrap, not to widen the legend
   without end, so that one long name does not squeeze the plot.
5. As a reader on a phone, I want a side legend to move above the plot when the chart is narrow, so that the
   plot is not squeezed to a sliver.
6. As a reader, I want a side legend to toggle, highlight and offer "Show data" exactly as a legend above
   does, so that placement changes where it stands, not what it does.
7. As a reader with many series and a short chart, I want a side legend whose entries do not fit to scroll
   within the chart's height, so that the chart keeps its height.
8. As a process engineer, I want a line to break where the historian sent nothing for longer than the
   sampling allows, so that an outage does not read as a steady course.
9. As a process engineer, I want to say how long a silence must be to count as a gap, in the axis' units, so
   that a sensor read every second and one read every ten minutes each break at their own threshold.
10. As a process engineer, I want an area to close on both sides of such a gap, so that the fill does not
    claim a value across it either.
11. As a process engineer reading a step line, I want a held value to hold no longer than the threshold
    before a gap, so that the hold does not run across the silence.
12. As a reader, I want a reading alone between two gaps to keep its marker, so that it stays visible, as
    it does between two missing values.
13. As a reader hovering inside a gap, I want the tooltip not to offer a reading from far outside it, so
    that the tooltip does not claim a value for a time nobody measured.
14. As a developer of a historian trend, I want a gap threshold off by default, so that compressed data,
    which holds its value across silence by design, keeps drawing as it does.
15. As a controller, I want monthly bars on `Date` rows to be labelled with their months, so that every bar
    carries its label and no tick names a day no bar stands on.
16. As a controller, I want daily bars to get day ticks and never hour ticks, so that the rule is the same
    at every step.
17. As a developer, I want explicit `ticks` to keep winning over that rule, so that I can still choose
    ticks of my own.
18. As a data scientist, I want `bin` to take a `Float64Array` without a cast, so that a histogram over a
    typed column needs no copy and no lie to the compiler.
19. As a maintainer, I want each new prop shown in an example, so that the props gate holds and a reader
    finds it on its page.

## Implementation Decisions

- **The side legend.**
  - `LegendProps.placement` becomes `"top" | "bottom" | "left" | "right"`; the default stays `"top"`.
  - The entries stand one per line, the data key ("Show data") at the column's end, as it stands at the
    row's end above.
  - *(agent)* **Width:** as wide as its longest entry, at most a quarter of the chart's width; a name longer
    than that wraps under its own text, the chip staying on its first line.
  - *(agent)* **Fallback:** where the chart is narrower than 480 px, a side legend stands above the plot,
    laid out as `top`. At 480 px a capped legend leaves the plot about 360 px before its axis bands; below
    that a plot beside a legend reads worse than a plot under one.
  - *(agent)* **Height:** the column is as tall as the plot; entries that do not fit scroll inside it. Each
    entry is a button, so focus brings it into view.
  - The plot's size stays what is left of the chart once the legend has its place. "Show all" keeps its
    corner rule: top right of the plot area, bottom right only under a legend above.
  - The Tab order stays as it is: plot first, then the legend (`accessibility.md` 8 is a finding of its own).
- **`maxGap`.**
  - `maxGap?: number` on `Line` and `Area`, in the x axis' units: milliseconds on a time axis (the exported
    `MINUTE`, `HOUR` and `DAY` write it), working time on a calendar axis, places on a category axis.
  - A step from one reading to the next that is longer than `maxGap` is a **Gap**. It breaks the stroke and
    closes an area's section on both sides, exactly as a missing value does.
  - *(agent)* **Where it is found:** in the drawing loops and the hit test, from the x distance of two
    neighbouring readings. No `NaN` is inserted into the materialised series, so the channels stay one to
    one with the rows, and the tooltip's `datum` and `index` stay the row's.
  - *(agent)* **A `step` line** holds its last reading before a gap for `maxGap`, then ends: the threshold is
    how long a reading is good for. A missing value still ends the hold at its own x.
  - *(agent)* **The hit:** a reading reaches no further than `maxGap` into a gap. A pointer farther than that
    from the nearest reading finds no hit on that series, as at a missing value.
  - A reading with a gap on both sides is isolated: `markers="auto"` marks it.
  - Downsampling keeps a gap, as it keeps a missing value.
  - *(agent)* **In a stack** `maxGap` is not read, as `baseline` is not: a stack's members stand on sums at
    every x, and a hole in one member would leave the members above standing on nothing.
  - The extent, the summary, the readout, the keyboard walk and the data table do not change: no reading is
    added or removed.
- **Ticks under bars.**
  - On a time axis carrying at least one `Bar` or `BoxPlot` series, the step that the axis chooses is never
    shorter than the bars' **Step**, the one their group measures (the smallest among them). Candidates
    whose nominal length is shorter are skipped. `tickCount` still chooses among the rest.
  - Nominal lengths are the time step table's (a month counts as 30 days). The shortest real distance of a
    unit is never longer than its nominal length (February's 28 days, a 23-hour day at a clock change), so
    no tolerance is needed.
  - *(agent)* Boxes count as bars, because they share the bars' step and their group.
  - The ticks stand on the unit's local boundaries, as every time tick does. A period's bar placed at the
    period's first instant gets its tick at its centre. The doc line of `Bar` says so.
  - *(agent)* A working-time axis keeps its own ticks. Its ticks follow the calendar, and that is another
    rule.
  - Explicit `ticks` and `tickFormat` are untouched.
- **`bin`.** The values overload becomes `bin(values: ArrayLike<number | null | undefined>, options?)`.
  The implementation reads by index, so a typed array needs no iterator. The rows overload stays.
- **Docs.** Each change carries its doc comment (`API.md` regenerated), its row in the capability record and
  its changelog line under "Added". No ADR.

## Testing Decisions

- A good test asserts on what a reader sees or reads: the entries' place relative to the plot, the stroke's
  segments, the ticks' values and labels, the counts of `bin`. It never asserts on private state of the
  scene.
- **Side legend:** a jsdom test with the existing `renderChart` and `sizePlot` helpers, which asserts the
  side legend's class, that toggling and "Show data" work from it, and that below the fallback width it
  carries the top layout. The example screenshots (light and dark) show both sides. The Legend example
  "Legend above or below" is the prior art.
- **`maxGap`:** unit tests on the drawing module with a recording context (prior art: `draw.test.ts`, which
  tests gaps and isolated markers): a stroke breaks at a long step and not at a short one; an area closes;
  a step line's hold ends `maxGap` after its reading; a lone reading keeps its marker. A hit test (prior
  art: `hit.test.ts`): no hit farther than `maxGap` from a reading. A downsampling test keeps the gap.
- **Ticks:** pure tests on the time step choice (prior art: `timeAxis.test.ts`, `ticks.test.ts`): monthly
  bars across a year give month ticks, February and a clock change included; daily bars never give hour
  ticks; a line alone on the same rows keeps its ticks; explicit `ticks` win.
- **`bin`:** `bin.test.ts` counts a `Float64Array`; the type test (`useChart.test-d.tsx` or one beside it)
  accepts a `Float64Array` and still refuses a string.
- **Gates:** every new prop or value is shown in an example (the props gate in `pnpm check:site`), every
  example renders in the demo smoke test, and each new example gets its screenshots in both themes,
  reviewed as new baselines.

## Out of Scope

- A legend's Tab order before the plot (`accessibility.md` 8).
- A legend inside the plot area, floating over the marks.
- A gap threshold on the axis or on the chart, shared by every series: two series on one axis can be
  sampled at different rates.
- Inserting a visible mark into a gap (a hatch, a "no data" band); a gap stays a hole.
- A month tick unit as a prop. The unit follows from the bars; explicit `ticks` cover the rest.
- Column input to `useChart` (ADR-0048: rows are what the hook binds). The recipe for columns is in
  `.scratch/charts-recipes/`.

## Further Notes

- `.scratch/charts-recipes/` waits on two tickets here: the per-month recipe on the month ticks (03), the
  columns recipe on `bin` (04).
- `.scratch/chart-picture-and-print/` paints the legend where the browser laid it out, so a side legend
  needs nothing there. `.scratch/under-a-finger/` ticket 04 may give the legend's entries a larger target.
  Both touch the legend's stylesheet, not its layout, and are not blocked by this spec, nor is it by them.
- `.scratch/root-contract/` ticket 05 renames `ariaLabel` to `aria-label`. A new example uses whichever name
  `Chart` takes when it lands; that ticket's sweep covers the rest.
- An example file takes the next free number on its page when it lands; other specs add examples to the same
  pages.
