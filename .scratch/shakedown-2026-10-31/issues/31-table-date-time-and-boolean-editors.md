# 31: Table - date-time and boolean editors

Status:     ready-for-agent
Blocked by: 01, 08

Spec: `../spec.md`, decision 8. Sources: README 19, wish 2; P22 `p38.mjs` (01:30 → 00:00).

- [ ] A column of date-times edits with core's DateTimePicker (`EditFor` names it, e.g. `"dateTime"`); the time of day is kept, the provider's zone respected.
- [ ] A boolean column edits with a Checkbox in the cell: Space toggles, a click toggles (ADR-0036), reported through `onCellEdit` like any edit.
- [ ] The date editor on a date-time column no longer drops the time; a column whose values carry a time picks the date-time editor or warns.
- [ ] Row editing (`editMode="row"`) takes both.
- [ ] Unit tests; an example on the Editing page; `pnpm check table`, `pnpm check:site`.

## Comments
