# 03 - Drawer

Status: done
Type: task

Spec: `.scratch/core-foundations/spec.md`

## Scope

F3, built on Modal's dialog; motion from the edge it enters by (visuelle-wertigkeit 02).

## Acceptance

- Focus trap, Escape, focus return, reduced motion; screenshots.

## Comments

Delivered as `Drawer` in `src/components/Modal`: Modal and Drawer now share one internal `DialogFrame` (choreography, backdrop, name); the drawer's sheet stands full height at `side` and enters from that edge on `--u-duration-medium`, leaving as the modal does. Width is the new token `--u-drawer-width`. Tests: `tests-unit/drawer.test.tsx`; focus trap, Escape, focus return and reduced motion in `features-basics.spec.ts`; the open drawer photographed at both edges outside the example loop.
