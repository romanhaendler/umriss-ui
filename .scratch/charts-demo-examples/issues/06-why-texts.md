# 06 - Why texts, and the exception retired

Status: ready-for-agent
Type: task
Blocked by: 01, 02, 03, 04, 05

Spec: `.scratch/charts-demo-examples/spec.md` (Q7)

## Scope

- `demo/why/area.tsx`: the baseline is a channel of its own, never a second series (ADR-0002, R-2.7).
- `demo/why/tooltip.tsx`: the hit is searched per series in its own axis space and compared in pixel space; the crosshair snaps to the point (R-4.6, R-4.7).
- `demo/why/axis.tsx`: the operating-time axis - removed time becomes a gap and a break mark, the axis stays affine (ADR-0001).
- Delete `WITHOUT_AN_EXAMPLE`, its assertion, and the paragraph in `demo/outline.ts`.

## Acceptance

- Smoke test green without any exception list.
