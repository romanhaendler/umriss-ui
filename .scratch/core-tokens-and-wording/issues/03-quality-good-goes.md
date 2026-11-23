# 03: `qualityGood` leaves the wording

**What to build:** the key `qualityGood` is removed from `Wording` and both language files, with whatever read it; under "Changed" with its migration line. See the spec's "`Wording`"; finding W8. Report what read the key and what stands there now.

**Blocked by:** 02

**Status:** ready-for-agent

**Size:** S (Sonnet, chain A)

- [ ] No `qualityGood` in `src` of any package
- [ ] Nothing a user reads changes, or the report says what does
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
