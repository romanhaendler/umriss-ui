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

**Release candidates.** `0.3.0-rc.0` is the first version for the registry, under
the tag `next` rather than `latest`: `pnpm add @umriss-ui/charts@next`. A release
candidate promises nothing a `0.x` does not already fail to promise; it says the
interface is still expected to move before `0.3.0`.

---

## 0.3.0-rc.0 – Styles that load themselves, and touch nothing else (Sep. 2026)

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
