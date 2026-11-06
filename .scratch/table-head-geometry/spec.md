Status: ready-for-agent
Date:   2026-11-06

# Every head stands whole, and lines up with its column

## Problem Statement

A user sorts the alarm table of a control room by "Raised" and
"Acknowledged" and sees the sort arrow cut in half: the arrow of "Raised"
disappears under the head of "Priority", the arrow of "Acknowledged" runs into
the table's right edge. The head is the one line a user reads before every
other, and a part of it cut at its edge reads as broken.

It is not one column. A probe put every head of every example of the table
demo through every sort state and measured where each part of a head stands
(the measurements are under Further Notes). Left-aligned heads are clean.
Right-aligned heads - a `numeric` column, and every column whose values are
numbers, such as a time - are not:

- their sort arrow hangs past the cell's padding into the next cell, which
  paints over it, or past the table's edge, which cuts it;
- with a column filter, the sort arrow and the filter funnel stand on each
  other;
- what lines up with the figures below changes with the state: the label
  unsorted, the sort arrow 12 px past the figures once sorted, the rank once
  a second sort level is added - the label jumps 11 px to the left on a
  shift-click - and the funnel with a filter.

Every sortable head, left or right, has a sort button 8 px wider than its
cell: under the keyboard its focus ring starts inside the neighbour, and
where the cell is tight its far side lies under the next head.

A `ColumnGroup` has two faults of its own. Its rule is one device pixel wide
at 100 % and 200 %, but at any other zoom - browser zoom, or a display scaled
to 125 or 150 % - the same rule is one device pixel in one place and two
lighter ones in another, sometimes between the head and the body of one
boundary: the user saw "the line partly twice as wide". And the label of the
first and the last group stands 2 px off the centre of its cell.

## Solution

Every part of a head - label, rank, sort arrow, filter funnel, and the focus
ring of its sort button - stands inside its own cell and apart from every
other part, in every sort state and every combination of column options, in
the first, a middle and the last place, pinned or not, at any width the table
allows.

A right-aligned head lines up with its figures by one rule in every state:
the whole head - label, rank, sort arrow, funnel, in that order - ends where
the figures end. The sort arrow takes its slot whether it is shown or not, as
it already does in a left-aligned head, so nothing hangs and nothing moves
when the user sorts, adds a sort level or hovers. The label of a right-aligned
head therefore stands in from the figures by the arrow's slot in every state,
not flush with them in one state only.

A left-aligned head keeps its rule: the label starts where the values start.

A group's rule is one device pixel wide at every zoom, the same in the group
head, the head, the body and the footer; a group's label stands in the centre
of its cell.

## User Stories

1. As a user of a table, I want a sorted column's arrow to be whole, so that I can read the sort direction at a glance.
2. As a user of a table, I want the arrow of a right-aligned column whole beside its neighbour, so that a sorted column of figures does not look broken.
3. As a user of a table, I want the arrow of the last column whole at the table's edge, so that the rightmost column reads like every other.
4. As a user of a table, I want the sort arrow and the filter funnel of a column side by side, never on each other, so that I can see both the sort and that the column filters.
5. As a user of a table, I want the funnel's button not covered by the arrow, so that a click on the funnel opens the filter and does not sort.
6. As a user sorting by several columns, I want the label of a column to stay where it was when I add it as a sort level, so that the head does not jump under my pointer.
7. As a user sorting by several columns, I want each rank number whole and beside its arrow, so that I can read the order of the sort levels.
8. As a user hovering a head, I want the hidden arrow to appear in its own place, so that hovering moves nothing.
9. As a user reading a column of figures, I want its head to end where the figures end in every state, so that head and column read as one block.
10. As a user reading a column of text, I want its label to start where the values start, so that head and column read as one block.
11. As a keyboard user, I want the focus ring of a head's sort button inside that head, whole on all four sides, so that I can see which head I am on.
12. As a keyboard user, I want the focus ring of a head never drawn into the neighbouring head, so that I do not mistake which column I will sort.
13. As a pointer user, I want a head's sort button to end at its cell's edge, so that a click near a boundary sorts the column I aimed at.
14. As a user of a table with pinned columns, I want a pinned head's arrow, rank and funnel whole beside the pin edge's shadow, so that pinning costs nothing.
15. As a user who narrows a column to its least width, I want its arrow, rank and funnel to stay whole while the label gives way with an ellipsis, so that a narrow column still shows its state.
16. As a user of a column with a width or a flex share, I want its head as clean as an automatic column's, so that sizing a column does not break its head.
17. As a user of a compact table, I want the same clean head as in a regular one, so that density is a choice of space, not of quality.
18. As a user of a time column in another zone, I want the zone's name after the label to stay inside the head with the arrow beside it, so that the head names its zone and its sort.
19. As a user of a table with column groups, I want the group's rule one even line from the group head down to the footer, so that the groups read as columns of one weight.
20. As a user who zooms the browser to 90, 110, 125 or 150 %, I want every group rule the same width, so that no group looks heavier than another.
21. As a user on a display scaled to 125 or 150 %, I want the group rule as crisp as at 100 %, so that the table looks the same on every screen.
22. As a user of a table with column groups, I want each group's label centred over its columns, the first and the last group included, so that the label belongs visibly to all of them.
23. As a user of a group split by pinning, I want each part's rule and label as clean as an unsplit group's, so that pinning a column of a group costs nothing.
24. As an operator in a control room, I want the alarm table's heads whole in every sort state, so that a sorted alarm list looks as reliable as it is.
25. As a developer using `Column`, I want every combination of column options to render a clean head without my checking it, so that I do not have to avoid combinations.
26. As a developer, I want a right-aligned head's layout decided by the table, not by me, so that every numeric column in the application looks the same.
27. As a maintainer of umriss, I want a check that walks every example's heads through every state, so that a new example is checked without being added to a list.
28. As a maintainer of umriss, I want one table that crosses all column options, so that combinations no example shows are checked too.
29. As a maintainer of umriss, I want the group rule measured at fractional zooms, so that a rule that only smears off 100 % does not slip through a suite that runs at 100 %.
30. As a maintainer of umriss, I want the check to say which head, which part and by how many pixels, so that a failure points at its cause.

## Implementation Decisions

- **The sort button never leaves its cell.** Its negative margin and its
  padding are the cell's own padding on each side (the first and the last
  cell's wider outer padding included), not a fixed larger step. Its hit area
  and its inset focus ring then end at the cell's edge.
- **A right-aligned head no longer hangs its sort arrow.** The rule that
  takes the arrow out of the flow for a numeric head goes; the arrow keeps
  its slot as in every other head, shown or hidden. The head's parts keep the
  order label, rank, sort arrow, funnel - the order decided in the table's
  review - and the whole group is set flush right, so that its last part ends
  where the figures end.
- **The column width a head needs grows by the arrow's slot** for a
  right-aligned head that had none. A sized column whose width is below what
  its head's state needs is raised to it, as ADR-0042 already says; the label
  gives way with an ellipsis, rank, arrow and funnel stay.
- **The group rule is drawn so that the engine snaps it to a device pixel**,
  as it snaps a border - not as a one-pixel background placed at a
  fractional position. It still runs through head, body and footer, stays on
  a sticky cell and stays beside a pinned edge's shadow, which is why it was
  drawn as a background; the new drawing has to keep all three.
- **A group's label is centred in its cell**, not in a content box made
  asymmetric by the wider outer padding of the first and the last cell.
- The change stands in the table package's head cell and its stylesheet.
  Core's control room and the alarm list take it with the package; nothing in
  them changes.
- No prop, no option and no token is added: the clean head is not a choice.
- The comment beside the hanging arrow ("the cell's padding is wider than the
  arrow") goes with the rule; it was not true.

## Testing Decisions

- **One seam: the table's visual suite over its demo.** The checks open the
  built demo the way every visual test of the table does, through the
  example's address, and measure what the browser lays out. They test what a
  user sees - where a part of a head stands, what it overlaps, what it lines
  up with - never class names or computed styles.
- **A head-geometry check over every example**, derived from the examples
  and not enumerated, like the screenshot suite: a new example is checked
  without being added. For each example it drives every sortable head
  ascending and descending, then every head into one multi-sort with ranks,
  then narrows every resizable column to its least width, and after each step
  asserts for every head:
  - each part - label, rank, sort arrow, funnel - inside the cell's content
    box, vertically inside the cell, and inside every clipping ancestor in
    which the cell itself stands whole;
  - no two parts overlapping;
  - the sort button inside the cell;
  - a left-aligned head's label starting where the values of the column start,
    a right-aligned head's last part ending where they end - measured on the
    ink of the text, skipping text hidden for assistive technology, and on a
    plain row of the same table, not a group header or a nested table.
  Indents of row groups and tree rows and the pill of a badge are the cell's
  own and are not compared. A failure names the example, the state, the head,
  the part and the distance in pixels.
- **One example that crosses the column options**, because the examples do
  not cover every combination: a table whose columns cross left and right
  alignment, a column filter (none, list, range), a width (automatic, flex,
  sized), a pin (none, start, end), place (first, middle, last), a
  `ColumnGroup` and a time column with the zone's name, shown in both
  densities. It is an ordinary example on the table's demo - the existing
  seam - with its lead and its code, so the head-geometry check walks it like
  every other and the screenshot suite photographs it. It has to pass the
  shell's page rules.
- **A group-rule check at fractional zoom**: the group examples rendered at
  device scale 0.9, 1, 1.1, 1.25, 1.5 and 2 in Chromium and WebKit; the check
  decodes the screenshot's pixels at every group boundary in the group head,
  the head, the body and the footer, and asserts that the rule covers the same
  number of device pixels in every row and at every boundary of one scale, and
  stands at the same device column from the top to the bottom.
- **Prior art**: the header label check (a head's label measured against its
  cell, run against one example), the column-group check (the group cell's box
  against its columns' boxes), and the screenshot suite (examples derived from
  the files, not listed).
- The moved screenshot baselines - every right-aligned head moves by the
  arrow's slot - are each looked at before they are rebuilt.
- Chromium and WebKit; Firefox as soon as it launches in the job sandbox.

## Out of Scope

- The order of a head's parts (label, rank, arrow, funnel): kept as decided.
- A mirrored right-aligned head (arrow before the label): rejected in the
  table's review.
- The cells' own alignment, indents, badges and verdict marks.
- The head's vertical rhythm: pitch, line height, vertical padding.
- Heads outside the table package (the schedule's lanes, the charts' legends).

## Further Notes

### The measurements behind this spec

A probe swept the 145 examples of the table demo in Chromium at 1280 px,
against `main` at `ff5db3e4`; the counts say in how many examples a finding
occurs.

- **Hanging arrow cut** (96 examples): the arrow of a right-aligned head
  stands 2-12 px past the label; the cell's padding is 8 px, so its last 4 px
  lie under the next head. In the last column (padding 12 px) it ends at the
  table's edge and the scroll area cuts it (5 examples).
- **Arrow under the funnel** (4 examples: `aggregate--matrix-with-totals`,
  `filter--range-filter`, `filter--own-filter`,
  `filter--offer-the-values-that-occur`): overlap 8 px.
- **Sort button wider than its cell** (130 examples): 4 px into each
  neighbour; the button's margin and padding are 12 px against the cell's
  8 px.
- **Right edge against the figures**, right-aligned heads: unsorted 0 px;
  sorted +12 px (the arrow past the figures); ranked, the label -11.4 px;
  with a funnel, the label -24 px, ranked -35.4 px.
- **Left edge against the values**, left-aligned heads: 0 px in every plain
  column and state.
- **Group label off centre** by 2 px in the first and the last group
  (`column--a-header-over-columns` "Q2",
  `virtualisation--groups-over-virtual-rows` "Week 1").
- **Group rule** (device pixels covered, "A header over columns" and "Groups
  over virtual rows"): always 1 at scale 1, always 2 at scale 2, in Chromium
  and WebKit. At 0.9, 1.1, 1.25 and 1.5, 1 or 2 at the same boundary in
  different rows, in both engines; e.g. Chromium at 1.1: head 1, body 2 at
  x = 476.69. Column widths are fractional, and a one-pixel background at a
  fractional x is smeared, where a border is snapped.

Not swept: Firefox; density compact and the touch scale only where an example
uses them; core's control room and the alarm list, which use the same table
stylesheet.

### The probe

`probe/` holds the two scripts and a config, as drafts for the checks above.
They run against a served demo (`pnpm --filter @umriss-ui/table build:demo`,
then `preview:demo`); from `probe/`:
`OUT=findings.md npx playwright test -c playwright.config.ts heads.spec.ts`
(and `line.spec.ts`). They write one line per fault and pass regardless: they
are evidence, not tests. Delete the folder with the spec's last ticket.
