# 02: Wording is handed in as a part

**What to build:** what a caller hands in as wording is `Partial<Wording>`, merged over the default; a complete object is still accepted; umriss's own language files stay complete. ADR-0019 gets the dated sentence that a caller hands in a part, and the seventeen joined sentences as a known limit. See the spec's "`Wording`"; findings D4, C5, W1, W7.

**Blocked by:** 01 (same files)

**Status:** ready-for-agent

**Size:** M (Sonnet, chain A)

- [ ] A type test: one overridden key compiles, a complete wording compiles, a wrong key does not
- [ ] The German file is still checked complete
- [ ] ADR-0019's status line and index row agree (the guard is green)
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
