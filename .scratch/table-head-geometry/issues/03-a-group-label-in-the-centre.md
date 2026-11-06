# 03 - A group label in the centre

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-the-sort-button-stays-in-its-cell.md`
Spec: `.scratch/table-head-geometry/spec.md` (Implementation Decisions, "A group's label is centred in its cell")

## What to build

A `ColumnGroup`'s label stands in the centre of its cell over its columns -
the first and the last group too. Today it is centred in the content box,
which the first and the last cell make asymmetric with their wider outer
padding, and stands 2 px off ("A header over columns", "Q2"; "Groups over
virtual rows", "Week 1").

The check from 01 asserts it: the ink of a group label is centred in its cell
(tolerance 0.5 px), also for each part of a group that pinning splits.

## Acceptance criteria

- [ ] Every group label in every example stands centred in its cell (tolerance 0.5 px), first, middle and last group, split by pinning or not.
- [ ] Moved screenshot baselines are each looked at before they are rebuilt.
- [ ] The check passes in Chromium and WebKit; `pnpm check table` passes.
