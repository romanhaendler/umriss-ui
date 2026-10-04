# 05: Table: a view applies by content, and is reported in every mode

**What to build:** A table takes a view handed in whenever it differs in content from the last one - not only on the first render - and reports every change of its view through `onViewChange`, in every mode. Two tables, or a table and a stored view, stay in step without a remount. The 'View' page shows it.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Model test: a view applies once per content change; the same again changes nothing; unknown columns fall out
- [x] `onViewChange` fires once per change with the whole view
- [x] The 'View' example keeps working without a `key`

## Comments

**2026-10-04, delivered.** `initialView` is compared by `viewKey` (model/view.ts: JSON with object keys sorted, lists in their order) against the last one handed in; a differing one is taken during the render as a new start - what it leaves out is reset, including conditions, grouping, folds, pins and branches - and `undefined` keeps the table's own. `onlyKnown` moved into the model beside it, so names no column carries still fall out on reading. `onViewChange(view)` reports `t.view` once per change after the commit, in both modes; the start is not reported. Tests: `tests-unit/viewKey.test.ts` (model), the "A view handed in later" block in `tests-unit/initialView.test.tsx` (apply, same again, unknown names, report once and whole under Strict Mode, two tables in step).

Part of 06 done here: one name could not carry both reports - manual mode's must not fire on a width drag (`manualMode.test.tsx`, "and nothing else"), the general one must. Manual mode's report is now `onRequest(request: ManualView)`; `manual`, `ManualView` and the page name 'Manual mode' are untouched and stay 06's. The changelog entry is 08's.

The 'View' example keeps the reported view in state and hands it back: "Keep this view", "Restore the kept view", "Back to the beginning", no `key`. Pictures renewed: the View and Manual-mode pages and examples (leads and buttons changed).
