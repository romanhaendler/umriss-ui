# 15: Numeric ids in the table and the choice fields

Status:     done
Blocked by: 01, 03

Spec: `../spec.md`, decision 4. Source: earlier-runs-open composed-app 3.

- [x] `rowKey` may return `string | number` (`table/src/types.ts:621`); selection, current row, folds, tree branches, the view and `onSelectionChange` carry the key as returned; `1` and `"1"` stay different.
- [x] Select, Combobox, MultiSelect, SegmentedControl and RadioGroup take `T extends string | number`; the value comes back with its type; form posting writes `String(value)`.
- [x] alarms' and the demos' `String(id)` workarounds go.
- [x] Type tests (generic inference with numbers) and unit tests; `pnpm check core`, `table`, `alarms`, `pnpm typecheck`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** `rowKey` may return `string | number`; Table, its options,
snapshot and callbacks take `Key extends RowKey = string`, inferred from `rowKey`, so numbers come back
as numbers and string tables compile unchanged; `1` and `"1"` stay apart; Combobox, MultiSelect,
SegmentedControl, RadioGroup, Select take `T extends string | number`. Decided: generic over the key
rather than a plain union (a union broke existing string-typed handlers). Left: DOM-derived comparisons
(data attributes, ids) compare by text - a table holding both `1` and `"1"` could mix them there.
