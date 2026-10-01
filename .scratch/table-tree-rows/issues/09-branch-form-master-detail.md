# 09 — The branch form from the prototype, and master/detail

Status: ready-for-agent
Type: task

Blocked by: 01, 03
Spec: `.scratch/table-tree-rows/spec.md` ("How a branch looks", "Levels with more fields")

## What to build

Branches get the form the user chose on the prototype (ticket 01); if it departs
from ADR-0029, an ADR records why. A leaf whose row detail holds a table of its
own - the employees of a unit - works as master/detail: the inner table keeps its
own sort, search and export, and its keys stay apart from the tree's.

## Acceptance criteria

- [ ] The chosen form renders as on the prototype, light and dark, compact and regular, forced colours.
- [ ] An ADR exists if the form departs from ADR-0029.
- [ ] A table in a leaf's row detail sorts, searches and exports on its own (rendered test).
- [ ] Visual baselines: five uneven levels, the branch form, a master/detail leaf, a pinned row header.
