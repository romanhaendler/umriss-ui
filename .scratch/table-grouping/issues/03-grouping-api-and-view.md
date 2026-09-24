# 03 — Grouping in the interface: option, view, `GroupBy`, menu and chip

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: `.scratch/table-grouping/spec.md` (Q1, Q2, Q3, Q7, Q8, Q11, "How it looks" 7)

## Scope

- `defaultGrouping` on `useTable`; `grouping` and `folded` in `TableView`
  (left out at their default); `grouping`, `setGrouping`, `folded`, `toggleFold`,
  `foldAll`, `unfoldAll` on the snapshot.
- `groupValue` beside `sortValue`/`exportValue`; `group="day|week|month|year"`
  on point-in-time columns; `groupable` on the column and on `Table`.
- `t.GroupBy` bound by the hook, typed like a field column, registered but never
  rendered as a column, exported or listed in the column menu.
- The column menu entry "Group by this column" (adds a level, at most three);
  the one toolbar chip "Grouped by A › B" with a menu to remove a level, fold
  all, unfold all; × removes the grouping.
- Wording entries in English and German.

## Acceptance

- Type tests for `GroupBy`, `group` on a non-date (fails) and `groupable`.
- `initialView` with grouping and folds round-trips through `view`; unknown
  keys and paths fall out.
- A table with `groupable={false}` shows no menu entry.
