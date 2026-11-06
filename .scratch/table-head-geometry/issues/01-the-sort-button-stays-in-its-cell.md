# 01 - The sort button stays in its cell

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/table-head-geometry/spec.md` (Implementation Decisions, first point; Testing Decisions, "A head-geometry check over every example")

## What to build

A keyboard user who tabs to a head sees its focus ring whole and inside that
head; a pointer user who clicks near a boundary sorts the column aimed at.
Today the sort button reaches 4 px into each neighbouring head: its margin and
padding are a larger step than the cell's padding.

The ticket also lays the seam every later ticket of the spec extends: a check
in the table's visual suite that walks every example of the demo (derived
from the example files, like the screenshot suite), drives every sortable
head ascending and descending, then all of them into one multi-sort with
ranks, then narrows every resizable column to its least width - and after
each step measures every head. In this ticket it asserts one rule: the sort
button's box inside its cell. A failure names the example, the state, the
head and the distance in pixels.

The probe in `.scratch/table-head-geometry/probe/heads.spec.ts` is a draft of
the sweep; it measures more than this ticket asserts.

## Acceptance criteria

- [ ] In every example and every state the check reaches, every sort button ends at its cell's edges (tolerance 0.5 px), the first and the last cell included.
- [ ] Under the keyboard (`:focus-visible`) the focus ring of a head is whole on all four sides; looked at in a screenshot of a tight right-aligned head and of a head beside a pinned edge.
- [ ] The check is derived from the example files: a new example is walked without being added anywhere.
- [ ] Before the fix, the check fails on the current `main` (130 examples in the probe); after it, it passes in Chromium and WebKit.
- [ ] Screenshot baselines that move are each looked at before they are rebuilt.
- [ ] `pnpm check table` and the table's quick visual tests pass.
