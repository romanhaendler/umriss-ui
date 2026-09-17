# 05 — Pan, zoom, hover, selection and reported interactions

Status: ready-for-agent
Type: task

Blocked by: 04
Spec: user stories 9–13, 21 · "Interaction"

## Scope

- Pan by dragging the background (both directions) and horizontal wheel; zoom
  with the wheel and a pinch around the pointer, within limits; headers and
  bands hold still.
- Hover feedback on subtasks and transports; a click selects the whole task.
- `onInteraction`: click, context menu and hover with the hit (subtask with its
  part, transport, lane, nothing) and positions (client point, time, lane).

## Acceptance

- `features-schedule.spec.ts`: panning moves the band labels, zoom changes the
  fine step, a right-click reports its hit, a click selects a task.

## Comments
