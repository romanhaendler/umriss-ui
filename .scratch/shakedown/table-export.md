# Shakedown: the table's export in every view mode (0.40.4)

Status: needs-triage

An oracle - the expected text computed independently from 60 raw rows and the documented state - diffed
character by character against the `Export` download, `onExport`, `asCsv()` and `selectionAsText()` (and
Ctrl+C), Vite with `cssTarget`, Chromium, 2026-10-24. Formula injection and ISO dates are in `table.md`.

**Bottom line: no case exports a wrong value against the screen or the documented contract.** All three
outputs agree in every passing case (over 40 cases: sorts, multi-sort, search, filters, paging, virtual,
hidden/ordered/pinned/resized columns, ColumnMenu moves, RowDetail, RowActions, GroupBy, VerdictColumn,
`exportValue`, custom cells, grouped and folded, trees, selection, server mode, both languages, custom
formats, odd numbers, grid mode, `setView`, rows replaced every 12 ms). What looks "not always right" are the
places where the contract is silent:

## Where the contract is silent

1. **Grouped tables export in the ungrouped order.** The screen shows R003, R008, R013 under a group; the
   file R001, R002, R003. Group headers, subtotals, footer aggregates and group keys never appear; folded
   groups export in full. `export.ts` says "in the order the user sees", which holds for the columns only.
2. ✓ **A visible column can be missing from the file.** `exportColumns` (`src/export.ts:51`) drops a column
   whose kind is "other" (an object) unless it has its own `exportValue` - with its header, silently.
   Documented only in `llms-full.md`.
3. **A mixed column is decided by its first present value:** an object in row 1 and strings below drop the
   whole column, strings lost (`"ID\r\nS01\r\nS02"`); a string first and an object later exports that cell
   empty.
4. **A column without a label exports its id as the header** (`nolabel`) while the screen header is blank.
5. **A tree search exports the ancestors on the path as ordinary rows:** `filtered` is `["T1a2"]`, the file
   has three rows, with no "path only" marker. The level column and "every row, open or not" are
   documented only in a code comment; `selectionAsText` has no level column.
6. **A date shown without a time shifts a day in the file:** `new Date(2026,2,17)`, shown as 17/03/2026,
   exports `2026-03-16T23:00:00.000Z` in Berlin and `2026-03-16T15:00:00.000Z` in Tokyo. Idea: a
   `date`-format column exports `YYYY-MM-DD` in local time.
7. **Selection outside the filter:** hidden selected rows are not copied (documented), but `selection.count`
   still counts them (4 selected, 1 copied); in server mode a selected row on another page is left out
   silently.
8. **A row-header column cannot be hidden, but `toggleColumn` says it was:** `hidden` lists it and the
   ColumnMenu unchecks it while it stays on screen (`src/types.ts:185`, `registry.ts:517`). The export
   matches the screen; state and menu do not.
9. **Number notation:** `-0` → `0`; `1e21` → `1e+21`; `1e-7` stays (German `1,5e-7`); `±Infinity` as text;
   float noise as is (`0.30000000000000004`); years outside 0–9999 as `-000001-…`/`+010000-…`; invalid Date,
   NaN and null all empty.

## Notes

- A date range's `to` bound includes the whole day.
- A same-tick `asCsv()` right after a synthetic `th.click()` is stale (React has not flushed); with real
  clicks it is fresh.
- `VerdictColumn` exports its number; the verdict itself is not exported (contract silent).
