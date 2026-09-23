# 11 - Change detection

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 12, Q10)

## Scope

- `calendar` compared by content (intervals), not by reference.
- `fnEqual`: where the source text is `[native code]`, compare by identity.
- The closure limit (two functions with the same source but different captured values count as equal) documented at `tickFormat`, `render` and the accessors, and in `capabilities.md` - not solved.

## Acceptance

- Unit tests (scene) first: an inline calendar array does not re-materialise; swapping two bound `Intl.NumberFormat#format` updates the ticks.
