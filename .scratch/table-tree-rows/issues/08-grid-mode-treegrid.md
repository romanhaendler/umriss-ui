# 08 — Grid mode as a tree grid

Status: done
Type: task

Blocked by: 03
Spec: `.scratch/table-tree-rows/spec.md` ("Grid mode") · ADR-0034, ADR-0036

## What to build

With `grid` and `childRows` the table is a `treegrid`: every row carries its
level (from one), position, set size and on branches whether it is open. The
arrows keep walking the cells; the fold is a control in the row header cell,
reached with Enter and left with Escape like any other, and then answers the
group fold's keys. Editing a cell changes nothing in the hierarchy.

## Acceptance criteria

- [ ] The treegrid attributes are present and right on every row, also virtualised.
- [ ] Arrow keys move between cells in the row header column as elsewhere.
- [ ] Enter reaches the fold, its keys work, Escape returns to the cell.
- [ ] Cell editing on a branch and on a leaf reports as in a flat table.
- [ ] axe passes in read and grid mode.
