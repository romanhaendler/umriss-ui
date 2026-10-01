# 02 — core: the tree model takes a match predicate

Status: done
Type: task

Blocked by: none
Spec: `.scratch/table-tree-rows/spec.md` ("One seam in core")

## What to build

Core's tree model matches a search by the node's label alone; the table matches
by its columns and filters. The node reader gains an optional `matches(node)`:
when given, it decides whether a node matches, and the search text only decides
whether a search runs at all. The path rule (a match comes with its path, a
branch shown for a descendant is open without writing the expanded state) is
unchanged. Additive - `TreeView` and `useTree` behave as before.

## Acceptance criteria

- [ ] With `matches`, the predicate decides the match; the label is not read for it.
- [ ] Path-only entries, positions and sibling counts follow the predicate's matches.
- [ ] Without `matches`, every existing tree model test passes unchanged.
- [ ] Tests stand beside the existing search tests of the tree model.
- [ ] Core changelog entry (minor).
