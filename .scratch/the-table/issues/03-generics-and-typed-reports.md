# 03: The server flag stands last; the grid's reports are typed

**What to build:** `Table<Z, Key, S>` and `ActionProps` with the server flag last and defaulted; `CellEdit.value`, `RowSave.changes` and `RowAdd.values` typed. No old form. See the spec's Generics and the grid's reports; findings B4, C1.

**Blocked by:** 02

**Status:** ready-for-agent

**Size:** M (Sonnet, continued)

- [ ] Type tests for both orders: the new compiles, the old does not
- [ ] Every package and demo type-checks
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
