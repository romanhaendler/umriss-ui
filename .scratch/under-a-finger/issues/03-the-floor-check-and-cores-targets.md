# 03 - The 24 px floor: the check, and core's targets on it

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-a-control-is-44-px-under-a-finger.md`
Spec: `.scratch/under-a-finger/spec.md`

## What to build

Under a finger, nothing core draws is a target smaller than 24 × 24 px. A check that every demo can call
proves it.

- **The check, in the demo shell's checks**, on the model of the large-text suite:
  - one function that each package's spec file calls, with the example list derived from the demo's files;
  - it runs under `hasTouch` at 375 px, in Chromium, light only, and asserts first that `pointer: coarse`
    matches;
  - a named list of open findings that is meant to be empty, each entry with its reason and its fix.
- **What counts as a target**, and how it is measured, as the spec's Implementation Decisions say:
  - a 24 px square centred on the target hits it at nine sampled points;
  - a hit inside the target or on its pseudo-element counts;
  - a hidden native input is measured as what the library draws for it;
  - a link inside running text is exempt.
- **Core's spec file** calls the check over core's demo.
- **Overlays.** Core's feature tests also measure, by the same function, an open Menu, a Combobox's list, a
  Select's list under a mouse, the date panel, the CommandPalette and a toast.
- **Fix what the check finds in core.** The known cases are the Tag remove, the NumberInput stepper's
  width, a Checkbox and a Switch outside a field, the TreeView chevron and the Splitter separator.
  - A glyph gets an invisible `::after` pad under `pointer: coarse`, as the clear cross and the stepper
    have, and never towards a neighbour. Side by side, the steppers keep their pads vertical, as their
    comment says.
  - A box that cannot be padded without reaching a neighbour grows under a finger instead.
- **The date picker's time fields** (arrows 13 px high) stay in the open list, with the native-picker spec
  named as their fix.
- **A tap on a TreeView label still selects.** The chevron is the fold.

## Acceptance criteria

- [ ] The check exists in the demo shell, is called by core's spec file, and fails on a target made smaller
      than 24 px on purpose (shown once, then reverted).
- [ ] Core's run of it is green, with the open list holding only the date picker's time-field entries.
- [ ] The overlay measurements pass in core's feature tests.
- [ ] The Tag remove, the stepper, a free Checkbox and Switch, the TreeView chevron and the Splitter
      separator each pass. A test under a fine pointer shows that their drawn size and layout are
      unchanged.
- [ ] `pnpm check core`, `pnpm check demo` and `pnpm test:visual:quick core` pass.
