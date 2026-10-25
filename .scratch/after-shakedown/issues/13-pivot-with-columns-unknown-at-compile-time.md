# Pivot with columns unknown at compile time

Type:   grilling
Status: open

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
