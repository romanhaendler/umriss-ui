# 03 — Tracer: `childRows` shows a tree that folds open

Status: done
Type: task

Blocked by: none
Spec: `.scratch/table-tree-rows/spec.md` ("The rows and their children", "The fold and the row header", "Read mode", "Wording") · ADR-0004, ADR-0017

## What to build

`useTable(rows, { rowKey, childRows })` shows the roots; a **Branch** has a fold
in its **Row header** that opens its children beneath it, indented by level as
in `TreeView`; a **Leaf** keeps the fold's space empty so the labels of one level
align. The flattening comes from core's tree model, never a second walk. The
snapshot carries `branches` (the open keys, default none) and
`toggleBranch(key)`. The fold looks and moves as the group fold of the same
table; branches stay otherwise neutral until ticket 09 gives them their form.

The fold is a button with `aria-expanded`, named from new wording
`unfoldBranch(row)` / `foldBranch(row)` - distinct from the row detail
expander's name. In read mode the row header carries the level as visually
hidden text (`treeLevel`). Right opens, Left closes or moves to the parent's
fold. Development warnings: a key that occurs twice on any levels (core's
`duplicateKey`), no row header column (the first visible column carries the tree).

## Acceptance criteria

- [ ] Roots show; a fold opens and closes the next level; an empty branch has no fold.
- [ ] Leaves and branches of one level start their labels on one vertical.
- [ ] A pinned row header keeps its indent; reduced motion switches the fold without turning.
- [ ] Fold and row detail expander on one row have different accessible names.
- [ ] The level is read once per row in read mode.
- [ ] A virtualised tree renders only the window and scrolls through open branches.
- [ ] Both warnings appear once in development and never in production.
- [ ] New wording entries in English and German, typed.
- [ ] `childRows` must return the row type (type test).
- [ ] One example on the demo's grouping rubric shows a small tree.

## Comments

**2026-10-01 (agent):** Built as the spec settled it while building: a tree is
a `treegrid` in read mode too, as a grouped table is, so the level is read from
`aria-level` and the `treeLevel` wording was not added. The fold's names read
"Unfold rows under {row}" / "Zeilen unter {row} aufklappen", apart from the
row detail's expander in both languages.
