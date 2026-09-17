# 08 — The checks that were pictures, and the ghost's cost

Status: done
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 53–55)

## Scope

- Ghost findings over the touched lanes and transports only.
- Browser tests for pinch zoom and the calendar under pan, zoom and drag.
- `ContextMenu` position and flip in core's browser suite.

## Acceptance

- The new tests green; no existing test changes.

## Comments

**Delivered.**

- The ghost's findings are assessed over the lane it is over and the lane it
  came from only - an overlap is a finding of one lane, and every other lane's
  are already assessed. Late transports are still judged against both ends,
  wherever they lie.
- Browser: a pinch zooms (two touch points through the protocol - Playwright
  has no multi-touch API, and Chromium turns them into pointer events of type
  touch, which is what the schedule listens to); the operating calendar gives
  no removed hour a tick through pan and zoom; a drag into a removed night
  stops at the seam and the plan takes it there. The calendar example handles
  the move intent now, so the drag has something to land in.
- Core: `ContextMenu` opens at the point of the right-click, and flips and
  stays inside a window small enough to force it. 516 browser tests green
  across the schedule and core projects.
