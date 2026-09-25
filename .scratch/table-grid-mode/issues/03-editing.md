# 03 - Cell editing

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/table-grid-mode/spec.md`

## Scope

G3, G4, G5.

## Acceptance

- Unit tests of the edit lifecycle; interaction tests (start by typing, Enter, Escape, Tab).

## Comments

**Done (2026-09-25).** `edit` (`"text" | "number" | "select" | "date"`
or an editor of one's own with `CellEditorProps`), `editOptions` for the
select (else the values that occur), `validate(value, row)`, and
`onCellEdit({ rowKey, columnId, value, row })` on `<Table>`. The editor sits in
a `FormField` whose label is visually hidden (`wording.editCell`, new in core,
English and German) and whose error is the validation message.

- Enter/F2 or typing (text, or a digit for a number) starts; Enter commits
  (not on a button - the date picker's trigger keeps it), Escape cancels, Tab
  commits and opens the next cell that edits, across rows; a picked day
  commits at once. An unchanged value is not reported. A draft that fails
  stays open and is checked again as it is corrected. Focus moving to another
  cell commits a valid draft and drops an invalid one.
- Tests: `cellEditing.test.tsx` (11) at the public interface; type tests in
  `types.test-d.tsx` (a number field for text, a text field for a date, a
  foreign option all fail to compile).
- For ticket 05: an open editor widens its column and makes its row taller
  (the field's natural width and the FormField's label gap); a message makes
  the row taller again. Seen rendered, not decided.
