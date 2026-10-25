# 06 - Table: a Date column with seconds

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/alarms/spec.md`

## What to build

A table prerequisite, and a table improvement in its own right (`.scratch/shakedown/operator-screens.md` 4).
A `Date` column shows seconds when its format says so, with no cell renderer.

- **`DateFormat`** gains `"timeWithSeconds"` and `"dateTimeWithSeconds"` beside `"date"`, `"time"` and
  `"dateTime"`. They map to core's existing `formats.time(d, true)` and `formats.dateTime(d, true)`, so an
  application's own formats and the German formats apply unchanged.
- The mapping is written once, where the table turns a value into its text, so that every place that writes a
  date column's value reads it: the cell, the cut-value tip, the list filter's entries, the group line, and
  the selection's copied text.
- The CSV and the XLSX keep raw values (ADR-0061, `.scratch/table-xlsx/`).
- The JSDoc of `DateFormat` names all five with an example each: "17/03/2026, 09:05:03".
- **The demo.** The table's page on formats shows a column of timestamps with seconds.

## Acceptance criteria

- [ ] `format="dateTimeWithSeconds"` writes "17/03/2026, 09:05:03" in English and "17.03.2026, 09:05:03" in
      German, in a cell and in the list filter's entry for that value.
- [ ] `format="timeWithSeconds"` writes "09:05:03".
- [ ] A type test: both names are accepted on a `Date` column and rejected on a number column.
- [ ] The CSV of that column is unchanged.
- [ ] `pnpm check table`, `pnpm check:site` (table's `API.md` regenerated) and `pnpm test:visual:quick table`
      pass.
