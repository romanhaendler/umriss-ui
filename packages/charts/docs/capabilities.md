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
| DEV warning without `ariaLabel` | R-7.6 | Manual |
| Series kinds can be mixed in one chart | ADR-0002 | Screenshot (`mixed`), Interaction |
| Every series kind can be bound to every axis | R-4.12 | Unit (scene) |
| SSR: `renderToString` does not throw | R-7.4 | Unit (SSR) |
| `onPerf` instrumentation | R-5.1 | Manual (benchmark page) |

## Registration, data, materialisation

| Capability | Rule | Proved at |
|---|---|---|
| Children register configuration; they render no pixels | R-2.1 | Unit (scene) |
| Registration order = drawing order | R-2.1 | Unit (scene) |
| A palette place by name: in order on first mounting, and a returning series gets its colour back; without a name by position, with a DEV warning on a change | R-2.1 | Unit (scene) |
| A config change only sets dirty flags, no synchronous draw | R-2.2 | Unit (scene) |
| A child outside `Chart`: DEV error, silent in PROD | R-2.3 | Manual |
| Accessors, generic `T`, a series' own `data` | R-2.4 | Unit (materialisation), Screenshot |
| `null`/`undefined`/`NaN` = a gap, no joining across it | R-2.5 | Unit (materialisation), Interaction, Screenshot |
| DEV sortedness check once per data change | R-2.6 | Unit (materialisation) |
| Materialisation into `Float64Array`, once per change | R-2.7 | Unit (materialisation) |
| An axis' value range comes only from the series bound to it | R-4.13 | Unit (materialisation, scene) |
| One order across the series kinds (drawing, and the first palette assignment) | R-2.1 | Unit (scene) |
| Series configuration as a discriminated union over `kind` | — | Unit (scene), type check |
| A second channel for the baseline, only where a kind needs it | R-2.7 | Unit (materialisation) |
| The baseline enters the value range of its Y axis | R-4.13 | Unit (materialisation, scene) |
| A fixed domain wins against the widened value range | 4.2 | Unit (layout) |
| A change of baseline or series kind materialises afresh | R-2.2 | Unit (scene) |

## `XAxis` / `YAxis`

| Capability | Rule | Proved at |
|---|---|---|
| The 1-2-5 tick algorithm | R-4.1 | Unit (ticks) |
| Default format through `Intl`, decimals from the step | R-4.1 | Unit (ticks), Screenshot |
| Tabular figures in every number | acceptance 5 | Screenshot |
| `domain="nice" \| "data" \| [min,max]` | 4.2 | Unit (ticks, layout), Screenshot (`configuration`) |
| A constant series → domain ±1 | R-4.3 | Unit (ticks) |
| The zero line stronger than the grid | R-4.2 | Manual |
| `tickCount`, `tickFormat` | 4.2 | Unit (layout), Screenshot |
| Any number of X and Y axes | R-4.12 | Screenshot (`axes`), Interaction |
| A duplicate id per orientation: DEV invariant | R-4.12 | Unit (scene) |
| A series' unknown axis reference: DEV invariant | R-4.12 | Unit (scene) |
| An axis with no series bound: DEV warning, domain [0,1] | R-4.13 | Unit (scene) |
| Grid default: only the first registered axis per orientation | R-4.15 | Screenshot (`axes`), Unit (scene, warning) |
| `position` on all four sides | R-4.16 | Unit (layout), Screenshot (`axes`) |
| Right and top labels mirror their alignment | R-4.16 | Interaction |
| The Y title rotated outside, along the axis | R-4.16 | Unit (layout, band width), Screenshot |

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
| Binding through `xAxisId` / `yAxisId` | R-4.12 | Interaction (`axes`), Screenshot |

## `Area`

| Capability | Rule | Proved at |
|---|---|---|
| Fill down to baseline 0 when none is given | ADR-0002 | Unit (materialisation, scene), Screenshot (`filled`) |
| A band area between two accessors | 4.3 | Screenshot (`mixed`, `corridor`) |
| The baseline pulls its Y axis' value range | R-4.13 | Unit (materialisation, scene) |
| Fill and outline as separate paths | R-2.12 | Screenshot (`mixed`) |
| A gap produces a hole, not a straight line across it | R-2.5 | Screenshot (`mixed`, `corridor`) |
| `fillOpacity`, `strokeWidth` (0 leaves the outline out) | 4.3 | Screenshot (`filled`, `corridor`, light and dark) |

## `Bar`

| Capability | Rule | Proved at |
|---|---|---|
| The step width = the smallest X distance | ADR-0002 | Unit (bars) |
| Uneven distances: the smallest gap applies | ADR-0002 | Unit (bars) |
| One point / all X values equal: a substitute from the value range | ADR-0002 | Unit (bars) |
| `barWidth` as a fraction of the step width | 4.3 | Unit (bars), Screenshot (`mixed`) |
| Bars on the same X axis stand side by side | ADR-0002 | Unit (bars), Screenshot (`mixed`) |
| A group shares the step width and the width fraction | ADR-0002 | Unit (bars) |
| Different `barWidth` within a group: DEV warning | ADR-0002 | Unit (scene) |
| The group as a whole centred on the X value | ADR-0002 | Unit (bars) |
| Grouping in registration order | R-2.1 | Unit (bars) |
| Bars on other X axes do not count towards the group | ADR-0002 | Unit (bars) |
| The foot at 0, with 0 inside the Y axis' value range | R-4.13 | Unit (scene) |
| Half a step width left and right inside the X value range | ADR-0002 | Unit (scene), Screenshot (`mixed`) |
| One `Path2D`, one `fill()` per series | R-2.12 | Manual (benchmark) |
| A gap leaves its bar out | R-2.5 | Screenshot (`mixed`) |
| The hover marker sits at the head, not at the foot | R-4.7 | Interaction (`mixed`) |

## `Scatter`

| Capability | Rule | Proved at |
|---|---|---|
| Points without a connecting path | 4.3 | Screenshot (`mixed`) |
| `radius` | 4.3 | Screenshot (`mixed`) |
| One `Path2D`, one `fill()` per series | R-2.12 | Manual (benchmark) |
| A gap leaves its point out | R-2.5 | Screenshot (`mixed`) |
| Deliberately without the line's marker policy | — | type check |

## `StateBand`

| Capability | Rule | Proved at |
|---|---|---|
| A state is a number: the index into the state list | ADR-0007 | Unit (scene), type check |
| A segment from one point to the next, the last to the end of the domain | — | Unit (state) |
| A hit: the segment under the pointer; a boundary belongs to the segment that begins there | R-4.6 | Unit (state) |
| A gap interrupts the band without changing the segments beside it | R-2.5 | Unit (state) |
| The track in the Y axis' domain units; it does not pull its axis | — | Unit (limits and bands in the scene), Interaction (every track answers for itself) |
| The legend explains states, not series | R-4.11 | Unit (limits and bands in the scene) |
| The tooltip names the state, not its code | R-4.8 | Interaction |
| Rendering in light and dark | — | Screenshot (`limits-and-state`) |

## `Matrix`

| Capability | Rule | Proved at |
|---|---|---|
| The value stands in its own, named value channel | ADR-0011 | Unit (limits and bands in the scene) |
| The cell edge from the smallest distance, in both dimensions; a substitute from the domain | ADR-0002 | Unit (cells) |
| A hit: the cell under the pointer, in both dimensions; a gap never hits | R-4.6 | Unit (cells) |
| A single row stays a point value range | R-4.13 | Unit (limits and bands in the scene) |
| Colouring as a gradient or from a limit set | ADR-0006 | Screenshot (`matrix`) |
| The tooltip carries the value, not the row number | R-4.8 | Interaction |

## `Span`

| Capability | Rule | Proved at |
|---|---|---|
| An explicit end; without an end, open to the edge | — | Unit (spans), Interaction (at the far right only the open span runs) |
| Idle time between two spans stays empty | — | Unit (spans) |
| Overlap is offset within the track, never packed; counted by registration | — | Unit (spans) |
| A hit only within its own track; where they cover each other, the last registered | R-4.6 | Unit (spans) |
| The end stands in the second, named X channel | ADR-0011 | Unit (limits and bands in the scene) |
| An open span does not tear open the X value range | R-4.13 | Unit (limits and bands in the scene) |
| Rendering in light and dark | — | Screenshot (`schedule`) |

## `LimitLine` / `LimitBand`

| Capability | Rule | Proved at |
|---|---|---|
| A limit is a rule with a severity; the colour follows the severity | ADR-0006 | Unit (limit), Screenshot (`limits-and-state`) |
| The same rule as in `@umriss-ui/core` | ADR-0006 | Unit (limit conformance, in `packages/core`) |
| The role specification, control limit or zone, each with its own stroke | ADR-0008 | Screenshot (`control-chart`) |
| It pulls its axis' value range, unless it expressly does not want to | R-4.13 | Unit (limits and bands in the scene) |
| A band takes up both edges; an axis without a series takes its own from its limits | R-4.13 | Unit (limits and bands in the scene) |
| No limit in the legend | R-4.11 | Unit (limits and bands in the scene) |

## `ControlChart`

| Capability | Rule | Proved at |
|---|---|---|
| Composition without drawing code of its own | ADR-0008 | Interaction (everything on the series layer, nothing on the overlay) |
| Limits from a named reference window or given, never from everything visible | ADR-0008 | Unit (control limits) |
| Sigma from the mean moving range | — | Unit (control limits) |
| Four rules after Nelson, each switchable off, run lengths as parameters | — | Unit (control limits) |
| Zone lines at one and two sigma | — | Unit (control limits), Screenshot (`control-chart`) |
| No text brought along: the labelling of the limits and the name of the violations come from the caller | — | Unit (jsdom, control chart) |
| The violations as data through `onViolations` | — | Manual |

## The operating-time axis (`calendar`)

| Capability | Rule | Proved at |
|---|---|---|
| The calendar sorted and merged; empty, reversed and infinite intervals fall away | — | Unit (operating time) |
| Wall clock ↔ operating time, monotonic; removed time becomes a gap | ADR-0001 | Unit (operating time, limits and bands in the scene) |
| Ticks in wall-clock time at readable boundaries, mapped afterwards | — | Unit (operating time) |
| One break mark per removed span | — | Unit (operating time), Screenshot (`operating-time`) |
| Default labelling `dd.MM. HH:mm`, independent of the locale | — | Unit (layout) |

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
| The built-in tooltip, numbers in mono with tabular figures | R-4.8 | Interaction, Manual |
| A render prop for one's own content | 4.4 | Screenshot (`configuration`), Manual |
| 12 px beside the crosshair, flipping at the edge, clamped vertically | R-4.9 | Interaction |
| Leaving the plot area and a window `blur` end the hover | R-4.10 | Interaction |
| `prefers-reduced-motion` switches the transition off | R-7.6 | Manual |

## `Legend`

| Capability | Rule | Proved at |
|---|---|---|
| Static, `placement="top" \| "bottom"` | R-4.11 | Screenshot (`multi-series`, `configuration`) |
| A colour chip plus a name per series | R-4.11 | Unit (jsdom), Screenshot |
| Hover highlights the series, the others at 0.25 alpha | R-4.11 | Manual |

## Theme

| Capability | Rule | Proved at |
|---|---|---|
| Coupling only through `--uc-*` with a `--u-*` fallback | R-1.6 | Screenshot (light/dark) |
| `getComputedStyle` once per chart, never in the draw loop | R-1.7 | Manual (code review, benchmark) |
| A MutationObserver on `documentElement` | R-1.7 | Interaction (theme switch) |
| `invalidateTheme()` | R-1.7 | Manual |
| Dark mode without code of its own | R-1.8 | Screenshot (dark) |

## Performance (R-5, reference run)

Measured on a current desktop browser (Chromium headless, Apple Silicon), three
series, without downsampling, through the demo build's benchmark page.

**What was measured is stated with it.** The figures of the first reference run
held for three lines. A filled area and a rectangle per point are different work
from a stroked path, so both are reported and the benchmark page can be switched
between the two sets.

Series kinds: **lines** = three `Line`. **Mixed** = one `Bar`, one `Area`, one
`Line`.

| Data volume | Set | Materialisation | Series draw | FPS on hover |
|---|---|---|---|---|
| 3 × 1,000 | lines | 0.3 ms | 0.1 ms | 60 |
| 3 × 1,000 | mixed | 0.1 ms | 0.3 ms | 60 |
| 3 × 100,000 | lines | 10.5 ms | 10.8 ms | 60 |
| 3 × 100,000 | mixed | 8.1 ms | 18.7 ms | 60 |
| 3 × 1,000,000 | lines | 49.8 ms | 49.6 ms | 60 |
| 3 × 1,000,000 | mixed | 50.0 ms | 108.2 ms | 60 |

The acceptance figures from R-5.2 (100k × 3: draw < 25 ms, hover ≥ 55 FPS) are met
for both sets. At 1 million × 3 the mixed set costs a good twice the pure line
set – as expected, because there a rectangle is produced per point instead of a
path segment. Both sizes run without freezing.

The hover stays at 60 FPS in every case. That is the actual statement: it draws
only the overlay layer, and the series kind changes nothing about that.

Live mode (10 points/s, a travelling window) holds the width of the left axis band
constant over 5 s – the hysteresis from R-3.4 works (R-5.3).

## Deliberately open

* The non-goals from section 0.1 of the handoff, in so far as they are still open:
  zoom/pan, animations, time and log scales, downsampling, curve interpolation,
  an interactive legend, export, full a11y build-out, WebGL.
* **Stacking** (stacked bars and areas). It needs more than two Y channels and a
  cross-series summing step; that is a data question and not a drawing one, and it
  deserves a work package of its own.
* **A category scale.** Bars sit on the numeric X axis (ADR-0002); categories are
  passed as numeric positions with a naming `tickFormat`.
* **Horizontal bars.** Bars grow along the Y axis from a baseline on the X axis.
* **Further series kinds** – step lines, candles, pie, radar, heatmap, box plot.
  The set of kinds is closed (no renderer interface for third parties).
* **Interaction specific to a kind.** No bar hover highlight, no brush, no click
  selection; the hit model is the same for all four kinds.
* Open points from section 9: the final package name, the final palette colours,
  the location of the demo, `alignTicks`, axis colouring.
