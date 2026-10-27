# 12 - Virtual rows for a list in a flood

Status: needs-triage
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/alarms/spec.md` ("The list at flood volume")

## Why

The spec measured one update of the alarm list at flood volume and set 50 ms as the line. The measurement
missed it: one tick of 1,000 to 1,200 standing alarms of 100 types takes 78 ms from click to commit at 1x CPU
(94 ms to the next frame) and 367 ms at 4x slowdown, in a production build of the demo's "A flood that ticks"
example. The method and the table of numbers stood under ticket 07's Comments, delivered in 0.47.0; the
spec says virtual rows then become a ticket of their own.

## What to decide and build

- Whether the list renders its rows virtually above some count, through the table's existing `virtual`
  option, and what the model's own share of the 78 ms is (`alarmModel` is pure and runs on every tick).
- The virtual grid's focus drop (`.scratch/shakedown/audit-family.md` 2): when the active row is re-sorted
  out of the window, focus falls to `<body>`. The list must keep focus on its alarm across a re-sort
  (user story 16), which today holds only because the list is not virtual.
- What stays: acknowledge what is in view (the rows rendered inside the visible area), the live region's
  throttle, the keys, and the tests that hold focus, selection and scroll across ten ticks
  (`alarmListFlood.test.tsx`, `tests-visual/flood-scroll.spec.ts`, `tests-visual/acknowledge-in-view.spec.ts`).

## Acceptance criteria

- [ ] The same measurement, repeated, is under 50 ms at 1x, or the ticket records why the line moves.
- [ ] Focus stays on the focused alarm across a re-sort in the virtual list.
- [ ] The existing flood, focus and in-view tests pass unchanged.
