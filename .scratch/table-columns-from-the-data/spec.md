# A matrix with row and column totals, its columns from the data

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Pivot with columns unknown at compile time" (its
Answer holds every decision below); finding `.scratch/shakedown/reports-bi.md`, "A matrix with row and column
totals"; ADR-0032 (amended here), ADR-0017, ADR-0029.

## Problem Statement

A report shows one row per plant and one column per year, with a total per row, per column and overall. The
years come from the data. ADR-0032 says "compute the pivoted rows and declare their columns". A developer
who did so typed the rows with one field per year and declared one field column per year. They hard-coded
2024 to 2026, because a field column names a field the compiler knows. The next year breaks the report.

The table already holds the matrix: a computed column takes a function and an id, so one column per year can
be mapped from the data. Nobody showed it, so the *Instead* reads as a wall.

The path also has two traps:

- **Index keys.** If the year columns are mapped with the index as React `key`, a column instance changes its
  year when the set of years shifts. The table holds a column's accessor while its source text stays the
  same, so the new header shows the old year's numbers. A false DEV warning about two columns with one id
  appears with them.
- **An old prop.** A computed column still accepts `footer="sum"` in its types, an alias the table no longer
  reads. It compiles and shows no total.

## Solution

umriss keeps pivot out (ADR-0032) and shows the matrix as a tested recipe:

- The application computes the pivoted rows: one row per entity, its cells in a map keyed by the column
  value, and its row total as a field.
- The table declares one computed `Column` per key, mapped from the data, keyed by that value, with
  `aggregate="sum"`.
- The footer then gives each column's total, the row-total column's footer gives the grand total, and a
  grouping gives subtotals per group.

The table stops holding a column's accessor across a change of its id, so index keys show the right numbers
too. The duplicate-id check runs once a render's columns have all registered. The computed column's `footer`
overload is deleted.

## User Stories

1. As a report developer, I want an example of a matrix whose columns come from the data, so that I don't
   hard-code next year's column.
2. As a report developer, I want each year column to total in the footer, so that I read a year's sum
   without computing it.
3. As a report developer, I want a row-total column whose footer is the grand total, so that the matrix has
   all three totals.
4. As a report developer, I want the example to say why the row total is a field of the row and not a
   function over the years, so that my totals don't go stale when the years change.
5. As a report developer, I want a new year in the data to appear as a column in order, and a year that
   leaves to disappear, with correct totals, so that the report follows the data.
6. As a report developer, I want a grouping over the matrix to show subtotals per group, so that region
   sums need no extra code.
7. As a developer who maps columns with the index as `key`, I want the cells to show the values of the year
   in the header, so that a shifted set of years never shows wrong numbers.
8. As a developer, I want no duplicate-id warning when my column ids are unique after a render, so that a
   warning means a real mistake.
9. As a developer, I want `footer` on a computed column to be a type error, so that a total that would never
   show cannot compile.
10. As a coding agent, I want the recipe in `llms-full.md` and the pivot limit line to point at it, so that
    "no pivot" leads to the way that works.
11. As the maintainer, I want ADR-0032's *Instead* to name computed columns mapped from the data, so that the
    next request for pivot is answered with the recipe.

## Implementation Decisions

- **No new API.** There is no `pivot()` helper and no column descriptors as data. Columns stay declared
  (ADR-0017). Which measure a cell holds, and how it is combined, stays the application's (ADR-0032).
- **The accessor hold.** The registry holds an accessor that is equal by source text only while the column
  keeps its id. A changed id takes the new accessors (value, sort value and group value) and counts as a
  change of values.
- **The duplicate-id check** runs after the render's columns have registered: at the point after the commit
  where the order is checked, not inside each registration. It still warns once per real duplicate.
- **The `footer` overload** of the computed `Column` is deleted. `aggregate` is the only name.
- **The recipe** is an example on the Aggregate page, titled "A matrix with row and column totals":
  - facts by plant and year, pivoted in a few lines of the example;
  - one computed column per year from the data, `key` by the year;
  - a row-total field column, every column with `aggregate="sum"`;
  - its lead states the closure rule: an accessor closes only over what is constant for its column, and
    whatever changes with the data goes into the row.
- **First-table's limit line on pivot** points at that example.
- **ADR-0032** gets a dated amendment under its pivot item: the *Instead* means one computed `Column` per
  key, mapped from the data, with the totals from `aggregate`.

## Testing Decisions

- A good test renders a table as an application does and asserts on what a reader sees: header texts, cell
  texts, footer texts, and the DEV warnings it logs. It never asserts on the registry's internals.
- The seams already exist:
  - the accessor tests in the table's unit tests (inline accessors compared by source text) take the
    index-key case;
  - the aggregate tests take the matrix: years from the data, years arriving and leaving, the grand total,
    and a grouping's subtotals;
  - the type tests (`types.test-d`) take `footer` rejected and the recipe's column accepted;
  - the demo smoke test renders the new example;
  - the visual suite records its screenshots.
- Prior art: the inline-accessor tests (a new function of the same text, a function of another text, a
  bound function), and the footer helper of the aggregate tests that reads a footer cell by its kind.

## Out of Scope

- A pivot engine, a pivot mode, column descriptors as data, a `pivot()` helper, or a drag-to-pivot UI
  (ADR-0032).
- Pivot in server mode.
- The general stale-closure trap: an accessor that closes over changing state with an unchanged text. It
  belongs to the map's ticket "DEV warnings for the silent traps". This spec only removes the id case and
  documents the rule for the recipe.
- Named aggregates beyond the built-in ones (median, standard deviation), which belong to the map's ticket
  "The table's and the schedule's single wishes".

## Further Notes

- The experiment behind this spec rendered the recipe against the table's source.
  - The types accepted a value of `number | undefined` with `aggregate="sum"`, a number format and
    `filter="range"`.
  - A year arriving at either end or leaving the data rendered in order, with correct footers.
  - A row total computed by a closure over the years stayed stale when a year arrived (42 instead of 45).
  - Index keys showed 2024's numbers under the header 2025 and logged the duplicate-id warning.
