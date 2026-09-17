# 04 — Shift raster and task shift

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 17–19, 35–36, 47, 50)

## Scope

- `snap` accepts `{ step, offset }`.
- `shiftTask(subtasks, task, by)` returns move intents; the demonstration's context menu offers it.

## Acceptance

- `snap.test.ts` and `shiftTask.test.ts`; browser tests for a drag on a shift raster and the demonstration's task shift.

## Comments
