# 04 — Checking, end to end

Status: done

Spec: `.scratch/tree-view/spec.md`
Blocked by: 03

## Scope

The cascade already works in the model and the checkbox already renders its three
states. This ticket is about the gestures around them being coherent, and about
the caller getting a useful answer out.

- **Clicking a branch's checkbox cascades**, and every ancestor's checkbox updates
  in the same interaction — including ancestors that are off screen or inside a
  closed branch.
- **The checked set is reported to the caller** as it changes, containing branches
  as well as leaves, so a caller can send a compact answer to a server rather than
  a list of every leaf.
- **Checking and activating stay apart** (ADR-0003). Clicking a node's label
  activates it and checks nothing. Clicking its checkbox checks it and does not
  move the active node. A caller can turn the checkboxes off entirely and be left
  with a tree that only has an active node.
- **A tree with no checkboxes has no checkbox column**, rather than an empty gap
  where one would be.
- The wording for the checkbox's accessible name comes from the wording seam and
  names the node.

## Acceptance

- Clicking a branch checkbox checks every descendant, verified through a closed
  branch — the descendants that were never rendered are in the reported set.
- Checking the last unchecked sibling makes the parent checked, and the change
  reaches the grandparent.
- The reported set contains branches as well as leaves.
- Clicking a label activates without checking; clicking a checkbox checks without
  activating.
- With checkboxes turned off, no checkbox is rendered and no space is reserved for
  one.
- No existing screenshot baseline moves.

## Notes

The valuable test here is the one through a closed branch. Everything visible is
easy to get right; the cascade's whole point is that it reaches what the user
cannot see, and an implementation that walks the flattening instead of the tree
will pass every test that only looks at open branches.

Resist adding a "check only leaves" mode. It is a reasonable thing to want and it
is a different component: it changes what the checked set means, which is the one
thing ADR-0003 fixes.
