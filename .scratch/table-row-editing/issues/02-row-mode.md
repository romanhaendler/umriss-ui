# 02 - Row mode: the Row draft, the action column, onRowSave

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/table-row-editing/spec.md` (R3, R5-R10)

## Scope

`editMode="row"`, the Row draft state, every editable cell open at once, the pinned action column with Save/Discard, Enter/Escape, refusal on leaving, validate all on Save, `onRowSave` with the changed columns only; the wording in English and German.

## Acceptance

- Tests for each of R5-R10 at the public interface.
- `editMode` unset: ADR-0034's behaviour plus 01.

## Comments

**Done (2026-09-26).** One edit state for both modes: `Editing` holds the drafts of its open cells by column id - one for a cell, every column that edits for a Row draft. One `save` validates all and reports `onCellEdit`, `onRowSave` (changed columns only) or `onRowAdd`. The Save/Discard buttons stand in the actions column, pinned at the end; its head reserves their width unseen so nothing shifts. A refused leave raises "Save or discard this row first" beside the buttons. Words in core (EN + DE).
