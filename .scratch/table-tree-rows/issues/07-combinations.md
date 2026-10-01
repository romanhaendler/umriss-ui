# 07 — Tree rows beside grouping, pagination and manual mode

Status: done
Type: task

Blocked by: 03
Spec: `.scratch/table-tree-rows/spec.md` ("Combinations")

## What to build

Tree rows and **Grouping** both build levels and exclude each other: with
`childRows` the column menu offers no grouping, and a grouping handed in is
passed over with a development warning. Pagination is off with a development
warning - a large tree uses `virtual`. `childRows` is not an option of manual
mode: combining them is a compile error.

## Acceptance criteria

- [ ] No grouping entries in the column menu of a tree; a `defaultGrouping` is ignored with a warning.
- [ ] `Pagination` beside a tree shows nothing and warns once.
- [ ] `childRows` with `manual: true` fails the type test.
- [ ] RowDetail and RowActions work on branches and leaves alike.
