# 31: Table - date-time and boolean editors

Status:     done
Blocked by: 01, 08

Spec: `../spec.md`, decision 8. Sources: README 19, wish 2; P22 `p38.mjs` (01:30 → 00:00).

- [x] A column of date-times edits with core's DateTimePicker (`EditFor` names it, e.g. `"dateTime"`); the time of day is kept, the provider's zone respected.
- [x] A boolean column edits with a Checkbox in the cell: Space toggles, a click toggles (ADR-0036), reported through `onCellEdit` like any edit.
- [x] The date editor on a date-time column no longer drops the time; a column whose values carry a time picks the date-time editor or warns.
- [x] Row editing (`editMode="row"`) takes both.
- [x] Unit tests; an example on the Editing page; `pnpm check table`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** `edit="dateTime"` on core's DateTimePicker (time of day and
zone kept, seconds when the format has them); `edit="boolean"` a Checkbox in the cell - a click toggles
and commits; `edit="date"` on a column with times uses the date-time editor; both work in row editing;
example "Edit a date and time, and a yes or no". Driven in Chromium: a click toggles and commits, Escape
keeps it, Enter on the date-time cell opens the picker with focus in the hour. Decided: Space on a cell
not being edited still selects the row (the existing rule); Enter/F2 opens the box.
