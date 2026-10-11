# The data table of a stacked chart carries the stack's total

Status: ready-for-agent
Date:   2026-10-11
Origin: `packages/charts/docs/capabilities.md`, "Later": "A stack's total in
the data table". The roadmap of 11 Oct 2026 (`open-points-roadmap`, section A)
lists it as small and clear: the maintainer is the caller (row G1), so it no
longer waits for one.

## Problem

The tooltip and the keyboard readout of a stacked chart end with the stack's
total (charts-stacking K4, `totalsOf` in `src/scene.ts`). The data table lists
the members' own values and no total: a reader who opens "Show data" to read
the numbers of a stacked bar chart adds the row up by hand. The table is the
chart's text twin (charts-alternatives), so it should say what the chart says.

## What exists

- `stackSeries` (`src/stack.ts`) gives each member a `total` channel: every
  member's own value at that x summed, gaps as zero; NaN where no member has a
  reading. It is the net sum of the readings, also in a normalised stack.
- `SeriesEntry.stacked = { value, total, normalize }`. `value` is the member's
  own reading, or its share in percent in a normalised stack.
- `totalsOf` puts the total after the stack's last member in the tooltip and
  the readout under the wording key `stackTotal` ("Total", German "Summe"). In a
  normalised stack the member rows are shares and the total is no share: it is
  written in the series' own `format` (else `formatValue`), not as a percent.
- `courseTable` (`dataTableGroups`) builds one table per x axis, one column per
  visible series, and swaps a stacked member's `y` for `stacked.value`. A
  stack's hidden members are not in the table. Above 500 rows `tableRows`
  thins the courses; the row's x stays an x of some member's point.
- The capability record says it today: "A stacked series lists its own value,
  not its top; no total column".

## Decisions

Marked *(spec)* are this spec's; the rest follow the tooltip.

| # | Question | Decision |
| --- | --- | --- |
| T1 | Whether | One column per stack, in every data table that lists a stack's members. *(spec)* |
| T2 | Its place | Directly after the stack's last member, as the tooltip puts it. A table with two stacks has two total columns. *(spec)* |
| T3 | Its heading | The existing wording `stackTotal` - "Total", German "Summe". No new key, so a wording written out in full is unaffected. Two stacks give two columns of the same heading; each stands beside its members. *(spec)* |
| T4 | A plain stack | The total in the series' `format`, else its y axis' `tickFormat`, else `formatValue` - as `formatY` writes the members and the tooltip the total. |
| T5 | A normalised stack | The members show their share in percent, as today. The total shows the sum of the readings in the series' `format`, else `formatValue`, as `totalsOf` writes it - not "100%". |
| T6 | A row without a reading | Empty where no member has a reading at the row's x, as an empty cell is today. Where the members have readings and some are gaps, the total is the sum of the others, gaps as zero (as the tooltip). |
| T7 | How it is found *(spec)* | By the row's x, looked up in the stack's members' materialised x channel (`lowerBound`), not by index into the thinned courses: a thinned table keeps correct totals. Any member of the stack that has the x will do. |
| T8 | Hidden members | A hidden member is out of the stack and out of the total, as the stack closes over it (ADR-0047). |
| T9 | A stack of one visible member | Still gets the column, as the tooltip still shows the row. *(spec)* |
| T10 | The accessible table | The column is a `td` column with the same `scope` rules as the others; the total heading is a column header. |

## User Stories

1. As a reader of the data table of a stacked chart, I want the total of each row, so that I do not add the members up.
2. As a reader, I want the total after the last member, so that the table reads like the tooltip.
3. As a reader of a normalised stack, I want the members as shares and the total as the sum of the readings, so that I see both what the bars show and what they add up to.
4. As a reader, I want the total in the units and format of the members, so that "kg" stands beside it.
5. As a reader of a chart with two stacks, I want a total beside each, so that I can tell which sums which.
6. As a reader of a long course, I want the totals right in a thinned table, so that a row's total is its x's.
7. As a screen-reader user, I want the total as a column with a heading, so that I hear it as a column.
8. As a German-speaking reader, I want "Summe", so that the table speaks one language.
9. As a developer, I want no new wording key, so that nothing breaks for a wording written out in full.
10. As a reader of the capability record, I want the line "no total column" replaced by the promise.

## Out of Scope

- A total for anything that is not a stack: a sum row, a footer, a column of
  all series.
- Totals for stacked lines or streamgraphs (not built, charts-stacking).
- A total column in the matrix table.

## Testing Decisions

- Mounted, in `tests-unit/dataTable.jsdom.test.tsx` and `stacking.jsdom.test.tsx`
  (the first file for the table, the second for the stack): a plain stack gets a
  "Total" column after its last member with the sum, in the series' format; a
  normalised stack shows shares and a total in the readings' format; two stacks
  get two columns; a gap row is empty where no member reads and a sum where
  some do; a hidden member leaves the total; German heading.
- Thinned: a stack long enough to pass `TABLE_LIMIT` keeps each row's total
  equal to the sum of the members' values at that x.
- The capability record's two lines ("no total column" and the "Later" entry)
  are changed in the same piece.

## Tickets

1. `01-the-total-column` (S): the column, T1-T9, the tests.
2. `02-documents-and-release` (S), blocked by 01.

## Decided while writing

- T1, T2, T3, T7, T9 and T10 are the spec's; the roadmap names only the line.
- No new wording key: the tooltip's `stackTotal` serves.
- The normalised total is the sum of readings, as the tooltip has it, not 100.
