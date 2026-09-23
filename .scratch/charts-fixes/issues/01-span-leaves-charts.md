# 01 - Span leaves charts

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (Q9, Q14, Q25)

## Scope

- Delete `Span.tsx`, `spans.ts`, the `span` kind in the series union, the second x channel `x1` (only Span uses it: `materialize.ts`, `draw.ts`, `types.ts`), the span branches in `scene.ts`/`draw.ts`/`measure.ts`, the exports, the tests, `demo/examples/Span/`, the `span` page in `demo/outline.ts`, the `schedule` screenshot baselines, the rows in `docs/capabilities.md`, the README mention ("Seven series kinds" → six).
- `docs/adr/0026-span-leaves-charts-occupancy-is-the-schedules.md`: occupancy over a course ("jobs in the same chart as a process curve") against two places that draw occupancy; the schedule does it better (lanes, groups, editing); an x `LimitBand` can hint at a job over a curve. Reinstated only on a real need.
- ADR-0011 and ADR-0022: a line pointing at ADR-0026.
- `CONTEXT.md`: strike **Span**; reword **Idle** and **Overlap** onto the schedule's entries on a lane; the schedule section (around "where a charts **Span** is an interval", and "It is not a **Span**") says the charts Span was removed in favour of the schedule. The file-naming table loses `spans.ts`.
- `CHANGELOG.md`: breaking - `Span` removed, use `@umriss-ui/schedule`.

## Acceptance

- Typecheck, unit, interaction and screenshot suites green; `grep -rn "Span\b" packages/charts/src` finds nothing of the kind.
- `@umriss-ui/schedule` builds and its tests stay green (it imports no `Span`).
