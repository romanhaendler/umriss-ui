# 04 - The time fields under a finger

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/under-a-finger/issues/03-the-floor-check-and-cores-targets.md`
Spec: `.scratch/date-jump-and-typed-entry/spec.md`

## What to build

On an iPhone, `0930` typed into the DateTimePicker's time fields gives 09:30, and the fields show no
target below 24 px.

- **The digits.** A time field takes each typed digit itself, independent of the caret and the selection:
  - the first digit after the field gains focus replaces the value;
  - the second completes it and moves on to the next field, as today;
  - Backspace, the arrow keys and the clamp on leaving behave as today;
  - the two-character limit goes, since it is what blocks a digit once a touch has undone the selection.
- **The arrows.** Under `pointer: coarse` they are hidden by CSS; the markup stays one. Under a fine
  pointer they stay, with their hold repetition.
- **The floor check.** Its open list loses the time-field entries, so core's run of it has none left.

Reproduce first: a feature test that launches WebKit under touch, as the calculation's density suite
launches WebKit, taps the hour field and types `0930`. If emulation does not lose the selection, a jsdom
test that collapses the selection after focus stands in for it, and the WebKit test stays as the
regression guard.

## Acceptance criteria

- [ ] A test that fails before the change: `0930` in the hour and minute fields gives 09:30 (in WebKit
      under touch, or the jsdom stand-in named above).
- [ ] The existing time-field tests ("Enter in the time field" and the others) pass unchanged.
- [ ] Under a fine pointer the arrows are drawn and work as before; under `hasTouch` they are not shown.
- [ ] Core's floor check is green with an empty open list.
- [ ] `pnpm check core` and `pnpm test:visual:quick core` pass.
