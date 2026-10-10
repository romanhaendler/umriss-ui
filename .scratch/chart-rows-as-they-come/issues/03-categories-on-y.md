# 03 — Categories on y: a matrix's rows and a state band's lane

Status: done
Type: task

Blocked by: 02
Spec: "Solution" (first bullet), "Implementation Decisions" D13, D14, D19,
D22; user stories 21–25

## What to build

A developer drawing a matrix names its rows by the data: `Matrix value` reads
a string field, and the y axis has one named row per category. A developer
drawing state bands names the lane a band occupies - `lane`, a category of its
y axis - instead of computing `laneFrom`, `laneTo` and a tick at the lane's
middle.

A y axis reads no value (ADR-0048); it becomes a category axis through the
series bound to it. `YAxis` takes `categories` and `categoryLabel` as `XAxis`
does. The first category stands at the top. `laneFrom` and `laneTo` stay for a
numeric axis; a band takes one way or the other. The state itself stays a
number (ADR-0007).

## Acceptance

- [x] Type tests: a string field is accepted by `Matrix value`; `lane` is a
      string; `lane` together with `laneFrom` or `laneTo` is refused.
- [x] Mounted through `useChart`: a matrix over a string field has one tick
      per category on y, the first at the top; the tooltip names the row by
      its category and still carries the level.
- [x] Mounted: `categories` on `YAxis` fixes the order, an empty place
      included; `categoryLabel` writes the label.
- [x] Mounted: several state bands, each with a `lane`, stand one per
      category in the y axis' order; the tooltip names the state as today; a
      band's lane is as wide as a bar is.
- [x] Mounted: a state band in a named lane on one y axis and a line on a
      numeric y axis share a chart.
- [x] Cell and state unit tests pass unchanged: a category's position is a
      number to them.
- [x] The glossary's entry on the **Lane** names the lane given by its
      category.
- [x] The examples that name rows or lanes through positions are written in
      the new shape: both Matrix examples, "Give each one a lane", "Read limits
      above the states", "Mark bands, limits and cells". Their screenshots are looked at
      before they are accepted; forced-colours baselines too where they exist.
- [x] `lane` is shown by an example; the y axis' twins of `categories` and
      `categoryLabel` are shown or stand in the list of props no example shows
      with their twin named.
- [x] Typecheck, the charts' unit tests, the demo smoke test and the own-data
      check pass.

## Comments

Delivered. The scene keeps its categories by orientation and axis id now. A y
axis' are what stands on it - the lanes its state bands name and the rows its
matrices read, in the series' order - or its own `categories`; the first takes
the highest place, so it stands at the top. A matrix' row is given its place
in materialisation, as an x category is; a named lane is `LANE_WIDTH` (0.8, a
bar's default) of its category's step. The tooltip names a cell's row where
its y axis has categories - in the place a point's own x stands, so the
readout says "at Billing". `StateBandProps` became a union for "one way or the
other", as the table's `ActionProps` is; the props generator reads it.

Where lanes share a chart with a course, the lanes' axis takes a fixed
`domain` in places - `[-0.5, 7.5]` leaves room above three lanes - which is
D12's "a fixed domain pair on a category axis is positions" at work
("Read limits above the states", "Mark bands, limits and cells").

Tests: `tests-unit/categoriesOnY.jsdom.test.tsx`, nine lines in
`tests-unit/useChart.test-d.tsx`. The two StateBand examples that name a lone
lane through one tick on a numeric axis keep it: a band without a lane fills
its axis, which is a promise of its own with a picture.
