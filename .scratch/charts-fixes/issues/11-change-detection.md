# 11 - Change detection

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 12, Q10)

## Scope

- `calendar` compared by content (intervals), not by reference.
- `fnEqual`: where the source text is `[native code]`, compare by identity.
- The closure limit (two functions with the same source but different captured values count as equal) documented at `tickFormat`, `render` and the accessors, and in `capabilities.md` - not solved.

## Acceptance

- Unit tests (scene) first: an inline calendar array does not re-materialise; swapping two bound `Intl.NumberFormat#format` updates the ticks.

## Delivery

Finding confirmed on both counts; both tests failed first.

- `sceneLimitsAndBands.test.ts`: an axis updated with a copy of its calendar
  dropped the materialised series. `scene.ts` `updateAxis` compares the
  calendar by its intervals (`calendarEqual`).
- `sceneFrame.jsdom.test.ts`: swapping one bound `Intl.NumberFormat#format`
  for another left the ticks reading "10,000%". `fnEqual` compares a function
  whose text contains `[native code]` by identity - for accessors, `tickFormat`
  and the tooltip's `render` alike, since all go through it.

The closure limit is documented, not solved: at the `Accessor` type (every
series' accessor), at `XAxis`/`YAxis` `accessor` and `tickFormat`, at
`Tooltip.render`, in the scene's header comment, and in `capabilities.md`
(a row under materialisation and a point under "Deliberately open"). No
picture affected.
