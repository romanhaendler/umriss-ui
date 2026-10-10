# 05 — The examples start with the chart: Bar, BoxPlot, Pareto

Status: ready-for-agent
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

- [ ] None of these files gives the x axis `ticks` together with a
      `tickFormat` that looks a name up, and none computes a position for a
      row.
- [ ] None of them holds a seeded generator; the rows are literals. Where a
      sum is the example's subject ("above and below zero"), the rows hold the
      result.
- [ ] Each example's lead says what the example shows and no longer explains
      positions.
- [ ] Every example runs as copied: the own-data check passes.
- [ ] Screenshots, and forced-colours baselines where they exist, are looked
      at before they are accepted: marks and values as before, the axis as
      the category axis draws it.
- [ ] The demo smoke test and the interaction suite pass.

## Comments
