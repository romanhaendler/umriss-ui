# 02 — Categories in the caller's order, and what is written for them

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: "Solution" (second bullet), "Implementation Decisions" D6, D8, D11;
user stories 4, 6–8, 37, 47

## What to build

A developer fixes the order of a category axis with a list of their own:
`categories` on `XAxis` is the order and the extent. A category on the list
that no row carries keeps its empty place - a week with a missing day still
reads as a week. A row whose category is not on the list is not placed, and
DEV names it. With a list and no rows the chart shows its axis and the empty
state.

Where the rows hold a key and not a name, `categoryLabel` says what is written
for a category - under the tick, in the tooltip, the readout, the summary and
the data table alike. `value` stays the field's name; two categories may share
a label.

## Acceptance

- [ ] Mounted through `useChart`: with `categories`, the tick labels stand in
      the list's order whatever the rows' order; a listed category without a
      row has its tick and no mark; a row whose category is not listed is not
      drawn and warns in DEV naming the series and the category.
- [ ] Mounted: `categories` with no rows shows every tick and the empty
      state.
- [ ] Mounted: `categories` on an axis whose values are numbers makes it a
      category axis, and the numbers are not placed (D4, D5).
- [ ] Mounted: with `categoryLabel`, the tick, the tooltip, the readout, the
      summary and the data table write the label; two categories with the same
      label keep two places.
- [ ] Type tests: `categories` is a list of strings; `categoryLabel` is handed
      a string.
- [ ] A new example on the Axis page, titled by what it shows, fixes an order
      with `categories`, shows an empty place, and writes a key's name through
      `categoryLabel`; it runs as copied and has screenshot baselines. Neither
      prop stands in the list of props no example shows.
- [ ] Typecheck, the charts' unit tests, the demo smoke test and the own-data
      check pass.

## Comments
