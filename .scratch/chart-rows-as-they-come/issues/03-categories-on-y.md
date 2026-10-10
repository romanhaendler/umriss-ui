# 03 — Categories on y: a matrix's rows and a state band's lane

Status: ready-for-agent
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

- [ ] Type tests: a string field is accepted by `Matrix value`; `lane` is a
      string; `lane` together with `laneFrom` or `laneTo` is refused.
- [ ] Mounted through `useChart`: a matrix over a string field has one tick
      per category on y, the first at the top; the tooltip names the row by
      its category and still carries the level.
- [ ] Mounted: `categories` on `YAxis` fixes the order, an empty place
      included; `categoryLabel` writes the label.
- [ ] Mounted: several state bands, each with a `lane`, stand one per
      category in the y axis' order; the tooltip names the state as today; a
      band's lane is as wide as a bar is.
- [ ] Mounted: a state band in a named lane on one y axis and a line on a
      numeric y axis share a chart.
- [ ] Cell and state unit tests pass unchanged: a category's position is a
      number to them.
- [ ] The glossary's entry on the **Lane** names the lane given by its
      category.
- [ ] The examples that name rows or lanes through positions are written in
      the new shape: both Matrix examples, "Give each one a lane", "Read limits
      above the states", "Mark bands, limits and cells". Their screenshots are looked at
      before they are accepted; forced-colours baselines too where they exist.
- [ ] `lane` is shown by an example; the y axis' twins of `categories` and
      `categoryLabel` are shown or stand in the list of props no example shows
      with their twin named.
- [ ] Typecheck, the charts' unit tests, the demo smoke test and the own-data
      check pass.

## Comments
