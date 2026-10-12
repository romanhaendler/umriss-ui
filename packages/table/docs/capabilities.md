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

Machine / browser / date: -

| Rows | Set | First render | Scroll step | Sort | Search | Page | Fold | Hide column | Re-render |
|---|---|---|---|---|---|---|---|---|---|
| 10,000 | virtual | - | - | - | - | n/a | n/a | - | - |
| 10,000 | grouped | - | - | - | - | n/a | - | - | - |
| 10,000 | paged | - | n/a | - | - | - | n/a | - | - |
| 50,000 | virtual | - | - | - | - | n/a | n/a | - | - |
| 50,000 | grouped | - | - | - | - | n/a | - | - | - |
| 50,000 | paged | - | n/a | - | - | - | n/a | - | - |
| 200,000 | virtual | - | - | - | - | n/a | n/a | - | - |
| 200,000 | grouped | - | - | - | - | n/a | - | - | - |
| 200,000 | paged | - | n/a | - | - | - | n/a | - | - |

These are the "before" every later change compares with. Where 200,000 rows
cannot be measured before the table stops throwing above roughly 125,000 rows
with an aggregate, the row says so and is filled in after that fix.
