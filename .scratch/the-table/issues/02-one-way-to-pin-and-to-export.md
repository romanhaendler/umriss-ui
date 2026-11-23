# 02: One way to pin the row header and one way to export

**What to build:** `stickyRowHeader` and `asCsv` are deprecated: they work for this minor and warn, and name `pin="start"` on the row-header column and `exportAs(csv)`. See the spec's Pinning and `asCsv`; findings A4, B2.

**Blocked by:** 01

**Status:** ready-for-agent

**Size:** S (Sonnet, continued)

- [ ] A table with `stickyRowHeader` looks and scrolls as before
- [ ] The workspace uses neither any more
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
