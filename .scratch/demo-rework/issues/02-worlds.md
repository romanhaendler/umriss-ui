# 02 - The five world datasets

Status: ready-for-agent
Type: task
Blocked by: —

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

`@umriss-ui/demo/worlds/{operations,logistics,controlling,planning,plant}.ts`: one invented company each with its standing cast (services, vehicles, cost centres, people, the kiln line from `core/demo/plant.ts`), usable by every demo. `core/demo/plant.ts`, `charts/demo/data.ts`, `schedule/demo/data.ts` move into it.

## Acceptance

- No real brand or person's name.
- Deterministic data (no `Math.random` at render).
