# A page is what its frame holds

Status: accepted, amends ADR-0042, ADR-0050 and ADR-0072
Date:   2026-10-30

A developer puts a table into a pane, a grid cell or a dashboard widget of fixed
height and wants it to use that height, the same whether the filtered set has no
row, five or a hundred. Until now a table was as tall as its rows (ADR-0050,
amendment of 2026-10-25) and a page held the most lines it had shown
(ADR-0042): five rows ended after five rows, an empty table was its head and a
message, and a pane of tables looked ragged and jumped when a search changed
the count. That was decided, not a user error. Filling the frame alone does not
help either: a table of thirty lines that keeps `pageSize` 10 shows ten rows over
blank surface while its pager says there are more, and the developer cannot fix
it, for they do not know the widget's height. The evidence is
`docs/research/table-height-and-paging-2026-10/`; the decisions are the user's,
of 2026-10-30.

## Decision

**Filling.** In a parent of definite height the table's frame is exactly that
height, with no prop; without one the percentage resolves to auto and nothing
changes - the mechanism the chart uses (ADR-0050). The frame stays a flex
column: toolbar and pager keep their heights, the scroll area takes the rest and
may shrink below its content. Under the last row the surface is blank and
unlined, takes no focus and no click, and is not in the accessibility tree.
Empty, nothing matching and the error stand at the top of the scroll area. A
virtual table, a tree table and a table without a pager fill the frame and
scroll; their totals footer stands at the frame's bottom edge. An explicit
`maxHeight` keeps today's behaviour, as tall as the rows up to that bound.
Printing shows the table as tall as its page; it does not fill. No prop turns
filling off: `maxHeight` or a flowing parent is the way out.

**What the table contributes.** To the size of its parent the table contributes
its held page height - toolbar, head, the held lines (ADR-0042) at one row
pitch each, the pager - never the rows it shows now. Every line is one pitch, so
the height is computed, not measured: it is the basis of the scroll area, which
grows and shrinks round it. Alone in a row the table is as tall as before;
beside a taller neighbour it fills the row; when the neighbour shrinks the row
shrinks back. A table that held the height of its tallest moment would ratchet
(measured: a grid row stayed at 698 px after a chart went 300, 700, 300). An
open row detail and a horizontal scrollbar are not in the computation.

**`framed`.** What `useTable` returns and the snapshot say whether the table
fills a parent of definite height. It is a probe, not a heuristic: the frame is
asked to be 7 px shorter than its parent and the answer is read back; the style
is put back before anything paints. It reads neither the rows nor the pager, so
a part may render a Pagination from it without a loop. `maxHeight` makes it
false.

**The fitted page.** With a Pagination in a filled frame the page holds
`max(1, floor(scroll area height / pitch))` lines, the head excluded and the
sticky totals footer and repeated group headers counted. The rest under one
pitch stays as a thin strip above the pager.

**Option and view.** The `pageSize` option is a default: the page in flow and the
start value before the first measurement, and it yields to the frame. A page size
in the view - picked in the selector or given by `initialView` - is a choice and
wins in the frame too. "Fit", offered first and preselected in a filled frame, is
the absence of a choice: it is never written to the view, and a frame resize
under "Fit" fires no `onViewChange`. `setPageSize` accepts `"fit"` beside a
number to go back.

**The anchor.** Whenever the page size changes - frame resize, density, a chosen
size, `setPageSize` - the new page is `floor(anchor index / new size) + 1`; the
anchor is the row with focus, else the current row if it is on the page, else the
top row. `setPageSize` no longer goes back to page one. A search, a filter or a
sort still does.

**Settling and the rest under focus.** A frame resize is applied once the size
has held 120 ms, and only when it crosses a whole pitch (a page shrinks only when
more than 1 px of its last row would be cut; a row that would be cut leaves at
once, only growth waits). Below the cadence of a drag the page thrashed (98 to
114 re-cuts in 15 s at 0 ms). While focus is in the rows a frame resize is not
applied; it is applied when focus leaves. A chosen size and a density change
apply at once. Rows that stay glide to their new place, new rows fade in; under
reduced motion they jump.

**The range.** Every pager says "13-24 of 120" beside "page 2 of 10" and stays
visible with one page, because only the range keeps its meaning when the page
size follows the frame. Its steps are glyphs - first, previous, next, last.

**Server mode.** The request keeps its shape; `page` and `pageSize` are the
fitted page. The first request waits for the first measurement; one request goes
out per resize, once the size has held 300 ms; until the answer the rows stay,
new slots show placeholders, surplus rows leave.

**Limits.** At least one line per page; in development a warning once when
fewer than three fit.

**The alarm list** in a sized pane renders a Pagination and pages with a fitted
page, and is not re-cut while focus is in it; with `maxHeight` it scrolls
virtually, in flow it renders every row.

## Considered and rejected

- **Fill and keep `pageSize`.** Ten rows over blank surface read as "the end".
- **Paged tables never fill.** The pane stays ragged exactly where it matters.
- **Ruled empty rows.** A drawing in the blank surface looks like rows to click.
- **Stretching rows.** ADR-0042: a row's height never follows what it shows.
- **Cutting the frame to whole rows.** A thin strip above the pager is calmer than
  a frame that is not the pane's height.
- **A window from the top row with offset and limit.** The server keeps `page`
  and `pageSize`; a page number and a range carry the place.
- **Growing up to `pageSize` and shrinking below it.** The parent's height is the
  layout's decision, not the table's.
- **`contain: size` for the contribution.** It drops the intrinsic inline size,
  and with it the table's width in an auto track; an explicit block-size does
  not touch table layout.

## Consequences

Every table in a sized parent looks different: it ends at the parent's bottom
edge, not at its last row. The changelogs of the table and the alarms say so and
name the way out, `maxHeight` or a flowing parent. "Page 3" is no longer the same
rows for two colleagues on different screens; the range, the search and row keys
carry what the page number did. A Card of fixed height smaller than the table's
held page does not shrink its body (a flex item with `min-height: auto`); give
the body `min-height: 0`. The Card stays as it is.
