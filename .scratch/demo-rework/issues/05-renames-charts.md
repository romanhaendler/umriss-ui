# 05 - Hard renames: charts

Status: ready-for-agent
Type: task
Blocked by: —

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

`operatingCalendar` → `workingCalendar` and every `operating…` name (`OperatingInterval`, `toOperatingTime`, `operatingTicks` …); `ControlChart` stays. JSDoc neutral (StateBand, Axis, operatingTime).

## Acceptance

- Changelog migration table, no aliases.
- Tests green.
