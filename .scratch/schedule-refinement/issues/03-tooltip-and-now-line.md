# 03 — Tooltip and now line

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 1–8, 26–29)

## Scope

- DOM tooltip for subtasks and transports with default content from wording and formats; `tooltip={false}` or a render function; hidden during drags; clamped and flipped.
- `now`: `true` follows the clock by the minute, a number fixes it; off by default.

## Acceptance

- Browser tests: tooltip content on a subtask with a finding and on a late transport, hidden during a drag, own content; now line at a fixed instant. No existing baseline moves.

## Comments
