# 04 - Hard renames: schedule

Status: done
Type: task
Blocked by: —

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

`setup`/`teardown` → `leadIn`/`leadOut`, `Transport` → `Dependency` (`duration` → `lag`), late transport → violated dependency, with every derived name (intents, findings, `Transports` part, props, wording keys, German "Vorlauf"/"Nachlauf"/"Abhängigkeit"); JSDoc and CONTEXT.md neutral. A dependency still joins subtasks of one task only.

## Acceptance

- Changelog migration table, no aliases.
- Tests green.

## Comments

2026-09-25, delivered on `main`. leadIn/leadOut, Dependency with lag, violated dependency, `Dependencies` part, wording keys EN/DE; migration tables in schedule and core changelogs. Visual baselines wait on the branch `demo-rework-baselines` for ticket 30's review (CONTEXT.md, Baseline).
