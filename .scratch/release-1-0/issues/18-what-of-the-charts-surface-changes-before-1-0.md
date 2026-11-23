# What of the charts' surface changes before 1.0

Type:   grilling
Status: resolved

## Question

"The surface of charts" returned groups of candidates whose change breaks a caller
(`.scratch/release-1-0/research/05-the-surface-of-charts.md`). For each: before 1.0, or frozen as it stands,
and under which name or shape?

- **The exported registry and internal types**: taken back, marked `@experimental` (ADR-0083), or frozen;
  and `SeriesKind` open or closed, by ADR-0059.
- **`tone` as `ok | warning | alarm`**: the glossary keeps Tone for success / warning / danger. Which word
  does a chart's verdict colour get?
- **A series' identity**: the optional `name`, or an id of its own; what `ChartView.hidden` stores.
- **`median` on `BoxPlot`**, the three meanings of `value`, and the three names of an axis binding.
- **`ChartProps` and the DOM's attributes**.
- **`LimitRole`'s `"zone"`**, and the defaults of `LimitLine` and `LimitBand`.
- **Dates in, milliseconds out**: frozen as it stands and said, or changed.
- **The copies of core's `assess`, `Limit`, `Verdict`, `NumberOptions`**: how the two are kept one.

Every one breaks a caller, so every one is the maintainer's. The answer is one line per group, shaped for
`/to-spec`. What is not a break (the parts' props in `API.md`, missing `@default`s, history in doc comments)
the agent decides.

## Answer

The maintainer answered ten questions (2026-11-23). Letters are the findings' sections in
`.scratch/release-1-0/research/05-the-surface-of-charts.md`. All before 1.0; each rename keeps its old name
for one minor (ADR-0066), each break carries its migration line.

**Changes, each a break:**

- **The registry's types leave the index** (D1, D2): `AxisConfig`, `SeriesBase`, `SeriesConfig`,
  `SeriesKind`, the seven `*SeriesConfig`, `LimitConfig`, `LimitLineConfig`, `LimitBandConfig`,
  `LegendConfig`, `TooltipConfig`, `MaterializedSeries`, `BoxChannels`, `Padding`, `Rect`, `ResolvedTheme`,
  `DataTableGroup`, `ParetoOptions`. `ChartPerf` and `onPerf` stay, `@experimental`. `BoxNumbers` and
  `BoxExtras` stay: `TooltipPoint.box` hands them out.
- **`tone` becomes `verdict`** on the seven series prop types (B4), values unchanged: the glossary keeps
  Tone from ever meaning a Verdict.
- **`value` is the reading only** (B3): `Matrix.value` becomes `row`, `StateBand.value` becomes `state`.
  `BoxPlot.median` stays (B2).
- **`ChartProps` takes a `div`'s attributes without `onSelect`, `title` and `color`** (C8, B6).
- **`LimitRole` on `LimitLine` and `LimitBand` is `"specification" | "control"`** (C1); `"zone"` stays
  inside `ControlChart`.
- **A name is required by type** (E): `Chart` takes `aria-label` or `aria-labelledby`, one of the two.
  `Schedule` gets the same either-or, which loosens it.

**Frozen as it stands:**

- **A series is identified by its `name`** (C4); `ChartView.hidden` holds names. *(agent)* A warning in
  development for two series of one name and for hiding an unnamed one. An `id` that falls back to the name
  can come after 1.0.
- **The axis binding** (B1): `xAxisId` / `yAxisId` on series, `id` on axes, `axisId` with `orientation` on
  limits; the limit's doc says why.
- **Charts' copies of core's `assess`, `Limit`, `Verdict`, `Severity`, `NumberOptions`** stay public (D3),
  held together by the conformance test.
- **The rest** (B5, B6, C2, C5, C6, C7, C9, C10, D3): dates in and milliseconds out; `Tooltip` and
  `ControlChart` outside the typed hook; `useChart`'s second type parameter; the defaults of `LimitLine` and
  `LimitBand`; the callbacks' names; the pure helpers.

*(agent)*, no break: the props of the ten parts in `API.md` with the generator (A1); `Bar.barWidth`'s doc
says 0.8 (C3); the missing `@default` lines (A3); ticket names and history leave the doc comments (B7);
`LinearScale` is not filed under "Constants" (A2).
