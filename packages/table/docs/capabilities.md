# Capabilities - @umriss-ui/table

What the table can be shown to do, and the figures of what it costs.

## Performance (reference run)

The page is the table demo's Benchmark page (`demo/examples/Benchmark/01-benchmark.tsx`),
run in the demo build. It measures from outside with the clock and adds nothing
to the table.

**Method.** A figure is the time `flushSync` takes around the change: render,
commit and layout effects, not the paint. The table has a footer
aggregate (sum of duration and size). Rows are
generated from a fixed seed, so every run has the same ones. Machine, browser and
date are written under the table when it is filled in. Each figure is the
median of five runs, except as noted.

| Figure | What is timed |
|---|---|
| First render | mounting the table on the rows, the previous table gone |
| Scroll step | mean over 60 scripted steps of 600 px each, from the scroll event to the change of the rows in the DOM; the table renders a scroll outside `flushSync`, so this includes React's scheduling, not the paint (virtual and grouped only) |
| Sort | sorting by the duration column |
| Search | one search text set, then cleared |
| Page | page 2 and on turned (paged only) |
| Fold | `foldAll` on the grouped table (grouped only) |
| Hide column | one column hidden |
| Re-render | the caller renders again with nothing changed, accessors written inline |

Sets: **virtual** = virtualised, footer aggregate. **Grouped** = the same, grouped by
service with share bars. **Paged** = pages of 50 instead of a window.

All figures in milliseconds; `-` means not yet measured, or not applicable in that set.

Machine / browser / date: Apple M2, 16 GB; Chromium headless (Playwright 1.62);
2026-10-12. One run of the page per row, driven by a script.

| Rows | Set | First render | Scroll step | Sort | Search | Page | Fold | Hide column | Re-render |
|---|---|---|---|---|---|---|---|---|---|
| 10,000 | virtual | 24.2 | 12.1 | 28.8 | 11.0 | n/a | n/a | 26.6 | 21.0 |
| 10,000 | grouped | 42.8 | 18.2 | 36.3 | 11.8 | n/a | 46.6 | 33.5 | 21.8 |
| 10,000 | paged | 22.6 | n/a | 18.9 | 9.1 | 19.4 | n/a | 18.7 | 20.0 |
| 50,000 | virtual | 62.4 | 36.2 | 122.9 | 37.2 | n/a | n/a | 123.6 | 77.6 |
| 50,000 | grouped | 137.5 | 71.0 | 165.8 | 49.3 | n/a | 220.3 | 162.1 | 102.7 |
| 50,000 | paged | 71.1 | n/a | 79.6 | 28.2 | 78.5 | n/a | 77.0 | 75.5 |
| 200,000 | virtual | 214.6 | 135.2 | 487.9 | 134.8 | n/a | n/a | 485.8 | 308.4 |
| 200,000 | grouped | 494.5 | 269.1 | 669.1 | 173.1 | n/a | 901.9 | 669.8 | 420.9 |
| 200,000 | paged | 216.8 | n/a | 314.1 | 92.9 | 311.9 | n/a | 310.0 | 308.6 |

These are the figures every later change compares with. They were taken after
the table stopped throwing above roughly 125,000 rows with an aggregate, and
before anything else about its speed was changed.

## What changed the figures

An accessor written in the call (a column's `value`, `sortValue`, `groupValue`
and the `rowKey`) is held while the next one has the same source text; a native
or bound function is compared by identity. A closure over a changed outer
variable reads as unchanged. The `preFilter` is not compared this way: it is
applied on every render and its result reconciled, because a pre-filter that
reads the caller's state is the ordinary case. With it, an aggregate is computed
once for a set of rows, and a scroll inside the virtual window renders nothing.
Same machine and page as above; milliseconds.

| Change | Rows | Set | Figure | Before | After |
|---|---|---|---|---|---|
| Inline accessors compared by source text | 50,000 | virtual | Scroll step | 36.2 | 5.2 |
| Inline accessors compared by source text | 50,000 | virtual | Re-render | 77.6 | 4.0 |
| Inline accessors compared by source text | 50,000 | grouped | Scroll step | 71.0 | 4.0 |
| Inline accessors compared by source text | 50,000 | grouped | Re-render | 102.7 | 4.2 |
| Inline accessors compared by source text | 200,000 | virtual | Scroll step | 135.2 | 7.9 |
| Inline accessors compared by source text | 200,000 | virtual | Re-render | 308.4 | 15.9 |
| Inline accessors compared by source text | 200,000 | grouped | Scroll step | 269.1 | 9.0 |
| Inline accessors compared by source text | 200,000 | grouped | Re-render | 420.9 | 22.0 |
| Pipeline in stages (filter and sort, grouping, page and columns) | 50,000 | paged | Page turned | 55.8 | 6.3 |
| Pipeline in stages | 50,000 | grouped | Group folded | 74.9 | 4.2 |
| Pipeline in stages | 50,000 | virtual | Column hidden | 47.8 | 4.0 |
| Pipeline in stages | 200,000 | paged | Page turned | 204.8 | 19.2 |
| Pipeline in stages | 200,000 | grouped | Group folded | 445.9 | 16.8 |
| Pipeline in stages | 200,000 | virtual | Column hidden | 212.8 | 17.3 |
| Sort keys read once per row and sort | 50,000 | virtual | Sort | 44.7 | 40.6 (kept) |
| Sort keys read once per row and sort | 50,000 | paged | Sort | 50.0 | 40.9 (kept) |
| Sort keys read once per row and sort | 200,000 | virtual | Sort | 189.4 | 161.1 (kept) |
| Sort keys read once per row and sort | 200,000 | paged | Sort | 211.6 | 166.4 (kept) |
| Deferred value for the search | 50,000 | virtual | Search | 13.8 | 3.7 (dropped) |
| Deferred value for the search | 200,000 | virtual | Search | 50.0 | 14.8 (dropped) |
| Toolbar skips the selected-rows scan when nothing is selected | 50,000 | virtual | Re-render | 4.0 | 1.0 (kept) |
| Toolbar skips the selected-rows scan when nothing is selected | 200,000 | virtual | Re-render | 12.5 | 2.8 (kept) |
| Toolbar skips the selected-rows scan when nothing is selected | 200,000 | virtual | Scroll step | 6.7 | 4.3 (kept) |
| Toolbar skips the selected-rows scan when nothing is selected | 200,000 | grouped | Re-render | 12.9 | 1.0 (kept) |

The sort keys are kept: the order is unchanged and the sort falls by a tenth to
a quarter. The deferred search is dropped: its figure falls only because the
page times a synchronous `setSearch`, and the filtering moves into a later
render; the rows a person sees match no sooner, and the field, controlled by
the same state, was held up by at most one filtering (14 ms at 50,000 rows).

What still grew with the rows was the toolbar: each render filtered the whole
filtered set for the selected rows, although nothing was selected. With an
empty selection it now holds no row without the pass; the rows a selection
holds are found as before. A profile of the re-render at 200,000 rows named it
(15 of the 30 ms of script); nothing else in a render grows with the rows now.

Not tried, because the figures leave nothing to win: memoised rows and cells (a
re-render costs 1 to 3 ms at 200,000 rows with some thirty rows drawn, and a
scroll step replaces nearly every row, so a held row would be drawn anyway); a
row's position in its group and a group checkbox's state without a scan of the
group (a grouped scroll step is 2.7 ms at 200,000 rows); the per-render maps of
tree rows and of the grid, built once per projection (they are built from the
rows drawn, not from all of them); the frame's layout effects reading boxes only
when rows can have moved (the 60 ms of a scroll run that a profile shows is the
browser laying out the new rows, paid by whichever read comes first, and a scroll
step does move rows).
