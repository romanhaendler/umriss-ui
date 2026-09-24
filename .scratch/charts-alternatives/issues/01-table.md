# 01 - The data table

Status: done
Type: task

Spec: `.scratch/charts-alternatives/spec.md`

## Scope

C1, C2, C5.

## Acceptance

- jsdom tests: columns, formats, visible domain, downsampled caption; axe clean; screenshot.

## Comments

Delivered (2026-09-24). `<DataTable />` registers like the legend; whether it
is open is the scene's, because two elements show it - the key at the end of
the legend (on a line of its own without one) and the panel. The rows are a
pure module, `src/table.ts`: the visible domain, the series of one x axis
merged on their x, and above 500 rows each series thinned by `downsample`
into first/min/max/last per stretch, the stretches shared out so that all
series together stay under the limit; a matrix gets a table of its own. Cells
are written in the tooltip's formats (series `format`, else the y axis'
`tickFormat`), a time axis carries seconds where rows lie less than a minute
apart.

One decision the spec left open: the table lies **over** the plot area, not
below the chart. A chart has a fixed height, and a table growing inside the
root would squeeze the plot to nothing; the panel covers the plot's box
(measured after each layout), scrolls there, and the plot beneath keeps its
size and is `visibility: hidden` meanwhile - so live data keeps it current and
closing shows it at once. The panel is a tab stop of its own (axe:
scrollable-region-focusable) with the chart's ring.

Tests: `tests-unit/table.test.ts` (rows, merge, gap, limit, thinning, the
caption in both languages), `tests-unit/dataTable.jsdom.test.tsx` (key in and
without the legend, disclosure, columns and formats, scopes, visible domain,
hidden series, new data while open, states, downsampled caption, German);
Playwright: two new examples (`data-table`, `a-week-as-a-table`) closed and
open, and axe on the open table. The `tooltip` page head moved - its import
line names `DataTable` now -, looked at and renewed (light and dark); nothing
else moved (175 passed).
