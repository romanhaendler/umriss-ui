# 01 — The total column

Status: ready-for-agent
Type: task
Size: S

Blocked by: none
Spec: decisions T1-T10; user stories 1-9

## What to build

The data table of a stacked chart ends each stack's members with a column
"Total" (German "Summe"): the sum of the stack's members at the row's x, in the
format the tooltip writes it in.

The place is `courseTable` in `packages/charts/src/scene.ts`: it builds
`columns` and `rows` from `entries` and swaps a stacked member's `y` for
`stacked.value`. After the last member of each stack (an entry whose
`stacked` is set, by `stackOf(config)`), add one column with the heading
`wording.stackTotal` and one cell per row. The cell is not read from the
thinned course by index: look the row's x up in the stack's members'
materialised x channel (`lowerBound`, as `boxCells` does) and read
`stacked.total` there; empty where no member has the x or the total is NaN.
Write it as `totalsOf` writes it - `formatY` for a plain stack, the series'
`format` else `formatValue` for a normalised one (the members show shares, the
total is the sum of the readings, not 100). Reuse that code rather than
repeating it; pull the formatting of a total into one helper that `totalsOf`
and the table both call.

No new wording key. `DataTable.tsx` renders `columns` and `rows` as they come,
so it needs no change.

## Acceptance

- [ ] Mounted: a plain stack of two bars gets "Total" after the second with
      the sum in the series' `format`; a hidden member leaves the total.
- [ ] Mounted: a normalised stack lists shares and a total in the readings'
      format, not a percent.
- [ ] Mounted: two stacks on one x axis get two total columns, each after its
      last member; an unstacked series gets none.
- [ ] Mounted: a row with a gap in one member sums the others; a row with no
      reading is empty; a stack of one visible member still gets the column.
- [ ] A stack long enough to be thinned (above `TABLE_LIMIT`) keeps each row's
      total equal to the sum of the members' values at that x.
- [ ] German heading "Summe"; a wording written out in full still type-checks.
- [ ] The tooltip's and the readout's totals are unchanged (the existing
      stacking tests pass).
- [ ] Typecheck, the charts' unit tests and the demo smoke test pass.
