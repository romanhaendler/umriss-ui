# 01 — The virtualisation moves out of the table

Status: done

Spec: `.scratch/tree-view/spec.md`

## Scope

The enabling change, and the only one in this work package that touches existing
code. It adds nothing and changes no behaviour.

- Move the window arithmetic — which rows are rendered at a given scroll
  position, and the two filler heights that keep the scrollbar honest — out of
  the table's folder and into the shared library folder, together with the hook
  that drives it.
- Move its unit test file with it, unchanged.
- Keep every existing public export of the package working from exactly the same
  import path as before. A consumer must not be able to tell this happened.

## Acceptance

- **The moved unit tests pass unchanged.** Not adapted, not re-written: the same
  assertions, green. That is the proof the move was behaviour-preserving.
- **No screenshot baseline moves**, in either theme.
- The table's interaction tests, including the virtual-table ones, pass unchanged.
- The package's public exports are identical before and after — same names, same
  paths.
- Nothing in the table's own modules is edited beyond the import lines that
  follow the move.

## Notes

Do this first and land it on its own. It is the one change in this package that
could break something that already works, and it is far easier to review against
an unmoved set of baselines than tangled up with a new component.

The reason for the move is a second consumer, not tidiness. The arithmetic is
index-based and knows nothing about tables — it takes a count, a row height, a
scroll position and a viewport height. A tree, once flattened, is a list of
uniform-height rows, which is exactly what it already serves.

The handoff's standing rule is that every work package is additive and nothing
existing may get worse. A move is not additive in the letter, so hold it to the
spirit instead: identical exports, identical behaviour, identical pixels. If any
of the three is in doubt, the fallback is to leave the module where it is and
have the tree import it from there — worse, but honest.
