# 07: The alarms' fixes

**What to build:** the list of `alarms` in the spec's "Implementation Decisions" (`../spec.md`), item by item,
and its part of "Examples": every entry of `packages/alarms/demo/unshown.json` whose reason is "not shown yet"
gets an example, or a reason that says why none can show it. The banner's border: say in the report which token it now reads and why that one.
Read each item's finding first (the letters in brackets point into the research file of the package under
`.scratch/release-1-0/research/`, the decision into `.scratch/release-1-0/issues/`). Nothing here breaks a
caller: an item that would change a caller's types or behaviour is not built but reported. A new `@default`
is the value the code applies today.

**Blocked by:** the generator (`.scratch/api-md-lists-the-surface`, all tickets), since `API.md` is regenerated

**Status:** ready-for-agent

**Size:** S (Sonnet)

- [ ] Every item of the list is done or reported with its reason
- [ ] No entry of `unshown.json` says "not shown yet"
- [ ] The report names every new example (page and title) and every visible change, for the coordinator to look at
- [ ] `pnpm check alarms`, `pnpm typecheck` and `pnpm check:site` are green
