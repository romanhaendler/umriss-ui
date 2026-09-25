# 03 - Hard renames: table and its alarms

Status: ready-for-agent
Type: task
Blocked by: —

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

ADR-0035's alarm renames (`snooze`, `disabled`, `suppressed`, `isHidden`, active/resolved) through the model, `AlarmList`, core's wording keys and `wording/de`; `ReturnBand.direction` → `"upper"`/`"lower"`; JSDoc neutral. `docs/standards.md` gains the ISA term → umriss name table; CONTEXT.md follows.

## Acceptance

- Changelog migration table, no aliases.
- Unit and visual tests green; baselines updated only where names show.
