# 15: Numeric ids in the table and the choice fields

Status:     ready-for-agent
Blocked by: 01, 03

Spec: `../spec.md`, decision 4. Source: earlier-runs-open composed-app 3.

- [ ] `rowKey` may return `string | number` (`table/src/types.ts:621`); selection, current row, folds, tree branches, the view and `onSelectionChange` carry the key as returned; `1` and `"1"` stay different.
- [ ] Select, Combobox, MultiSelect, SegmentedControl and RadioGroup take `T extends string | number`; the value comes back with its type; form posting writes `String(value)`.
- [ ] alarms' and the demos' `String(id)` workarounds go.
- [ ] Type tests (generic inference with numbers) and unit tests; `pnpm check core`, `table`, `alarms`, `pnpm typecheck`, `pnpm check:site`.

## Comments
