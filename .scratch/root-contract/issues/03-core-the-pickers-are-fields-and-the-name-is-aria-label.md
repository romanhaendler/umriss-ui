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
  - TreeView's and ContextMenu's names stay required.
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
- **Changelog** (Changed): migration lines for the moved `ref` and rest of the six fields (with their new
  element types) and for the `ariaLabel` rename on the three.

## Acceptance criteria

- [ ] `render(<Combobox data-testid="city" … />)` followed by `getByTestId('city')` finds the input, and
      typing into it filters the options.
- [ ] A `<label htmlFor="d">` names `<DatePicker id="d" … />`'s trigger.
- [ ] A Combobox's `ref` is an `HTMLInputElement`, and the four pickers' and MultiSelect's are
      `HTMLButtonElement`s. Today's element types are a type error.
- [ ] `ariaLabel` exists nowhere in core's public types. `<TreeView aria-label="Files">` names the tree.
- [ ] The guard holds the six fields in the field shape and fails if one puts its rest back on the wrapper.
- [ ] `pnpm check core`, `pnpm check table`, `pnpm check dashboard`, `pnpm typecheck` and `pnpm check:site`
      pass, and `pnpm test:visual:quick core` passes.
- [ ] The changelog carries one migration line per change.
