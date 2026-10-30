Status: ready-for-agent
Date:   2026-10-30

# A page is what its frame holds

The evidence behind every decision here is the research
`docs/research/table-height-and-paging-2026-10/` (`report.md` is the synthesis,
in German). The decisions themselves were made by the user on 2026-10-30.

## Problem Statement

A developer puts a table into a pane, a grid cell or a dashboard widget whose
height is fixed, and wants the table to use that whole height - the same
height whether the filtered set has no row, five or a hundred.

Today the table is as tall as its rows. In a parent of definite height it is
bounded, not filled (ADR-0050, amendment of 2026-10-25): five rows end after
five rows and the pane shows blank page under the table. Pagination holds the
most lines a page has shown (ADR-0042, "A page holds its height"), so a short
last page keeps its height, but a table that never had more than five rows
stays five rows tall, and an empty one is the head and its message. A pane of
tables looks ragged, and it jumps when a search, a filter or a reload changes
the count. This is no user error; it is what was decided.

Filling the frame alone does not help: a table that fills a pane of thirty
lines and keeps `pageSize` 10 shows ten rows over a large blank surface while
its pager says there are more. The blank reads as "the end" where it is not.
The developer cannot fix it either: they do not know the widget's height, so
any `pageSize` is a guess - the guess ADR-0050 removed for the chart.

## Solution

In a parent of definite height the table fills it, with no prop, and with a
Pagination its page is what the frame holds: as many whole lines as fit
between the head and the pager. A pane of twelve lines over a hundred rows
shows twelve rows, no row cut, no scrollbar, the pager at the bottom edge
saying "1–12 of 100". Blank surface stands only where there is nothing more:
on a short last page, under the few rows a search leaves, under the empty
message. Where the parent has no definite height, nothing changes.

Three things go beyond every grid looked at in the research:

- **The row the user looks at stays.** When the frame grows or shrinks, the
  density changes or the user picks a page size, the page is re-cut so that
  the focused row - else the current row, else the top row - stays on the
  page. Other grids keep the page number, so the rows under the user's eyes
  vanish.
- **"Fit" is a choice, not a hidden mode.** The page-size selector offers
  "Fit" first, preselected, then the page sizes. A number the user picks
  wins, also in the frame, and is kept in the view. Other grids hide the
  selector and their users ask for it back.
- **The pager says the range.** Every pager says "13–24 of 120" where it said
  "120 entries", because only the range keeps its meaning when the page size
  follows the frame.

The pager also gets the two steps users have asked for: to the first and to
the last page. Its four steps are glyphs - first, previous, the page, next,
last - each an icon button that names itself in a tooltip, as AG Grid, MUI,
Kendo and Grafana draw them. The words "Back" and "Next" go; the pager gets
narrower and wraps less in a narrow pane.

## User Stories

1. As a developer, I want a table in a parent of definite height to be exactly as tall as the parent, so that my layout does not depend on how many rows arrive.
2. As a developer, I want this with no prop, so that I do not have to remember a word in every table.
3. As a developer, I want a paged table in a sized parent to hold as many rows per page as fit, so that I never guess a `pageSize` for a height I do not know.
4. As a user, I want a page to show whole rows only, so that no row is cut at the bottom and there is no scrollbar on a page that fits.
5. As a user, I want the pager to stand at the frame's bottom edge on every page, so that it does not wander as the row count changes.
6. As a user, I want the toolbar to stay at the top of the frame, so that the search field stays where my eyes left it.
7. As a user, I want a short last page to show its rows and blank surface under them, so that I see the list ends there.
8. As a user, I want a search that leaves three rows to show three rows and keep the frame and pager still, so that typing does not make the layout jump.
9. As a user, I want an empty result to keep the frame's height with the message at the top, where the first row would stand, so that my eyes are where the matches appear when I type on.
10. As a user, I want "no entries" and "nothing matches search and filters" with "reset all" to stay two different messages, so that I know whether to change my search.
11. As a user, I want the blank surface to carry no stripes, no lines and no borders, so that it does not look like empty rows I could fill or click.
12. As a user, I want clicking the blank surface to do nothing, so that I do not create, select or open anything by accident.
13. As a keyboard user, I want the arrow keys to stop at the last row, so that focus never lands on nothing.
14. As a screen reader user, I want the blank surface to be absent from the accessibility tree, so that the table announces only its real rows.
15. As a screen reader user, I want a row on page 2 to be announced as "row 14 of 121", not "row 2 of 13", so that I know where I am in the whole set.
16. As a screen reader user, I want a polite status message saying the new range when I page, so that I know the page changed.
17. As a screen reader user, I want no announcement when the frame resizes, so that a change I caused does not talk over me.
18. As a user, I want the page to grow by rows at the bottom when the pane gets taller on page 1, so that nothing I was reading moves.
19. As a user on a later page, I want a resize to re-cut the pages so that the row I am looking at stays on the page, so that I do not lose my place.
20. As a keyboard user, I want the focused row to stay on the page and keep focus when the page size changes, so that my work is not interrupted.
21. As a user, I want the current row (the one another view chose) to stay on the page when no row has focus, so that the link between the views holds.
22. As a user, I want a resize to be applied once the size has settled, not at every pixel, so that rows do not flicker while I drag a splitter.
23. As a user, I want rows that stay on the page to glide to their new place and new rows to fade in, so that I can follow what happened.
24. As a user who prefers reduced motion, I want the rows to change place without movement, so that nothing moves that I did not ask to move.
25. As a user working in a row, I want the page not to be re-cut while focus is in the rows, so that a resize never pulls the row from under me; it is applied when focus leaves.
26. As a user, I want the page-size selector to offer "Fit" first, preselected, in a sized frame, so that the default uses the space.
27. As a user, I want to pick 10, 25 or 50 and get exactly that, even when it scrolls inside the frame or leaves blank under it, so that my choice is respected.
28. As a user, I want my chosen page size kept in the view and restored on my next visit, so that I choose it once.
29. As a user, I want to go back to "Fit" with one choice, so that a number I picked is never a trap.
30. As a developer, I want a frame resize under "Fit" to report no view change, so that my stored view is not rewritten on every resize.
31. As a developer, I want `pageSize` to stay the page in a parent without a definite height and the start value before the first measurement, so that tables in flowing pages behave exactly as today.
32. As a developer, I want "Fit" offered only in a sized frame, so that a flowing table's selector stays as it is.
33. As a user, I want every pager - in a frame or not - to say "13–24 of 120" beside "page 2 of 10", so that I always know which rows I see.
34. As a user, I want the pager to stay visible when everything fits on one page, so that the frame does not flip between a page with a pager and a page with one row more.
35. As a developer in server mode, I want the first request to carry the measured page size, so that the table never loads twice on start and never asks for a size of 0.
36. As a developer in server mode, I want one request per resize, sent once the size has held 300 ms, so that dragging a splitter does not flood my server.
37. As a user in server mode, I want the rows to stay while the new page loads, new slots showing placeholders and surplus rows leaving, so that the table never blanks.
38. As a user, I want the first load to show exactly as many placeholder rows as rows are about to come, so that loading looks like what it becomes.
39. As a user, I want loading over rows to keep the rows dimmed, as today, so that reloading is calm.
40. As a developer, I want a virtual table or a tree table without Pagination in a sized parent to fill it and scroll, so that filling works without a pager too.
41. As a user, I want the totals footer of a filled scrolling table without a pager to stand at the frame's bottom edge, so that the sums are always in the same place.
42. As a user, I want the totals footer of a paged table to stand directly above the pager and count as a line of the page, so that the page still fits whole.
43. As a user, I want a grouped page to count its repeated group headers as lines, so that a grouped page fits like any other.
44. As a user, I want folding a group to fill the page with the following lines, so that folding does not leave a hole.
45. As a user, I want the compact density and the touch pitch to fit the page anew, with the same anchor rule, so that density never leaves a cut row.
46. As a developer, I want an explicit `maxHeight` to keep today's behaviour - as tall as the rows up to that bound, `pageSize` as the page - so that a height I chose wins.
47. As a developer, I want a wrapper of my own between the parent and the table to pass the height on with `height: 100%`, as today, so that the rule stays one rule.
48. As a developer, I want a table in a stretched Card or a dashboard widget body to fill it, so that a table widget ends where a chart widget ends.
49. As a developer, I want a table beside a taller chart in a stretched grid row to fill the row and hold more rows, and the row to shrink back when the chart does, so that the table never holds a row at the tallest it ever was.
50. As a developer, I want the table to contribute only its held page height to its parent's size, never the rows it shows, so that filling cannot create a layout feedback loop.
51. As a developer, I want a tiny frame to show at least one row, and a development warning once when fewer than three fit, so that a mistake in my layout is visible.
52. As a developer, I want printing to show the table as tall as its page, not the frame, so that a printout carries no blank surface.
53. As a developer, I want to know whether the table fills a frame, so that I can, for example, offer "View all" in a dashboard widget.
54. As an operator, I want the alarm list in a sized pane to page with a fitted page instead of scrolling, so that new alarms do not roll the list away under me.
55. As an operator, I want the alarm list's page not to be re-cut while focus is in the list, so that the alarm I am acknowledging stays where it is.
56. As a developer upgrading, I want the changelogs to say what changed and how to keep the old look, so that a visible change is not a surprise.
57. As a German-speaking user, I want "13–24 von 120" and "Passend" in the German wording, so that the new words are not English.
58. As a user on page 7 of 40, I want one step to the first page, so that I do not click "previous" six times.
59. As a user, I want one step to the last page, so that I reach the oldest or newest entries at once.
60. As a user, I want the four steps drawn as glyphs - first, previous, next, last - so that the pager reads at a glance and takes little width.
61. As a user, I want the page status between the backward and the forward steps, so that the steps read as "back ‹ where I am › forward".
62. As a user, I want each step's name shown as a tooltip when I hover or focus it, so that a glyph is never a riddle.
63. As a screen reader user, I want each step named "First page", "Previous page", "Next page", "Last page", so that I hear what it does.
64. As a user on the first page, I want "first" and "previous" disabled, and on the last page "next" and "last", so that a step that does nothing does not look like it does something.
65. As a touch user, I want the step buttons to have the touch hit area, so that I can hit them with a finger.
66. As a user in a narrow pane, I want the four steps and the page status to wrap together, never split, so that "next" never stands alone on a line.
67. As a developer in server mode, I want "last page" to request the last page the server's count makes, so that the jump works without loading the pages between.
68. As a German-speaking user, I want the four names in German, so that the tooltips are not English.

## Implementation Decisions

- **Prototype first.** The main risk is a layout feedback loop: measuring the
  parent while contributing to its size. Ant Design withdrew a `scroll.y:
  'fill'` mode in July 2026 for it, and MUI X flickered. Before any other
  work, a throwaway prototype proves in Chromium and WebKit (Firefox does not
  launch in job sandboxes; the user checks it locally) that a table in a
  stretched grid row beside a growing and shrinking chart fills the row,
  shrinks back with it, works inside a stretched Card body, and does not loop
  in `ResizeObserver`. If it cannot be made to hold, stop and report before
  writing the ADR.
- **Filling.** In a parent of definite height the outer frame is exactly the
  parent's height; without one, a percentage height resolves to auto and
  nothing changes - the mechanism the chart uses (ADR-0050). The frame stays a
  flex column: toolbar and pager keep their heights, the scroll area takes the
  rest and may shrink below its content.
- **What the table contributes.** To the size of its parent the table
  contributes its held page height - toolbar, head, the held lines (ADR-0042)
  at one row pitch each, the pager - never the rows it shows now. Because
  every line is one pitch, this height is computed, not measured. Alone in a
  row the table is as tall as today; beside a taller neighbour it fills the
  row; when the neighbour shrinks, the row shrinks. An open row detail or a
  horizontal scrollbar is not in the computation; a page with an open detail
  may scroll in the frame, as today.
- **The fitted page.** With a Pagination in a filled frame, the page holds
  `max(1, floor(scroll area height / pitch))` lines, the head excluded and the
  sticky totals footer counted. Group headers count, as `pageLines` already
  counts them. The rest under one pitch stays as a thin strip above the
  pager. Glossary term: **Fitted page** (add it to `CONTEXT.md`; "Page" there
  already names a demo page).
- **Option and view.** The `pageSize` option is a default: it is the page in
  flow and the start value before the first measurement, and it yields to the
  frame. A page size in the view - picked in the selector or given by
  `initialView` - is a choice and wins in the frame too. "Fit" is the absence
  of a choice: it is never written to the view, and a frame resize under
  "Fit" fires no `onViewChange`. `setPageSize` accepts `"fit"` beside a number
  to go back.
- **The anchor.** Whenever the page size changes - frame resize, density or
  pitch change, a chosen size, `setPageSize` - the new page is
  `floor(anchor index / new size) + 1`, where the anchor is the row with focus
  in the table, else the current row if it is on the page, else the top row
  of the page. `setPageSize` no longer goes back to page one (today: "Sets
  the rows per page; back to page one"). A search, a filter or a sort still
  goes back to page one, as today.
- **Settling.** A frame resize is applied once the size has held still briefly
  (in the region of 50-200 ms; the prototype picks the value) and only when
  the change crosses a whole pitch, with a small dead zone against one-pixel
  wobble. While focus is in the table's rows, a frame resize is not applied;
  it is applied when focus leaves the rows. A chosen size and a density
  change apply at once.
- **Motion.** Rows that stay glide to their new place with the line motion
  grouping already has; new rows fade in; under reduced motion they jump.
- **The selector.** In a filled frame the page-size selector starts with
  "Fit", preselected while no size is chosen, then `pageSizes`. In flow there
  is no "Fit".
- **The range.** Every pager says the range - "13–24 of 120" - where it said
  the entry count, beside "page 2 of 10" and the step buttons. The pager stays
  visible with one page. The core wording gets the range and "Fit" in English
  and German (ADR-0018, ADR-0019); the entry-count wording the pager used
  goes if nothing else uses it.
- **The steps.** The pager's steps are, in this order: first page, previous
  page, the page status ("page 2 of 10"), next page, last page. Each step is
  an `IconButton` (ADR-0039) at the pager's size: square, its name required,
  shown as the tooltip, with the touch hit area under a finger (ADR-0079).
  Previous and next draw `AngleGlyph`, turned; first and last draw a new glyph
  of core's set - the chevron against a bar, one drawing mirrored for the two
  directions - named after what it shows, following the glyph rules in
  `CONTEXT.md` (stroke, no fill, `currentColor`, hidden from assistive
  technology). First and previous are disabled on page 1, next and last on
  the last page. The steps and the status wrap as one group, as they do
  today. "Last page" calls `setPage(pageCount)`; in server mode that is one
  request for that page. The core wording gets the four names in English and
  German (ADR-0018, ADR-0019); "Back" and "Next" as the pager's button words
  go if nothing else uses them.
- **Accessibility.** A paged table carries `aria-rowcount` (all rows, head and
  footer included) and `aria-rowindex` on every row, as the virtual window
  already does. Paging by the user announces the new range in a polite status
  message; a frame resize announces nothing. The blank surface is not in the
  accessibility tree, not focusable, and takes no click. Focus stays on the
  control the user used.
- **Server mode** (ADR-0072). The request keeps its shape: `page` and
  `pageSize` are the fitted page. The first request waits for the first
  measurement and carries it; there is never a request with an unmeasured
  size. A frame resize sends one request once the size has held 300 ms (the
  search's pause). Until the answer, the rows stay, new slots show
  placeholders, surplus rows leave.
- **Loading and empty.** The first load shows exactly as many placeholders as
  the fitted page holds. Loading over rows is unchanged. Empty, nothing
  matching and the error stand at the top of the scroll area in the frame's
  height, with today's two wordings.
- **Totals footer.** In a paged filled table it is a line of the page,
  directly above the pager. In a filled scrolling table without a pager it
  stands at the frame's bottom edge, the blank surface above it.
- **Virtual and tree tables** without Pagination fill the frame and scroll;
  nothing about their window changes.
- **Limits.** At least one line per page. In development the table warns once
  when fewer than three lines fit. Printing shows the table as tall as its
  page; it does not fill. An explicit `maxHeight` keeps today's behaviour:
  as tall as the rows up to that bound, `pageSize` as the page, no "Fit".
- **One new read on the table.** `framed: boolean` on what `useTable` returns
  (and the snapshot): whether the table fills a parent of definite height.
  It does not depend on the Pagination, so a part may render a Pagination
  depending on it without a loop.
- **The alarm list** (`@umriss-ui/alarms`). Without `maxHeight` and in a
  sized pane (`framed`), it renders a Pagination and pages with a fitted page;
  the "no re-cut while focus is in the rows" rule covers the operator at work.
  With `maxHeight` it scrolls virtually, as today. In flow it renders every
  row, as today. Its wrapper around the table passes the height on.
- **ADRs.** A new ADR, "A page is what its frame holds": filling, the fitted
  page, option versus view, "Fit", the anchor, settling and the rest under
  focus, the contributed held height, the range, the rejected ways (fill and
  keep `pageSize`; paged tables never fill; ruled empty rows; stretching rows;
  cutting the frame to whole rows; a window from the top row with
  offset/limit; growing up to `pageSize`). ADR-0050 gets a dated amendment
  reversing the table part of its 2026-10-25 amendment and pointing at the
  new ADR. ADR-0042's "A page holds its height" gets a dated amendment: in a
  filled frame the held height is the frame's, and a page-size change keeps
  the anchor. ADR-0072 gets a dated amendment on the first request and the
  settled resize.
- **Documents.** The table README's paragraph on parents of definite height,
  the dashboard README's sentence "a table stays within it", the docs of
  `pageSize`, `setPageSize` and the new `framed` (API.md is regenerated), the
  core wording, `CONTEXT.md`, core's glyph documentation and demo for the new
  glyph. Changelogs at release: table and alarms (minor; the look changes in
  every sized parent; the way out is `maxHeight` or a flowing parent; the
  pager's steps are glyphs, and a test that found "Next" by its text finds it
  by its accessible name), core (the new glyph; the range, "Fit" and the four
  step names in the wording).

## Testing Decisions

- A good test measures what a user sees and does: the frame's box against the
  parent's, how many rows a page shows, which rows they are after a resize,
  where focus is, what the pager says, which request went out. It does not
  read class names, computed styles or internal state.
- **Highest seam: the `Table` component with `Pagination`, rendered.** Unit
  tests in the table's `tests-unit` render it with a faked scroll-area height
  (prior art: the unbounded virtual tests fake `clientHeight`; the row pitch
  tests hold "a page holds its height"). They cover: the fitted page for a
  given height and pitch, group headers and footer counted, at least one
  line; "Fit" in the selector only when framed; a chosen size wins and lands
  in the view, "Fit" never does, a resize fires no `onViewChange`; the anchor
  (focused, current, top row) across a resize, a density change and a chosen
  size; no re-cut while focus is in the rows, applied when it leaves; the
  range wording; `aria-rowcount` and `aria-rowindex` on a page; the polite
  range message when paging and none on resize; no focusable element or
  filler under the last row; `framed` true and false.
- **The steps** in the same Pagination unit tests: the four buttons by their
  accessible names, in order around the status; first and previous disabled
  on page 1, next and last on the last page; first and last land on page 1
  and on `pageCount`; in server mode "last page" sends one request for that
  page. The tooltip is core's and needs no test here.
- **Server mode** in the server mode unit tests (prior art: they assert the
  requests `onRequest` receives): the first request carries the measured
  size and none goes out unmeasured; a run of resizes sends one request after
  300 ms; rows stay and placeholders fill new slots meanwhile.
- **Layout: visual tests** in the table's `tests-visual`, next to "in a pane
  of fixed height" (prior art: it measures the frame against the pane),
  tagged `@quick`, Chromium and WebKit: in a pane of fixed height with 0, 5
  and 100 rows the frame equals the pane and the pager's bottom edge is the
  frame's; with 100 rows no row is cut and there is no vertical scrollbar;
  the same table in flow is unchanged; with `maxHeight` it is as tall as its
  rows; in a stretched grid row beside a chart whose height changes, the row
  grows and shrinks back (the feedback loop test, from the prototype). One
  demo example shows the rule, with a control switching 0/5/100 rows and a
  splitter or size control for the pane.
- **The alarm list** in the alarms' tests: in a sized pane it pages with a
  fitted page; with `maxHeight` it stays virtual; in flow it renders all rows.
- Screenshots of the demos with a table in a sized parent - the core demo's
  control room, the dashboard demo, the alarms demo - change. Each is looked
  at as a user before it is accepted.

## Out of Scope

- Ruled empty rows or any drawing in the blank surface.
- Rows that stretch to fill the frame (ADR-0042).
- A window that starts at the top row with offset/limit in the server
  request; the request keeps `page` and `pageSize`.
- Growing a table up to `pageSize` and shrinking below it in a sized parent:
  the parent's height is the layout's decision.
- A "View all" pattern for dashboard widgets; `framed` lets an application
  build it.
- Paging past the page's edge with Page Up / Page Down in grid mode.
- A field to type a page number, and a row of page numbers to click.
- Moving the calendar's hand-drawn month steps onto the new glyphs.
- Any change to the chart, the schedule, the calculation or the Card.
- A prop to turn filling off; `maxHeight` or a flowing parent is the way out.

## Further Notes

- The user asked whether the short-table look was a user error. It is not:
  it was ADR-0050's 2026-10-25 amendment and ADR-0042's held page height.
- The user's decisions of 2026-10-30, on the research's open questions:
  the page follows the frame; "Fit" plus the page sizes, a chosen number wins
  and is kept in the view; one server request per settled resize; all of it
  in one step; the range in every pager; the empty message at the top; the
  totals footer of a pagerless filled table at the bottom edge; the alarm
  list pages in a sized pane and is not re-cut while focus is in it. Later
  the same day the user added the steps to the first and the last page,
  which users had asked for repeatedly, and asked whether the steps should be
  glyphs; they are.
- "Page 3" is no longer the same rows for two colleagues on different
  screens; the range, the search and row keys carry what a page number used
  to. Accepted.
- Every table in a sized parent looks different after this. Minor versions
  for table and alarms.
