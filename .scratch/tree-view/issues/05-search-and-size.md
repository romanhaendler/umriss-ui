# 05 — Search, and trees too big to render

Status: done

Spec: `.scratch/tree-view/spec.md`
Blocked by: 01, 03

## Scope

The second ring: the two things the tree inherits from the table rather than
invents.

- **Search in the interface.** A term narrows the tree to matches and the paths
  leading to them. The rules are already in the model — this ticket is the input,
  the empty state when nothing matches, and the visual treatment.
- **Ancestors kept only for the path are muted**, so the real matches stay
  legible. The flattening already says which is which.
- **Clearing the search restores the tree exactly** — the same branches open, the
  same node active. The model guarantees it; assert it through the interface.
- **Virtualisation, connected.** Use the module issue 01 moved, unchanged. Once
  flattened, a tree is a list of uniform-height rows, which is what that module
  already serves. Do not write a second implementation and do not fork it.
- **The sibling counts stay correct** while only part of the tree is rendered and
  while a search is narrowing it. This is the obligation ADR-0004 creates; the
  counts come from the flattening, never from what is in the document.
- **Virtualisation is opt-in**, off by default. A tree of thirty nodes should not
  pay for machinery it does not need, and a caller who has not asked for it should
  not have to reason about row heights.

## Acceptance

- A search for a term that only matches deep under closed branches shows the match
  with its whole path, without the expansion state changing.
- Clearing the search returns the tree to exactly its previous shape.
- A search matching nothing shows the empty state rather than an empty box.
- Ancestors present only for the path are visually distinguishable from matches.
- With virtualisation on and a large tree, only a window of rows is in the
  document, and scrolling brings the rest.
- With virtualisation on, a node's reported position and sibling count are the
  same as they are with it off. Assert this directly: it is the one place where
  the two features can silently contradict each other.
- Keyboard movement still reaches nodes outside the rendered window, and moving to
  one scrolls it into view.
- The moved virtualisation tests from issue 01 remain untouched and green.
- No existing screenshot baseline moves.

## Notes

The two features in this ticket are together because they interact, not because
they are alike. Search changes what the flattening contains; virtualisation
changes how much of it reaches the document. The failure mode is the intersection:
counts taken from what is rendered look right until a filter is active, and look
right under a filter until virtualisation is on. Test the intersection, not the
two features side by side.

Keyboard movement into an unrendered node is the other intersection worth care.
The active node is a key, not an element; moving to a key that is not currently in
the document has to scroll it in and then focus it, in that order.
