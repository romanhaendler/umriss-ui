# 02 - Stepper

Status: done
Type: task

Spec: `.scratch/core-layout-extras/spec.md`

## Scope

L2.

## Acceptance

- Roles; screenshots.

## Comments

Delivered as `Stepper` (`src/components/Stepper`): an `<ol>`, `steps` (`label`, `description`, `failed`) and `current`; the steps before `current` done, after it upcoming, past the last all done; a `failed` step stays failed wherever `current` stands. `aria-current="step"` on the current step, every other state a visually hidden word beside the label (new wording keys `stepDone`, `stepUpcoming`, `stepFailed`); the marker says it again as a tick, a number or the cross glyph. Row or column (`orientation`). No keys and no `onSelect`: navigation is the caller's, as L2 says. The failed marker's danger colour stands in the ISA-101 register. The markers are circles (`corner-shape: round`): a small squircle with a tick read as a checkbox to press. Tests: `tests-unit/stepper.test.tsx`; axe and own-base on the page; four examples photographed light and dark, the first under forced colours (the current step an outline in `Highlight` there).
