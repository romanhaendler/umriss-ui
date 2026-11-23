# 01: Core's fixes and examples

**What to build:** the list of `core` in the spec's "Implementation Decisions" (`../spec.md`), item by item,
and its part of "Examples": every entry of `packages/core/demo/unshown.json` whose reason is "not shown yet"
gets an example, or a reason that says why none can show it.
Read each item's finding first (the letters in brackets point into the research file of the package under
`.scratch/release-1-0/research/`, the decision into `.scratch/release-1-0/issues/`). Nothing here breaks a
caller: an item that would change a caller's types or behaviour is not built but reported. A new `@default`
is the value the code applies today.

**Blocked by:** the generator (`.scratch/api-md-lists-the-surface`, all tickets), since `API.md` is regenerated

**Status:** ready-for-agent

**Size:** M (Sonnet)

- [ ] Every item of the list is done or reported with its reason
- [ ] No entry of `unshown.json` says "not shown yet"
- [ ] The report names every new example (page and title) and every visible change, for the coordinator to look at
- [ ] `pnpm check core`, `pnpm typecheck` and `pnpm check:site` are green
