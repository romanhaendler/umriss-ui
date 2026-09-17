# 04 — The schedule drawn: lanes, subtasks, transports, findings, both bands

Status: done
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

**Delivered** (d452d68).

- `Schedule`, `Lane`, `Subtasks`, `Transports`; scene in `scene.ts`, pure
  placement in `geometry.ts`. Colours: core tokens and task colours through
  `resolveColours`, redrawn on `subscribeTheme`.
- Positions through `Math.round` before the canvas. The fifty baselines of 07
  passed three consecutive runs.
- Overlapped bars shift down 3 px per level (at most three) and carry an edge in
  the surface colour; the shared time is marked across the lane. Transports are
  cubic curves; a late one is dashed in the danger colour.
- The root is `role="figure"` with the name; canvases `aria-hidden`; both bands
  `aria-hidden` (the times are visual labels); lane headers are text.
