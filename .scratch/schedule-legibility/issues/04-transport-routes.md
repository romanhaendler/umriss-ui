# 04 — Routes and anchors of the transports

Status: ready-for-agent
Type: task

Blocked by: 02
Spec: `.scratch/schedule-legibility/spec.md` (user stories 9–16, "Transport routes")

## Scope

- `route`: curve, straight, orthogonal. `anchor`: centre, nearest (the corner facing the other stop).
- Options of the schedule, overridable per transport; the hit follows the drawn polyline.
- The findings do not move: `leaves`/`arrives` decide lateness, `route`/`anchor` only the drawing.

## Acceptance

- Unit tests of the geometry (a stop above, below, in the same lane; the polyline of the hit); browser tests through the examples; own pictures.

## Comments
