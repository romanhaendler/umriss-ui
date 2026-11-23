# 05: The cross clears the field

**What to build:** on `Input`, `Select` and `TreeSearch` the cross of `clearable` clears the field, controlled or not, and reports the empty value through `onValueChange`; `onClear` is still called for this minor and warns. See the spec's "`clearable`"; finding B1.

**Blocked by:** 04 (same components)

**Status:** ready-for-agent

**Size:** M (Sonnet, chain B)

- [ ] Controlled and uncontrolled: one `onValueChange` with the empty value per click on the cross
- [ ] `onClear` alone still clears as before, with a warning
- [ ] The workspace's own callers use `onValueChange`
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
