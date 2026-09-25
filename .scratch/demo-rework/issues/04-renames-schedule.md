# 04 - Hard renames: schedule

Status: ready-for-agent
Type: task
Blocked by: —

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

`setup`/`teardown` → `leadIn`/`leadOut`, `Transport` → `Dependency` (`duration` → `lag`), late transport → violated dependency, with every derived name (intents, findings, `Transports` part, props, wording keys, German "Vorlauf"/"Nachlauf"/"Abhängigkeit"); JSDoc and CONTEXT.md neutral. A dependency still joins subtasks of one task only.

## Acceptance

- Changelog migration table, no aliases.
- Tests green.
