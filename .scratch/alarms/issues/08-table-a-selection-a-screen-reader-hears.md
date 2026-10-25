# 08 - Table: a selection a screen reader hears

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/alarms/spec.md`

## What to build

A table prerequisite, and the part of `.scratch/shakedown/audit-family.md` 6 that a keyboard alarm list needs.
In grid mode a selected row is heard as selected, and a change of the selection is said.

- **Grid mode with a selection** (`<Table grid selectable>`):
  - the grid carries `aria-multiselectable="true"`;
  - every selectable body row carries `aria-selected`, `"true"` or `"false"`. Group lines, the footer and a
    new-row draft carry none.
- **The count is said.** A change of the selection by the user is announced through core's `announce`: a
  click on a box, Space on a row, "select all". The text is the count, "3 selected" / "3 ausgewählt", from
  core's wording with the prefix `table`. A selection handed in from outside and changed by the application
  is not announced.
- **A native table** keeps its checkboxes as the carrier of the state, with no `aria-selected` on its rows:
  ARIA defines the attribute for a grid's rows, not for a plain table's.
- Space already selects in grid mode, from any cell of the row (`gridKeys.ts`). A test now holds it, beside
  the new attributes.
- **Out:** announcing sort, page and export, and `aria-colcount`. They are the table's own wishes (map
  ticket 23) or the defects triage.

## Acceptance criteria

- [ ] In grid mode with a selection, the grid has `aria-multiselectable="true"`, and a selected row has
      `aria-selected="true"`, an unselected one `"false"`, after a click, after Space and after "select all".
- [ ] Without `selectable`, no row carries `aria-selected` and the grid carries no `aria-multiselectable`.
- [ ] A native table's rows carry no `aria-selected`.
- [ ] Each user change of the selection announces the count once, in English and German. A change from
      outside announces nothing.
- [ ] `pnpm check table`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick table` pass, and
      the shell's accessibility check passes on the table's selection page.
