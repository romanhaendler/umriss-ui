# 02 - Tab stop, active subtask, focus ring

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/schedule-a11y/spec.md`

## Scope

S1, S3; the active subtask drawn as the hover is; pointer and keyboard share it.

## Acceptance

- Interaction tests: Tab in, keys, pointer handover; own-base focus check green.

## Comments

The plot is `tabIndex=0`, `role="application"`, `aria-roledescription` from the wording, the schedule's `ariaLabel`, described by the summary. The active subtask IS the gestures' hover, set by `sceneKeys.ts` (`setKeyboardHover`): drawn with the hover's wash, tooltipped, and handed over - the pointer takes it by moving, the keys' subtask stays when the pointer leaves, and the keys walk on from the pointer's. Focus by keyboard enters at the first subtask in view (a click does not start the walk, `:focus-visible` as in the charts). Escape and blur let go. Space/Enter select through the existing `select` path (onSelectedTaskChange).

The ring is the shared token on a span inside the plot (`.plot:focus-visible > .focusRing`), not on the plot: the plot meets the root's clipped right edge, where an outer ring would be cut. The canon check and the own-base check both pass; the focus guard now lists the plot.

Tests: `keys.test.ts` (scene), `features-keyboard.spec.ts` (Tab in, keys, pointer handover, Space; own-base green over every page).
