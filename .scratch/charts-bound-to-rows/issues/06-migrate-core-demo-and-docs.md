# 06: Migrate: core's demo and the charts' documents

**What to build:** Core's control room and scenarios use the new shape, and the charts' README, capability record and outline prose describe it.

**Blocked by:** 02 (Expand: `useChart` and `value`)

**Status:** done

- [x] No `accessor` and no free series, axis or `Chart` remain in the batch
- [x] Typecheck and tests green; screenshots unchanged

## Comments

Delivered. Scenario 01 (incident) declares its chart through `useChart(TODAY)`; scenario 05 (the control room) holds two charts in one component and reaches them as `kilnTrend.Chart`/`tileLength.Chart` and their parts - destructuring both would collide. `value` is a field name throughout; `ControlChart`'s `accessor` stays for 07. The charts' README shows the smallest chart and the German wording through `useChart` and says what the hook binds and what stays a free import; `docs/capabilities.md` names `useChart` and `value` in the registration row and drops "accessor" from the area band and the performance note. "Known limits" (source-text comparison) and the `ControlChart` row about its inline accessor are left for 07.

Not touched, as agreed: the charts' demo outline prose (the examples' agents own `outline.ts`); core's outline still says "`Line` from @umriss-ui/charts" in two alternatives, which names the page and stays true.

Tests: core and charts typecheck, `pnpm lint`, core unit suite (1810) green; core's visual tests for the scenarios, the control room features and the chart-bearing examples, light and dark: 22 passed, no pixel changed (temporary config on port 4273, deleted).
