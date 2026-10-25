# 03 - Core: the pickers are fields, and the name is `aria-label`

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-one-root-contract.md`, `02-the-pass-through-guard-is-shared.md`
Spec: `.scratch/root-contract/spec.md`

## What to build

Core settles the contract for the family.

- **The field shape.** `Combobox`, `MultiSelect`, `DatePicker`, `DateTimePicker`, `DateRangePicker` and
  `DateTimeRangePicker` put class and style on the wrapper, and `ref` and the rest on the control that takes
  the focus: the combobox's input, or the trigger button.
  - Their `RefProp` element types change to match.
  - The clause that takes their `aria-label`, `aria-labelledby` and `aria-describedby` out of the rest is
    deleted.
- **The name.** `TreeView`, `Popover` and `ContextMenu` take `aria-label` instead of `ariaLabel`.
  - `ariaLabel` stays for one further minor as a deprecated alias (`aria-label ?? ariaLabel`), and it warns
    once in development. The warning uses the mechanism that the upgrade-promise spec defines.
  - TreeView's and ContextMenu's names stay required: either spelling satisfies the type for that minor.
  - Every internal use moves in the same change: core's own components, and the table's and the dashboard's
    popovers.
- **The guard.** In core's call of the shared guard, the six components move from "the ref reaches the
  wrapper" to the field shape. A case asserts that `data-testid` on a Combobox reaches the element with
  `role="combobox"`, and that `id` on a DatePicker reaches the trigger.
- **README.**
  - Principle 1 states the four shapes for the family (element, field, composite, no element), as the ADR
    does. It names core's members of each shape and says that the other packages follow it.
  - Principle 6 drops the `ariaLabel` exception: the name is `aria-label` everywhere.
- **Demos and documents.** Every `ariaLabel` on these three components moves, in core's demo and in the
  skill `skills/umriss-ui`. Regenerate `API.md`.
- **Changelog** (Changed):
  - the moved `ref` and rest of the six fields, with their new element types, named as the one change
    that keeps no old form;
  - the `ariaLabel` rename on the three, deprecated, with the release that removes it.

  Each has a migration line.

## Acceptance criteria

- [ ] `render(<Combobox data-testid="city" … />)` followed by `getByTestId('city')` finds the input, and
      typing into it filters the options.
- [ ] A `<label htmlFor="d">` names `<DatePicker id="d" … />`'s trigger.
- [ ] A Combobox's `ref` is an `HTMLInputElement`, and the four pickers' and MultiSelect's are
      `HTMLButtonElement`s. Today's element types are a type error.
- [ ] `<TreeView aria-label="Files">` names the tree.
- [ ] `<TreeView ariaLabel="Files">` still names it, warns once in development, and is marked deprecated
      in its type. No workspace source or demo uses `ariaLabel` on the three components.
- [ ] The guard holds the six fields in the field shape and fails if one puts its rest back on the wrapper.
- [ ] `pnpm check core`, `pnpm check table`, `pnpm check dashboard`, `pnpm typecheck` and `pnpm check:site`
      pass, and `pnpm test:visual:quick core` passes.
- [ ] The changelog carries one migration line per change.
