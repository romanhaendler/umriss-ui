# 01: The table's names agree with its view and the glossary

**What to build:** `t.conditions`, the model's `preFilter`, `foldAllGroups` / `unfoldAllGroups`, `pinned` on `RowActions`, `GroupKey` with `GroupKeyBase` and `GroupKeyComponent`; each old name works for this minor and warns. See the spec's Conditions, Folding, Pinning and `GroupBy`; findings A1 to A5.

**Blocked by:** None (can start once core's spec is in)

**Status:** ready-for-agent

**Size:** M (Sonnet; call sites by script)

- [ ] Per rename: new works, old works and warns once, new wins
- [ ] The alarms and every demo use the new names
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
