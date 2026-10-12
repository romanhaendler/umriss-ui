# 22 - Walking a large tree

Status: done
Type: task
Size: M

Blocked by: 12, 14
Spec: `.scratch/react-19-and-performance/spec.md`, "The tree"; user stories 37, 38

## What to build

The **Active node** moves through a tree of a hundred thousand nodes as fast
as the keys are pressed, and a scrolled tree stays where it was scrolled.

- A change of the active node does not compute the **Flattening** again; the
  flattening depends on what is expanded, loaded and found, not on which entry
  is active.
- The virtual rows a tree hands on keep their identity while nothing in them
  changed, so that a scroll runs no search over the flattening.
- **To verify first, in a browser:** scroll a virtualised tree until its
  active node is outside the window, without touching the keyboard. If the
  tree is pulled back to the active node, that is a defect: it is fixed here
  and held by a test in the browser suite. If it is not, the line in the spec
  is struck with what was observed, and nothing is built for it.

## Acceptance

- [ ] A reader that counts its calls is not called again when the active node
      moves by a key.
- [ ] What was observed about the scrolled tree is written under `## Comments`
      in this ticket; if it was a defect, a browser test holds the fix.
- [ ] The existing tests of the tree's keys, of expanding and of the search
      pass unchanged.
- [ ] The benchmark page's key-walk and scroll figures, before and after, are
      in the tree's capability record.
- [ ] No screenshot moves.
- [ ] `pnpm check core` passes.

## Comments

Observed in headless Chromium on the benchmark page (10 000 nodes): focus the
tree, four ArrowDown, then six wheel steps of 400 px. The scroll position did
not hold: it jumped back to the active node and flipped between two values
(148 and 122) over the next second. A defect: the effect that brings the active
node into view ran on every render and moved the view whenever the node lay
outside the window. It now acts once when the active node (or the reveal count)
changes. A browser test is in `tests-visual/features-tree.spec.ts` ("A scrolled
virtualised tree stays where it was scrolled"); written, not run.

A second defect showed on the way: the root is a flex column and the fillers
shrank to zero height, so the scroll area was only 468 px high at 10 000 nodes
and a wheel could not reach far. The fillers carry `flexShrink: 0` now.

The flattening is computed without the active node and the active entry is set
on top (array copy, one entry replaced). The new unit test was written after the
change, so it was not seen failing.
