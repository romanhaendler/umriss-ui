# 01 — The scene divided

Status: done
Type: task

Spec: `.scratch/schedule-refinement/spec.md` (user story 52, "Scene division")

## Scope

- Split the scene into registration and data, view and layout, drawing, gestures; the scene composes them and keeps its public surface.
- No behaviour change.

## Acceptance

- Every existing unit and browser test of the schedule green without being touched; no baseline moves.

## Comments

**Delivered.** `scene.ts` (composition, selection, snapshot, binding, frame),
`sceneData.ts` (registrations and derived data), `sceneView.ts` (domain,
scroll, size, layout, bands, hit), `sceneDraw.ts` (both canvases as functions
over a `DrawInput`), `sceneGestures.ts` (pointer, wheel, pinch, ghost, intents,
talking to the scene through `GestureHost`). No test touched: 82 unit, 110
browser tests green, no baseline moved.
