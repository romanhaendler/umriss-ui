# 03 — Tooltip and now line

Status: done
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 1–8, 26–29)

## Scope

- DOM tooltip for subtasks and transports with default content from wording and formats; `tooltip={false}` or a render function; hidden during drags; clamped and flipped.
- `now`: `true` follows the clock by the minute, a number fixes it; off by default.

## Acceptance

- Browser tests: tooltip content on a subtask with a finding and on a late transport, hidden during a drag, own content; now line at a fixed instant. No existing baseline moves.

## Comments

**Delivered.**

- Tooltip: a DOM element in the plot (`role="tooltip"`, `data-schedule-tooltip`)
  beside the resting pointer, on the side with more room; shown only while no
  press, pan, pinch or drag is in flight. The scene publishes a
  `ScheduleTooltipTarget` - subtask with its task, the subtasks it overlaps and
  its late transports, or transport with its task, both ends and its finding.
  Default content in `ScheduleTooltip.tsx`; `tooltip={false}` or a render
  function. Wording in core: `scheduleSetup`, `scheduleTeardown`,
  `scheduleTransport`, `scheduleRoute`, `scheduleOverlapWith`,
  `scheduleLateBy`, English and German; durations through the existing
  `hoursShort`/`minutesShort`.
- Now line: `now` (`true` reads the clock at mount and once a minute; a number
  fixes it). Drawn on the data canvas above the grid and beneath the work, two
  pixels in the accent colour, with a mark in the time band (`data-now`).
- Examples `Schedule/06-now-line`, `Schedule/07-own-tooltip`; four new
  pictures. Browser tests: subtask tooltip with parts and both findings,
  transport tooltip, own content, the tooltip gone during a drag, the now line
  at the frozen 10:30. 121 green; no existing picture moved.
- Keyboard access to the tooltip stays with the accessibility spec.
