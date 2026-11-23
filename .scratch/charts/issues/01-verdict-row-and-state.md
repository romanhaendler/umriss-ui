# 01: A series says `verdict`; `value` is the reading only

**What to build:** `verdict` on the seven series prop types, `row` on `Matrix`, `state` on `StateBand`; each old name works for this minor and warns. See the spec's first two decisions; findings B3, B4.

**Blocked by:** None (can start once core's spec is in)

**Status:** ready-for-agent

**Size:** M (Sonnet; call sites by script)

- [ ] Per rename: new works, old works and warns once, new wins
- [ ] The schedule, core's control room page and every demo use the new names
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
