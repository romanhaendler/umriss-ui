# 05 — Pan, zoom, hover, selection and reported interactions

Status: done
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

**Delivered** (d452d68; browser suite 39d766b).

- Wheel zooms around the pointer (ctrl-wheel from a trackpad pinch with a
  finer factor), a horizontal or shift wheel pans, the background drags in both
  directions, two touch pointers pinch. The wheel listener is registered
  non-passive so the page does not scroll with it.
- `onInteraction` reports hover only when the target changes.
- `features-schedule.spec.ts`, 8 tests. The right-click's time is asserted to
  the minute either side: one pixel is about a minute in the example.
