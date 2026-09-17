# 02 — The tree model

Status: done

Spec: `.scratch/tree-view/spec.md`
Blocked by: 01

## Scope

The heart of the work. Everything genuinely hard about a tree lives here, and
none of it needs a browser. Read ADR-0003 and ADR-0004 before starting.

- **A pure model module.** It takes the roots, a reader and a state, and returns
  the **flattening**: the visible nodes in reading order.
  - The reader says how to read a node's key, its children and its label. It is
    supplied once, not per node, and the node type stays entirely the caller's.
  - The state carries the expanded keys, the checked keys, the active key and the
    search term.
  - Each entry in the flattening carries the node, its key, its **level**, whether
    it is a branch, whether it is expanded, whether it is checked, whether it is
    **indeterminate**, whether it matched the search or is present only as an
    ancestor of a match, its position among its siblings and its sibling count.
- **The state transitions, as pure functions in the same module.** Expand,
  collapse, toggle a check, and move the active node in each keyboard direction.
  Each takes a state and returns a new one. They belong here and not in a hook,
  and that is what keeps this work package down to one seam.
- **The cascade.** Toggling a check adds or removes every descendant, then
  recomputes every ancestor: checked when all its children are checked, unchecked
  otherwise. **Indeterminate is derived while the flattening is built and never
  stored** — a branch is indeterminate when it is not itself checked and at least
  one descendant is.
- **Search.** A node survives if it matches or if any descendant matches, so a
  match always appears with the path leading to it. Matching is case-insensitive
  on a trimmed term against the label the reader supplies. While a search is
  active a branch with a surviving descendant is treated as open **without the
  expansion state being written to**.
- **Sibling counts against what survives the filter** — not against the whole
  tree, and not against what happens to be rendered.
- **A duplicate key is a development-time invariant**, not a silent merge.

## Acceptance

Unit tests against the model and its transitions, with a small purpose-built
tree deep enough to have grandchildren and wide enough for sibling counts to
matter. Cover, in this order:

- **The cascade.** Checking a branch checks every descendant, including
  grandchildren. Unchecking is symmetrical. Checking the last unchecked child of
  a branch makes the branch checked, and that reconciliation carries all the way
  up. The checked set contains branches as well as leaves.
- **Indeterminate.** A branch with some but not all descendants checked is
  indeterminate and is not checked. A branch with all descendants checked is
  checked and not indeterminate. A branch with none is neither. The state is
  recomputed from the descendants and cannot be set directly.
- **Search with ancestors.** A match several levels deep, under branches that are
  all closed, appears together with every ancestor on its path. Those ancestors
  are marked as non-matching. A branch matching itself brings its children only if
  it is expanded.
- **Search leaves expansion alone.** Search, assert the flattening opened up,
  clear the search, and assert the flattening is identical to what it was before —
  the same nodes, in the same order, with the same expansion.
- **Sibling counts under a filter.** With a filter hiding two of four siblings,
  the survivors report a sibling count of two and positions one and two. This is
  the obligation ADR-0004 creates and the thing most likely to be got quietly
  wrong.
- **Levels.** Roots at level zero, and a grandchild at level two.
- **The flattening order** is reading order, and a closed branch contributes
  itself and nothing below it.
- **Every keyboard transition**, as a pure state change:
  - down and up move by the flattening, so a closed branch's contents are skipped;
  - right opens a closed branch, and steps to the first child of an open one;
  - left closes an open branch, and steps to the parent of a closed one;
  - left on a root that is already closed does nothing;
  - right on a leaf does nothing;
  - Home and End reach the ends of the flattening;
  - moving the active node changes nothing but the active node.
- **Edge cases**: an empty tree, a branch with an empty child list (which is a
  branch, not a leaf, and must be distinguishable from an unopened one), an active
  key that no longer exists, and an expanded key for a node that has gone.

## Notes

Write the tests first. This is the ticket where that discipline pays, because
almost every rule here is one that looks right when it is wrong: a cascade that
forgets grandchildren still cascades, an indeterminate state that is stored still
displays, sibling counts taken from the unfiltered tree are only wrong while a
filter is active, and a search that quietly expands branches is only wrong once
the user clears it.

The flattening is the component's real data structure. Everything after this
ticket reads that list and nothing walks the tree — keep it that way, and resist
adding a second traversal anywhere downstream.

Derive indeterminate as the flattening is built rather than in a separate pass.
A second pass is a second place for the rule to live.
