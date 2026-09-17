# 05 — Domain report and point handle

Status: done
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 30–34, 48)

## Scope

- `onDomainChange` after pan and zoom gestures only.
- A ref handle: client point ↔ time and lane.

## Acceptance

- Browser tests: two schedules kept in step by an example; the handle's round trip in an example.

## Comments

**Delivered.**

- `onDomainChange` reports the visible span as two wall-clock instants, at most
  once per frame, and only after a gesture - a wheel, a drag, a pinch, the
  auto-pan. A span handed in through `initialDomain` is not reported, which is
  what keeps two schedules synchronised with each other from feeding one
  another. The gestures say `viewMoved()` where they said `viewChanged()`.
- `ScheduleHandle` through a ref: `positionAt(clientX, clientY)`,
  `clientPointOf(time, lane?)`, `visibleDomain()`. `Schedule` is a
  `forwardRef` component now; no prop changed.
- Example `Schedule/08-in-step`: two plans of the same hours kept in step, the
  span written out, and the application's own pin placed with the handle and
  moved along with every reported span. Two new pictures.
- Browser: "two schedules move together, and the span is reported", "the handle
  places the application's own mark at a time". 127 green.
