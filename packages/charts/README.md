# @umriss-ui/charts

Canvas-based charts for data-dense applications: few chart kinds, each one drawn
properly. Lines, areas, bars, scatters, state bands, matrices and spans compose
into one chart on shared axes — together with the instruments a plant screen is
made of: limit lines and bands, a control chart, a Pareto and an operating-time
axis.

The package depends on **nothing but React**, and it will keep doing so (R-1.2).
It brings no component library, no date library and no chart framework, and the
lint rule over `packages/charts/src/**` holds that fast.

## Install

```bash
pnpm add @umriss-ui/charts@next
```

The package is a **release candidate**, published under the tag `next`. As long
as no released version exists, npm points `latest` at the candidate too — a plain
`pnpm add @umriss-ui/charts` installs it as well.

React 18 or 19 as a peer, and nothing else. `@umriss-ui/core` is **not** a
dependency and not a peer dependency — if an application uses both packages, it
does so because it chose to, not because this one required it (ADR-0020).

No fonts are shipped either. The charts use Geist when the application loads it
(`@fontsource/geist-sans`, `@fontsource/geist-mono`) and the system fonts
otherwise.

## The smallest chart that runs

```tsx
import { Chart, Line, XAxis, YAxis, Tooltip } from "@umriss-ui/charts";
import "@umriss-ui/charts/styles.css";

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
  return (
    <Chart data={DATA} height={280} ariaLabel="Course of one series">
      <XAxis accessor={(d: Point) => d.t} label="Index" />
      <YAxis accessor={(d: Point) => d.a} />
      <Line accessor={(d: Point) => d.a} name="Series A" />
      <Tooltip />
    </Chart>
  );
}
```

A series is an element, not an entry in a configuration object: the order in the
JSX decides what lies over what, and at the same time the palette colour.

## The stylesheet

```ts
import "@umriss-ui/charts/styles.css";
```

The axes, ticks, legend and tooltip are DOM and take their values from the
stylesheet; only the series themselves are drawn on canvas. The JavaScript loads
no CSS of its own, so the application imports the stylesheet itself.

## What it can do

* **Seven series kinds** in one chart on shared axes: `Line`, `Area`, `Bar`,
  `Scatter`, `StateBand`, `Matrix`, `Span`.
* **Several axes per orientation**, each with its own extent; only the first
  registered axis per orientation draws a grid.
* **The instruments**: `LimitLine` and `LimitBand`, `ControlChart` with its four
  rule violations, `pareto()` with a collected remainder, and an operating-time
  axis that takes the empty hours out and marks every removed span.
* **The pure modules are exported**, not hidden: `assess`, `controlLimits`,
  `zones`, `violations`, `pareto`, `operatingCalendar` and the rest. Whoever
  wants to draw something other than the composition offers should reach the
  arithmetic without rebuilding it.
* **Performance, measured rather than claimed.** Three series of 100,000 points
  each: 10.5 ms materialisation, 10.8 ms series draw, 60 FPS on hover; at three
  million points, 49.8 ms and 49.6 ms. The measuring run, its conditions and the
  mixed series set stand in [`docs/capabilities.md`](docs/capabilities.md).

What it deliberately cannot do — zoom and pan, animations, stacking, a category
scale, horizontal bars — stands in the same record, with the reason.

## More

* The demo: <https://romanhaendler.github.io/umriss-ui/charts/>, or locally
  `pnpm dev:charts` (port 4174). It is the documentation — every page
  shows running examples with their source and the props table generated from
  `src/`.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* [`docs/capabilities.md`](docs/capabilities.md) — every capability with the
  level at which it is proved.
* [`../../docs/design-language.md`](../../docs/design-language.md) — the design
  language all three packages share.

## Licence

MIT — see [`LICENSE`](LICENSE).
