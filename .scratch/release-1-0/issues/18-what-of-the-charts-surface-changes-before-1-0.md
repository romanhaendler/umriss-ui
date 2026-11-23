# What of the charts' surface changes before 1.0

Type:   grilling
Status: open

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
