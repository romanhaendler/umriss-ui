# 05 - Hard renames: charts

Status: done
Type: task
Blocked by: —

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

`operatingCalendar` → `workingCalendar` and every `operating…` name (`OperatingInterval`, `toOperatingTime`, `operatingTicks` …); `ControlChart` stays. JSDoc neutral (StateBand, Axis, operatingTime).

## Acceptance

- Changelog migration table, no aliases.
- Tests green.

## Comments

2026-09-25, delivered on `main`. `workingCalendar` and every `working…` name; migration table in the charts changelog. Visual baselines wait on the branch `demo-rework-baselines` for ticket 30's review (CONTEXT.md, Baseline).
