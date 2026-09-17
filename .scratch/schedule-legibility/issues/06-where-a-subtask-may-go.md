# 06 — Where a subtask may go

Status: ready-for-agent
Type: task

Blocked by: 02
Spec: `.scratch/schedule-legibility/spec.md` (user stories 25–31, "Where a subtask may go")

## Scope

- `canMoveTo?: (subtask, lane) => boolean`, asked while dragging and at the drop, for drags from outside as well.
- The ghost stays on the last allowed lane; a **Refusal** stands in the snapshot and at the ghost; a refused drop reports nothing.

## Acceptance

- Browser tests: a drag across a forbidden lane, the refusal, no intent; the same for a drag from outside. An example whose subtasks are bound to their machines.

## Comments
