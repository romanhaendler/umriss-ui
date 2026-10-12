# 22 - Walking a large tree

Status: ready-for-agent
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
