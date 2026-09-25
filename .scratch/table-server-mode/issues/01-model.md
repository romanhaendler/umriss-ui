# 01 - Manual mode in the model

Status: done
Type: task

Spec: `.scratch/table-server-mode/spec.md`

## Scope

M1 in the pure table model: the view object out, no local processing.

## Acceptance

- Unit tests: the model passes rows through untouched and reports every view change once.

## Comments

- 2026-09-25: `manual: { rowCount }` on the model's input: the rows pass through as they came (copied, so a later sort cannot reorder the caller's page), the page count comes from the server's total, and the page is clamped only against a known total - with none yet, a view's page three survives the first request. Grouping is not applied.
- The options are a discriminated union: `manual: true` requires `rowCount` and `onViewChange`; without it neither is taken (type tests).
- The view goes out as `ManualView` - a `TableView` whose search, conditions, sort, page and page size are always present. Deviation from the letter of M1 ("as the view object"): `t.view` leaves out whatever is at its default, and a server has no default of the table's to fill in, so the reported view carries all five. It is reported from an effect, keyed by those five: once when the table stands (Strict Mode included), once per change, never for a width or a hidden column.
- Tests: `manualModel.test.ts` (pure), `manualMode.test.tsx` (the reporting).
