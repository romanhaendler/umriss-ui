# The charts, examined

Status: ready-for-agent
Date:   2026-09-23
Origin: grilling session on the state of `@umriss-ui/charts` (0.3.2) - two
tasks: complete the demo, and examine every chart critically. This file is the
record of the findings and the decisions; the work lives in five packages of
their own, listed at the end.

## Problem Statement

`@umriss-ui/charts` has had the least attention of the four packages. Five of
its demo pages carry no example of their own. The code holds real bugs - a
span on one lane offset by a span on another, a tooltip that ignores the axis
format, a control chart that can render forever - and it lacks things a plant
screen expects from a chart: a time axis without an operating calendar, a
value format per series, a step line, a way to hide a series, an empty state,
zoom on a long course.

## Ground rules for the whole effort

Held fixed; everything else was open to review (decision Q5):

- No dependency but React (R-1.2).
- The set of series kinds is closed - no renderer interface for third parties.
- A bar sits on the numeric x axis (ADR-0002).

## Findings

Found by reading `packages/charts/src/` in full; the decisive ones checked
against the code a second time. Line numbers are those of 0.3.2.

### Bugs

1. `overlapDepth` (`src/spans.ts:68`) knows no lane: spans overlapping in time
   on different resources are offset. *Resolved by removing `Span`.*
2. The DEV sortedness check runs for the first materialised series only, and
   warns falsely for Matrix and Span, whose x values are legitimately unsorted
   (`src/scene.ts:897`).
3. Matrix gets a palette colour in legend and tooltip that it never draws
   (`src/scene.ts:1270`, `:1622`).
4. The Span tooltip shows the lane index as its value ("Jobs 0").
   *Resolved by removing `Span`.*
5. Legend hover on a state shared by several StateBands highlights the first
   band only (`src/scene.ts:1257`).
6. The tooltip formats values with a fixed default, never with the y axis'
   `tickFormat` (`src/format.ts:41`, `src/TooltipHtml.tsx:18`). With several x
   axes, the header uses the primary hit's axis only (`src/scene.ts:1702`).
7. ±Infinity is not a gap: it enters the extent, which becomes non-finite, and
   the axis falls back to [0,1] (`src/materialize.ts:111`, `:179`).
8. A point between two gaps is a lone `moveTo` and is never drawn; markers stop
   above 60 points (`src/draw.ts:189`, `src/scene.ts:1397`). A single-point
   area is invisible.
9. `ControlChart` recomputes on every identity change of an inline accessor or
   `origin` and calls `onViolations` in an effect each time - a caller that sets
   state there renders forever (`src/ControlChart.tsx:89-111`).
10. `LimitLine`/`LimitBand` with `orientation="x"` and no `axisId` finds no axis
    (default `"y"`) and silently draws nothing (`src/LimitLine.tsx:64`,
    `src/scene.ts:1309`); `validate()` never checks limits. Labels of x limits
    get no band space (`src/layout.ts:272`).
11. The calendar axis: x limits are placed in wall-clock units on an
    operating-time scale (`src/scene.ts:1121`, `:1316`); explicit `ticks` are
    not mapped (`src/layout.ts:186`); day and 6/12 h ticks fall on UTC
    midnight while the labels are local - "01:00" under a day change in CET
    (`src/layout.ts:191`).
12. Change detection: `calendar` compared by reference (an inline array
    re-materialises every render, `src/scene.ts:575`); `fnEqual` compares
    source text, also for `tickFormat` and the tooltip `render`
    (`src/scene.ts:184`, `:587`, `:675`) - a bound `Intl.NumberFormat#format`
    is `"[native code]"` and never updates.
13. Hit testing: in `"nearest"` mode a band or cell is always at distance 0 and
    beats every point (`src/scene.ts:1646`); a chart of bands or cells only
    anchors crosshair and tooltip at the segment start, not at the pointer
    (`:1641`, `:1690`); scatter hits by x only (`src/hit.ts:8`).
14. Small: the comment on `Chart.height` promises the host's height, the
    default is 300 (`src/Chart.tsx:39` vs `:64`); StateBand and Matrix use up
    places of a six-colour palette (`src/theme.ts:99`, `src/scene.ts:1217`);
    `matrixBuckets` allocates on every series redraw including legend hover
    (`src/scene.ts:1458`); the hover path allocates despite R-5.4; with
    `sigma` 0 every value off the centre line is an outlier.

### Found while writing the examples

Appended by `charts-demo-examples` (Q1): what snagged against the API of 0.3.2
while the five pages got their examples. Not worked around in the examples.

15. A series' `color` is documented as "any CSS colour value", but it reaches
    the canvas as the text it was given (`src/scene.ts:1205`, `:1283`); only
    the palette and `tone` go through the theme's probe. `var(--u-…)` or
    `light-dark(…)` - the only way to name a colour that follows the scheme -
    is ignored by the canvas, which keeps the previous `fillStyle`, while the
    legend chip, a CSS `background`, resolves it. So the grouped bar example
    gives the plan a literal (`#94a3b8`) that is merely acceptable in both
    schemes. Resolve `color` through `resolveColours` like the palette.
16. A state band's last segment runs to the end of the x domain
    (`src/state.ts:52`, on purpose: the current state is the one read first).
    With the default `domain="nice"` that end is a rounding of the axis, not a
    moment: in the StateBand examples the last report is at 21:45 and the band
    claims "Maintenance" until 23:26, beside a temperature line that stops at
    21:45. With `domain="data"` the last segment has width 0 and is not drawn at
    all. Neither is what the page says - a state is known for as long as it was
    reported. Candidates: end the last segment one measured step after its
    point, or at an explicit `until` (default: the last x value of the chart's
    data), never at the padding.

### API inconsistencies

| Prop | Line | Area | Bar | Scatter | StateBand | Matrix |
|---|---|---|---|---|---|---|
| `color` | ✓ | ✓ | ✓ | ✓ | – (states) | – |
| `tone` | ✓ | – | – | ✓ | – | – |
| `dash` | ✓ | – | – | – | – | – |
| value format / `hidden` | – | – | – | – | – | – |

`ControlChart` has no `tone` for its line either. The size props measure
different things in different units (`barWidth` a fraction, `radius` px,
`laneFrom`/`laneTo` y units) - left as they are (Q13).

### Test gaps

Capabilities proved "Manual" that can be automated: DPR, one rAF and the
dirty flags, clipping, DEV warnings, `onPerf`, legend hover, the theme
observer, reduced motion, `onViolations`. `docs/capabilities.md` claims Area
`fillOpacity`/`strokeWidth` proved by the `mixed` screenshot, which uses the
defaults only. Each package below automates what it touches; a sweep of its
own is not planned.

## Decisions

| # | Question | Decision |
|---|---|---|
| Q1 | Order | Examples first against today's API; what snags there is a finding. |
| Q2 | Examples per page | Two to three, each showing one property. |
| Q3 | Isolated or composed | First example the kind alone; a second may compose where that shows its strength. The mixed example stays on the Chart page. |
| Q4 | Data | Plant data, new generators in `data.ts`; existing examples untouched. |
| Q5 | Non-goals | All open to review except the three ground rules above. |
| Q6 | Where the results live | This file, then one `.scratch/` package per effort. |
| Q7 | "Why" texts | Only where a surprising decision stands: Area, Tooltip, Axis. |
| Q8 | Tooltip & Legend | Stay one page. |
| Q9 | `Span` | Removed. `@umriss-ui/schedule` draws occupancy, and does it better. |
| Q10 | Bugs | A package of their own, before any feature; one failing test per bug first. `fnEqual`: identity when the source is `[native code]`; the closure limit documented, not solved. |
| Q11 | Definitely missing | Time axis, value format per series, step line, `hidden` + legend toggle, empty state, `tone`/`dash` where they fit → `charts-essentials`. Keyboard and screen-reader access → `charts-a11y`. |
| Q12 | Expected beyond that | In: x zoom/pan, downsampling, cursor sync, `alignTicks` (`charts-long-series`). Later: `onSelect`, stacking, box plot, line colour by limit. Out: log scale, smoothing, animation, export, WebGL, horizontal bars, pie/radar/candle. |
| Q13 | Size props | Not unified; each JSDoc names its unit. |
| Q14 | Glossary without Span | **Span** struck; **Idle** and **Overlap** reworded onto the schedule; the schedule entries say where they came from. Done with the removal. |
| Q15 | Time axis | `XAxis time`; `calendar` implies it. Ticks on local boundaries; the offset logic moves from schedule to charts. Labels `en-GB`, 24 h, by level (`15:00`, `17 Mar`, `Mar 2026`); the calendar axis loses `dd.MM.`. |
| Q16 | Value format | `format?: (value) => string` per series; fallback the y axis' `tickFormat`, then the default. No `unit` prop. `ControlChart` passes `format` on. |
| Q17 | `hidden` | Controlled: `hidden` on the series, `Legend.onToggle(name)`; no handler, no click. A hidden series does not count for the extent. |
| Q18 | Empty state | Axes and frame stay; `Chart.empty?: ReactNode`, default `"No data"`. |
| Q19 | Zoom/pan | Controlled: `XAxis.onDomainChange`; wheel, drag, pinch propose; double click proposes `"data"`. `YAxis domain="visible"`. |
| Q20 | Downsampling | Automatic, Line and Area only, above 2 points per pixel; first/min/max/last per column; the tooltip searches the raw data. |
| Q21 | Cursor sync | `Chart.syncId`; only the x position in domain units is shared; one tooltip, under the pointer. |
| Q22 | Step line | `step?: boolean` on `Line`, sample-and-hold only. |
| Q23 | Isolated points | Always a marker unless `markers="never"`; an area draws a vertical stroke from baseline to value. |
| Q24 | `alignTicks` | On a further y axis: takes the first axis' tick count and widens its own domain until the ticks fall on its grid; steps stay 1-2-5. |
| Q25 | ADR | Exactly one: ADR-0026 "Span leaves charts; occupancy is the schedule's". |
| Q26 | Order and releases | The five packages in the order below; a minor release after `charts-fixes` (carrying the examples), `charts-essentials` and `charts-long-series`; `charts-a11y` gets its own grilling. |

## Packages

1. `.scratch/charts-demo-examples/` - the five pages without an example.
2. `.scratch/charts-fixes/` - bugs 2-14, the removal of `Span`, release.
3. `.scratch/charts-essentials/` - Q11, Q15-Q18, Q22, release.
4. `.scratch/charts-long-series/` - Q19-Q21, Q24, release.
5. `.scratch/charts-a11y/` - to be grilled when it is due.

## Out of Scope

Everything under "Later" and "Out" in Q12. They move into `docs/capabilities.md`
with their reason, replacing "Deliberately open" (`charts-essentials` 07).
