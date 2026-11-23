# 03: `ChartProps`, a limit's role, and a name required by type

**What to build:** `ChartProps` without the DOM's `onSelect`, `title` and `color`; `LimitRole` narrowed on `LimitLine` and `LimitBand`; `Chart` requires `aria-label` or `aria-labelledby` by type; development warnings for two series of one name and for hiding an unnamed one; the limit's doc says why its axis binding has its own name. See the spec; findings C8, B6, C1, E, C4, B1.

**Blocked by:** 02

**Status:** ready-for-agent

**Size:** M (Sonnet, continued)

- [ ] Type tests: a chart without a name does not compile, with either it does
- [ ] Every example and scenario of the workspace names its charts
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
