# Pivot with columns unknown at compile time

Type:   grilling
Status: resolved

## Question

When a table's columns come from the data (years, plants, shifts), what does umriss offer?

ADR-0032's *Instead* for pivot - compute the pivoted rows, declare their columns - held in six lines until the
columns were not known at compile time: the persona hard-coded `y2024`-`y2026` because `Column` is typed per
field (`.scratch/shakedown/reports-bi.md`, "A matrix with row and column totals"). Grouping gives nested rows,
not the matrix.

- Is the failure a missing recipe or a missing feature? A computed `Column` already takes a function and an
  `id` (`packages/table/API.md`, `ColumnComponent`), so `years.map(y => <Column id={y} value={r => r.byYear[y]} />)`
  may hold - with which aggregates and footer totals?
- A row total and a column total: the footer aggregate covers columns; what covers a row's total?
- Pivot stays "never" (the analysis is the application's) with a documented recipe, or a `pivot()` helper
  beside `pareto()` that returns rows and column descriptors, or more?

## Answer

Decided 2026-10-25 by the agent, on the maintainer's delegation. One point is a product call and is marked
for review.

The failure is a missing recipe plus one defect, not a missing feature. An experiment against the table's
source (throwaway, outside the repo) rendered a matrix whose years came from the data. It checked the
types, the footer, and years arriving and leaving.

- **What holds today, unchanged.**
  - The application computes the pivoted rows: one row per plant, the cells in a map keyed by year
    (`byYear`), and the row total as a field of the row.
  - The table declares one computed `Column` per key: `years.map(y => <Column key={y} id={...}
    label={...} value={r => r.byYear[y]} aggregate="sum" />)`.
  - The types accept a value of `number | undefined`, with `aggregate="sum"` (and `avg`, `min`, `max`),
    a number `format` and `filter="range"`.
  - **A column's total** is the footer aggregate of its year column.
  - **A row's total** is a field column over the row's `total`, with `aggregate="sum"`. Its footer is the
    grand total.
  - Grouping (ADR-0029) on top gives each group's subtotals in its header. The column menu, the sort and
    the export work per year column like any other column.
- **Pivot stays "never", and there is no `pivot()` helper** *(agent, product - for review)*. ADR-0032's
  reason stands: which measure a cell holds, and whether it is summed, averaged or taken last, is the
  application's analysis. The rows take about ten lines of application code. A helper that returns column
  descriptors would be a second way to declare columns beside the declaration (ADR-0017). `pareto()` is a
  different case: it is a chart's computation, in charts.
- **The recipe is documented and tested** *(agent)*. It is a demo example, "A matrix with row and column
  totals". The demo is the documentation, and `llms-full.md` carries the example to agents.
  - First-table's limit line on pivot points at the example.
  - ADR-0032's *Instead* for pivot gets an amendment (dated 2026-10-25) naming one computed `Column` per
    key, mapped from the data. This is an amendment, not a new ADR.
  - The recipe states the one rule it depends on: an accessor may close only over what is constant for its
    column (its key). Anything that changes with the data goes into the row. The row total is a field for
    exactly this reason. A closure over `years` stays stale, because the accessors are compared by source
    text (`packages/table/docs/capabilities.md`).
- **The defect: a column keeps its accessor only while it keeps its id** *(agent)*. With an index `key`,
  a column instance changes its year from one render to the next, but its accessor's source text stays the
  same.
  - The registry keeps the old accessor. The new header then shows the old year's numbers, and a false
    DEV warning "Two columns carry the id" appears for a moment.
  - The fix: an accessor is held only while the column's id is unchanged.
  - Uniqueness is checked once all of a render's columns have registered, not after each one.
  - A unit test proves both.
- **A leftover goes** *(agent)*. The first overload of a computed `Column` still accepts `footer="sum" |
  "avg"`, the alias that commit 42603525 stopped reading. It compiles and shows nothing, which is a silent
  trap on exactly this path. The overload is deleted, and a type test holds that `footer` is rejected.
- **Out.**
  - A pivot engine or a pivot mode of the table.
  - Column descriptors as data.
  - A `pivot()` helper.
  - Pivot in server mode.
  - Drag-to-pivot UI.
  - The general stale-closure trap: an accessor closing over changing state with the same text. That is
    ticket 18's ("DEV warnings for the silent traps"). This answer only removes the id case and documents
    the rule for the recipe.
- **Not costly to reverse.** A registry fix, a type deletion, an example and an amendment. No ADR.
- **Touches:** `@umriss-ui/table` only: the registry, the computed `Column` types, the demo (a new example
  and First-table's limit line), and ADR-0032 (amended).
- **Becomes the spec** `.scratch/table-columns-from-the-data/`.
