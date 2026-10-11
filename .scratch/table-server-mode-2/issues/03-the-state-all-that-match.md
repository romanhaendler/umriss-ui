# 03 - The selection as a state: all that match, except these

Status: ready-for-agent
Type: task
Size: M

Blocked by: 01
Spec: `.scratch/table-server-mode-2/spec.md`, "Selecting all that match (T2)"

## What to build

`TableSelection` gains `allMatching`, `except` and `selectMatching()`;
`useTableSelection` builds them. With `allMatching`, `isSelected(id)` is
`!except.has(id)`, `toggle` puts a key into `except` or takes it out,
`toggleAll` and `clear` end the state, `selected` is empty, `count` counts the
keys in `selected`. With it false nothing differs from today.

In `useTable`, after the commit, a change of `search` or `conditions` (not of
sort, page or page size) calls `selection.clear()` while the state stands. This
holds for a selection handed in as `selection`. In automatic mode the state is
ignored and DEV warns once if it arrives.

## Acceptance

- [ ] Pure tests of the arithmetic: select all, untick, tick again, clear.
- [ ] A change of search or conditions clears the state and the keys; a change
      of sort, page or page size keeps both - for the table's own selection and
      for one from `useTableSelection` held outside.
- [ ] `useTableSelection.test.ts` passes unchanged for the old members.
- [ ] A type test: the new members are required on `TableSelection`.
- [ ] The README's section on holding the selection outside says to store
      `allMatching` and `except` with the keys.
