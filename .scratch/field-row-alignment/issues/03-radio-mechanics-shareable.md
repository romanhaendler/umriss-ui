# 03 — Prefactor: the radio mechanics can be shared

Status: done

Blocked by: None (can start immediately)

Spec: `.scratch/field-row-alignment/spec.md`

## What to build

The radio group's behaviour becomes usable by a second component that draws
differently: real radio inputs; one tab stop that sits on the chosen option, or
on the first selectable one; arrow keys that move and choose, skip disabled
options and wrap; controlled and uncontrolled; the surrounding `FormField`'s
id, description, required and invalid state on the group. The radio group
draws and behaves exactly as before. One behaviour in one place - the
segmented control (04) builds on it rather than copying it.

## Acceptance criteria

- [x] The radio mechanics are reachable from another core component without going through the radio group's drawing
- [x] Nothing about it is exported from the package
- [x] Every existing radio group test passes without being changed
- [x] The radio group's screenshots are unchanged
- [x] Lint, types, unit, build and visual pass

## Comments

Delivered. `useRadioGroup` beside the radio group holds the tab stop, the
arrow keys, controlled and uncontrolled, the field's wiring and the option
ids; it hands back the group's attributes, its key handler, its ref and each
option's input attributes. The ref is merged in the JSX, as before - the
hooks lint refuses a ref passed to a function in a hook's render. The radio
group's 23 unit tests pass unchanged, its screenshots are pixel-equal.
