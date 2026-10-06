# 01: Grid columns of their own widths

**What to build:** A caller gives each column of a `Grid` its own width without CSS of their own: `columns` takes, besides a count, a list with one width per column - a number in pixels, or `"fill"` for an equal share of what the fixed columns leave, guarded so a long line cannot push its column wider than its share. The Stack and Grid page shows it in a new example, "Columns of their own widths": a cost centre's key figures, a 140 px column of labels beside a `"fill"` column of values. See `../spec.md` for every decision.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `columns` accepts `number | readonly GridColumnWidth[]`; `GridColumnWidth = number | "fill"` is exported and listed under the page's "Types on this page"
- [x] A number becomes a pixel track, `"fill"` the same guarded share `Grid` already writes for a count; the list's length is the column count
- [x] `minItemWidth` wins over a list as over a count, and both doc comments say so (wording in the spec)
- [x] A count or no `columns` behaves exactly as in 0.27: the "Fixed columns" and "Columns by width" baselines do not change
- [x] New example "Columns of their own widths" after "Columns by width"; its lead names pixels, `"fill"` and that `minItemWidth` wins; "Fixed columns" keeps its name
- [x] Layout test in the Sizes behaviour spec on the new example: label column 140 px; value column one gap to its right, ending on the grid's right edge; at a 320 px viewport the label column is still 140 px and no value cell reaches past the grid's right edge
- [x] Screenshot baselines for the new example (light and dark) added, page baselines redrawn; forced-colours baselines redrawn only where the added example moves them
- [x] "Added" entry in core's changelog
- [x] Lint, types, unit, build and visual green

## Comments

- Done. The page baselines (`page-stack-and-grid-*`) did not move: they show the page's head only. The tour summary's baselines were redrawn - the example above it moves it by a fraction of a pixel, its content unchanged. The layout test fails when `"fill"` is written as a bare `1fr`. Full visual suite: 3116 passed; four charts screenshots that lost their browser mid-run passed on `--last-failed`.
