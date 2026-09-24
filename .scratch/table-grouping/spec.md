# Grouping a table so that it still reads at a glance

Status: ready-for-agent
Date:   2026-09-24
Origin: grilling session on grouping for `@umriss-ui/table`. Vocabulary in
`CONTEXT.md`, "Tables" — **Aggregate**, **Grouping**, **Group key**, **Row
group**, **Group header**, **Group span**. The form of a group in ADR-0029.
The prototype that settled the look lies in `prototype/` beside this file.

## Problem Statement

A plant or office table is read by what its rows have in common — orders by
line and customer, measurements by machine and shift, stoppages by cause. Today
`@umriss-ui/table` can only sort by that; the user adds up in their head what
belongs together, and a sum exists only for the whole filtered set
(`footer: "sum" | "avg"`).

Every grouped table on the market solves this the same way, and the same way
fails: a line above each group, on every level. It works for groups of forty and
falls apart on the keys people group by most — a customer with two orders, a
machine with one stoppage. The prototype needed 25 lines for 13 orders; every
second line was a header, and the table no longer read as a table.

The bar set for this feature: the best grouping of any table. Trivial to switch
on, aggregates the caller defines, and a look that makes a grouped table
understood — and handled — at the first glance.

## Solution

Any table can be grouped, by the user from the column menu or by the
application with one option, up to three levels deep. A **Row group** takes one
of two forms by its level (ADR-0029): the innermost level is a **Group span** —
the grouping column first, its value once beside its rows, no line of its own;
every outer level is a **Group header** — a band carrying the value, the count
and the group's **Aggregates** in their columns. Both fold; folded all the way, a
grouped table is a summary of its groups.

The whole caller-side cost:

```tsx
const t = useTable(orders, { rowKey: o => o.id, defaultGrouping: ["line", "customer"] });

<t.Table>
  <t.Column value="customer" label="Customer" />
  <t.Column value="id" label="Order" rowHeader />
  <t.Column value="article" label="Article" />
  <t.Column value="quantity" label="Quantity" aggregate="sum" />
  <t.Column value="scrap" label="Scrap" aggregate="sum" />
  <t.Column value="due" label="Due" format="date" aggregate="range" />
</t.Table>
```

Without `defaultGrouping` the table is still groupable — by the user, from the
column menu. That line is the only thing the caller writes for grouping at all.

## User Stories

1. As a shift lead, I choose "Group by this column" in the column menu of any
   table and see orders by customer without the application having planned it.
2. As a shift lead, I group by line and then by customer and read, at one
   glance, which line carries how much quantity and scrap — and which customer
   has which orders on it.
3. As a planner, I fold every group and have a summary table of the lines; I
   unfold the one that looks wrong.
4. As a planner, I click the Scrap header and the lines order themselves by
   their scrap, the orders within each line by theirs.
5. As a planner, I group by a value that is no column — the shift, derived from
   the start time — because the application offered it.
6. As a planner, I group dates by month and quantities by band without the
   application writing a line for the month.
7. As a quality engineer, I see a group's worst verdict, a weighted average and
   a count of distinct articles in the group header, computed by the
   application's own aggregate.
8. As a user, I select a whole customer with one checkbox and release all their
   orders with the bulk action I already know — including the rows on the next
   page and in folded groups.
9. As a user, I page through a grouped table and the page that begins inside a
   group still tells me which group I am in.
10. As a user on a keyboard or with a screen reader, I move through groups and
    fold them with the arrow keys; the reader announces level, group and count.
11. As an application developer, I switch grouping on with one option, restore
    a user's grouping and folds from a stored view, and switch grouping off for a
    table where it makes no sense.
12. As an application developer, the footer I already declare keeps working and
    tells me, in development, its new name.

## Implementation Decisions

The decisions are numbered as in the grilling session (Q1–Q17), so that a
reader of a ticket can find the reason.

### Who groups, and by what

- **Q1 — both.** The application gives the default grouping; the user changes
  it. The grouping is part of the **View** like the sort levels: handed in with
  `initialView`, read back from `view`, kept nowhere by the table. The user
  groups from the column menu ("Group by this column") and removes it from the
  table toolbar. No drag-to-group bar: undiscoverable and poor on touch.
- **Q8 — opt-out, one option.** `defaultGrouping: key | key[]` on `useTable`,
  parallel to `defaultSort`: the application's default, left out of `view`.
  Every column whose value is text, a number, a point in time or a boolean is
  groupable unless it says `groupable={false}`; `<Table groupable={false}>`
  switches it off for the table. Every existing table gains the menu entry with
  the update: a minor version with a note in the changelog.
- **Q2 — the value, or a third value path.** A column is grouped by its
  **Value**. Beside `sortValue` and `exportValue` a column may give
  `groupValue: (value) => key` — for bands of a number. For points in time one
  word chooses a standard key: `group="day" | "week" | "month" | "year"`.
  Absent values form a group of their own, labelled by the wording ("No
  value"), which stands last in either direction, as absent values sort.
- **Q7 — a group key without a column.** `<t.GroupBy value="plant" label="Plant" />`
  or `value={row => shiftOf(row.start)}` with an `id`: a **Group key**, typed
  like a field column, with no cell, no export, no entry in the column menu —
  offered only where a grouping is chosen. A hidden column is groupable as it
  is; the group key is for the value that should never be a column.
- **Q3 — at most three levels**, as there are at most three sort levels.

### Aggregates

- **Q4 — one concept for footer and group.** `aggregate` on a column replaces
  `footer`; `footer` stays as a deprecated alias for one minor version, with a
  development warning naming the new prop — as `filter` did for `preFilter`.
  Built in: `sum`, `avg` for numbers; `min`, `max` for numbers and points in
  time; `range` for points in time (written "Oct 02 – 14"); `count` (values
  present) and `distinct` (different values present) for every type. A caller's
  own is a function `(values, rows) => W` whose result runs through the
  column's own presentation — a weighted average, a worst verdict.
- Every aggregate is computed from the values themselves, never from other
  aggregates: an average of averages is wrong, and the model makes it
  impossible. Absent values count towards nothing.
- The typing follows the existing footer: a built-in that does not fit the
  value type is a compile error (`"sum"` on a text column), recorded in
  `types.test-d.tsx`.
- The Σ/⌀ sign stands before the footer only. Repeated on every header band it
  would be noise; the column header tells which aggregate a column carries.

### The form of a group — ADR-0029

- **Q14 — the form follows the level.** Innermost level: **Group span**. Every
  outer level: **Group header**. A grouping by one column is all span.
- The innermost grouped column is moved to the front and shows its value once
  per group; the outer grouped columns are hidden, their value standing in the
  header (this revises Q5, where every grouped column was to be hidden).
- **Q15 — a group of one row is that row.** No fold, no count, no aggregate that
  would repeat the value; it is selected by the row's own checkbox.
- **Q16 — no `rowspan`.** A span is a cell in every row whose value shows in the
  first one. The value stays in view while its group scrolls and is pushed out
  by the next group; on a page that begins inside a group it repeats, marked as
  continued. The same holds in a virtualised window.
- Folding: a folded header hides its rows; a folded span is ONE line — value and
  count in the span, the group's aggregates in their columns, "3 orders" muted
  where the first text column would stand.

### How it looks — Q17 and the refined prototype

The pixels are verified in ticket 07; these are the relations, and they bind:

1. **A header is exactly one row high** — the row's padding, a band on
   `--u-color-surface-sunken` across the full width. Its only line is the
   `--u-hairline-strong` above it; the band's own edge is its lower boundary.
   Weight medium for the value and the aggregates.
2. **One fold slot of 20 px on every level**, so that the text of every level
   begins on one vertical: "Line 1" and "Brenner GmbH" align. A group of one row
   keeps the slot empty.
3. **Lines by rank.** Between rows of one group, the ordinary `--u-hairline`,
   right of the span only. Between span groups, `--u-hairline-strong` across the
   full width. Between header groups, the band.
4. **The span**: value in medium, count right-aligned in mono and muted,
   separated from the rows by a vertical `--u-hairline`; its fold on the first
   row's centre line. Hover lights the row, not the span — the span belongs to
   the group.
5. **The share bar**: under a `sum` in a header, 2 px of ink at 35 %, its length
   the group's share of the filtered set's sum (at most 64 px), hanging from the
   cell's lower edge and costing no height. On by default for `sum` in headers;
   `share={false}` on the column switches it off. Not in a span (a span's
   neighbours are rows, and a bar there would read as a value).
6. **Point-in-time aggregates condensed**: "Oct 02 – 14", not "Oct 02 – Oct 14".
7. **The toolbar carries one chip** for the grouping, "Grouped by Line ›
   Customer": the order of the levels is legible, a level is removed from the
   chip's menu, × removes the grouping.
8. Dark theme through the tokens only; the band stays distinguishable
   (checked in the prototype).

### Motion — Q13

All of it through the duration tokens, so that `prefers-reduced-motion` turns it
off:

- **Regrouping** is animated (FLIP): rows travel to their group in
  `--u-duration-medium` and flow back when the grouping is removed. The motion
  explains what happened.
- **Folding** animates the height, as a card does; the rows fold into the
  header, whose aggregates stay.
- **Sticky headers stack** — each level below the one above it — and hand over
  seamlessly; the shadow step appears only while content lies beneath.
- **Filtering**: a group that empties leaves animated; the count in a header
  counts to its new value.
- **Tree guides**: a hairline per level at the left, as in the tree view, only
  where three levels stand.

### Paging, sorting, selection, folding, export

- **Q9 — a page counts lines**: headers plus unfolded rows. Headers repeated at
  the top of a page that begins inside a group do not count and are marked
  continued. An aggregate is always over the whole group, never over the part on
  the page. Virtualised, a header is a line of the row height.
- **Q10 — sorting.** By default groups stand ascending by their grouping value.
  A sort level on a column with an aggregate orders the groups by it and the rows
  within by their value; on the grouped column it reverses the group order; on
  any other column it orders the rows within the groups. The existing sort
  levels carry all of it — no new state.
- **Q11 — folding.** Everything open at first. The folded groups are part of the
  View, by their path of values; a path that no longer occurs falls out, as an
  unknown column does. Alt-click on a fold folds all siblings; the toolbar chip's
  menu offers "Unfold all" and "Fold all". A grouped table is a `treegrid` with
  `aria-level`, `aria-expanded` and `aria-setsize`/`aria-posinset`; left and
  right arrows fold and unfold as in the core tree view — whose keyboard model is
  looked at, not imported (ADR-0016 permits the public entry only).
- **Q12 — selection and export.** A header and a span carry a tri-state checkbox
  that selects the group's rows in the filtered set — including other pages and
  folded groups; bulk actions are unchanged. The CSV stays flat, one line per
  row, grouped columns included; a spreadsheet pivots better than a CSV of
  subtotals.

### Where it lives

- The grouping pipeline is a pure module in `table/src/model/` — group tree,
  aggregates, group order, lines for paging and the virtual window, fold paths —
  written test-first, like the lane layout of the schedule (ADR-0025).
- Filter → group → sort → page; figures of the selection still come from the
  filtered set.
- Wording entries (English and German): group by this column, remove grouping,
  grouped by, no value, continued, fold all, unfold all, the count of rows in a
  folded span, the fold's accessible name.

## Testing Decisions

- The pipeline module: grouping on one to three levels, absent groups last,
  `groupValue` and the date keys, every built-in aggregate with and without
  absent values, the average-of-averages trap, a caller's aggregate, group order
  by value and by aggregate, the line count for paging with continued headers,
  folds by path including paths that disappear.
- Types: `aggregate` per value type, `groupable`, `group` on non-dates, `GroupBy`
  against the row, the `footer` alias — what must compile and what must not.
- Rendering tests: the prototype's case (13 orders, line › customer), a group of
  one row, folded span and header, selection of a group across pages,
  treegrid attributes and keys.
- Visual baselines for the matrix of ticket 07; axe on every grouped example.

## Out of Scope

- A pivot: groups as columns.
- Grouping by more than three levels.
- Drag-to-group.
- Aggregates over the page instead of the group.
- Subtotal lines in the export.
- Editing a group (renaming a customer by its header).
- The form chosen by the data or by a prop (ADR-0029, considered options).

## The demo

Grouping gets a rubric of its own with two pages, both on the **Page**
exception that **Filter** uses: a concept several parts share and none owns.

**Grouping** — `defaultGrouping`, `GroupBy`, `groupValue`, `group`,
`groupable`; the examples as a ladder, every one with real numbers from plant or
office:

1. *One line*: orders by line with `defaultGrouping: "line"`.
2. *Nothing declared*: the same table ungrouped — the user groups from the
   column menu.
3. *A group of one*: customers with one order each, and why they have no fold.
4. *No value*: orders without a customer, grouped last.
5. *By month*: deliveries with `group="month"`.
6. *In bands*: quantities by band with `groupValue`.
7. *Two levels*: line › customer — the prototype's case.
8. *Three levels*: maintenance orders by plant › hall › machine.
9. *A key that is no column*: measurements by shift, derived from the
   timestamp, with `GroupBy`.
10. *Groups by their aggregate*: which line has the most scrap — one click.
11. *The overview*: everything folded, then one line unfolded; the view with its
    folds handed back in.
12. *A whole group selected*: releasing all of a customer's orders across pages.
13. *Paging*: a page that begins inside a group.
14. *Filter and search*: groups emptying and counts changing as you type.
15. *Twenty thousand rows*: a virtualised measurement log by machine › shift.
16. *Switched off*: `groupable={false}` on a table and on a column.
17. *The shift report*: grouping, a verdict column with its worst verdict per
    group, a weighted scrap rate, the count of distinct articles, selection and
    export in one table — worked through.

**Aggregate** — the footer and the group header as one concept:

1. *The footer renamed*: `footer="sum"` → `aggregate="sum"`, and the warning.
2. *Sum and average*.
3. *Minimum and maximum*, and on points in time.
4. *A range of dates* in the header.
5. *Count and distinct*.
6. *Absent values do not count*: an average over a column with gaps.
7. *The share bar*, and `share={false}`.
8. *Never an average of averages*: a scrap rate done wrong and right.
9. *An aggregate of one's own*: a weighted average.
10. *The worst verdict* of a group in a verdict column.

"Why it is like this" on the Grouping page links ADR-0029 and shows the
prototype's A beside its F, 25 lines against 16.

## Further Notes

Terms introduced: **Aggregate**, **Grouping**, **Group key**, **Row group**,
**Group header**, **Group span** — all in `CONTEXT.md`. Deliberately avoided:
*group* alone (a lane group, a chart legend group), *subtotal* (a maximum is no
sum), *gutter* and *rowspan* for the span.

The prototype (`prototype/`) is throwaway HTML on the real tokens: `variants.html`
holds A–G, the layouts compared; `final.html` the refined F in three states,
`#dark` for the dark theme. Its screenshots are the reference for ticket 07.

## Comments

### Delivery notes (2026-09-24), tickets 01–06 and 08

Deviations from the text above, each decided while building:

- **Groups of a `groupValue` stand by what they hold** (the smallest sort value
  of their rows), not by the name the function gives them: bands of a number
  named "Small", "Medium", "Large" stood in the alphabet's order. Q10's
  "ascending by their grouping value" holds for every other key.
- **A virtual window does not mark "continued".** Its group headers stick while
  their group scrolls; the mark is a page's word. A page keeps it.
- **A range of dates names the year once** ("02/10–14/10"), not "Oct 02 – 14":
  a month-and-day form would need a format `@umriss-ui/core` does not have.
- **Folding moves the lines that stay (FLIP)** instead of animating a height -
  table rows have none; a group a filter empties leaves without an exit motion.
- **`aggregate="worst"` on the verdict column.** Its value is a reading, and
  the worst verdict is the aggregate every plant screen wants; a function of
  one's own would be the same five lines in every application.
- **The footer shows "min" and "max" as signs** beside Σ and ⌀.
- Words: the code says **group header** where this spec says "band", and the
  grouping stands in the table toolbar as a **tag** (the glossary avoids
  "chip").

Open, for the user to decide:

1. ~~**One level shows no group aggregates until it is folded.**~~ Decided
   2026-09-24 (Q24-Q27, each from rendered variants): the outermost level is
   always a group header carrying every aggregate; one level is a header over
   plain rows, the span is the innermost of several levels and carries none
   open. The share bar stands once per header, under the first sum. ADR-0029
   records the six variants rejected on sight.
2. **The user groups through `<ColumnMenu>`.** A table without a column menu
   can be grouped by the application only.
3. **Groups follow an aggregate on any sort level**, not only the first:
   the first sort level that speaks about a grouping level or an aggregate
   decides.
