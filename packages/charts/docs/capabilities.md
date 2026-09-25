# STATUS – @umriss-ui/charts V0

Every capability per component, with the level at which it is proved (R-7.5).

Levels of proof:

* **Unit** – vitest, `packages/charts/tests-unit/`
* **Interaction** – Playwright, `tests-visual/features-interaction.spec.ts`
* **Screenshot** – Playwright, `tests-visual/screenshots.spec.ts` (pages 1–6 × light/dark)
* **Manual** – checked in the demo, not automated

State: packages C.1–C.7 complete; `mixed-series-kinds` 01–05, the three
operations packages (`judging-values`, `shopfloor-instruments`,
`plant-at-a-glance`, the charts share) and `library-audit` 03/05 delivered.
Screenshot pages carry their name in brackets.

## `Chart<T>` (container)

| Capability | Rule | Proved at |
|---|---|---|
| Two canvas layers, the HTML layer above them | R-2.8 | Unit (jsdom), Screenshot |
| DPR scaling and rebinding on a DPR change | R-2.9 | Manual |
| `width` as a number and as `"100%"`, `height` | 4.1 | Screenshot (page `sizes`) |
| ResizeObserver, coalesced onto rAF | R-2.10 | Interaction (collapse/expand) |
| Size 0: do not draw, do not throw | R-2.10 | Unit (layout), Unit (jsdom) |
| Dirty flags per layer, exactly one rAF | R-2.11 | Manual (benchmark FPS) |
| Hover draws the overlay layer only | R-2.11 | Manual (benchmark FPS: 60 at 3 million points) |
| `padding` as a number and as an object | 4.1 | Unit (layout), Screenshot (`configuration`) |
| `role="img"` + `aria-label` on the plot area, the legend beside it rather than inside it; canvas `aria-hidden` | R-7.6 | Unit (jsdom) |
| With a tooltip the plot area is one tab stop: `role="application"`, `aria-roledescription`, its ring on `:focus-visible` | ADR-0030 | Unit (jsdom keyboard), Interaction, Screenshot (`focused-active-point`) |
| ←/→, Home/End, PageUp/PageDown walk the Active point over the visible positions, gaps skipped; ↑/↓ change the emphasised series; a matrix walks cell by cell; Escape clears, blur clears | charts-a11y Q2, R1-R7 | Unit (walk), Unit (jsdom keyboard), Interaction |
| One Active point for pointer and keyboard, the last input winning; a pointer's leave keeps the keyboard's; it travels over `syncId` | ADR-0030 | Unit (jsdom keyboard), Interaction |
| A polite readout after a key, never after the pointer, once the keys rest 150 ms; the emphasised series first | charts-a11y Q4, R11 | Unit (jsdom readout) |
| A summary the plot is described by: series, visible stretch, each series' range there, the keys | charts-a11y R10 | Unit (jsdom readout) |
| `+`/`−`, Shift+←/→ and `0` zoom, pan and show everything - only with `onDomainChange` | charts-a11y Q6 | Unit (jsdom zoom keys) |
| The charts' own wording, English by default, German from `@umriss-ui/charts/wording/de`; `empty` wins over it | ADR-0031 | Unit (jsdom wording) |
| `encoding="marks"`: each series a dash and a marker shape (line, area outline, scatter) or a hatch (bar, area fill) by its palette place - the first plain -, a caller's `dash` winning; a state hatched by its name, alike in every band that lists it, a matrix step by index, a limit band hatched in its colour; the legend's chips show the same, an area's its dash over its hatched fill; default off | charts-alternatives C3, 04 | Unit (marks, draw, jsdom encoding), Screenshot (`told-apart-without-colour`, `marks-on-every-kind`, `bands-limits-and-cells`) |
| DEV warning without `ariaLabel` | R-7.6 | Manual |
| Series kinds can be mixed in one chart | ADR-0002 | Screenshot (`mixed`), Interaction |
| Every series kind can be bound to every axis | R-4.12 | Unit (scene) |
| SSR: `renderToString` does not throw | R-7.4 | Unit (SSR) |
| `onPerf` instrumentation | R-5.1 | Manual (benchmark page) |
| `syncId`: the pointer's x position, in domain units, shared by every chart of the id - a crosshair in each, the tooltip only under the pointer, cleared when the pointer leaves | Q21 | Interaction (cursor sync) |
| `empty`: "No data" or the caller's content, centred in the plot area when no visible series has a point; axes and frame stay | Q18 | Unit (jsdom empty state), Screenshot (`empty`) |

## Registration, data, materialisation

| Capability | Rule | Proved at |
|---|---|---|
| Children register configuration; they render no pixels | R-2.1 | Unit (scene) |
| Registration order = drawing order | R-2.1 | Unit (scene) |
| A palette place by name: in order on first mounting, and a returning series gets its colour back; without a name by position, with a DEV warning on a change | R-2.1 | Unit (scene) |
| A config change only sets dirty flags, no synchronous draw | R-2.2 | Unit (scene) |
| A child outside `Chart`: DEV error, silent in PROD | R-2.3 | Manual |
| Accessors, generic `T`, a series' own `data` | R-2.4 | Unit (materialisation), Screenshot |
| `null`/`undefined`/`NaN`/±Infinity = a gap, no joining across it, outside the extent | R-2.5 | Unit (materialisation), Interaction, Screenshot |
| DEV sortedness check once per data change, for every series with a binary-search hit (not the matrix), naming the series | R-2.6 | Unit (materialisation, scene) |
| Materialisation into `Float64Array`, once per change | R-2.7 | Unit (materialisation) |
| An axis' value range comes only from the series bound to it | R-4.13 | Unit (materialisation, scene) |
| One order across the series kinds (drawing, and the first palette assignment) | R-2.1 | Unit (scene) |
| Series configuration as a discriminated union over `kind` | — | Unit (scene), type check |
| A second channel for the baseline, only where a kind needs it | R-2.7 | Unit (materialisation) |
| The baseline enters the value range of its Y axis | R-4.13 | Unit (materialisation, scene) |
| A fixed domain wins against the widened value range | 4.2 | Unit (layout) |
| A change of baseline or series kind materialises afresh | R-2.2 | Unit (scene) |
| `hidden`: not drawn, not hit, not in its axes' extent | Q17 | Unit (scene, jsdom scene), Screenshot (`toggling-legend`) |
| Functions compared by source text, a native or bound one (`Intl.NumberFormat#format`) by identity; a `calendar` by its intervals | R-2.2 | Unit (jsdom scene, limits and bands in the scene) |

## `XAxis` / `YAxis`

| Capability | Rule | Proved at |
|---|---|---|
| The 1-2-5 tick algorithm | R-4.1 | Unit (ticks) |
| Default format through `Intl`, decimals from the step | R-4.1 | Unit (ticks), Screenshot |
| Tabular figures in every number | acceptance 5 | Screenshot |
| `domain="nice" \| "data" \| [min,max]` | 4.2 | Unit (ticks, layout), Screenshot (`configuration`) |
| `YAxis domain="visible"`: the extent of the points inside the fixed x domain, a fixed foot and the limits included; every point where the x domain is not fixed | Q19 | Unit (materialisation, scene), Screenshot (`visible-domain`) |
| A constant series → domain ±1 | R-4.3 | Unit (ticks) |
| The zero line stronger than the grid | R-4.2 | Manual |
| `tickCount`, `tickFormat` | 4.2 | Unit (layout), Screenshot |
| Any number of X and Y axes | R-4.12 | Screenshot (`axes`), Interaction |
| A duplicate id per orientation: DEV invariant | R-4.12 | Unit (scene) |
| A series' unknown axis reference: DEV invariant | R-4.12 | Unit (scene) |
| An axis with no series bound: DEV warning, domain [0,1] | R-4.13 | Unit (scene) |
| Grid default: only the first registered axis per orientation | R-4.15 | Screenshot (`axes`), Unit (scene, warning) |
| `alignTicks` on a further y axis: the first y axis' tick count, its own domain widened until its ticks stand on that grid, steps 1-2-5; margins of a first axis whose ticks do not fill its domain carried over | Q24 | Unit (ticks, layout), Screenshot (`aligned-ticks`) |
| `position` on all four sides | R-4.16 | Unit (layout), Screenshot (`axes`) |
| Right and top labels mirror their alignment | R-4.16 | Interaction |
| The Y title rotated outside, along the axis | R-4.16 | Unit (layout, band width), Screenshot |
| `time`: ticks on local boundaries from the minute to the month, across a clock change | Q15 | Unit (time axis, under Europe/Berlin) |
| `time`: labels by level in en-GB, 24 h (`15:00`, `17 Mar`, `Mar 2026`), the date on the first tick and on the first of a new day (the year on a day axis); `tickFormat` for any other language | Q15 | Unit (time axis), Screenshot (`time`) |
| `time` with `domain="nice"`: widened to the step's local boundaries | Q15 | Unit (time axis) |
| `time` over less than a minute (an axis without data): no ticks | Q18 | Unit (time axis) |
| `onDomainChange`: Ctrl/⌘ + wheel and a pinch zoom around the pointer, a drag and a horizontal or Shift wheel pan, a double click proposes the data range; without it nothing zooms and the plain wheel stays the page's | Q19 | Interaction (zoom and pan) |

## The layout engine

| Capability | Rule | Proved at |
|---|---|---|
| Plot area = container − legend − bands − padding | R-3.1 | Unit (layout) |
| Bands stack from the inside outwards, with a fixed joint | R-3.2 | Unit (layout), Screenshot (`axes`) |
| A measuring pass over a single hidden measuring span | R-3.3 | Unit (layout, with a measuring stub) |
| Edge collision of the X labels: shift rather than clip | R-3.3 | Unit (layout) |
| Whole-number band sizes with hysteresis per band | R-3.4 | Unit (layout), Manual (live mode) |
| Grid lines on half pixels | R-3.5 | Manual |

## `Line`

| Capability | Rule | Proved at |
|---|---|---|
| One `Path2D`, one `stroke()` per series | R-2.12 | Manual (benchmark) |
| Gaps produce a `moveTo`, not separate strokes | R-2.12 | Interaction, Screenshot |
| Clipping to the plot area | R-2.13 | Manual |
| `lineJoin`/`lineCap` round | R-4.4 | Manual |
| `strokeWidth`, `dash`, `color` | 4.3 | Screenshot |
| Palette `--uc-series-N` by name, in order on first mounting | 4.3 | Unit (scene), Screenshot |
| Markers `auto` / `always` / `never` | R-4.5 | Screenshot (`configuration`) |
| A point between two gaps (or a gap and the edge) keeps its marker at any point count; only `never` drops it | R-4.5 | Unit (draw), Screenshot (`multi-series`) |
| Binding through `xAxisId` / `yAxisId` | R-4.12 | Interaction (`axes`), Screenshot |
| `step`: sample-and-hold, a gap ends the hold at its x | Q22 | Unit (draw), Screenshot (`step`) |
| `step`: the tooltip reports the sample the hold began with | Q22 | Unit (jsdom scene) |
| Downsampling above two points per pixel column: first, min, max and last per column, a gap kept; only the window of the x domain and one point beyond each edge | Q20 | Unit (downsample), Screenshot (`zoom-and-pan`, unchanged by it) |
| The tooltip searches the raw data, not what the drawing kept | Q20 | Unit (jsdom scene) |

## `Area`

| Capability | Rule | Proved at |
|---|---|---|
| Fill down to baseline 0 when none is given | ADR-0002 | Unit (materialisation, scene), Screenshot (`filled`) |
| A band area between two accessors | 4.3 | Screenshot (`mixed`, `corridor`) |
| The baseline pulls its Y axis' value range | R-4.13 | Unit (materialisation, scene) |
| Fill and outline as separate paths | R-2.12 | Screenshot (`mixed`) |
| A gap produces a hole, not a straight line across it | R-2.5 | Screenshot (`mixed`, `corridor`) |
| A point between two gaps is a stroke from its foot to its value, with or without an outline | Q23 | Unit (draw) |
| `fillOpacity`, `strokeWidth` (0 leaves the outline out) | 4.3 | Screenshot (`filled`, `corridor`, light and dark) |
| `dash` on the outline only; the fill and a lone point's stroke stay solid | Q11 | Unit (draw) |
| `tone`: a role the theme resolves | Q11 | Unit (jsdom tone) |
| Downsampling as the line's, the baseline channel taken at the same points | Q20 | Unit (downsample) |
| `stack`: areas of one id stand on the ones registered before, the stack below as their baseline channel; a gap stacks as zero; downsampled after stacking, each member keeping its own extremes per pixel column | charts-stacking K1-K3 | Unit (stack, jsdom stacking), Screenshot (`stacked`) |
| Below a stacked area's outline a 1px line in the ground's colour parts its fill from the member above, in both encodings | charts-stacking 04 | Unit (draw), Screenshot (`stacked`) |

## `Bar`

| Capability | Rule | Proved at |
|---|---|---|
| The step width = the smallest X distance | ADR-0002 | Unit (bars) |
| Uneven distances: the smallest gap applies | ADR-0002 | Unit (bars) |
| One point / all X values equal: a substitute from the value range | ADR-0002 | Unit (bars) |
| `barWidth` as a fraction of the step width | 4.3 | Unit (bars), Screenshot (`mixed`, `grouped`) |
| Bars on the same X axis stand side by side | ADR-0002 | Unit (bars), Screenshot (`mixed`, `grouped`) |
| A group shares the step width and the width fraction | ADR-0002 | Unit (bars) |
| Different `barWidth` within a group: DEV warning | ADR-0002 | Unit (scene) |
| The group as a whole centred on the X value | ADR-0002 | Unit (bars) |
| Grouping in registration order | R-2.1 | Unit (bars) |
| Bars on other X axes do not count towards the group | ADR-0002 | Unit (bars) |
| The foot at 0, with 0 inside the Y axis' value range; negative values hang below it | R-4.13 | Unit (scene), Screenshot (`deviation`) |
| Half a step width left and right inside the X value range | ADR-0002 | Unit (scene), Screenshot (`mixed`) |
| One `Path2D`, one `fill()` per series | R-2.12 | Manual (benchmark) |
| A gap leaves its bar out | R-2.5 | Screenshot (`mixed`) |
| `tone`: a role the theme resolves | Q11 | Unit (jsdom tone) |
| The hover marker sits at the head, not at the foot | R-4.7 | Interaction (`mixed`) |
| `stack`: bars of one id stand on each other in registration order, one place in the group; a gap stacks as zero and is no hit; negative values stack downward from zero apart from the positive | charts-stacking K1-K3 | Unit (stack, bars, draw, jsdom stacking), Screenshot (`stacked`) |
| A stack's extent from its foot to its highest top; a hidden member gives up its place | charts-stacking K2 | Unit (jsdom stacking) |
| `normalize` on any member, a hidden one too: every x of the stack sums to 100 %, the y axis reads in percent without a `tickFormat` (the sign from the wording); a line on that axis keeps its own values | charts-stacking K5 | Unit (stack, jsdom stacking), Screenshot (`percent`) |
| A Bar and an Area with the same id stack on each other - the key is the id and the two axes, not the kind | charts-stacking K1 | Unit (stack) |
| Between two stacked bars a 1px line in the ground's colour - `Canvas` under forced colours -, in both encodings; none on the baseline | charts-stacking 04 | Unit (draw), Screenshot (`stacked`, `percent`) |
| Under forced colours and `encoding="marks"` a stack's members are told apart by their hatches | C3, C4 | Manual (both stacked examples, forced colours emulated) |

## `Scatter`

| Capability | Rule | Proved at |
|---|---|---|
| Points without a connecting path | 4.3 | Screenshot (`mixed`, `measurements`) |
| `radius` | 4.3 | Screenshot (`measurements`, `over-a-course`) |
| `tone`: a role the theme resolves, not a colour value | 4.3 | Screenshot (`over-a-course`, light and dark) |
| One `Path2D`, one `fill()` per series | R-2.12 | Manual (benchmark) |
| A gap leaves its point out | R-2.5 | Screenshot (`mixed`) |
| Deliberately without the line's marker policy | — | type check |

## `StateBand`

| Capability | Rule | Proved at |
|---|---|---|
| A state is a number: the index into the state list | ADR-0007 | Unit (scene), type check |
| A segment from one point to the next, the last to the chart's latest reading (one median step past the band's own last point where that is the latest), never beyond the domain | — | Unit (state), Unit (open points in the scene) |
| A hit: the segment under the pointer; a boundary belongs to the segment that begins there | R-4.6 | Unit (state) |
| A gap interrupts the band without changing the segments beside it | R-2.5 | Unit (state) |
| The track in the Y axis' domain units; it does not pull its axis | — | Unit (limits and bands in the scene), Interaction (every track answers for itself), Screenshot (`under-a-course`) |
| Without `laneFrom`/`laneTo` the band fills its Y axis' whole domain | — | Screenshot (`shift`) |
| The legend explains states, not series | R-4.11 | Unit (limits and bands in the scene), Screenshot (`shift`) |
| A state shared by several bands highlights all of them on legend hover | R-4.11 | Unit (limits and bands in the scene) |
| No place in the palette: the next line gets the first colour | R-2.1 | Unit (limits and bands in the scene), Screenshot (`under-a-course`, `limits-and-state`) |
| The tooltip names the state, not its code | R-4.8 | Interaction |
| Rendering in light and dark | — | Screenshot (`limits-and-state`, `shift`, `under-a-course`) |

## `Matrix`

| Capability | Rule | Proved at |
|---|---|---|
| The value stands in its own, named value channel | ADR-0011 | Unit (limits and bands in the scene) |
| The cell edge from the smallest distance, in both dimensions; a substitute from the domain | ADR-0002 | Unit (cells) |
| A hit: the cell under the pointer, in both dimensions; a gap never hits | R-4.6 | Unit (cells) |
| A single row stays a point value range | R-4.13 | Unit (limits and bands in the scene) |
| Colouring as a gradient or from a limit set | ADR-0006 | Screenshot (`matrix`) |
| The tooltip carries the value, not the row number | R-4.8 | Interaction |
| The legend chip shows the gradient's or the limit set's colours, the tooltip chip the cell's; no place in the palette | R-4.11 | Unit (limits and bands in the scene; jsdom scene) |

## `LimitLine` / `LimitBand`

| Capability | Rule | Proved at |
|---|---|---|
| A limit is a rule with a severity; the colour follows the severity | ADR-0006 | Unit (limit), Screenshot (`limits-and-state`) |
| The same rule as in `@umriss-ui/core` | ADR-0006 | Unit (limit conformance, in `packages/core`) |
| The role specification, control limit or zone, each with its own stroke | ADR-0008 | Screenshot (`control-chart`) |
| It pulls its axis' value range, unless it expressly does not want to | R-4.13 | Unit (limits and bands in the scene) |
| A band takes up both edges; an axis without a series takes its own from its limits | R-4.13 | Unit (limits and bands in the scene) |
| No limit in the legend | R-4.11 | Unit (limits and bands in the scene) |
| Without `axisId` the axis its orientation names; an unknown axis is a DEV error, as for a series | R-4.12 | Unit (limit line, scene) |
| The label of an x limit stands in the row of the tick labels, set as they are | — | Unit (layout) |

## `ControlChart`

| Capability | Rule | Proved at |
|---|---|---|
| Composition without drawing code of its own | ADR-0008 | Interaction (everything on the series layer, nothing on the overlay) |
| Limits from a named reference window or given, never from everything visible | ADR-0008 | Unit (control limits) |
| Sigma from the mean moving range | — | Unit (control limits) |
| Four rules after Nelson, each switchable off, run lengths as parameters | — | Unit (control limits) |
| Zone lines at one and two sigma | — | Unit (control limits), Screenshot (`control-chart`) |
| No text brought along: the labelling of the limits and the name of the violations come from the caller | — | Unit (jsdom, control chart) |
| A constant reference window (sigma 0): no outlier and no two-of-three, and a DEV warning that the limits are degenerate | — | Unit (control limits) |
| The violations as data through `onViolations`, once per change of their content; inline accessor and origin recompute nothing | — | Unit (jsdom, control chart violations) |
| `tone` colours the line; the violations stay "alarm" | Q11 | Unit (jsdom tone) |

## The working-time axis (`calendar`)

| Capability | Rule | Proved at |
|---|---|---|
| The calendar sorted and merged; empty, reversed and infinite intervals fall away | — | Unit (working time) |
| Wall clock ↔ working time, monotonic; removed time becomes a gap | ADR-0001 | Unit (working time, limits and bands in the scene) |
| Ticks in wall-clock time on the time axis' local boundaries, mapped afterwards | — | Unit (time axis, layout under Europe/Berlin), Screenshot (`working-time`) |
| Explicit `ticks` and x limits named on the wall clock and mapped like the data | — | Unit (layout, limits and bands in the scene, jsdom scene) |
| One break mark per removed span | — | Unit (working time), Screenshot (`working-time`) |
| The time axis' labels, independent of the locale; `tickFormat` gets the wall clock | Q15 | Unit (layout, time axis) |

## `pareto`

| Capability | Rule | Proved at |
|---|---|---|
| Sorted descending, ties stable through the input index | — | Unit (Pareto) |
| Share and cumulative share, exactly 1 at the last entry | — | Unit (Pareto) |
| The crossing of the cutoff; an entry exactly on it counts | — | Unit (Pareto) |
| The remainder collected and always last; a collecting rank requires `remainderName` | — | Unit (Pareto) |
| Categories as indices on the numeric X axis | ADR-0002 | Screenshot (`pareto`) |

## `Tooltip`

| Capability | Rule | Proved at |
|---|---|---|
| A binary search per series in its own axis space | R-4.6 | Unit (hit), Interaction |
| Comparison between series always in pixel space | R-4.6 | Interaction (`axes`) |
| Gaps are not hits | R-4.6 | Interaction |
| The crosshair snaps onto the data point | R-4.7 | Interaction (overlay pixels) |
| Mode `"x"` with 4 px grouping | R-4.7 | Interaction |
| Mode `"nearest"` | 4.4 | Screenshot (`configuration`), Manual |
| `"nearest"`: a point within 12 px wins over the band or cell under the pointer; a scatter is measured in x and y | 4.4 | Unit (hit, jsdom scene), Interaction (`measurements`) |
| A chart of bands or cells only anchors crosshair and tooltip at the pointer | R-4.7 | Unit (jsdom scene) |
| The built-in tooltip, numbers in mono with tabular figures | R-4.8 | Interaction, Manual |
| A value in its y axis' `tickFormat`, the default without one; with several x axes each point's own x value in its own axis' format | R-4.8 | Unit (jsdom tooltip) |
| A series' own `format` before its y axis' `tickFormat`, a matrix' value included; `ControlChart` passes it to its line and its violations | Q16 | Unit (jsdom tooltip, jsdom control chart), Screenshot (`value-format`) |
| A stack: each series' own value (a normalised one's share), and the stack's total as its last row - in the series' `format` where the stack is normalised; the readout the same, the totals last | charts-stacking K4 | Unit (jsdom stacking) |
| `"nearest"` over a stack: the segment under the pointer, not the nearest top; at a shared edge the upper one, so the keys reach a segment of zero height | charts-stacking K4 | Unit (jsdom stacking) |
| A render prop gets each stacked point's own value in `yValue` and no total - it sums the points itself | charts-stacking K4 | Unit (jsdom stacking) |
| A render prop for one's own content | 4.4 | Screenshot (`configuration`), Manual |
| 12 px beside the crosshair, flipping at the edge, clamped vertically | R-4.9 | Interaction |
| Leaving the plot area and a window `blur` end the hover | R-4.10 | Interaction |
| `prefers-reduced-motion` switches the transition off | R-7.6 | Manual |

## `Legend`

| Capability | Rule | Proved at |
|---|---|---|
| `placement="top" \| "bottom"`, above without one | R-4.11 | Screenshot (`multi-series`, `configuration`, `legend-placement`) |
| A colour chip plus a name per series | R-4.11 | Unit (jsdom), Screenshot |
| Hover highlights the series, the others at 0.25 alpha | R-4.11 | Manual |
| `onToggle(name)`: entries become buttons with `aria-pressed`; without it no button | Q17 | Unit (jsdom legend toggle), Screenshot (`toggling-legend`) |
| A hidden series keeps its entry, drawn back; a state's entry only when every band showing it is hidden | Q17 | Unit (scene, jsdom legend toggle), Screenshot (`toggling-legend`) |

## `DataTable`

| Capability | Rule | Proved at |
|---|---|---|
| A disclosure key "Show data"/"Hide data" with `aria-expanded`, at the end of the legend, on a line of its own without one | charts-alternatives C1 | Unit (jsdom data table), Screenshot (`data-table`, `a-week-as-a-table`) |
| The table lies over the plot area; the plot keeps its size and is hidden meanwhile | C1 | Screenshot (`open-data-table`, `open-a-week-as-a-table`) |
| The visible domain only; the x in the first column (the axis `label`, else "Position"), then one column per visible series | C1 | Unit (table, jsdom data table) |
| Each value in the tooltip's format - the series' `format`, else its y axis' `tickFormat`; a gap and a missing reading leave the cell empty; a state by its name; a corridor by both edges | C1 | Unit (jsdom data table) |
| A stacked series lists its own value, not its top; no total column | charts-stacking K4 | Unit (jsdom stacking) |
| The series of one x axis merged on their x; a matrix in a table of its own, by column and row | C1 | Unit (table) |
| Above 500 rows the downsampled course - first, lowest, highest and last per stretch; a state band its changes of state, as the keys walk it -, and the caption says from how many readings | C2, charts-alternatives 04 | Unit (table, jsdom data table), Screenshot (`open-a-week-as-a-table`) |
| Column and row headings (`scope`), a caption, the scrolling panel a tab stop of its own; axe clean | C1 | Unit (jsdom data table), Accessibility |
| Its words from the chart's wording, German beside them | C5 | Unit (table, jsdom data table) |

## Theme

| Capability | Rule | Proved at |
|---|---|---|
| Coupling only through `--uc-*` with a `--u-*` fallback | R-1.6 | Screenshot (light/dark) |
| `getComputedStyle` once per chart, never in the draw loop | R-1.7 | Manual (code review, benchmark) |
| A MutationObserver on `documentElement` | R-1.7 | Interaction (theme switch) |
| `invalidateTheme()` | R-1.7 | Manual |
| Dark mode without code of its own | R-1.8 | Screenshot (dark) |
| Under `forced-colors: active` the theme resolves to system colours - `CanvasText` for text, axes and every series, `Canvas` for the ground, `GrayText` for the grid, `Highlight` for warning and alarm; a caller's colour becomes `CanvasText` - and encoding by marks switches on by itself, the tooltip's chips drawing the legend's marks; entering or leaving the mode reads the theme anew | charts-alternatives C4, 04 | Unit (jsdom theme, jsdom encoding), Interaction (forced colours: chip and canvas), Screenshot (forced colours × 4 examples) |

## Performance (R-5, reference run)

Measured on a current desktop browser (Chromium headless, Apple Silicon), three
series, through the demo build's benchmark page - the median of five loads per
row. Re-measured in `charts-long-series` 03 on one machine on one day, before
and after the automatic downsampling of lines and areas, so the two columns
compare; the first reference run's figures were of the same order as the
"before" column.

**What was measured is stated with it.** The figures of the first reference run
held for three lines. A filled area and a rectangle per point are different work
from a stroked path, so both are reported and the benchmark page can be switched
between the two sets.

Series kinds: **lines** = three `Line`. **Mixed** = one `Bar`, one `Area`, one
`Line`.

| Data volume | Set | Materialisation | Series draw | Series draw without downsampling | FPS on hover |
|---|---|---|---|---|---|
| 3 × 1,000 | lines | 0.1 ms | 0.1 ms | 0.3 ms | 60 |
| 3 × 1,000 | mixed | 0.1 ms | 0.3 ms | 0.3 ms | 60 |
| 3 × 100,000 | lines | 8.3 ms | 2.6 ms | 7.6 ms | 60 |
| 3 × 100,000 | mixed | 8.8 ms | 8.9 ms | 14.5 ms | 60 |
| 3 × 1,000,000 | lines | 51.4 ms | 8.2 ms | 47.0 ms | 60 |
| 3 × 1,000,000 | mixed | 52.2 ms | 57.3 ms | 100.4 ms | 60 |

The acceptance figures from R-5.2 (100k × 3: draw < 25 ms, hover ≥ 55 FPS) are met
for both sets. At 1,000 points per series nothing is thinned - any plot wider
than 500 pixels holds them at two per column or fewer - and the figures are the
same within noise. Above that a line
costs a pass over its window and a path of four points per column: the pass is
what is left of the 8 ms at a million. The mixed set keeps its bar, which is
never thinned - a rectangle per point - and that is most of its 57 ms.
Materialisation does not change: every accessor still runs once per point.

The second example on the benchmark page, a week of a kiln at one reading a
second (2 × 604,800 points, zoomable), drew the whole week in 8 to 23 ms and
a zoomed three quarters of an hour in 0.6 ms.

The hover stays at 60 FPS in every case. That is the actual statement: it draws
only the overlay layer, and the series kind changes nothing about that.

The hover path is not free of allocation: the hit test builds a handful of
small objects per move (candidates, the hit, its key). Measured directly in
`charts-fixes` 12 - `pointerMove` 20,000 times over three lines in jsdom -
it costs about 3 µs per move at 1,000, 100,000 and 1,000,000 points alike,
with no heap growth beyond noise; the count of points does not enter it. That is
a five-thousandth of a frame, so the objects stay and the comment at the pointer
handler says so, instead of promising none.

Live mode (10 points/s, a travelling window) holds the width of the left axis band
constant over 5 s – the hysteresis from R-3.4 works (R-5.3).

## Later

Wanted, not yet built (charts-review Q12). Each waits for a caller who needs it.

* **`onSelect`.** A click that reports the hit; the hit model is there, the
  question of what a selection is (ADR-0003 in core) is not.
* **A stack's total in the data table.** The tooltip and the readout carry it
  (charts-stacking K4); the table lists the members' own values only, and waits
  for a reader who misses the column.
* **Box plot.** A kind of its own with five channels; nobody has asked for it
  on a plant screen yet.
* **Line colour by limit.** A line that turns alarm-coloured above a limit; today
  a `LimitBand` and the ControlChart's violations say the same.

## Out

Not planned, because each contradicts a ground rule or buys little for its cost.
The reasons across all five packages stand in
[ADR-0032](../../../docs/adr/0032-what-umriss-is-not.md); the case for each one
here.

* **A category scale.** Bars sit on the numeric X axis (ADR-0002); categories are
  passed as numeric positions with a naming `tickFormat`.
* **Log scale.** Plant values are read linearly; a log axis breaks the affine
  scale that the working-time axis relies on (ADR-0001).
* **Smoothing.** A curve between samples invents values the plant never
  measured; `Line step` draws what was held.
* **Animation.** A chart that moves on every update is harder to read, and the
  chart redraws once per change, not per frame.
* **Export.** The canvas is a canvas; a picture of it is the caller's
  `toDataURL`.
* **WebGL.** Downsampling keeps a week of seconds under 25 ms in 2D; a second
  renderer would double every kind.
* **Stacked lines, streamgraphs.** A line is a course, not a share: `stack`
  is on the two kinds that fill a whole of parts (charts-stacking).
* **Horizontal bars.** Bars grow along the Y axis from a baseline on the X axis.
* **Pie, radar, candle.** The set of kinds is closed (no renderer interface for
  third parties); none of the three answers a question of a plant screen.

## Known limits

* **The closure limit of change detection.** Accessors, `tickFormat` and the
  tooltip's `render` are compared by their source text, because inline ones are
  new on every render. Two functions of the same text that read different
  captured values count as equal: an accessor is not run again, an axis not
  relabelled. The remedy is a new data reference or a new text; solving it
  would mean re-running every function on every render (Q10).
