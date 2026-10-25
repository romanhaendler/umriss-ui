# @umriss-ui/charts

React canvas charts for data-dense dashboards: few chart kinds, each one drawn
properly. Lines, areas, bars, box plots, scatters, state bands and matrices compose into
one chart on shared axes — together with the instruments a monitoring screen is
made of: limit lines and bands, a control chart, a Pareto and a working-time
axis.

The package depends on **nothing but React**, and it will keep doing so (R-1.2).
It brings no component library, no date library and no chart framework, and the
lint rule over `packages/charts/src/**` holds that fast.

## Install

```bash
pnpm add @umriss-ui/charts
```

React 19 or newer as a peer, and nothing else. `@umriss-ui/core` is **not** a
dependency and not a peer dependency — if an application uses both packages, it
does so because it chose to, not because this one required it (ADR-0020).

The package ships ES2022 syntax; an application that serves older browsers
transpiles it itself.

Every entry, `./wording/de` included, begins with `"use client"`, the directive a framework
with Server Components reads to treat a module as client code. A chart is declared by its hook,
`useChart`, so the declaration lives in a Client Component file: a Server Component renders that
file and hands it the rows. On a server a chart gives its labelled frame and an empty canvas; the
drawing arrives after mount. No test runs inside such a framework: the charts are rendered to a
string in a test.

## The smallest chart that runs

```tsx
import { Tooltip, useChart } from "@umriss-ui/charts";

interface Point {
  t: number;
  a: number;
}

const DATA: Point[] = [
  { t: 0, a: 12 },
  { t: 1, a: 18 },
  { t: 2, a: 15 },
  { t: 3, a: 24 },
];

export function Course() {
  const { Chart, XAxis, YAxis, Line } = useChart(DATA);
  return (
    <Chart height={280} ariaLabel="Course of one series">
      <XAxis value="t" label="Index" />
      <YAxis />
      <Line value="a" name="Series A" />
      <Tooltip />
    </Chart>
  );
}
```

`useChart(rows)` binds the chart to its rows, as `useTable` binds a table: it
hands back `Chart`, the axes and every series kind, typed at the row, so that
`value` is a field name the compiler checks - or a function where a field does
not suffice. A series with its own `data` is typed by that data instead, and
an x axis that reads such rows names their type: `<XAxis<Row> value="t" />`.
A y axis reads no value: its series place the rows along y. `Tooltip`, `Legend`, `DataTable`, `LimitLine` and `LimitBand` read no row and
are imported as they are (ADR-0048).

A series is an element, not an entry in a configuration object: the order in the
JSX decides what lies over what, and at the same time the palette colour.

On a touch screen a tap shows the tooltip, and a tap on empty plot or outside
the chart takes it away; a finger swiping over the chart scrolls the page.

**By keyboard and screen reader**, a chart with a `<Tooltip>` is one tab stop:
the arrows walk its values, ↑/↓ choose the series read first, and a screen
reader hears each value once the keys rest and a summary of the whole. A chart
with a zoomable x axis is one as well, without a tooltip: there is nothing to
walk, and plus, minus, Shift with an arrow and 0 zoom and pan it. `onSelect` on
`useChart` hears a click on a hit and Enter on the walked one; the chart keeps
no selection. The words, and with them the numbers and the dates and times of the
axes, tooltip, data table and screen-reader text, are English (`en-GB`, 24-hour
clock); German (`de-DE`) comes from its own subpath. The `locale` of the
wording is the one input - the browser's language is not read:

```tsx
import { GERMAN_CHARTS_WORDING } from "@umriss-ui/charts/wording/de";

<Chart ariaLabel="Verlauf" wording={GERMAN_CHARTS_WORDING}>…</Chart>
```

## Styles

Nothing to import. `dist/charts.js` loads its own stylesheet; the axes, ticks,
legend and tooltip are DOM and take their values from it, and only the series
are drawn on canvas. The stylesheet touches nothing but the chart's own `uc-`
elements and lies in the layer `umriss.components`, so an application's CSS
wins. `@umriss-ui/charts/styles.css` stays exported for setups that link
stylesheets by hand.

**Colours** come from `--uc-*` variables that fall back to the tokens of
`@umriss-ui/core` where they exist and to literals where they do not. **Light and
dark** follow the application's `color-scheme`: the canvas colours are resolved
anew when the root element's attributes or the system preference change;
`invalidateTheme()` covers a switch made on another ancestor. **Fonts** are not
loaded: Geist when the application has it, the system fonts otherwise.
**Browsers:** Chrome 123, Firefox 120, Safari 17.5 or newer.

## What it can do

* **Seven series kinds** in one chart on shared axes: `Line`, `Area`, `Bar`,
  `BoxPlot`, `Scatter`, `StateBand`, `Matrix`. Occupancy — work on people or vehicles, idle time,
  double bookings — is `@umriss-ui/schedule`'s (ADR-0026).
* **Rows as they come** (ADR-0052): an axis reads a category from a string -
  a place, a tick and its name each, in the rows' order or your own
  `categories` - and an instant from a `Date` or, with `time`, from the ISO
  string an API sends. No position computed per row, no tick list, no lookup.
* **Several axes per orientation**, each with its own extent; only the first
  registered axis per orientation draws a grid.
* **The chart holds its own view** (ADR-0047): an `XAxis zoomable` zooms and
  pans by wheel, pinch, drag and keys within its `zoomLimits`, and a 'Show
  all' button brings the whole back; the legend hides and shows a series on a
  click and shows only it on a double click. `useChart(rows, { initialView,
  onViewChange })` takes a start, read once, and reports what the reader does,
  always the whole view - charts in step send each other theirs through
  `setView`, which is not reported; `setDomain`, `toggleSeries`, `showOnly`
  and `showAllSeries` stand on what the hook hands back.
* **A chart that is loading says so**, as the table does: `loading` keeps
  and dims a course already drawn, and where there is nothing yet a
  silhouette of the chart to come shimmers in the plot (ADR-0042).
* **The instruments**: `LimitLine` and `LimitBand`, `ControlChart` with its four
  rule violations, `pareto()` with a collected remainder, `bin()` for a
  histogram, and a working-time axis that takes the empty hours out and marks
  every removed span. `<Tooltip limits />` reads the labelled limits at a hit.
* **The pure modules are exported**, not hidden: `assess`, `controlLimits`,
  `zones`, `violations`, `pareto`, `workingCalendar` and the rest. Whoever
  wants to draw something other than the composition offers should reach the
  arithmetic without rebuilding it.
* **Performance, measured rather than claimed**, up to three series of a
  million points, with the hover at 60 FPS throughout. The figures, the
  measuring run and its conditions stand once, in
  [`docs/capabilities.md`](docs/capabilities.md) under "Performance" — they are
  not repeated here, so that a new measurement has one place to go.

What it deliberately cannot do — animations, a log scale, pie, donut and
radar — stands in the same record, with the reason,
and across all five packages in
[ADR-0032](../../docs/adr/0032-what-umriss-is-not.md). Stacking is not among
them: bars and areas stack (`stack`, `normalize`). Horizontal bars are the
next kind to come (ADR-0059).

## More

* The demo, in a checkout: `pnpm dev:charts` (port 4174). It is the documentation — every page
  shows running examples with their source and the props table generated from
  `src/`, each prop linked to the examples that show it. An API index lists
  every export, and one search finds across all five packages.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* **For a coding agent**: `docs/llms-full.md` inside the installed package —
  the demo as one Markdown file, pinned to the installed version: every page
  with its examples' source, its props tables and why it is built as it is,
  and an index of every export with its comment and its declaration. The running documentation of a version is opened as [the repository README describes](https://github.com/romanhaendler/umriss-ui#see-it-running): check out the tag `<package>-v<version>`, then `pnpm start`.
* [`docs/capabilities.md`](docs/capabilities.md) — every capability with the
  level at which it is proved.
* [`../../docs/design-language.md`](../../docs/design-language.md) — the design
  language all five packages share.

## Licence

MIT — see [`LICENSE`](LICENSE).
