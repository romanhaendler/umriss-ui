# The surface of charts (research 05)

Candidates only; nothing is decided here. Read: `packages/charts/API.md` whole, `src/index.ts`, `types.ts`,
`useChart.tsx`, `view.ts`, `Chart.tsx`, `Axis.tsx`, `Line/Area/Bar/Scatter/StateBand/Matrix/BoxPlot/ControlChart/LimitLine/Legend/Tooltip.tsx`,
`limit.ts`, `controlLimits.ts` (types and `violations`), `pareto.ts`, `bin.ts`, `format.ts`, `theme.ts` (exports), `dev.ts`,
`wording/index.ts`, the `CONTEXT.md` terms Tone, Series kind, Limit, Severity, Verdict, and ADR-0059 (title and first lines).

Not read: `scene*.ts`, `draw.ts`, `materialize.ts` (beyond one comment), `layout.ts`, `workingTime.ts` and `zone.ts` bodies,
`wording/de.ts`, the CSS (`--uc-*` tokens are a public surface too, not reviewed), the demo pages, the visual and unit tests,
`docs/capabilities.md`, and the ADRs beyond the ones named. Behaviour claims were not run; they are read from source.

"Breaks a caller" = fixing it after 1.0 would cost a major (or, before 1.0, breaks a current caller). Sizes S/M/L.

## A. API.md leaves out what it says it lists

Checked by grep against `API.md` and `src/index.ts`.

**A1. No "Props" section for ten of the components.** `API.md` has `### ` sections only for ChartsWordingProvider, ControlChart,
Legend, LimitBand, LimitLine, Tooltip and useChart (lines 153-223). The props of `Chart`, `XAxis`, `YAxis`, `Line`, `Area`, `Bar`,
`Scatter`, `StateBand`, `Matrix` and `BoxPlot` - the ten that `useChart` hands out, i.e. the heart of the package - appear nowhere:
the Types list has `ChartProps`, `XAxisProps`, `YAxisProps`, `LineProps`, `AreaProps`, `BarProps`, `ScatterProps`, `StateBandProps`,
`MatrixProps`, `BoxPlotProps` (API.md 55, 71, 77, 103, 142 and neighbours) as one sentence each, with no field list (the `*Config`
types do carry one, in brackets). Grep: `barWidth`, `fillOpacity`, `laneFrom`, `coloring`, `zoomable`, `timeZone`, `encoding`,
`syncId`, `markers`, `radius`, `categoryLabel`, `alignTicks`, `boxWidth` occur in API.md only inside `*Config` or `AxisConfig`
field lists (or not at all: `timeZone`, `encoding`, `syncId`, `width`, `height`, `padding`, `loading`, `empty`, `wording` of `Chart`
are absent), and the one `xAxisId` line (167) is ControlChart's. The `useChart` returns list gives `XAxis: <T = Z>(props: XAxisProps<T>) => null`
and stops. A reader of API.md (the stated first stop in CLAUDE.md) would conclude that `Chart` has no props. Likely cause (generator `demo/props.ts` not read): it
lists exported components, and these ten are not exported as components. Fix: have it read the exported `*Props` interfaces
of the hook's parts. Size S-M. Not a break.

**A2. No export is missing as an entry.** Every name in `src/index.ts` has an entry in API.md (checked name by name). But two are
misfiled: `LinearScale` (a class) is listed under "Constants" (API.md 49), and `ChartsWording`'s fields are listed while
`GERMAN_CHARTS_WORDING` sits under its own subpath heading (fine). Size S.

**A3. Defaults the code applies that the doc does not state**, so API.md prints no `(default: ...)`: `Line.strokeWidth` 1.5 and
`markers` "auto" (`Line.tsx:67,69`; doc at 34,39), `Area.fillOpacity` 0.18 and `strokeWidth` 1.5 (`Area.tsx:85-86`; doc 52-56), `Bar.barWidth`
0.8 (`Bar.tsx:83`), `BoxPlot.boxWidth` 0.8 (`BoxPlot.tsx:94`), `Scatter.radius` 3 (`Scatter.tsx:53`), `Chart.padding` 8 (`Chart.tsx:132`),
`XAxis`/`YAxis` `id` "x"/"y", `position`, `domain` "nice" (`Axis.tsx:129-134,180-185`). Size S, not a break (but the value then becomes
promised, see C3).

## B. Names

**B1. Three names for "which axis".** Series and `ControlChart`: `xAxisId` / `yAxisId` (`Line.tsx:17,19`, `ControlChart.tsx:50,52`); the axes: `id`
(`Axis.tsx:16`); limits: `axisId` plus `orientation` (`LimitLine.tsx:27,31`). `ChartView.domains` and `setDomain` say "by axis `id`". Limits
cannot share the series' shape because one prop serves both orientations, but the pair `axisId`+`orientation` is the only place that
names the orientation by a prop. Break if changed: yes (rename). Smallest change: leave it, or add nothing; if changed, `xAxisId`/`yAxisId` on limits
is wrong (one limit has one axis). Recommend: decide it is deliberate and say so in the limit's doc. Size S (doc) / M (rename).

**B2. `BoxPlot` calls its y value `median`; every other series calls it `value`** (`BoxPlot.tsx:22` vs `Line.tsx:15`, `Area.tsx:18`, `Bar.tsx:21`,
`Scatter.tsx:19`). Defensible (its median is the base accessor, config `accessor`), and it matches the tooltip row; but generic code that maps
over series props must special-case it. Break: yes. Smallest change: accept `value` as the alias and later drop `median`, or keep as decided. Size S.

**B3. `value` means a different thing on three series.** `Matrix.value` is the *row position* and `level` the colour (`Matrix.tsx:41,44`);
`StateBand.value` is an *index into `states`* (`StateBand.tsx:23`); on `Line`/`Bar`/`Area`/`Scatter` it is the y reading. The docs say so,
the names do not. Break: yes. Size S to leave, M to rename (`row`, `state`). Candidate only for the decision ticket.

**B4. `tone` takes the verdict's words, not the Tone's.** Charts: `tone?: "ok" | "warning" | "alarm"` on seven prop types (`types.ts:92`, `Line.tsx:33`,
`Area.tsx:41`, `Bar.tsx:46`, `Scatter.tsx:37`, `BoxPlot.tsx:65`, `ControlChart.tsx:65`). `CONTEXT.md:77-82` defines **Tone** as success, warning, danger and
says a tone must never mean a verdict; core's tones (`AlertTone`, `BadgeTone`, `MeterTone`, `TagTone`) are four different sets again (API.md of core 155-220).
Charts' `ok/warning/alarm` is exactly the Verdict/Severity vocabulary (`limit.ts:26-40`, theme `colorOk/colorWarning/colorAlarm`). So the prop is
named by the term CONTEXT.md forbids for this meaning. Break: yes either way (rename prop or values). Smallest change: decide whether `tone` stays
the series prop name and fix CONTEXT.md, or rename to `verdict`/`severity`-style. Size S (CONTEXT.md) / M (rename across seven types, demo, tests). Maintainer decision.

**B5. Same word, two meanings in the pure helpers.** `BinOptions.count` is "about how many bins" while `Bin.count` is how many values fall in a bin
(`bin.ts:26-33`, `:14-24`); `BoxPlotProps.count` is a value count again. `from`/`to` are *half-open indices* in `ControlLimitOrigin` (`controlLimits.ts:43`),
*domain values* in `LimitBand`, *an inclusive stretch* in `ChartRange`, *edges* in `Bin`. Break: yes. Size S each; none is wrong alone.

**B6. Callback names.** `onViewChange` (matches schedule's `onViewChange`; good), `onSelect`, `onRange`, `onViolations`, `onPerf`. The table's equivalents are
`onSelectionChange`/`onValueChange` (API.md of table). `onSelect` here reports a *hit* (an event, nothing is held: ADR-0056) so the different name is
justified; `onViolations` reports computed data on each change. Note `ChartProps extends HTMLAttributes<HTMLDivElement>` (`Chart.tsx:48`), which already carries a DOM
`onSelect` (text selection) - a caller passing `onSelect` to `<Chart>` instead of to `useChart` type-checks and does nothing useful. Break if renamed: yes. Size S.

**B7. History and ticket names stand in public doc comments**, against CLAUDE.md ("no ticket names, no history"): `ControlChart.tsx:79-82` ("Before this, a German suffix stood on the name of the chart"),
`wording/index.ts:53` ("component-view 04"), `:65`, `:72` and `materialize.ts:273` ("box-plot B9"), `Chart.tsx:194` ("R-7.6" in a DEV warning shown to callers),
and a doubled punctuation in `ControlChart.tsx:57` ("on the violations., as a function"). The ControlChart sentence reaches `docs/llms-full.md`. Size S, not a break.

## C. Shapes and defaults

**C1. `LimitRole` has three values, the doc names two.** `types.ts:387` `"specification" | "control" | "zone"`; the prop doc says "A chosen specification limit or a calculated control limit"
(`LimitLine.tsx:49-51`, so API.md 199/212). `"zone"` is used by `ControlChart` internally but is accepted and unexplained on the public prop. Break after 1.0 if narrowed: yes.
Smallest change: document it, or take `"zone"` out of the public prop's type. Size S.

**C2. Severity default differs between the pair:** `LimitLine` "alarm" (`LimitLine.tsx:81`), `LimitBand` "warning" (`:115`). Both are documented, but the pair share all other
props and the doc sentence is copied, so a caller who swaps line for band changes colour class. Break: yes (a default change repaints). Likely keep and state the reason in the doc. Size S.

**C3. `Bar.barWidth` doc and default disagree:** doc "just under 1, so that neighbours do not touch" (`Bar.tsx:57-58`), default 0.8 (`:83`); `BoxPlot.boxWidth` likewise 0.8 and is shared with bars.
Once unstated defaults are printed (A3) they are frozen. Fix the doc or the default before 1.0. Size S.

**C4. An unnamed series shows as "Series n" (documented `@default`) but cannot be hidden or addressed** (`Legend.tsx:6-9`, `view.ts:18`: "a series without one cannot be hidden").
So `name` is at once an optional label and the series' identity for `ChartView.hidden`, `toggleSeries`, `showOnly`, and the palette ("colour follows its name", CONTEXT.md). Two series with the same
name hide together. Break to change: yes (`hidden: string[]` is part of `ChartView`, which callers persist). Smallest change before 1.0: decide whether `name` becomes required for named
features, or a separate `id`; at least document that `hidden` is by name and names must be unique. Size M.

**C5. Typing is split between the hook and the free components.** Series and axes come typed at the row from `useChart` (ADR-0048), and `onSelect` hands `TooltipHit<Z>` (`useChart.tsx:46`).
`Tooltip`, `ControlChart`, `LimitLine`, `LimitBand`, `Legend`, `DataTable` are free imports: `Tooltip`'s `render` receives `TooltipHit<T>` with `T` inferred from nothing, so `hit.points[i].datum` is
`unknown` unless written `<Tooltip<Row> ...>` (`Tooltip.tsx:12,30`). `ControlChart` requires its own `data` (`ControlChart.tsx:45`) and cannot read the hook's rows, unlike every series.
Break: adding `Tooltip` to `ChartParts` is additive; removing the free export later is a break. Size S-M.

**C6. `ChartParts`/`ChartOptions` second generic `V` is an unchecked assertion.** `useChart<Z, V extends number | string = number>` (`useChart.tsx:118`): `ChartRange<V>` is `string` only if the caller says
`useChart<Row, string>`, and nothing ties it to the axis kind. `onRange` on a category axis called with a handler typed for numbers compiles and receives strings. Doc says "say so in the handler's parameter".
Break if tightened: possibly. Size M. Candidate for "leave, documented".

**C7. Dates in, numbers out.** Inputs accept `Date` (`XAxis.domain`, `LimitLine.value`, `LimitBand.from/to`, AxisValue), but everything reported or held is milliseconds as `number`: `ChartView.domains` / `AxisSpans`
(`view.ts:10`), `setDomain(axisId, [number, number])`, `ChartRange<number>`, `TooltipPoint.xValue: number` (`types.ts:434-436`, a category's place too), `ZoomLimits`. A time-axis caller round-trips `+date` and `new Date(ms)`.
Widening outputs later to `Date | number` would break; widening *inputs* of `setDomain` is additive. Candidate: freeze as numbers on purpose and say it once. Size S.

**C8. `ChartProps` inherits all of `HTMLAttributes<HTMLDivElement>`** (`Chart.tsx:48`), including `color`, `title`, `onSelect`, `onChange`, `translate`, `dir`: every attribute becomes part of the contract, and a future own prop of the same name
(e.g. a chart `title`) would be a break. Smallest change: `Pick` the attributes that are meant (`id`, `className`, `style`, `aria-*`, `data-*`, `role`?) - narrowing is itself a break, so it is cheaper now. Size S-M. Also `ref` as a prop requires React 19 (peer `>=19`, fine).

**C9. `RuleOptions` mixes four booleans and two numbers** (`controlLimits.ts:160-172`), and rules are named by an enumeration (`RuleName`) *and* by prose numbers (the docs speak of "rule 1/2/3/4"). `rules?: Partial<RuleOptions>` on `ControlChart`, `violations(values, limits, options)` the same.
Adding a fifth rule is additive; removing the numbers from docs is S. Low priority.

**C10. `controlLimits(values, origin)` takes `readonly number[]`**, so `NaN` stands for a gap (`ControlChart.tsx:~150` converts null to NaN), unlike `assess(value: number | null | undefined)` and `bin(values: ArrayLike<number | null | undefined>)`. Three
helpers, three gap conventions. Additive to widen the input. Size S.

## D. Exports nothing outside the package documents or uses (candidates to unexport before 1.0)

Method: grep of the other packages' `src` for imports from `@umriss-ui/charts`. The only importer is `@umriss-ui/schedule`; it takes `calendarFrom, DAY, HOUR, MINUTE, LinearScale, Scale, localOffset, inDoubledHour,
workingTimeTicks, timeStep, toWorkingTimeClamped, toWallClock, removedIntervals, resolveColours, subscribeTheme, CalendarInput, WorkingTimeTick` (`schedule/src/sceneView.ts:8-17`, `timeAxis.ts:14-26`, `sceneDraw.ts:9`, `geometry.ts:13`, `scene.ts:22`, `snap.ts:10`,
`sceneGestures.ts:10`). Charts' own demo uses `useChart`, `LimitLine`, `LimitBand`, `Tooltip`, `ControlChart`, `DataTable`, `ChartRange`, `ChartPerf` (`demo/.../bench`), `bin`, `pareto`, `workingCalendar`, `DEFAULT_GRADIENT`.

**D1. Registration-model types exported with no public function that takes or returns them:** `AxisConfig`, `SeriesBase`, `SeriesConfig`, `SeriesKind`, `LineSeriesConfig`, `AreaSeriesConfig`, `BarSeriesConfig`, `BoxSeriesConfig`, `ScatterSeriesConfig`, `StateSeriesConfig`, `MatrixSeriesConfig`,
`LimitConfig`, `LimitLineConfig`, `LimitBandConfig`, `LegendConfig`, `TooltipConfig`, `MaterializedSeries`, `BoxChannels`, `ChartPerf` (only for the bench page, `Chart.tsx:113`), `Padding`, `Rect`, `ResolvedTheme` (nothing public returns it; `resolveTheme` is not exported), `DataTableGroup` (`DataTable` takes no props and returns a node),
`ParetoOptions` (`pareto` takes `ParetoSettings`; `ParetoOptions` is "the complete" form, `pareto.ts:48-66`), `BoxNumbers`/`BoxExtras` (only via `TooltipPoint.box`, which is legitimate). API.md describes the first group as "as the chart holds it once registered" - an internal state. No import outside charts, no demo use (`ChartPerf` excepted). `index.ts:85-99`, `:18`, `:44-49`, `:120`, `:125`.
Exporting them freezes the internal registry's shape and fields (`SeriesConfig` as a union - see D2). Un-exporting is a break for anyone who imported them; before 1.0 it is the cheapest it will ever be. Size S (delete lines, regenerate API.md).

**D2. `SeriesKind`/`SeriesConfig` are documented "closed" (`types.ts:63-72,231-233`) but ADR-0059 declares the set of kinds open.** A caller who writes an exhaustive `switch (config.kind)` breaks at the next kind. If D1 is taken they go; otherwise state "may grow" in the type's doc. Size S.

**D3. Pure helpers with no demo and no user outside tests:** `zones`, `violatedIndices`, `breaks`, `verdictWeight`, `assess` (charts' copy; core carries its own, ADR-0006 / `core/src/lib/limit.ts:6`), `removedIntervals` (schedule uses it). They are documented and unit-tested, so these are not dead, but each is promised for ever once 1.0 is out. `assess`/`Limit`/`LimitSet`/`Severity`/`Verdict`/`Assessment` and `NumberOptions` (`format.ts:15`) are *second copies* of core's, kept in step by a conformance test; at 1.0 both copies freeze, and a change needs both packages' majors.
Candidate: say so in the 1.0 promise, or take charts' copies out of the public index if no caller needs them. Break: yes if removed. Size S.

**D4. No deprecated alias is alive.** `grep` finds no `ariaLabel`, no `@deprecated`; `dev.ts:60,100` (`warnDeprecated`, `warnDeprecatedTokens`) are internal helpers with no caller left. CHANGELOG 0.44.0 removed `ariaLabel`. Dead code, not surface. Size S.

## E. Sentences and behaviour that disagree, or that need a look

- `Chart.tsx:191-196`: a chart without `aria-label`/`aria-labelledby` only warns in DEV (the table of other packages may require it; not compared). Required-by-type would break callers; a decision for 1.0 since accessibility is a stated promise (ticket 12).
- `StateBand`, `Matrix` take no `color`/`tone` (config's `SeriesBase` has them): consistent with their colour sources, but `StateBandProps` has no `format` either, though `SeriesBase.format` exists; the tooltip format of a state is its label. Fine; stated for completeness.
- `ChartsWording` is one flat interface of ~35 keys (`wording/index.ts:7-90`). Callers pass `Partial<>`, so adding a key is additive; a caller who *implements* the full type (as `GERMAN_CHARTS_WORDING` does) breaks at each new key - the same shape as the other packages' wording, not compared here.
- `LimitLine`/`LimitBand` on a *category* axis or a time axis with `Date`: `+props.value` turns a `Date` to ms (`LimitLine.tsx:88`); a category-axis limit has no way to name a category (number only). Not run; read only.
- The `--uc-*` CSS tokens and `./styles.css` export (`package.json` exports) are part of what 1.0 freezes and were not reviewed.

## What matters most (for the decision tickets)

1. A1 - API.md has no props for ten parts (`Chart`, axes, seven series); fix the generator before anything else is judged from it. Not a break.
2. D1 - about 20 registry/internal types are public with no user; un-exporting is cheapest now. Breaks a caller who imported them (none inside the workspace).
3. B4 - `tone` carries `ok/warning/alarm`, which CONTEXT.md reserves for Verdict/Severity; the prop name or the term must change. Breaks.
4. C4 - series identity is its optional `name`; `ChartView.hidden` is by name; decide before views are persisted by callers. Breaks.
5. B2/B3 - `BoxPlot.median` vs `value`; `value` means row / state index on Matrix / StateBand. Breaks.
6. C1/C3 - `LimitRole` has an undocumented `"zone"`; `barWidth` doc "just under 1" vs default 0.8. Small, before the defaults are frozen.
7. C8 - `ChartProps` inherits every `div` attribute; narrowing later breaks, so now. Breaks.
8. C5/C6/C7 - Tooltip and ControlChart outside the typed hook; the `V` generic of `useChart`; Dates in, numbers out. Mostly "state it and freeze".
