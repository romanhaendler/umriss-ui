# 01 - First click edits; the pointer shows it

Status: ready-for-agent
Type: task

Spec: `.scratch/table-row-editing/spec.md` (R1, R2, R4)

## Scope

A pointer click on a cell that edits opens its editor at once (select: its list open; date: its calendar). Cursor and hover tint on editable cells.

## Acceptance

- One click on a text cell focuses its input; on a select, the list is open.
- Walking with arrows/Tab still opens nothing.
- A click on another cell while an edit fails validation keeps the editor (unchanged).
- Tests at the public interface.
