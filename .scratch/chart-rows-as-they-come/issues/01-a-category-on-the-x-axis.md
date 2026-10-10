# 01 — A category on the x axis

Status: ready-for-agent
Type: task

Blocked by: none
Spec: "Solution" (first bullet), "Implementation Decisions" D1–D10, D12,
D19–D21; user stories 1–3, 5, 9–14, 16–20, 33–36, 38–41, 50–52

## What to build

A developer names the field that holds a category - `<XAxis value="costCentre" />`
over rows whose `costCentre` is a string - and gets one place per distinct
category, a tick under each and the category as its label. No position, no
`ticks`, no `tickFormat`.

The decision is written down first: ADR-0051, with a pointer in ADR-0002 and
ADR-0032 to it (neither is rewritten), and **Category** and **Category axis**
in the glossary.

The mechanism is D1: each category gets a whole-number position, written into
the x channel in materialisation; scale, step, hit-testing, stacking, zoom and
downsampling keep reading numbers. Categories stand in the order of first
occurrence, the series taken in registration order, hidden ones included. The
materialised series is in axis order whatever order the rows came in; a hit,
the tooltip and a `value` function's `index` still refer to the caller's row -
settle that first, it is the one place where the scene hands something back
that it did not before.

The kind of an axis follows the type of the value read (D4), one kind per axis
(D5). What the reader is told - tooltip, readout, summary, data table - goes
through the path the tick labels take (D21).

`categories`, `categoryLabel` and anything on y are ticket 02 and 03.

## Acceptance

- [ ] ADR-0051 written; ADR-0002 and ADR-0032 each carry a pointer to it and
      are otherwise unchanged; the ADR index lists it. **Category** and
      **Category axis** stand in the glossary.
- [ ] Type tests: a string field is accepted by `XAxis value` (the line that
      refuses one today turns round); an object or boolean field is refused; a
      function returning a string needs no annotation; a string field as a
      bar's or a line's `value` is refused. The new forms are exported as
      types at the end of the entry.
- [ ] Mounted through `useChart`: the tick labels are the categories, in the
      order of first occurrence; the tooltip, the keyboard readout, the
      summary and the data table's x column name the category.
- [ ] Mounted: two bar series stand side by side and stack on a category
      axis; a line stands at the middle of each category; a series with its
      own `data` adds its categories after the hook's; hiding a series from
      the legend moves no category.
- [ ] Mounted: rows given in an order other than the axis' land in the right
      places, and the tooltip of a hit shows the row it came from; a `value`
      function receives the caller's row index.
- [ ] Mounted: a row whose category is `null`, `undefined` or `""` is not
      placed and warns nothing; the same category twice in one series warns in
      DEV naming series and category; strings and numbers on one axis are
      reported in DEV naming the series, and the numbers are not placed;
      `tickFormat`, `ticks` or `tickCount` on a category axis is named in DEV.
- [ ] Mounted: `zoomable` on a category axis zooms and pans by key as on a
      numeric one; the view reports spans in positions.
- [ ] Materialisation unit tests: positions from categories, a series in axis
      order from rows in any order with the row index kept, a placeless
      category a gap outside the extent, the channels a kind does not use
      still `null`.
- [ ] A string that looks like a number is a category; a number field stays a
      numeric axis exactly as today, and every existing test passes unchanged.
- [ ] The Bar example "One bar per category" is written in the new shape, its
      rows written out as literals with the numbers it draws today; its lead
      no longer speaks of positions. Its screenshots are looked at before they
      are accepted: the picture moves at the axis and nowhere else.
- [ ] The benchmark example's figures stay inside what the capability record
      promises.
- [ ] Typecheck, the charts' unit tests, the demo smoke test and the own-data
      check pass.

## Comments
