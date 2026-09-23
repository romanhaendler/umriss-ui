# 01 - Span leaves charts

Status: done
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

## Delivery

`Span`, `spans.ts`, the `span` kind, the second x channel `x1` and every span
branch in `scene.ts`, `draw.ts` and `materialize.ts` are gone; so is `open` in
a tooltip point's `segment`, which only a span ever set. `measure.ts` had no
span branch (its "span" is the measuring `<span>`). ADR-0026 written, ADR-0011
and ADR-0022 point at it, `CONTEXT.md` reworded (Idle and Overlap now stand in
the schedule section, on subtasks), README says six kinds, `docs/testing.md`
counts thirteen charts pages. The demo data `SCHEDULE`/`RESOURCES` went with
the example; the StateBand "why" text now points at the schedule.

Checks: charts typecheck, 390 unit tests, lint green; `@umriss-ui/schedule`
builds, typechecks and its 202 tests pass. Screenshots: 4 baselines deleted
(`example-span--schedule`, `page-span`, light and dark), none renewed. The
charts screenshot suite fails 14-17 example pictures per run on sub-pixel drift
**with or without this change** (measured on the untouched HEAD: 14), a
different set each run - more than the "two to four" `docs/testing.md` records.
