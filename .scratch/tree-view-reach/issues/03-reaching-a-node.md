# 03 — Reaching a node

Status: done

Spec: `.scratch/tree-view-reach/spec.md`
Blocked by: 02

## Scope

Two gestures the application cannot perform today without walking the tree
itself — which is the work the model exists to do.

- **Show a node, by key.** It expands what is loaded along the path to that node,
  brings the row into view when virtualised, and puts the keyboard on it.
- **It reports how far it got**: the target when it succeeded, the unloaded branch
  where it stopped, or nothing when the key is not in the data at all. That report
  is the signal the caller needs to fetch that branch and call again — the same
  loop it already runs for expansion.
- **Open everything and close everything.** Over loaded, non-empty branches only.
  **Opening never triggers loading**: a branch with unloaded children stays closed.
- The path walk and the expansion are pure functions of the model; only bringing
  the row into view and moving the keyboard belong to the companion.

## Acceptance

- Unit tests for the path walk: the path to a root, to a grandchild, to a key that
  does not exist, and to a key below an unloaded branch.
- Unit tests for showing a node: it expands every loaded ancestor and touches
  nothing else — not the checked set, not the search.
- Unit tests for the reported stopping point in all three cases: reached,
  stopped at an unloaded branch, key unknown.
- Unit tests for opening everything: every loaded non-empty branch is open; a
  branch with unloaded children is **not**; nothing is reported as loaded that was
  not; empty branches stay closed because opening them would show nothing.
- Closing everything leaves nothing open, including branches that a search had
  forced open — closing is about the expansion state, and a search never wrote to
  it.
- In a browser, with virtualisation on: showing a node that is outside the
  rendered window scrolls it in and focuses it. This is the case jsdom cannot
  prove, and it is the reason the gesture exists.
- No existing screenshot baseline moves.

## Notes

The reported stopping point is the whole design. Without it the caller cannot
tell "your node is not in this tree" from "your node is under a branch you have
not loaded", and those need opposite responses.

Do not let showing a node trigger loading, and do not let it wait for anything. It
is synchronous, it does what it can, it says what it did. The caller composes the
loop. This is the same boundary ADR-0005 draws for expansion, for the same reason.

The interaction between showing a node and virtualisation is already solved once,
in the effect that follows the active node — reuse that path rather than adding a
second one. Note that it was got wrong the first time by putting the scroll behind
the focus guard; scrolling and focusing are two things and only the second depends
on the tree having focus.
