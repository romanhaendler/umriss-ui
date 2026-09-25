# 02 - The five world datasets

Status: done
Type: task
Blocked by: —

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

`@umriss-ui/demo/worlds/{operations,logistics,controlling,planning,plant}.ts`: one invented company each with its standing cast (services, vehicles, cost centres, people, the kiln line from `core/demo/plant.ts`), usable by every demo. `core/demo/plant.ts`, `charts/demo/data.ts`, `schedule/demo/data.ts` move into it.

## Acceptance

- No real brand or person's name.
- Deterministic data (no `Math.random` at render).

## Comments

2026-09-25, delivered on `main`. Five worlds in `packages/demo/src/worlds/` (Quillmere, Ferrow Parcel, Carrow & Lisle, Tidewell, Brenholt Tile Works), import-free and deterministic; `shows`/`beside` removed; `worlds.test.ts`. Visual baselines wait on the branch `demo-rework-baselines` for ticket 30's review (CONTEXT.md, Baseline).
