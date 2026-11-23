# 07: Six exports go; five members are experimental

**What to build:** `hasWarned`, `mergeLanguage`, `scrollForRow`, `RowPlacement`, `WindowInput` and `PressPoint` leave core's index (the workspace imports them from their module where it needs them); `revealCount` of `useTree`'s return and `Popover`'s `focusRef`, `insideRefs`, `closeOnTabOut`, `onBlur` are marked `@experimental`. See the spec's "Six exports go" and "`@experimental`"; findings D1, E5, D2.

**Blocked by:** 06 (same index)

**Status:** ready-for-agent

**Size:** S (Sonnet, chain B)

- [ ] `API.md` of core lists the five under `## Experimental` and the six nowhere
- [ ] Every package still builds and type-checks
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
