# 03 - New row and delete

Status: ready-for-agent
Type: task
Blocked by: 02

Spec: `.scratch/table-row-editing/spec.md` (R11-R13)

## Scope

"New row" button and the new-row Row draft above the body, `newRow` defaults, `onRowAdd`; the delete button with its ask in the row, `onRowDelete`. Both edit modes.

## Acceptance

- Tests: new row validates and reports whole; discard leaves no trace; a draft elsewhere refuses; the ask, confirm and cancel of a delete.
