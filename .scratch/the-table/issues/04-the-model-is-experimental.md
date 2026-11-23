# 04: The pure model is experimental, in the table and in the alarms

**What to build:** the model's `searchable` default follows the column's, `OwnAggregate` gives way to `AggregateFunction`, then `tableModel` and the types beside it, and the alarms' `alarmModel`, `AlarmProjection`, `alarmColumns`, `ALARM_COLUMNS`, `DEFAULT_ORDER`, are marked `@experimental`. The three patterns of controlled state are written together in the table's README. See the spec's "The pure model"; finding D1.

**Blocked by:** 03

**Status:** ready-for-agent

**Size:** M (Sonnet, continued)

- [ ] `API.md` of the table and of the alarms list them under `## Experimental`
- [ ] The report says what the two model changes alter for a caller of the model
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
