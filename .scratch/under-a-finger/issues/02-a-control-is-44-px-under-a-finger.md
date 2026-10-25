# 02 - A control is 44 px under a finger

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-the-adr-under-a-finger.md`
Spec: `.scratch/under-a-finger/spec.md`

## What to build

The tracer bullet. On a phone, a tablet or a touch kiosk, every `md` control of every package is 44 px tall,
with no line of the application's code. A touch laptop with a trackpad and every desktop stay as they are.

- **Core's tokens** get one block under `@media (pointer: coarse)` that sets the `md` control height to
  44 px. It stands beside the phone-width and reduced-motion blocks, in the tokens layer, and its comment
  says why `sm` and `xs` stay (ADR-0070).
- **Nothing else changes:** no padding, icon size or type, and no `sm` or `xs` value.
- **Whatever reads the `md` height follows.** Walk the readers of the token in every package and look at
  each under touch emulation at 375 px and at 1024 × 768:
  - fields, buttons, IconButton, the segmented control, a radio row, a checkbox in a field;
  - the date picker's trigger, the table's `md` toolbar, the dashboard widget's head.

  Fix what breaks, for example a layout that assumed 32 px. If a reader of the token should not grow,
  because it is not a control, give it its own value and say why.
- **Core's changelog**, under "Changed": `md` controls are 44 px under a coarse pointer, with the token line
  that restores 32 for an application that wants it.

## Acceptance criteria

- [ ] Core's sizes suite has an "under a finger" block (`hasTouch`). It asserts that `pointer: coarse`
      matches, that every control on the Sizes page measures 44 px at `md` and 26 at `sm`, and that the
      same page without touch still measures 32 and 26.
- [ ] The table's and the calculation's existing touch measurements (a compact row and line at 35 px) pass
      unchanged.
- [ ] The visual suites of all six demos pass; screenshot changes are limited to touch-emulated tests and
      each is looked at.
- [ ] A screenshot of a form and a dialog under touch, beside the same without, is attached under
      `## Comments` for the maintainer's look.
- [ ] `pnpm check core` and `pnpm check:site` pass.
