# Shakedown: a data scientist's analysis app (0.40.4)

Status: needs-triage

Charts, table, calculation and core with data from pandas 3.1 and pyarrow (every `to_json` orient, ISO and
epoch dates, NaN/NaT, int64 beyond 2^53, Arrow tables, typed arrays), statistical views, numbers from 1.6e-19
to 6.02e23, the way back into pandas, and a Streamlit custom component. Vite 8 with `cssTarget`, Chromium,
Europe/Berlin, 2026-10-24. Not covered: anywidget, WebKit, BigInt in charts. Verdict: keep it for dashboards
over sensor data; stay in Plotly for analysis.

## Findings

1. ~~**[Break] A calculation shows a tiny `Given` as `0` and prints a false sentence without "≈":**~~ "N_A times e
   equals 602,214,076,000,000,000,000,000 times 0, equals 96,485.33 C/mol" - shown and spoken. Not the known
   "tiny total rounds to 0" (`calculation.md` 4): here a given itself is mis-shown. Idea: exponential notation,
   or enough digits, once a non-zero value would round to 0. **Fixed 2026-10-24** (spec `.scratch/shakedown-defects/`).
2. **[Look] The table shows tiny numbers as 0 and percent without decimals:** 1.6e-19 → "0" (1e-9 →
   "0.000000001"), 0.256 → "26%", 0.0004 → "0%", `{decimals: 1}` on -0.0004 → "-0.0". Idea: percent with
   decimals, exponential below a threshold, no negative zero.
3. **[Look] No scientific notation anywhere by default:** 6.02e23 prints 24 digits in ticks, tooltip and
   readout; 1.6e-19 reads "charge from 0 to 0". The chart's `tickFormat` Instead works (Intl `scientific`,
   `engineering`, an SI-prefix formatter, about 5 lines each); the table and the calculation have no hook.
4. **[Trap] A table view does not survive JSON for date filters:** a Date range in `onViewChange` becomes ISO
   strings; restoring it shows 40 rows instead of 11, silently. A range `{from: 2, to: Infinity}` is never put
   into the view and filters nothing. Numeric filters restore correctly. Idea: revive ISO strings for date
   columns; an open bound as `from` alone.
5. **[Trap] Wrong data shapes fail silently, and chart and table disagree:** `orient="split"`, `"columns"`,
   `"table"`, `"values"`, a column dict, an Arrow `Table` and a `Float64Array` give a chart "No data" without a
   warning, and a table `e.filter is not a function`. An Arrow int64 (BigInt) cell is blank and breaks
   `JSON.stringify`. Records, epoch (with `time`), ISO with `Z` or an offset, and `Array.from(arrowTable)` work.
   Idea: a DEV warning naming the shape, and column-oriented input. (DEV warnings are dead in Vite:
   `cross-package.md` 15.)
6. **[Misfit] What pandas does before the data arrives** (not umriss): `to_json` rounds floats to 10 digits,
   writes tz-aware times as UTC; `json.dumps` writes a bare `NaN` that `JSON.parse` rejects; int64 above 2^53
   collides as a `rowKey` with a React key error that never names `rowKey`. Idea: a short "from pandas" page.
7. **[Look] Small multiples do not line up:** with `syncId` each plot area starts at a different x (y label
   widths differ) and each y autoscales; a fixed `domain` aligns them. Twelve charts mount in under a second.
8. **[Misfit] A time gap without rows is bridged by a straight line**; only a `null` row makes a gap. Idea: a
   gap threshold.
9. **[Misfit] A custom aggregate cannot be named** ("Aggregate 42" for a median); no built-in median or std (a
   function aggregate works, 4 lines each, NaN skipped).
10. **[Look] An embedded component stays light on a dark Streamlit host** (documented: the library sets no
    `color-scheme`); setting it from Streamlit's theme fixes it.
11. Core's `GlyphProps`/`RefProp` d.ts error under `skipLibCheck: false` (known, `core.md` A5).

## Statistical views

| View | Result |
|---|---|
| Histogram | built in: `bin()` + `Bar`; 1-2-5 edges, not numpy's rules; NaN/null/Infinity dropped; a Float64Array works but is a type error |
| Box plot | built in; the caller supplies the numbers, the whisker rule is not named; outliers beyond 3 IQR as rings fit Tukey's "far out" |
| Scatter, 1M points | draws in 200 ms, hover 33 ms; a solid blob - no opacity or density |
| Fit line + 95 % band | Instead: `Line` + `Area baseline`, about 12 lines of own OLS; works |
| Error bars | gave up; a thin BoxPlot looks right but the tooltip says "quartile" |
| Correlation matrix | `Matrix` with a 9-stop gradient and `range: [-1, 1]` works; stepped, no colour bar, no cell labels |
| Small multiples | `syncId`, with finding 7 |
| Two y axes | built in, fine |

## Numbers out

The calculation propagates no uncertainty and has no sqrt or power, so a quadrature error cannot be built;
significant digits are not modelled · `selectionAsText()`/Ctrl+C is TSV that `pd.read_csv(sep="\t")` parses
(German decimals need `decimal=","`) · the CSV read with `sep=";", decimal=","` round-trips exactly,
`10.299999999999999`, `1.6e-19`, `6.02e+23`, `Infinity` and empty cells included · the chart's
`onViewChange` gives JSON-safe domains · Streamlit: CSS loads inside the iframe, popovers and tooltip work,
the frame height follows the content.

## Wishes (all unlisted unless marked)

Error bars and confidence bands as series (Plotly `error_y`, Vega-Lite `errorbar`) · a fit line with a band
(Plotly trendline, Vega-Lite `regression`) · point opacity or density for a million points (ECharts `large`,
hexbin) · a colour bar and cell labels for `Matrix` with a smooth diverging scale (ECharts `visualMap`) ·
`notation: "scientific" | "engineering" | "si"` and significant digits on axes, columns and the calculation
(Plotly `.3s`, AG Grid `valueFormatter`) · percent with decimals and a name for custom aggregates (AG Grid
`aggFunc`) · a shared y domain / aligned plots for small multiples (Vega-Lite `facet`, Plotly
`shared_yaxes`) · a gap threshold (Highcharts `gapSize`) · typed arrays and Arrow as direct input (today
`Array.from` allocates 1M objects) · uncertainty propagation in the calculation (non-goal in spirit, no unit
algebra) · log scale: never, Instead holds (known).

## Held up

The 1M scatter · Berlin DST days, ISO `Z`, offsets and space-separated times give correct ticks · NaN/null
as gaps or "— No value", skipped in averages · Tukey outliers, the mean marker and the count draw right ·
the CSV round trip into pandas · the numeric `initialView` restore · the Streamlit component.
