# 02 - Row mode: the Row draft, the action column, onRowSave

Status: ready-for-agent
Type: task
Blocked by: 01

Spec: `.scratch/table-row-editing/spec.md` (R3, R5-R10)

## Scope

`editMode="row"`, the Row draft state, every editable cell open at once, the pinned action column with Save/Discard, Enter/Escape, refusal on leaving, validate all on Save, `onRowSave` with the changed columns only; the wording in English and German.

## Acceptance

- Tests for each of R5-R10 at the public interface.
- `editMode` unset: ADR-0034's behaviour plus 01.
