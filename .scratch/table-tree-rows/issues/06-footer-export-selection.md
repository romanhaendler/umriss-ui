# 06 — Footer over the roots, export with the level, selection

Status: done
Type: task

Blocked by: 05
Spec: `.scratch/table-tree-rows/spec.md` ("Footer and export", "Selection")

## What to build

A column's footer aggregate counts each figure once: it runs over the roots that
match or carry a match, never over every row, and its tooltip says so
(`footerTopLevel`). `asCsv` and `Export` write every row of the filtered tree in
reading order, open or not, path rows included, with a first column from the
wording (`levelColumn`), 1 for a root. Selection stays flat: any row on any
level is ticked on its own, and "all" means the filtered set.

## Acceptance criteria

- [ ] A sum footer over a tree equals the sum of the shown roots.
- [ ] The footer tooltip names the top level.
- [ ] The CSV has the level column and every row of the filtered tree, closed branches included.
- [ ] Select all ticks the matches on all levels and no path row.
- [ ] Glossary entry **Filtered set** names the footer's exception.
