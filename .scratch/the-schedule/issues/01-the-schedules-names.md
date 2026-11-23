# 01: A dependency names predecessor and successor; `barLabel`, `endMarks`, four appearance words

**What to build:** the four renames of the spec, each old name working for this minor with a warning, data with `from` / `to` on a dependency included; the two written rules. See the spec; findings A1, A3, A4, A5, A2, B2.

**Blocked by:** None (can start once core's spec is in)

**Status:** ready-for-agent

**Size:** M (Sonnet; call sites by script)

- [ ] Per rename: new works, old works and warns once, new wins
- [ ] A dependency given as `{ from, to }` draws as before
- [ ] Every demo uses the new names
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
