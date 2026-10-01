# Box plot

Status: ready-for-agent
Date:   2026-10-01
Origin: grilling session of 1 Oct 2026; `packages/charts/docs/capabilities.md`
listed the box plot under "Later" ("a kind of its own with five channels").

## Problem Statement

A reader of a data-dense screen wants to compare distributions: the cycle time
of three machines, the response time per hour across a day, a batch before and
after a change. Today `@umriss-ui/charts` shows single values per x - a line, a
bar, a scatter - and a distribution has to be faked from bars and limit lines,
or drawn with another library that looks and reads nothing like the rest of the
screen.

## Solution

A new series kind `"box"`, written as `<BoxPlot>`. It draws, at each x, a
**Box**: lower to upper quartile, the median across it, a **Whisker** to each
side, optionally a **Notch**, a mean marker, and the **Outliers** beyond the
whiskers. The caller brings every number - the library computes none of them -
so it draws boxes aggregated in a database just as well as boxes computed in
the browser. It sits on the numeric x axis like a bar (ADR-0002), mixes with
every other kind, groups side by side, is read by the tooltip, the readout, the
keyboard walk and the data table exactly as every other series is, and speaks
English and German.

## Decisions

From the grilling session; each is the user's.

| # | Question | Decision |
| --- | --- | --- |
| B1 | Use | Distributions per time bucket and per group alike, both on the numeric x axis; groups are positions named by `tickFormat`. No category scale. |
| B2 | Who computes | The caller. The library draws the numbers it is given and exports no statistics helper; quartile method and whisker rule are the caller's and are not named anywhere in the library. |
| B3 | Orientation | Upright only, as bars are ("horizontal bars" is Out). |
| B4 | Features | Box, median, whiskers, outliers, far-out outliers, mean marker, notches, grouping. Out: width by n, jitter/beeswarm, violin, horizontal. |
| B5 | Limits | No automatic tone from limits; `tone` is set by the caller, `LimitLine`s in the same chart show the specification. |
| B6 | Name | Component `<BoxPlot>`, kind `"box"`, the mark is a **Box**. |
| B7 | Outliers | An accessor returning an array per datum; they belong to their box (one series, one legend entry, one colour). ADR-0040. |
| B8 | Props | `median` (the base accessor), `lowerQuartile`, `upperQuartile`, `lowerWhisker`, `upperWhisker`; optional `outliers`, `mean`, `notchLower` + `notchUpper` (both or neither), `count`; `boxWidth` like `barWidth`. No ± SD. |
| B9 | Reading | Tooltip and data table top to bottom as drawn: upper whisker, upper quartile, median, lower quartile, lower whisker; then mean, n and outliers where given. Outliers as a count and their values, cut after five ("and 7 more"). |
| B10 | Term | "Outlier" stays, distinguished in `CONTEXT.md` from the control chart's `"outlier"` **Rule**. |
| B11 | Hit and walk | The hit is the box at its x; arrows walk box to box; outliers are never hits of their own. The active point's marker sits on the median. |
| B12 | Look | Start values: fill in the series colour at 0.18 with a full 1px outline; median 2px; whiskers 1px with a cap half the box wide; mean a small ×; outliers filled circles r 3, far-out (beyond 3 IQR of the box's own quartiles) a ring; the notch a waist in the outline. Final look settled by the user at the rendered image (ticket 04). |

## User Stories

1. As a dashboard developer, I want to draw a box per machine from five numbers I already have, so that I can compare their spread at a glance.
2. As a dashboard developer, I want to name each machine's position with `tickFormat`, so that the x axis reads as categories without a category scale.
3. As a dashboard developer, I want boxes on a time axis, so that I can show the distribution per hour or per shift.
4. As a dashboard developer, I want to pass numbers aggregated by my database, so that I do not ship raw samples to the browser.
5. As a dashboard developer, I want the library to make no assumption about my quartile method or whisker rule, so that the picture shows exactly what my analysis computed.
6. As a dashboard developer, I want props named for what they are (`lowerQuartile`, `upperWhisker`), so that I never wonder which of five numbers an `accessor` means.
7. As a dashboard developer, I want to pass the outliers per box as an array, so that I do not have to flatten them into a second dataset.
8. As a dashboard developer, I want outliers to belong to their box, so that the legend carries one entry per series and hiding a series hides its outliers.
9. As a reader, I want an outlier beyond three IQR to look different from one just past the whisker, so that I can tell an extreme from a straggler.
10. As a dashboard developer, I want an optional mean marker, so that a skewed distribution shows the gap between mean and median.
11. As a dashboard developer, I want optional notches from two bounds I give, so that a reader can judge whether two medians differ.
12. As a dashboard developer, I want to give only one notch bound and be warned in DEV, so that a half-given notch is not silently drawn wrong.
13. As a dashboard developer, I want an optional count `n`, so that the tooltip and the table say how many values stand behind a box.
14. As a dashboard developer, I want several `<BoxPlot>` series on one x axis to stand side by side, so that before and after are compared per group.
15. As a dashboard developer, I want `boxWidth` as a fraction of the step, so that boxes size like bars and never overlap.
16. As a dashboard developer, I want to mix `<BoxPlot>` with `<Line>`, `<Scatter>` and `LimitLine`s in one chart, so that a median trend and the specification stand over the boxes.
17. As a dashboard developer, I want `color` and `tone` as on every series, so that a box I judged out of specification reads as alarm.
18. As a dashboard developer, I want `hidden` to take a box series out of drawing, hit and extent, so that the legend toggle works as for every series.
19. As a reader, I want the y axis to include whiskers, outliers, mean and notches, so that nothing of a box is clipped.
20. As a reader, I want a gap (a missing median) to draw no box, so that a missing group is visibly missing rather than zero.
21. As a reader, I want to hover a box and see its numbers top to bottom as drawn, so that the tooltip reads like the picture.
22. As a reader, I want the tooltip to list outliers as a count and their values, cut after five, so that a long tail does not flood the screen.
23. As a keyboard user, I want the arrow keys to walk from box to box, so that I can read every distribution without a mouse.
24. As a screen reader user, I want the readout to announce a box's numbers in order, so that I hear the distribution, not only the median.
25. As a screen reader user, I want the data table to list every box with its columns, so that I can read all numbers as text.
26. As a reader, I want columns for mean, n and outliers only where they were given, so that the table carries no empty columns.
27. As a German-speaking user, I want the tooltip and table labels in German through the charts' German wording, so that the box plot speaks as the rest of the screen.
28. As a developer, I want `format` and the y axis' `tickFormat` to write every number of the box, so that units read the same everywhere.
29. As a reader in dark mode, I want the box to resolve its colours from the theme, so that it reads in both themes.
30. As a reader under forced colours, I want the box drawn in system colours, so that it stays visible.
31. As a reader who cannot tell colours apart, I want a box series to carry the encoding by marks (hatch) its bar would, so that two box series are distinguishable without colour.
32. As a library user, I want a demo with examples from minimal to fully detailed, so that I can copy the one closest to my need.
33. As a coding agent, I want the props documented in the source, so that the generated props table and `llms.txt` describe `<BoxPlot>`.
34. As a maintainer, I want the outlier channels null for every other kind, so that ADR-0011's channel layout keeps describing what it holds.

## Implementation Decisions

- **Series kind.** A `"box"` member joins the closed `SeriesConfig` union with its five accessors (median as the base accessor), the optional ones and `boxWidth`. Properties only the box carries stand in its member, never in the base.
- **Materialisation.** The median goes into `y`. The quartiles, whisker ends, mean and notch bounds are named channels of their own, null for every other kind (ADR-0011). The outliers materialise into two named channels: one flat array of values and one array of offsets per box (ADR-0040). The far-out distinction is not materialised: it is derived when drawing, from the box's own quartiles.
- **Extent.** A box series' extent spans its whisker ends, outliers, mean and notch bounds. A gap (median absent) contributes nothing.
- **Width and grouping.** As bars: a fraction of the step (ADR-0002); box series on the same x axis share the step side by side. Whether boxes and bars share one group when mixed on the same axis follows whatever is the simpler rule in the existing grouping; the decision is written in the ticket's comment.
- **Drawing.** In the scene's existing monomorphic draw loop, as one more kind; values per B12. Colours from the theme (palette by name, `tone`, forced colours); encoding by marks as the bar's.
- **Hit.** The box at x by the existing binary search over x; the overlay marker on the median.
- **Tooltip, readout, data table.** Per B9, through the existing tooltip point and table paths. The tooltip point gains named, box-only fields for the further numbers rather than reusing `yValue` or `value` (ADR-0011's reasoning for `value`).
- **Wording.** New entries in `ChartsWording` for the five names, mean, n, outliers and the "and N more" cut; German in `wording/de` (ADR-0031).
- **Export.** `BoxPlot`, `BoxPlotProps` and `BoxSeriesConfig` at the end of the index, by the workspace's rule for new exports.
- **DEV warnings.** One notch bound without the other; numbers out of order (not lower whisker ≤ lower quartile ≤ median ≤ upper quartile ≤ upper whisker) warn once and draw what is given.
- **ADR-0040** records B7. `CONTEXT.md` already carries **Box**, **Whisker**, **Notch** and **Outlier (of a box)**; the **Series kind** entry's list of kinds is brought up to date when the kind ships.
- **Docs.** `capabilities.md`: the box plot leaves "Later" for the capability list; "Out" gains violin and jitter with their reason (smoothing; a picture that does not repeat). The charts `CHANGELOG` gains the entry.

## Testing Decisions

- A good test drives the public API and reads what a user meets: text in the tooltip, the readout, the data table, the tick labels, the legend. It does not reach into the scene's internals unless the thing tested is internal by nature (the channel layout).
- **Seam 1 - a mounted chart in jsdom**, by the existing `renderChart` helper (prior art: `stacking.jsdom.test.tsx`, `tooltipFormat.jsdom.test.tsx`, `keyboard.jsdom.test.tsx`, `wording.jsdom.test.tsx`, `dataTable.jsdom.test.tsx`, `legendToggle.jsdom.test.tsx`). It proves: tooltip order and contents, the outlier cut after five, optional rows only where given, `format`/`tickFormat`, the keyboard walk box to box, the readout, the data table's columns, `hidden`, the extent through tick labels, German wording, DEV warnings.
- **Seam 2 - the existing ADR-0011 assertion** in `materialize.test.ts`, extended: the box's channels hold their values, the outlier values and offsets are right with gaps and empty arrays, and every new channel is null for every other kind.
- **Seam 3 - Playwright screenshots** of the demo examples (`tests-visual`), light and dark: the look. No unit test of drawing geometry beyond what `draw.test.ts` already checks for every kind.
- No pure-function test: the library computes no statistics (B2).

## Tickets

Vertical slices; 02-04 each need 01 only, but touch the same files - worked one
after another.

| Ticket | Scope | Size | Blocked by |
| --- | --- | --- | --- |
| 01 | A minimal box, end to end | M | - |
| 02 | Several series - grouped and mixed | M | 01 |
| 03 | Outliers | M | 01 |
| 04 | Mean, notches and count | S | 01 |
| 05 | Final polish round | S | 02, 03, 04 |

## Out of Scope

- A statistics helper (`boxStats`), quartile methods, whisker rules - the caller's (B2); additive later.
- Horizontal boxes (B3), a category scale (ADR-0002).
- Box width proportional to n.
- Jittered or beeswarm raw points; a deterministic beeswarm would be a kind of its own.
- Violin plots: a density estimate is smoothing.
- ± standard deviation at the mean.
- Automatic tone from limits (B5).
- Outliers as hits of their own (B11).

## Further Notes

The demo ladder (ticket 03): minimal (three machines); over time (response
time per hour); with outliers incl. far-out; mean and notches; grouped before
and after with a legend toggle; with specification `LimitLine`s and a box the
caller set to `tone="alarm"`; detailed (box per shift plus a `Line` of the
medians, tooltip and data table).
