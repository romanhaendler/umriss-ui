# 02: The registry's types leave the index

**What to build:** the listed types are no longer exported; `ChartPerf` and `onPerf` are `@experimental`. Report any remaining public type that names a removed one before removing it. See the spec; findings D1, D2.

**Blocked by:** 01

**Status:** ready-for-agent

**Size:** S (Sonnet, continued)

- [ ] `API.md` lists none of them, and `ChartPerf` under `## Experimental`
- [ ] The schedule and the demos still type-check
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
