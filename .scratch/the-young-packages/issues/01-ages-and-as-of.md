# 01: The alarms say `ages`, and `asOf` has one type

**What to build:** `ages` on `AlarmList` and `AlarmBanner`, the old `freshness` working for this minor with a warning; `asOf` as `Date | number` everywhere, `AlarmInput` widened. **Before touching `null`**: report what `null` means today in each alarm component; if it means something of its own, leave it and say so. See the spec; finding A1.

**Blocked by:** None (can start once core's spec is in)

**Status:** ready-for-agent

**Size:** M (Sonnet)

- [ ] Per rename: new works, old works and warns once, new wins
- [ ] The report states, per component, what `asOf={null}` does today
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
