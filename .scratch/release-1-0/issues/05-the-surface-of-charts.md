# The surface of charts

Type:   research
Status: resolved

## Question

Review the public surface of `@umriss-ui/charts` for what should not be frozen as it stands.

Read `packages/charts/API.md` first (every export, prop, option and return), then the source and the demo examples where a
line raises a question. Look for:

- **Inconsistent names**: the same thing named two ways across components or packages (a prop, a callback,
  a value of a union), and names that disagree with `CONTEXT.md`.
- **Inconsistent shapes**: callbacks that report differently for the same kind of event, controlled and
  uncontrolled pairs that do not follow one pattern, options that are a boolean here and a union there.
- **Loosely typed surface**: `unknown`, `any` or `string` where the caller could be checked.
- **Deprecated aliases and renames still alive**, and anything exported that nothing documents or uses.
- **Defaults** that surprise, and props whose doc sentence and behaviour disagree.

Candidates only, no decision. For each: where (`file:line`), what stands there, whether setting it right
after 1.0 would cost a major, the smallest change, its size (S/M/L). Say what was not read.

Findings: `.scratch/release-1-0/research/05-the-surface-of-charts.md`

## Answer

Findings: `.scratch/release-1-0/research/05-the-surface-of-charts.md`. Read from source, nothing run. Not
read: the scene, draw, layout and materialize internals, the `--uc-*` tokens, the German wording, the demos,
the tests.

No deprecated alias is alive in charts.

Candidates whose change breaks a caller (decided in "What of the charts' surface changes before 1.0"):

- **About twenty registry and internal types are exported** with no user outside charts (`AxisConfig`,
  `SeriesConfig`, `SeriesKind`, the seven `*SeriesConfig`, `LimitConfig`, `MaterializedSeries`, `ChartPerf`,
  `Rect`, `ResolvedTheme`, ...). `SeriesKind` and `SeriesConfig` are documented as closed, against ADR-0059.
- **`tone` takes `ok | warning | alarm`** on seven prop types; `CONTEXT.md` defines Tone as
  success / warning / danger and says it never means a verdict.
- **A series is identified by its optional `name`**: an unnamed one cannot be hidden, two of one name hide
  together, and `ChartView.hidden` stores names.
- **`BoxPlot` calls its y value `median`** where the other series say `value`; `value` means the row on
  `Matrix` and the state index on `StateBand`. Axis binding has three names (`xAxisId` / `yAxisId`, `id`,
  `axisId` with `orientation`).
- **`ChartProps` extends all of `HTMLAttributes<HTMLDivElement>`**, the DOM's `onSelect`, `color` and `title`
  included.
- **`LimitRole` includes an undocumented `"zone"`**; `LimitLine` defaults to alarm, `LimitBand` to warning.
- **Dates go in, milliseconds come out**: views, ranges and `setDomain` report `number`. `Tooltip` and
  `ControlChart` stand outside the typed hook; `useChart`'s `V` is an unchecked assertion.
- **Charts' own `assess`, `Limit`, `Verdict` and `NumberOptions`** duplicate core's (charts depends on
  nothing); both copies freeze together.

Not a break: `API.md` gives no props for the ten parts `useChart` hands out, and files `LinearScale` under
"Constants"; `Bar.barWidth` is documented as "just under 1" and defaults to 0.8; many defaults carry no
`@default`; ticket names and history stand in public doc comments (`ControlChart.tsx`, `wording/index.ts`,
`materialize.ts`, `Chart.tsx`).
