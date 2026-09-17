# 07 — Dragging work in: the place intent

Status: ready-for-agent
Type: task

Blocked by: 02
Spec: `.scratch/schedule-refinement/spec.md` (user stories 20–25, 39–43, 49)

## Scope

- Intent `place`; `placing` prop declared by the application during an HTML drag; ghost with findings; drop, leave, Escape.
- `applyIntent` ignores it; `subtaskFromPlace` builds the subtask; `ripple` accepts it.

## Acceptance

- Unit tests for the helpers; browser test dragging from a list in an example, with the ghost's findings and the reported intent.

## Comments
