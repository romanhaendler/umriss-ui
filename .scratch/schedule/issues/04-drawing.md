# 04 — The schedule drawn: lanes, subtasks, transports, findings, both bands

Status: ready-for-agent
Type: task

Blocked by: 03
Spec: user stories 1–8, 23, 28, 30, 31 · "Rendering"

## Scope

- `Schedule` with `Lane`, `Subtasks` and `Transports` as children that render
  nothing and register; drawing order is registration order.
- Canvas for subtasks (main time, setup and teardown distinguishable),
  transports (end to start, per the anchors) and findings (offset, marked);
  coordinates on whole device pixels.
- DOM: lane headers (real text), the day band above, the adaptive time band
  below; the root carries the accessible name; the canvas is hidden from
  assistive technology.
- Colours through charts' resolution: the task colours are the caller's, the
  rest are core tokens; `color-scheme` switches redraw.

## Acceptance

- The demo's first pages show it; screenshots are new baselines.

## Comments
