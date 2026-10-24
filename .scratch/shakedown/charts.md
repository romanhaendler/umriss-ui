# Shakedown: @umriss-ui/charts 0.40.4

Status: needs-triage

A Vite host (TS strict, `exactOptionalPropertyTypes`, `skipLibCheck:false`, StrictMode) with core and charts
from the packed tarballs, Chromium, 2026-10-24. Not run: WebKit, `ar-EG`/`de-DE` locales, series changed
during a held hover, browser zoom, range selection / navigator. Build, server and test findings for charts
(the black canvas under Vite 8, Jest and `import.meta`, jsdom) are in `cross-package.md`.

## Findings

1. **[Misfit] A theme switch on an ancestor other than `<html>` leaves the canvas in the old colours** until
   `invalidateTheme()` is called (`src/theme.ts`). A ThemeProvider on a wrapper div, per-panel themes and
   embedded widgets hit it. Documented in the README; idea: observe the chart's own ancestors.
2. **[Look] Values around 1e-9 give y ticks that all read `0.000000`.** Five identical labels. Sensor data in
   SI base units hits it. Idea: exponential notation, or enough digits to keep ticks distinct.
3. **[Look] The "Show data" key is 3.4:1** (`#8b8b8b` on white, 12.5 px), axe's only serious violation:
   core B5 again.
4. **[Misfit] A screen reader meets the chart as one `role=application`**, which swallows browse-mode
   reading; the keyboard walk, the live readout and the hidden data table work.

5. **[Trap] Wrong data gives "No data" and no message:** an object instead of an array, a series naming a
   field that does not exist, values as strings; `data={undefined}` while loading throws `reading
   'length'`. With the DEV warnings dead in Vite (`cross-package.md` 15) a beginner gets no hint at all.
6. **[Look] A chart in a dashboard widget is cut at the bottom:** its 300 px floor (ADR-0050) is taller than
   a 4-row widget body (226 px), so neither the `height:100%` recipe nor a larger widget below 5 rows helps.
7. **[Misfit] Bars on `Date` rows get weekly ticks and unlabelled month bars**; per-month bars need string
   categories.

## Wishes

- **A "per month" aggregation helper and a month tick unit.** Workaround: 6 lines of `perMonth()` and
  strings as categories. Elsewhere: ECharts dataset transform, Highcharts data grouping. `capabilities.md`
  calls aggregation the application's.
- **Currency formatting** (`format="currency"`) in ticks, also in table columns and `Stat` ("1.259,5" with
  no trailing zero). Workaround: `decimals: 2` and "€" in the label. Elsewhere: Intl `style:"currency"`.
  Unlisted.

- **A log y axis.** never: ADR-0032/0059. **Instead holds:** `Math.log10` in the accessor and a `10^n`
  `tickFormat` (about 8 lines) give ticks 10^0…10^6, a tooltip "3.5e+3" and a correct summary; no minor
  ticks, steps of two decades.
- **Export the whole chart as an image.** never: ADR-0032 ("a canvas already exports itself"). **Instead
  fails:** a chart is two canvases (`uc-layer-series`, `uc-layer-overlay`), and axes, ticks, legend and
  tooltip are DOM, so `toDataURL` yields only the plotted series on a transparent ground. A host must
  rasterise the DOM itself. Elsewhere: ECharts `getDataURL()`, Highcharts exporting, MUI X Charts.
- **Display in a fixed time zone** (UTC, the plant's zone). Workaround: a `tickFormat` with `timeZone`
  (3 lines); the tooltip came out right, tick alignment untested. Elsewhere: Highcharts `time.timezone`.
  not yet: ADR-0060.

## Held up

Empty, one point, two identical, all-equal, all-zero, all-NaN, NaN/null/±Infinity, mixed sign, 1e15 flat,
unsorted and duplicate x render without error; gaps stay gaps · Date, epoch and ISO x give identical axes ·
1M points ready in 0.4 s, 16 ms per hover move; 200 series the same · 60 Hz streaming for 120 s: frames
16.7 ms (max 16.8), heap flat, observers and listeners constant · 100 mount cycles leave nothing · DST in
Berlin and New York, year boundary and 29 Feb: ticks on local boundaries; the working-time axis across a
weekend and a holiday correct, also in the DST week · charts in a hidden tab, a collapsed Accordion, a
height-less flex/grid child, a dragged Splitter, `transform: scale(.5)`, DPR 1/2/3, print and a Modal all
size and hover correctly · root theme switches and `prefers-color-scheme` redraw; forced colours use system
colours · tooltip flips at the edges, touch tap and tap-outside work, keyboard walk sets the live region,
the tooltip follows a scroll · charts' own d.ts compiles under `exactOptionalPropertyTypes`.
