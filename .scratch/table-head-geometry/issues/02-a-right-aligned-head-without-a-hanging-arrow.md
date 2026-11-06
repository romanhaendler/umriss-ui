# 02 - A right-aligned head without a hanging arrow

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-sort-button-stays-in-its-cell.md`
Spec: `.scratch/table-head-geometry/spec.md` (Solution; Implementation Decisions, points two and three; Further Notes, the measurements)

## What to build

A user sorts a column of figures - a `numeric` column, or one whose values are
numbers, such as a time - and sees its sort arrow whole, beside its rank and
its filter funnel, never under the next head, the table's edge or the funnel.
Adding the column as a second sort level, hovering it or sorting it moves
nothing in its head.

The arrow of a right-aligned head stops hanging outside the head's flow: it
keeps its slot, shown or hidden, as in a left-aligned head. The head's parts
keep their order - label, rank, sort arrow, funnel - and the whole group is
set flush right, so that its last part ends where the figures end, in every
state. The label stands in from the figures by the arrow's slot. A sized
column narrower than its head's state needs is raised to it (ADR-0042); the
label gives way with an ellipsis. The comment that claimed the padding was
wider than the arrow goes with the rule.

The check from 01 asserts three more rules for every head, in every state:

- each part (label, rank, sort arrow, funnel) inside the cell's content box,
  vertically inside the cell, and inside every clipping ancestor in which the
  cell stands whole;
- no two parts overlapping;
- a left-aligned head's label starting where its values start; a
  right-aligned head's last part ending where its values end - on the ink of
  the text, skipping text hidden for assistive technology, on a plain row of
  the same table (not a group header, not a nested table). Indents of row
  groups and tree rows and a badge's pill are the cell's own and are not
  compared.

## Acceptance criteria

- [ ] No part of a right-aligned head leaves its content box or the scroll area, in any example and state (96 and 5 examples in the probe).
- [ ] Sort arrow and funnel never overlap (4 examples in the probe).
- [ ] A right-aligned head's last part ends where its figures end (tolerance 0.5 px) unsorted, sorted, ranked, with and without a funnel; its label does not move between those states.
- [ ] A left-aligned head's label starts where its values start, as today.
- [ ] Core's control room ("Watch a kiln line"), sorted by "Raised" and "Acknowledged", shows both arrows whole; looked at in a screenshot.
- [ ] Every moved screenshot baseline - in the table, core, alarms and dashboard demos wherever a right-aligned head stands - is looked at before it is rebuilt.
- [ ] The check passes in Chromium and WebKit; `pnpm check table` passes.
