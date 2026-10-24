# Shakedown: a Power BI author rebuilds two reports (0.40.4)

Status: needs-triage

A sales report (slicers, KPI cards, a combo chart with drill-down year → quarter → month → day,
cross-highlighting, a region × year matrix with totals, top 10, conditional formatting, a waterfall) and an
operations report (OEE per line and shift, scrap verdicts, downtime Pareto, a drill-through page), plus
bookmarks, a theme, a phone layout and PDF. Vite 8 with `cssTarget`, German, Chromium, 2026-10-24. Not
covered: WebKit, dark, schedule, calculation, dashboard, accessibility. Verdict: both reports in four hours
with 273 lines where Power BI needs none; "a framework, not a report tool" - kept for a plant dashboard, not
as a Power BI replacement in controlling.

## Findings

1. **[Look] Printing the page to PDF cuts the canvas charts off:** charts keep their screen width (a 1216 px
   canvas on A4), so the combo chart shows two of three bars and the waterfall loses its right edge; slicers
   and buttons print too. Worse than a missing print stylesheet - the output is wrong. Idea: re-measure on
   `beforeprint`, plus a print stylesheet.
2. **[Trap] `pageSize: 10` without a mounted `<Pagination/>` renders every row** (2,016 rows, 38,933 DOM nodes,
   a 53-page PDF); a `Pagination` placed after `</Table>` does nothing and says nothing. Idea: a DEV warning.
3. **[Misfit] A numeric year prints "2.024" in German formats**, in the table and in its filter list; no
   plain-integer format to find.
4. **[Misfit] A chart in a tooltip's `render` gets no German** (wording is per chart): "14,000,000" in the
   mini chart beside "14.000.000" on the page. See `composed-app.md` 4.
5. **[Misfit] A waterfall from stacked bars leaks its helper series into the tooltip** ("Basis …", "Summe 0",
   "Rückgang 0"). Idea: a series option to stay out of the tooltip, or a waterfall kind.
6. **[Misfit] No row click and no active row on the table:** cross-highlighting needs `rowProps` data
   attributes and click delegation - mouse-only unless the cell holds a button. See `composed-app.md`.
7. **[Look] At 375 px the waterfall drops category labels.**
8. **[Trap] An unknown `format` object on a column** (`{ style: "percent" }` on a `VerdictColumn`, past the
   compiler with a cast) renders "0,0 +0,0" without a warning.
9. Known, worse here: the CSV date a day off and unreadable in Excel; `toDataURL` without axes; no currency
   format.

## Wishes

- **A cross-filter / cross-highlight model** - one click on a visual filters or highlights the others.
  Workaround: slicers through `t.setFilter` feeding `t.filtered` into the charts, plus 12 lines of highlight.
  Elsewhere: Power BI "Edit interactions", ECharts `dispatchAction`. Unlisted.
- **Drill-down along a time hierarchy.** About 20 lines (a drill stack, keys per level, `onSelect`, a drill-up
  button). Elsewhere: Highcharts Drilldown, ECharts `universalTransition`. Unlisted.
- **A waterfall chart.** About 10 lines of stacked bars with the tooltip noise above. Unlisted.
- **A matrix with row and column totals (pivot).** never: ADR-0032. **Instead holds - until the columns are not
  known at compile time:** pivoted rows in 6 lines with declared columns and `aggregate="sum"` totals work,
  but `Column` is typed per field, so the years had to be hard-coded (`y2024`–`y2026`). Grouping (ADR-0029)
  gives nested rows, not the matrix. Elsewhere: AG Grid pivot, Power BI matrix.
- **Conditional formatting as rules** (data bars, colour scales, icons): 3 lines per column with `Meter`,
  `color-mix`, `Badge`, `VerdictColumn` - a template per column, not a rule. Elsewhere: AG Grid
  `cellClassRules`. Unlisted.
- **Bookmarks and URL state:** 12 lines (`t.view`, `setView`, a hash); `initialView` read once means an effect
  with a JSON compare. Works (a reload restored 672 rows). Unlisted.
- Pie/donut: never, Pareto Instead holds for the operations report (known). A theme file: held up - 8 tokens
  recolour core and charts.

## Effort (lines; Power BI needs none)

Slicers 7 · KPI 8 · combo + drill 24 · cross-highlight 12 · matrix 10 · top N 8 · conditional formatting 9 ·
waterfall 9 · bookmarks 12 · operations page + drill-through 55 · total 273. The docs helped with `setFilter`,
`preFilter`, `pareto()`; they lost him on `Action` (`label`/`onAction` rejected by the types, the real API is
`onSelect` and children), on "one page, one filter", and on where `Pagination` goes. Minimum React needed:
`useState`, `useMemo`, props, one effect, generics read off compiler errors.

## Held up

The types caught misuse of Action, Breadcrumb and Column fields · slicers through `setFilter` keep chips,
reset and `view` in agreement · `Stat` limits give the right German verdict · Legend, LimitLine and a second
y axis worked first try · bar + line and stacked bars work · `onSelect` drill-down works · a mini chart in a
tooltip works · zero console output · drill-through filter carry-over and URL restore hold · German wording
complete.
