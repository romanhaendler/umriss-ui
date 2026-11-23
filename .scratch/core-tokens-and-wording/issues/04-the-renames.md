# 04: Four props and values and four types get their new names

**What to build:** `showValue` on `Meter` and `ProgressBar`, `onSelect` on `CommandPalette`, the tone `"neutral"` on `MenuItem`, and the types `TreeKey`, `LimitSide`, `TreeDirection`, `PopoverAlign`. Each old name works for this minor, is marked `@deprecated since 0.58 - use <new>.`, stands last and warns once; the new one wins where both stand. Every caller in the workspace moves, by one script where one rule covers many files. See the spec's "Names"; findings A2 to A5.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M (Sonnet, chain B; the call sites by script)

- [ ] Per rename: new works, old works and warns once, new wins
- [ ] `grep` finds the old names only at their deprecated declarations and in the tests of the old names
- [ ] `pnpm -r check:dist` accepts the markers (after `pnpm build`)
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
