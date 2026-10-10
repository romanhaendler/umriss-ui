# 05 — The examples start with the chart: Bar, BoxPlot, Pareto

Status: done
Type: task

Blocked by: 01
Spec: "Solution" (last bullet), "Implementation Decisions" D22, D23, D26;
user stories 12, 14, 15, 42–44

## What to build

A developer who opens the Bar, the BoxPlot or the Pareto page sees the chart
on the first screen of every example. Each of these examples names its
categories by a field, and holds its rows as literals shaped as an API would
deliver them - no seeded generator, no world of ledgers, no index field kept
for the chart's sake. The numbers drawn stay the ones drawn today, so that a
moved picture is the axis' doing.

The files: the Bar examples "Group bars side by side", "Show bars above and
below zero", "Stack bars" and "Show shares of a whole"; the BoxPlot examples
that name their boxes through positions (six of the seven); the Pareto
example, whose entries go onto the axis by their `name`.

`pareto()` itself does not change; its entries keep their `index`.

## Acceptance

- [x] None of these files gives the x axis `ticks` together with a
      `tickFormat` that looks a name up, and none computes a position for a
      row.
- [x] None of them holds a seeded generator; the rows are literals. Where a
      sum is the example's subject ("above and below zero"), the rows hold the
      result.
- [x] Each example's lead says what the example shows and no longer explains
      positions.
- [x] Every example runs as copied: the own-data check passes.
- [x] Screenshots, and forced-colours baselines where they exist, are looked
      at before they are accepted: marks and values as before, the axis as
      the category axis draws it.
- [x] The demo smoke test and the interaction suite pass.

## Comments

Delivered. The four Bar examples hold nine or ten literal rows each and are
32 to 37 lines long, where the chart began at line 42 to 83; "above and below
zero" holds the year's sums the ledger would send. Six BoxPlot examples read
their group's name - four had their rows written out already and lose only
the tick list and the lookup, "side by side" and "against the objective" lose
their index field, and "a box per shift" holds the six boxes its generator
computed. The Pareto reads its entries' `name`; `pareto()` is untouched, its
`index` re-described as a rank.

The pictures: "above and below zero" did not move by a pixel, with the same
data on the new axis. The others moved by a pixel as a whole - a lead above
them on the page changed its height by a fraction, and a canvas at a
fractional place is resampled - and at their own leads where those changed.
Marks, values, ticks and labels are the same. The Bar and BoxPlot pages'
texts and the comments on `Bar`, `BoxPlot` and `pareto` no longer send a
reader to positions.
