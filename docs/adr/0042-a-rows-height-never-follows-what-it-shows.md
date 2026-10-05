# A row's height never follows what it shows

Status: accepted
Date:   2026-10

A table's height moved with whatever it held. A row was 13 px type × a line of
1.5 = 19.5 px, plus 16 px of padding and a 1 px line: 36.5 px, a half pixel
that Chromium, Firefox and WebKit each rounded their own way - a row with a
fold measured 37.5, 37.25 and 37.188 px, the last row 36, 36 and 36.5. A
checkbox made a row 38.5 px, an alarm's badge 29, a fold 37.5. Text wrapped:
in **91 of the 116 tables** of the table's demo the rows were of uneven height
at 1280 px, in 98 at 390 px. A short last page and a search that found nothing
moved the pagination bar - "Next" stood 954, 772 and 178 px below the head on
page 1, the last page and an empty result. Loading replaced the rows with four
placeholders, then ten rows came. A virtual window took a `rowHeight` the
application guessed: the demos said 37 for rows of 36.5, 10,000 px off at the
end of twenty thousand. The probe: `.scratch/row-pitch/spec.md`.

**Every line of a table is one row pitch tall, and never what it shows.** The
head, a row, a group header, a placeholder, the aggregate footer: one whole-
pixel line of text and the density's padding, and never less than a small
control and 4 px above and below it. Regular 36 px; compact 27 px under a fine
pointer, where a dense surface's small control is 18 px, and 35 under a finger,
where it stays 26. A row detail is the one line that is as tall as it is - the
user opened it.

**One line, always.** Nothing in a cell wraps. A cell's value stands in one box
that is never wider than its column nor taller than its row, and what does not
fit is cut at the box's edge: text with an ellipsis, which a tip completes under
the pointer and at once on the Active cell; a component plainly, without an
ellipsis or a tip - beside a cut badge an ellipsis read as neither. A component
taller than a row is cut as well, and in development the table says so once per
column. A column without a width grows with its values up
to `min(20rem, 60vw)` - the group span's measure - and cuts there; a column
with a width is that wide, never wider and never narrower, by the same
inline-size containment a field takes (ADR-0041).

**The table's controls are small.** The table sets `ControlSizeProvider
size="sm"`, as its toolbar does; a compact table's dense surface takes `sm` as
`xs`. Every control from @umriss-ui/core fits the pitch without the application
saying a size.

**A page holds its height.** With a pagination bar, a page keeps the most
lines it has shown, up to `pageSize`: a short last page, a search or a
condition that leaves a few rows, and an empty result end in an unlined filler
of the lines they lack - the empty result with its message at the top - and a
table that never had more rows than it shows stays as it is. A grouped page is
`pageSize` lines, the headers it repeats counted; the first load shows a page of
placeholders. Loading over rows keeps the rows - they dim after
`--u-delay-stale` and take no pointer; placeholders stand only where there is
nothing to keep.

**The window counts in the pitch the table measures.** `virtual` is `true` or
`{ overscan }`; the window reads the pitch from the head after every layout.

## Alternatives that were real

**Truncation on request, wrapping by default.** MUI's `getRowHeight: 'auto'`
and AG Grid's `wrapText` with `autoHeight` make a variable height a column's
option. It keeps every row's height a question of its content, and a page's
height with it: a short last page, a filter and a reload move the bar under
the pointer again. Carbon, Primer and Spectrum truncate by default and wrap on
request; umriss does not offer the request at all, because one table with two
kinds of rows is two tables.

**Two or three lines (`rowLines`), as Airtable's row heights.** Every row the
same height, only taller. A data-dense table is read down its columns, and the
whole record is what a row detail is for; the option would have halved the rows
on a screen to spare the reader one click, and it can come when an application
needs it.

**Measuring instead of fixing.** Manual mode measured the previous page's rows
and set its placeholders to their height. It held a refetch still and nothing
else - a first load, a last page, a wrapped row and the half pixel stayed.

**A fixed height of the scroll area** - AG Grid's `domLayout: 'normal'`,
Spectrum's required `height`. It holds the frame and moves the rows inside it,
and a table on a page that flows has no height to give.

## Consequences

The short-token exception (a value of up to 24 characters without a space did
not wrap) is gone: nothing wraps.

`virtual.rowHeight` is gone without an alias, before 1.0, with a line in the
table's changelog.

A cell's text is no longer the cell's child but its value box's; a test that
finds a cell by its text takes `closest("td, th")`.

Loading over rows is a change a caller sees: the rows stay, dimmed. An
application that wants placeholders on every request hands in no rows while it
loads.

The chart's `loading` follows the same rule (chart-loading). A course already
drawn stays: it dims after `--u-delay-stale` and takes no pointer. Where there
is nothing to keep, a silhouette of the coming chart, shaped by its first
series' kind, stands in place of the table's placeholder rows. A chart has a
fixed height, so it has nothing of its own to hold. Its band sweeps a
placeholder and its course fades in once, when the answer arrives; neither
animates the data, which ADR-0032 rules out.

Measured, not argued: the table's browser suite holds every row of every demo
table at one pitch in Chromium, Firefox and WebKit, and "Next" on one pixel
over a short last page and an empty result.
