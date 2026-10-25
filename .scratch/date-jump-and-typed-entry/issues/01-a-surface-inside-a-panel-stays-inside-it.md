# 01 - A surface inside a panel stays inside it

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/date-jump-and-typed-entry/spec.md`

## What to build

The prefactor: a Select, a Combobox, a Menu or a Popover opened from inside a Popover's panel belongs to
that panel. The calendar's head (02) puts two Selects into the date panel, and they must work there.

- Start with a failing jsdom test: a Select inside a Popover, opened under a mouse; a pick in its list
  closes the Popover today, because the list is portalled outside the panel and the Popover's outside
  check reads the DOM.
- A pointer-down in a surface opened from inside a panel does not close that panel, at any depth.
- Escape closes only the innermost open surface; the next Escape closes the one around it.
- It holds whether the outer panel portals to the body, to the provider's target, or into a dialog.
- Nothing changes for a Popover with nothing nested: the existing Popover, Menu, Combobox and Select tests
  stay green unchanged.

## Acceptance criteria

- [ ] A jsdom test: a Select inside a Popover, a pick in its own list reaches `onChange` and the Popover
      stays open.
- [ ] A jsdom test: Escape in the nested list closes the list only; a second Escape closes the Popover and
      returns the focus to its trigger.
- [ ] A feature test holds the same inside a Modal, where the panels portal into the dialog.
- [ ] `pnpm check core` and `pnpm test:visual:quick core` pass.
