# 03 — The companion and the building blocks

Status: done

Spec: `.scratch/tree-view/spec.md`
Blocked by: 02

## Scope

The tree becomes something you can see and operate. No search interface and no
virtualisation yet — those are issue 05.

- **A stateful companion hook.** It holds the expanded keys, the checked keys,
  the active key and the search term, calls the model, and returns the flattening
  together with the gestures. Every gesture is one of the model's pure
  transitions applied to its own state; the hook contains no logic of its own.
  Each of the four state values can also be supplied and controlled from outside,
  so a tree can be restored from a URL or a saved view.
- **Compositional rendering pieces.** The tree renders the row, the indentation,
  the chevron, the checkbox and the accessibility attributes. **What a node says
  is the caller's**, so icons, badges, counts and secondary text stay possible —
  the same reason the table's cells stayed compositional.
- **A flat accessibility structure** (ADR-0004): one item per visible node, each
  declaring its level, its position among its siblings and its sibling count, with
  branches declaring whether they are open. Indentation is a computed offset from
  the level, never nesting.
- **Keyboard**, following the house rule for lists and grids: roving tabindex with
  exactly one focusable item, which is the active node. Down and up move by the
  flattening. Right opens a closed branch and steps into an open one. Left closes
  an open branch and steps out of a closed one. Home and End reach the ends. Enter
  activates and reports it to the caller. Space toggles the check.
- **The active node is visibly marked, and marked differently from a checked
  one.** Two different states must not share one appearance.
- **The existing checkbox**, wired to the checked and indeterminate values from
  the flattening. It already supports the indeterminate state; do not build a
  second one.
- **A branch with no children is distinguishable from an unopened branch**, so a
  user does not click at something that will never open.
- Appearance follows the house style: ink on paper, the single accent reserved
  for interactive state, edges as shadows rather than borders, and motion that is
  disabled under reduced motion.

## Acceptance

- A React Testing Library test covering the keyboard, following the radio group's
  test as prior art:
  - exactly one item is reachable by Tab, and it is the active node;
  - leaving the tree and returning restores the same item;
  - each arrow key does both of its jobs — right opens then steps in, left closes
    then steps out;
  - down and up skip a closed branch's contents;
  - Enter reports activation and does not change the checked set;
  - Space changes the checked set and does not move the active node.
- The same test asserts the accessibility attributes on a rendered node: its
  level, its position, its sibling count, and, on a branch, whether it is open.
- Checked, unchecked and indeterminate branches each render the checkbox in the
  matching state.
- A branch with an empty child list renders differently from a closed branch that
  has contents.
- Node content supplied by the caller renders inside the row.
- No existing screenshot baseline moves.

## Notes

The hook is meant to be boring. If a piece of logic wants to live in it, that is
a sign the model is missing a transition — put it there instead, where it can be
tested without mounting anything.

The two-jobs arrow keys are the part most likely to be got wrong, and wrong in a
way that feels almost right: opening a branch and stepping into it are one key
press apart, and an implementation that does both at once is a common mistake
that makes the tree impossible to inspect without expanding it.

Do not let indentation come from nesting even as a shortcut. ADR-0004 is the
reason, issue 05 is when it would bite, and by then the markup would be hard to
unpick.
