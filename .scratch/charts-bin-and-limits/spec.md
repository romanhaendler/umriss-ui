# charts: `bin()` and limits a reader can reach

Status: done

## Problem

1. A histogram needs the counting done before the chart. `Bar` already draws on
   a numeric x axis (ADR-0002), so only the arithmetic is missing - the way
   `pareto()` is the arithmetic of a Pareto chart.
2. A `LimitLine` or `LimitBand` told a reader only through colour and a label
   painted in the axis band. What was found before changing anything:
   - Label on the plot: yes (HTML layer, `limitLabels()`).
   - Summary for a screen reader: no limit was named.
   - Tooltip and the readout after a key: no limit was named.
   Both gaps were real, so both are closed - nothing else about limits changes.

## Decisions

| Choice | Decision |
|---|---|
| Signature | `bin(values, options?)` and `bin(rows, value, options?)`; returns `{ from, to, x, count }[]`. Overloaded, not a fixed row shape like `pareto`, because a histogram's input is nearly always a bare column. |
| Options | `width`, `count`, `domain` - nothing else. |
| Width and count both given | `width` wins. |
| Neither given | `count` 10. |
| `count` meaning | A target: the width is the next 1-2-5 step of the ticks (`tickStep`), so the number of bins is near it. With a `domain` it is exact (`(hi - lo) / count`). |
| Nice edges | Without a `domain`, multiples of the width from `floor(min / width)` to `ceil(max / width)`; edges rounded to the width's decimals so 3 x 0.1 is 0.3. |
| Given `domain` | Taken as it is: first edge on its start, last edge on its end (the last bin is shorter when the width does not divide the span). Not widened. |
| Value on an edge | In the bin that edge starts: `[from, to)`. |
| Greatest value | The last bin is closed, so the maximum (or the domain's end) is counted. Consequence: integer data `1, 2` at width 1 gives one bin `[1, 2]`. Same as d3. |
| Outside a `domain` | Left out, not clamped into the end bins. |
| Non-finite values | `NaN`, +-Infinity, `null`, `undefined`, and non-numbers are skipped, as a gap is on a chart. |
| No values | `[]` (no domain given). With a domain and no values: all-zero bins. |
| All values equal | One bin starting on the value, width from `tickStep` (1) or the given `width`. |
| Invalid options | DEV `invariant` for `width <= 0` / `count < 1`, and for more than 10 000 bins; silent in production like the rest of the package. |
| Bar width | The example sets `barWidth={0.94}` so neighbours nearly touch; `Bar` measures its step from the smallest x distance, which is the bin width. |
| Site place | The Bar page: `exports: ["useChart", "bin"]`, a sentence in its `about`, example `Bar/06-histogram.tsx`. No page of its own. |
| Example data | 40 support-ticket answer times written out, no generator. |
| Summary | One sentence `limitList` after the series ranges: "Limits: Name value, ...". Labelled limits only, all orientations, each in its own axis' format; a band's two edges as `a – b`. New wording entry, English and German ("Grenzen: ..."). This changes the summary text of existing charts that have labelled limits (listed under Changed in the changelog); no picture changes. |
| `<Tooltip limits />` | Boolean, default `false`. Rows of the hit's primary y axis only (orientation y, same axis id), label and value, no chip, in the order the limits were declared, after the stack totals. Built-in tooltip only; a `render` prop is untouched (it can compute its own). |
| Readout | With `limits`, the same rows are appended to the readout through the existing `readout` wording as `name value`, so no further wording is needed. |
| Example | `Tooltip/06-limits.tsx`, a line, a labelled band and a labelled line, hand-written data. |
| Row styling | The limit row reuses `uc-tooltip-total` (no chip, name across chip column); no CSS change. |
| ADR | None, per the brief. |

## Out of scope

- Any new chart kind, renderer or `Histogram` component; density curves; unequal bin widths; Sturges/Freedman rules.
- Stacked or grouped histograms (bin each group and use several `Bar`s).
- Limits in the data table, on a custom `render` tooltip, or in the legend.
- Limits of an x axis in the tooltip (the brief says the hit's y axis); they are in the summary.
- Screenshot baselines for the two new examples; `docs/journal.md`; version bump.

## For the maintainer when accepting

- The closed last bin (integer data at width 1 collapses the maximum into the last bin) - the one rule most likely to surprise.
- `count` as a target without a domain, exact with one.
- The summary change on existing charts with labelled limits (`limitList` is a new required key of `ChartsWording`, so a hand-written wording must add it).
- Visual check of the limit rows in the tooltip (`uc-tooltip-total` reuse) and of the histogram bars touching at `barWidth` 0.94; no screenshots were taken (no browser run).
- `limits` is read when a hit changes; toggling the prop with a tooltip open shows on the next hit.

## Comments

**Accepted and released (2026-10-11).** The maintainer checked it by hand on the running demo ("Alles händisch geprüft, sieht gut aus") and took the decisions above as they stand; released in @umriss-ui/charts 0.15.0.
