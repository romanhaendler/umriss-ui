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
