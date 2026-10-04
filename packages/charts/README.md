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

React 18 or 19 as a peer, and nothing else. `@umriss-ui/core` is **not** a
dependency and not a peer dependency — if an application uses both packages, it
does so because it chose to, not because this one required it (ADR-0020).

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
reader hears each value once the keys rest and a summary of the whole. The
words are English; German comes from its own subpath:

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
* **Several axes per orientation**, each with its own extent; only the first
  registered axis per orientation draws a grid.
* **The instruments**: `LimitLine` and `LimitBand`, `ControlChart` with its four
  rule violations, `pareto()` with a collected remainder, and a working-time
  axis that takes the empty hours out and marks every removed span.
* **The pure modules are exported**, not hidden: `assess`, `controlLimits`,
  `zones`, `violations`, `pareto`, `workingCalendar` and the rest. Whoever
  wants to draw something other than the composition offers should reach the
  arithmetic without rebuilding it.
* **Performance, measured rather than claimed**, up to three series of a
  million points, with the hover at 60 FPS throughout. The figures, the
  measuring run and its conditions stand once, in
  [`docs/capabilities.md`](docs/capabilities.md) under "Performance" — they are
  not repeated here, so that a new measurement has one place to go.

What it deliberately cannot do — animations, a log or category scale,
horizontal bars, pie and radar — stands in the same record, with the reason,
and across all five packages in
[ADR-0032](../../docs/adr/0032-what-umriss-is-not.md). Stacking is not among
them: bars and areas stack (`stack`, `normalize`).

## More

* The demo: <https://romanhaendler.github.io/umriss-ui/charts/>, or locally
  `pnpm dev:charts` (port 4174). It is the documentation — every page
  shows running examples with their source and the props table generated from
  `src/`, each prop linked to the examples that show it. An API index lists
  every export, and one search finds across all five packages.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* **For a coding agent**: `docs/llms-full.md` inside the installed package —
  the demo as one Markdown file, pinned to the installed version: every page
  with its examples' source, its props tables and why it is built as it is,
  and an index of every export with its comment and its declaration. Each
  page also has a Markdown twin online; for the latest version:
  <https://romanhaendler.github.io/umriss-ui/charts/llms.txt>.
* [`docs/capabilities.md`](docs/capabilities.md) — every capability with the
  level at which it is proved.
* [`../../docs/design-language.md`](../../docs/design-language.md) — the design
  language all five packages share.

## Licence

MIT — see [`LICENSE`](LICENSE).
