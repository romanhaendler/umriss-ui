# Shakedown: the six packages as one design family (0.40.4)

Status: needs-triage

A product designer's specimen pages and one composed screen (dashboard widgets holding a Stat, a chart, a
table and a calculation, a schedule below) at 375, 1366 and 1920 px, root 16 and 24 px, light and dark,
Chromium and WebKit, 2026-10-24. Not covered: hover and disabled states of every control, DPR 2, grouped or
grid-mode tables. Single-package looks are in each package's file; core's in `core.md` D.

## Findings, most noticeable first

1. **[Look] In a dashboard, content is clipped or scrolls inside a fixed frame** (1366×768): a `small`
   Figure widget's body is 78 px for a Stat that needs 93 px; a `wide` table widget has 202 px for 271 px
   of content plus its own inner scroller, row 5 half cut and the Pagination invisible; a compact payslip
   in a `medium` widget is 402 px wide for 464 px, so the figures column is off the edge. Same at 375 px and
   in WebKit. Documented ("height follows the size"), but it hits everyone who puts a table or a
   calculation in a widget. See also `dashboard.md` 6.
2. **[Look] A Stat in a widget is a card in a card:** two edges, two shadow stacks, the inner one inset
   about 12 px.
3. **[Look] Chart axis text does not grow with the root font size**: at root 24 px chart ticks stay 11.5 px
   and titles 12 px, while the chart's own legend is 24 px, table cells 19.5 px, schedule ticks 16.5 px.
   Axis and legend text is `--u-color-text-muted`, about 3.1:1 light, 3.74:1 dark.
4. **[Look] An empty chart looks unfinished:** the legend still lists the series and the axes show
   placeholder 0.0–1.0 ticks under "No data". An empty table shows "No data" cleanly.
5. **[Look] Numeric headers in the table sit 14 px left of their numbers** (the reserved sort slot), in
   every numeric column, both engines. Decimals do not align (table and calculation print numbers as given).
6. **[Look] Number typography is not one system:** minus is U+002D in table cells and Stat but U+2212 in the
   calculation's operators; calculation digits are Geist Sans 13 px tabular while the design language puts
   every numeric column in Geist Mono (table 12 px mono, Stat 24 px mono); the unit is small and raised in
   Stat, flush against the number in the calculation.
7. **[Look] Two tooltip looks:** core's dark ink pill against the chart's white card with shadow.
8. **[Look] A loading table shows "0 entries" and "Page 1 of 1"** under its skeleton rows; the pager
   mixes faces ("Page 1 of 6" mono, "Rows", "Back/Next" sans).
9. **[Look] Toolbar controls stay 26 px high at root 24 px** while their text grows from 11 to 16.5 px, so
   the text nearly fills the box (table rows grow from 36 to 46 px).
10. **[Look] Forced colours: chart gridlines are drawn in full system ink**, as heavy as the data.
11. **[Look] At 375 px the schedule's lane gutter takes about 40 % of the width.**

## Wishes

- **A legend left or right of the plot** (placement is `top | bottom`). Gave up. Elsewhere: ECharts
  `legend.orient`, Highcharts `legend.align/layout`. Unlisted.
- **A `loading` state on Chart, Schedule and a dashboard widget**, as Table has. Gave up. Elsewhere: MUI X
  Charts `loading`, Highcharts/ECharts `showLoading`. Unlisted.
- **A pie or donut.** never: ADR-0032. **Instead holds, with a caveat:** `pareto()` + `Bar` (about 8 lines)
  sorts and collects the tail, but shows counts, not shares; share labels need the cumulative `Line` and a
  second axis, more code than a pie.

## Held up

Tokens, edges and the 2 px petrol focus ring are the same on every control in both engines · canvas colours
follow a runtime theme switch · axes are HTML text, crisp at any DPR · dark is consistent across all five ·
core controls beside table controls align (26 px, radius 6 px, same edge) · a throwing widget keeps its
frame · no page-level horizontal scroll in any package at 375/1366/1920 · Chromium and WebKit identical
apart from widget titles 1 px lower in WebKit.
