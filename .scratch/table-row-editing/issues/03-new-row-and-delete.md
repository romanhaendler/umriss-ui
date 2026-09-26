# 03 - New row and delete

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/table-row-editing/spec.md` (R11-R13)

## Scope

"New row" button and the new-row Row draft above the body, `newRow` defaults, `onRowAdd`; the delete button with its ask in the row, `onRowDelete`. Both edit modes.

## Acceptance

- Tests: new row validates and reports whole; discard leaves no trace; a draft elsewhere refuses; the ask, confirm and cancel of a delete.

## Comments

**Done (2026-09-26).** "New row" in the toolbar (own or put there), else beneath the table (`registry.showsToolbar()`); the new row is the grid line `new`, rendered in a `<tbody>` of its own above the body. Delete asks in its row (focus to Keep, back to Delete); a Row draft elsewhere blocks the actions of other rows.

Ceiling: a draft row hidden by a filter or another page stays open unseen; a click elsewhere is then refused without the hint in view.
