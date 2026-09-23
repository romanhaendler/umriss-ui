# Changes to `@umriss-ui/charts`

This document describes what changes for **callers** of the package: exports,
props, behaviour. What was worked on in the repository — rebuilds, tests,
decisions that are invisible from outside — stands in the repository's journal
(`docs/journal.md`) and in the specs under `.scratch/`.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. As long as the first digit is `0`, no number
promises compatibility — which is why a rule stronger than the figure applies as
well: **whatever changes existing behaviour stands under a heading "Changed" of
its own**, no matter which digit rose. Whoever reads only one section before an
upgrade reads that one.

**Names read forwards.** Where an entry describes a name that has since been
renamed, it is named here as it is called today; names that were removed stand
as they stood.

The versions 0.1.0 and 0.2.0 were reconstructed afterwards, out of the
specs; the document itself came into being only with
`library-audit` 08. They are grouped by unit of delivery, not by commit, and were
never published.

**Release candidates.** `0.3.0-rc.0` and `0.3.0-rc.1` were the two versions on
the registry, under the tag `next`. With `0.3.0` that is over: the tag is gone
and `pnpm add @umriss-ui/charts` is the whole install line. A release candidate
promised nothing a `0.x` does not already fail to promise; it said the
interface was still expected to move before `0.3.0`.

---

## Unreleased – What a plant screen expects

From `.scratch/charts-essentials/spec.md`; the decisions stand in
`.scratch/charts-review/spec.md` (Q11, Q13, Q15-Q18, Q22).

### Changed

- **The operating-time axis labels in en-GB by level.** Without a
  `tickFormat` it wrote every tick as `dd.MM. HH:mm`; it now labels as the
  time axis does - `15:00`, and the date on the first tick of a new day,
  `17 Mar 06:00` - and the tooltip's x value as `17 Mar 15:23`. Its ticks
  stand on the same local boundaries, across a clock change too.

### Added

- **`XAxis time`**: the values are instants. Ticks on local boundaries from
  the minute to the month, labels by level in en-GB with a 24-hour clock -
  `15:00`, `17 Mar`, `Mar 2026` - and the date on the first tick of a new
  day. `domain="nice"` widens to the step's boundaries. A `tickFormat` is
  handed the instant, which is how the axis speaks German. `calendar` implies
  `time`.
- **`format` on `Line`, `Area`, `Bar`, `Scatter`, `Matrix` and
  `ControlChart`**: `(value: number) => string`, the value as the tooltip
  writes it - "806.4 °C" without a render prop. Without it the y axis'
  `tickFormat`, then the default; a matrix' value has no axis format and goes
  to the default. `ControlChart` passes it on to its line and its violations.
- **`Line step`**: sample-and-hold. Each value holds as a horizontal until
  the next sample and jumps there - a set point, a digital signal. A gap ends
  the hold at its x. The tooltip reports the sample the hold began with, not
  the nearer one after it.
- **`hidden` on `Line`, `Area`, `Bar`, `Scatter`, `StateBand` and `Matrix`**,
  controlled: a hidden series is not drawn, not hit and does not count for its
  axes' extent - a fixed `domain` keeps the axis still. Its legend entry stays,
  struck through with a faint chip. A hidden bar leaves no empty place in its
  group.
- **`Legend onToggle(name)`**: with it every entry is a button
  (`aria-pressed`) that hands the caller the series' name, or a state's label.
  Without it the legend is not clickable, as before.

---

## Unreleased – The charts, corrected

From `.scratch/charts-fixes/spec.md`; the findings stand in
`.scratch/charts-review/spec.md`.

### Changed

- **`Span` is removed** (breaking, ADR-0026). Occupancy - jobs on machines,
  idle time, double bookings - is drawn by `@umriss-ui/schedule`, with lanes,
  groups and editing. With it go `SpanProps`, `SpanSeriesConfig`, the series
  kind `"span"`, the second x channel `x1` of `MaterializedSeries` and
  `open` in a tooltip point's `segment`.
- **A state band and a matrix take no palette colour.** They colour themselves,
  and each used up a place of the palette all the same: a line after a state
  band came out in the palette's second colour, after three bands in its
  fourth. It now gets the first. A series without a `name` counts its position
  among the series that take a colour.

### Added

- **`TooltipPoint.xValue`**: a point's own x value. With several x axes it can
  differ from the hit's.
- **`localOffset(instant)`**: the time zone's offset at an instant, as the
  shift of a tick grid onto local time. It moved here from
  `@umriss-ui/schedule`, which takes it from here now.

### Fixed

- **The sortedness check sees every series.** In DEV it ran for the first
  series only, and warned falsely where that was a matrix, whose cells run
  row-major. It now checks every series but the matrix, once per change of its
  data, and names the series it warns about.
- **A matrix explains its own colours.** Its legend entry showed a palette
  colour it never draws; it now shows the gradient's steps or the limit set's
  three colours, and the tooltip's chip shows the colour of the cell.
- **A state several bands share highlights all of them.** Hovering "Fault" in
  the legend of three machines highlighted the first band only.
- **The tooltip writes a value in its axis' format.** It formatted every value
  with a fixed default, so beside ticks reading "40 %" the tooltip wrote a
  bare "42". A value now takes its y axis' `tickFormat`, and the default only
  without one. A point on another x axis than the header's names its own x
  value, in its own axis' format, beside its name.
- **An infinity is a gap.** `±Infinity` out of any accessor - y, baseline,
  a matrix' value, x - entered the extent, which was then no longer finite, and
  the axis fell back to [0, 1] with every other value pressed against its edge.
  It is now treated like `null` or `NaN`: a gap, outside the extent.
- **A point between two gaps is drawn.** On a line it was a lone move of the
  pen and drew nothing, and above 60 points `markers="auto"` drew no marker for
  it either - a reading a gap isolates vanished. It now always keeps its marker;
  only `markers="never"` drops it. On an area it is a stroke from its foot to
  its value, with or without an outline.
- **A control chart reports its violations once per change.** An inline
  `accessor` or `origin` recomputed the limits on every render, and
  `onViolations` was called after each - a caller that kept the violations in
  state rendered forever. The accessor is now compared by its source text, the
  origin by its values, and `onViolations` is called only when the violations
  differ in content.
- **A limit on the x axis finds its axis.** `LimitLine` and `LimitBand` with
  `orientation="x"` and no `axisId` looked for an axis "y" among the x axes,
  found none and drew nothing, silently. Without an `axisId` a limit now binds
  to the axis its orientation names - "x" or "y" - and an unknown `axisId` is a
  DEV error, as it is for a series.
- **The operating-time axis stands on the local clock.** Its day and half-day
  ticks fell on UTC's midnight and were labelled in local time - "01:00"
  where a day begins, in CET. They now fall on local midnight and noon. Explicit
  `ticks` and the value of an x limit are named on the wall clock, like the
  data, and mapped into operating time as the data are; before, both were taken
  as operating time and landed far off, or pulled the axis out of shape.
- **Hit testing where areas and points meet.** Under `mode="nearest"` a state
  band or a matrix cell under the pointer counted as distance zero and beat
  every point; a point within 12 px of the pointer now wins, and the area
  answers where none is. A chart of bands or cells only pinned crosshair and
  tooltip to the beginning of the section; they now stay with the pointer. And
  a scatter under `"nearest"` was hit by x alone - the sample straight above
  the pointer beat the one beside it; it is now measured in x and y.
- **Change detection.** An inline `calendar` array is new on every render, and
  was compared by reference: every render mapped every point again. It is now
  compared by its intervals. Functions are compared by their source text, and
  every native or bound function reads the same - two bound
  `Intl.NumberFormat#format` counted as equal, and swapping one for the other
  left the axis in the old format. Such a function is now compared by identity.
  The known limit stays and is now documented at the props: two functions of
  the same text that read different captured values count as equal.
- **A control chart over a constant reference window finds no outliers.**
  Sigma is 0 there, the limits lie on the centre line, and every value off it
  was an outlier - and two of three beyond "two sigma". Both rules now find
  nothing without a spread, and DEV warns that the limits are degenerate.
- **`Chart.height` says its default.** The comment promised the host's height;
  the default is and was 300.
- **A matrix buckets its cells once per change**, not on every redraw of the
  series layer - a legend hover redraws it - and its tooltip chip no longer
  scans every cell on each pointer move.

---

## 0.3.2 – Phones, touch and a review (Sep. 2026)

### Fixed

- **A tap shows the tooltip.** On a touch screen the tap that lands on the plot
  shows what lies there, and the finger lifting no longer takes it away again;
  a tap outside the plot ends it.
- **A limit's label fits its y axis band.** The band is as wide as the widest
  limit label on it, so a label such as "Warning limit" is no longer clipped at
  the edge of the chart and no longer covers the tick labels.
- **The tooltip follows new data under a resting pointer.** Live data or a
  resize moved the series away beneath the hover marker, and the tooltip went on
  naming the values of before; the hit is now asked again with every new layout.
- **A web font that arrives late re-measures the axes.** Labels measured in the
  fallback font no longer overflow their band once the real font is there.
- **A resize there and back within one frame** lands on the last size, not the
  first.
- **A span's `height`** now widens the y axis anew when it changes, and a
  covering span is hit where it is drawn - moved within its lane - not where it
  would lie unmoved.
- `LegendProps.placement` said the legend stands below the plot without a
  value; it stands above it, as it always did.

---

## 0.3.1 – The README catches up (Sep. 2026)

Nothing in the code changed; the README counts four packages sharing the design
language, not three.

---

## 0.3.0 – Arithmetic with a second consumer (Sep. 2026)

From `.scratch/schedule/spec.md` (ADR-0022): `@umriss-ui/schedule` takes its
time arithmetic from here, so what it uses is public now.

### Added

- **`resolveColours(root, colours)`** — any CSS colours, tokens and
  `light-dark()` included, resolved to values a canvas can draw in the scheme
  that applies at `root`. **`subscribeTheme(notify)`** tells a canvas when to
  resolve again.
- **`toOperatingTimeClamped`** — wall clock to operating time without `NaN`: a
  time in removed time lands on its seam.

### No longer a release candidate

The tag `next` is gone: `0.3.0` publishes to `latest`, and
`pnpm add @umriss-ui/charts` is the whole install line. Nothing in the package
changed for that — the candidates 0.3.0-rc.0 and 0.3.0-rc.1 are what this is,
with the arithmetic above added for `@umriss-ui/schedule`, which now stands on
it in a released version of its own.

---

## 0.3.0-rc.1 – Styles that load themselves, and touch nothing else (Sep. 2026)

Delivery report for `.scratch/styles-without-side-effects/spec.md`, the charts'
share (ADR-0021).

### Changed

- **No stylesheet import any more.** `dist/charts.js` imports its own
  stylesheet; `@umriss-ui/charts/styles.css` stays exported and is optional.
- **The classes are `uc-*`.** Every `kc-*` class of the DOM - `.kc-root`,
  `.kc-plot`, `.kc-axis`, `.kc-tooltip` and the rest - is `uc-*`. A selector an
  application wrote against them changes its prefix.
- **Cascade layer.** The rules lie in `umriss.components` and select only the
  chart's own elements.
- **Light and dark follow `color-scheme`.** Canvas colours are resolved through
  the browser, so a `light-dark()` token draws in the scheme that applies. The
  resolved theme is read anew when an attribute of `<html>` changes (a
  `style="color-scheme: …"`, a class) or the system preference does;
  `invalidateTheme()` stays for a switch on another ancestor.

---

## 0.3.0-rc.0 – One language, one scope (Sep. 2026)

Delivery report for `.scratch/english-and-umriss-ui/spec.md`, the charts' share.

- **The package is called `@umriss-ui/charts`.** The npm scope moved from
  `@umriss/*` to `@umriss-ui/*`, which is the org actually secured for this
  library. The sibling package `@umriss/ui` is `@umriss-ui/core` and lies at
  `packages/core`; `@umriss/table` is `@umriss-ui/table`. Nothing was ever
  published under the old names — all three returned 404 from the registry — so
  there is no alias and no deprecation window, and the version number stays where
  it is.
- **Every identifier and every document in the workspace is English** (ADR-0018,
  which supersedes ADR-0015). For a caller of this package that changes little,
  because its exported names were English already; what changed is the inside —
  the pure modules' internal identifiers, the long prose headers that carry the
  design reasoning, and the demo. The headers were translated, not shortened.
- **The library ships two wordings, English by default** (ADR-0019). That
  concerns `@umriss-ui/core`, whose German moved to the subpath
  `@umriss-ui/core/wording/de`. This package is untouched by it and stays
  untouched by it: it has no text layer at all, and every string it draws comes
  from the caller — the one reason `pareto` has no default name for its remainder
  and `ControlChart` no default labels.
- **`@umriss-ui/charts` still depends on nothing**, and will keep depending on
  nothing (ADR-0016). "Core" names the package one installs first, not a layer
  this package sits on.
- The licence is MIT, and a `LICENSE` file ships in the package.

### Changed — the limit model's values

`Verdict` is `"ok" | "unknown" | "warning" | "alarm"`, `Severity` is
`"warning" | "alarm"`, `Side` is `"upper" | "lower"`, and the fields of `Limit`,
`LimitSet` and `Assessment` are `value`, `side`, `severity`, `limits`, `target`,
`verdict`, `limit`, `excess`, `deviation`.

ADR-0006 holds this model twice — once here, once in `@umriss-ui/core` — and the
copies are pinned together by a runtime conformance test that compares both
results structurally rather than importing either. The two packages, the shared
case table and that test therefore moved in a single commit; a divergence stays a
red test and not a report from the field.

`--uc-color-alarm` is unchanged. What moved beside the model is
`.uc-limit-label[data-severity="warnung"]`, which now reads `"warning"` — the
same word `tone` has carried all along.

## 0.3.0-rc.0 – Where the library contradicted itself (Sep. 2026)

Delivery report for `.scratch/library-audit/spec.md`, tickets 03 and 05.

### Changed

**The package brings no text along any more.** It has no text layer, and four
German defaults stood there regardless:

- `ControlChart` no longer labels the control limits without being told to —
  previously `"OEG"` and `"UEG"`. Whoever wants the labels passes
  `labelUpper`/`labelLower`.
- The scatter of the violations was called `` `${name} – Regelverletzung` ``. It
  is now called what `violationName` says, and without a statement not at all —
  a `Legend` then carries it as "Series n".
- `pareto` has no default name for the remainder any more (previously
  `"Sonstige"`). Whoever names `collectRank` names `remainderName` with it — in
  the type (`ParetoSettings`) and in DEV as an error. `paretoDefaults` no longer
  contains `remainderName`.
- The labelling of an operating-time axis without a `tickFormat` of its own is
  `dd.MM. HH:mm`, set by hand. Previously it came out of
  `toLocaleString(undefined, …)` and looked different on every machine.
- `"Series n"` remains the last resort for a series without a `name`, but warns
  once in DEV.

**A series keeps its colour.** The palette followed the position in the
registration; a series that unregistered and registered again landed at the back,
and every series of the chart changed colour. The palette now follows the `name`:
on first mounting as before in JSX order, after that a returning series gets its
colour back. A series without a `name` still takes the colour of its position and
warns in DEV when that shifts. Drawing happens unchanged in registration order.

**`role="img"` and `aria-label` stand at the plot area** (`.uc-plot`), no longer
at the root. The root contains the legend, and the descendants of an image are
presentation to a screen reader — the legend was unreachable. Whoever looked for
the role at `.uc-root` finds it one level deeper.

### New

- `ControlChart violationName`.
- The type `ParetoSettings`: what a call of `pareto` may specify.

## 0.2.0 – Limits, states, instruments (Aug. 2026)

Delivery report for `.scratch/judging-values/spec.md`,
`.scratch/shopfloor-instruments/spec.md` and
`.scratch/plant-at-a-glance/spec.md`, the charts' share. The decisions stand in
ADR-0006 to ADR-0011.

### New

- **Three series kinds:** `StateBand` (one state per interval, ADR-0007),
  `Matrix` (one value per cell, with `DEFAULT_GRADIENT` as the colouring) and
  `Span` (an interval with an explicit end on a lane).
- **`LimitLine` and `LimitBand`:** a limit as a rule with severity and role
  (specification, control limit, zone), which draws the value range of its axis.
- **`ControlChart`:** the control chart as a composition out of `Line`,
  `LimitLine` and `Scatter` (ADR-0008), and with it the pure modules
  `controlLimits`, `zones`, the four rules and `violations`.
- **The operating-time axis:** `calendar` on `XAxis`/`YAxis` and the pure modules
  out of `operatingTime.ts` — wall clock ↔ operating time, ticks, breaks.
- **`pareto`** as a pure module.
- **The limit as a rule:** `assess` and `verdictWeight` with their types — the
  same rule as in `@umriss-ui/core`, deliberately there twice (ADR-0006).

Nothing changes in the behaviour of the four existing series kinds.

## 0.1.0 – Takeover state and mixed series kinds (Aug. 2026)

The number stood at `0.1.0` the whole time; it covers the takeover state
(packages C.1–C.7) and `.scratch/mixed-series-kinds/`.

### New

- `Chart` with two canvas layers and one HTML layer above them, `XAxis`/`YAxis`
  with axis bands on all four sides, `Tooltip`, `Legend`, `LinearScale` and
  `invalidateTheme`.
- Four series kinds mixable within one chart: `Line`, `Scatter`, `Area` with a
  baseline, and `Bar` on the numeric X axis (ADR-0002).

### Changed

**`LineChart` is called `Chart`** and is generic over the series kinds within it
(`mixed-series-kinds` 01). The takeover state knew only lines.
