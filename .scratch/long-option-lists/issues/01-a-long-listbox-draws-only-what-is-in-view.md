# 01 - A long listbox draws only what is in view

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/root-contract/issues/03-core-the-pickers-are-fields-and-the-name-is-aria-label.md`
Spec: `.scratch/long-option-lists/spec.md`

## What to build

The tracer bullet: a Combobox of 10,000 cost centres opens at once and types without a stall, and a Select's
own list of the same length does too. The ticket waits for the root contract's ticket 03, which reworks the
Combobox's root, ref and pass-through in the same file.

- **The threshold.** One internal constant, 500: a list longer than that is windowed; a shorter one is drawn
  whole, as today.
- **The windowed list** is a component of the shared listbox that mounts inside the panel with its scroll
  element and draws its window through `useVirtual`, with presentational filler rows before and after.
  `useVirtual` itself does not change.
- **The active option**:
  - is always drawn: the window widens to hold it, so `aria-activedescendant` never names a missing element;
  - is brought into view through the hook's `showRow`, on the keys and on opening.
- **Positions.** Each drawn option carries `aria-setsize` and `aria-posinset` (from 1).
- **Unchanged.** A grouped list (the Select's optgroups) is drawn whole. Pointer hover, click, the check on
  the chosen option and the listbox announcements behave as today.
- **The Combobox page** gains an example with a few thousand generated options, its lead naming the
  threshold.

## Acceptance criteria

- [ ] jsdom tests: a Combobox with 10,000 options opens with far fewer than 10,000 options in the DOM; End
      makes the last option active and drawn, with `aria-posinset` and `aria-setsize` 10,000, and
      `aria-activedescendant` names it; typing filters and the window follows; Enter chooses the active
      option.
- [ ] A jsdom test: a Combobox with 500 options draws all 500.
- [ ] A jsdom test: a Select's own list of 10,000 options is windowed the same way; a grouped one is drawn
      whole.
- [ ] A `@quick` check in core: the Combobox example opens with fewer than 100 options in the DOM, and the
      list scrolls to its last option.
- [ ] The existing Combobox, Select and listbox announcement tests pass unchanged.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core` pass.
- [ ] Core's changelog lists the window under "Changed".
