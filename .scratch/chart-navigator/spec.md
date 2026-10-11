# A navigator shows the whole course

Status: needs-triage
Date:   2026-10-11
Origin: moved out of `.scratch/chart-range-selection-and-navigator/spec.md`
(its questions Q5-Q10 and the tickets that belonged to them), corrected against
`docs/research/open-points-2026-10/range_and_navigator.md`. Roadmap row C5:
the navigator is a piece of its own, later, with a design session of its own.

**This spec waits for that session.** It decides nothing. It is built after
the range (`chart-range-selection-and-navigator`), whose gesture and `onRange`
it does not need but whose release settles what a reader does on a long
course first. Everything marked "recommendation" is a first reading for the
session to confirm, change or throw out.

## Problem Statement

On a long course a zoomed chart shows a slice and nothing says where it lies.
`packages/charts/docs/capabilities.md`, "Later", wanted "a small overview of
the whole course under the plot, its window the span in view, dragged to pan
and stretched to zoom". Without it a reader zooms in, loses the whole and
presses "Show all" to find out where they were.

## What exists

- **The view** (ADR-0047, `src/view.ts`): `domains` by axis `id`, `initialView`
  in, `onViewChange` out, `zoomLimits` clamping, the chart's own "Show all".
  A navigator would read `domains[axisId]` as its window and the axis' `domain`
  as its whole, and write through the scene's own pan and zoom entry points.
- **The gestures and keys** (`src/scene.ts`; ADR-0030): zoom and pan on the
  plot only, on an axis that is `zoomable`; one tab stop for the plot.
- **Registered parts** (`Tooltip`, `Legend`, `DataTable`) register with the
  scene and sit in the chart's layout (`DataTable.tsx` is the model: it
  measures the plot after each layout).
- **Loading and empty** (`Chart.tsx`): `loading` dims and takes no pointer;
  `empty` shows "No data" in the plot.
- **The schedule's Miniature** (CONTEXT.md **Miniature**,
  `packages/schedule/src/rows.ts` `RowKind = "miniature"`): a folded lane group
  as thin strips in the schedule's canvas. It shrinks rows, not time, and has
  no window; it is not a navigator. What carries over is the principle, "the
  real work, smaller - never a summary".
- **ADR-0032** lists no navigator among the things never built.

## What the other libraries do

From the research note, corrected from the old spec's memory:

| Library | What it draws | Height | How it is wired |
| --- | --- | --- | --- |
| Recharts `Brush` | One child chart element, cloned with `compact` and `data`; nothing renders for zero or several children. Background, slide, two travellers, start and end labels | 40, `travellerWidth` 5 | A child of the chart; works in data **indices** (`startIndex`/`endIndex`, `onChange` only when they differ), not in x values. Travellers are `role="slider"`, arrows move one index |
| MUI X | An optional `preview` (bar, line, area, scatter, candlestick); `preview.seriesIds` picks series | `zoom.slider.size`; default not read | `zoom.slider.enabled` on the zoom config or the `ChartsZoomSlider` component. There is **no `zoomSlider` prop**. The zoom page is Pro/Premium |
| ECharts slider | A "data shadow", a miniature trend (`showDataShadow` auto) | 30 | A `dataZoom` component; `xAxisIndex` links axes; `realtime` true |
| Highcharts Stock | The first series as areaspline by default; `series.showInNavigator`, `navigator.series` choose others | 40, margin 22 | In the chart with its own axes; a Standalone Navigator syncs charts |
| uPlot, Grafana | none | | |

Keyboard and screen reader: only Recharts documents sliders with arrows; MUI's
zoom keys are the plot's; none of the others is documented. Not established:
MUI's slider markup, Highcharts' navigator keyboard.

## Open questions

### Q5 - A component of its own or a prop?

- **A. `<Navigator />` inside `<Chart>`**, like `Tooltip` and `Legend`: shares
  scene, view, data and axis; sits under the plot in the chart's layout.
- **B. A component beside the chart.** Free placement; the caller wires
  `view`/`onViewChange` both ways (the boilerplate ADR-0047 removed) and its x
  would not align with the plot's left axis band.
- **C. A prop `navigator`.** Short, an object once it names a series or height.

Recommendation: A. The research bears on it: Recharts and MUI both make it a
child or a component of the chart.

### Q6 - What does it draw?

- **A. One series**, named by the caller. Cheap, legible; Recharts draws one
  child chart, Highcharts one by default.
- **B. Every visible series, downsampled** (`downsample.ts`): "the real work,
  smaller"; a hidden series must follow the legend or lie.
- **C. The caller's choice**: `series` a name or a list; default every visible
  one. MUI's `preview.seriesIds` and Highcharts' `navigator.series` are this.

Line or area only at first; bars and stacks left out. Recommendation: C.

### Q7 - Height, what it reads, what it sets

- Height: a `height` prop, about 40-48 px by the libraries' habit (30-40),
  added to the chart's height.
- Reads: the window is `domains[axisId]`, the whole the axis' `domain`; the
  axis is the one zoomable x axis, else a prop names it.
- Sets: through the scene's pan and zoom entry points; `onViewChange` fires as
  for a drag, `zoomLimits` clamps, no second view (ADR-0047). Works in x
  values, not indices - which also serves a category axis (ADR-0052) in
  positions.
- Window: drag the body to pan, an edge to zoom, a click outside to centre, a
  double click to reset. No zoomable axis: renders nothing, warns in dev.

### Q8 - Keys and role

Its own tab stop after the plot; the plot's is not widened. `role="group"`
with a label and two `role="slider"` thumbs with `aria-valuemin/max/now` and
`aria-valuetext` in the axis' format - the WAI-ARIA multi-thumb slider, as
Recharts' travellers. Arrows move a thumb, Home/End go to the ends, PageUp and
PageDown larger steps; the live region reads the span in view. One
`role="application"` would be heavier than needed. Recommendation: two sliders.

### Q9 - Loading and empty

It follows the chart. `loading`: dims, takes no pointer. Empty or all hidden:
draws nothing, says nothing ("No data" is said once), keeps its height.

### Q10 - Does the Miniature share anything with it?

Different canvases, different questions. Recommendation: nothing now. The
Miniature stays the schedule's word; the charts say **navigator**. The
schedule's span (`packages/schedule/src/view.ts`) could take one later
(ADR-0022).

### New with the research

- **Q11 - Does it share across charts?** Recharts shares the brush by `syncId`
  (indices); MUI shares by controlling the zoom state; Highcharts has a
  Standalone Navigator. Here `syncId` never shares zoom (ADR-0047) and charts
  zoom together by handing each other the view. Recommendation: no sharing;
  one navigator drives one chart's view, which a caller hands on.
- **Q12 - Does it and a range meet?** A range is the reader's mark on the plot
  and is not drawn after release; the navigator's window is the view. They
  share no state. Whether the navigator may show the application's range is the
  application's, with the bands it has.

## A first cut into tickets (sizes are guesses)

1. **ADR and CONTEXT** (S): the decisions; the term **Navigator**.
2. **`<Navigator />`: drawing and the window's drag** (L): Q5-Q7.
3. **Keys, role, loading, empty** (M): Q8, Q9; after 2.
4. **Examples, documents, release** (S): a page or an example on Zoom and pan,
   README, `capabilities.md` "Later" struck, changelog.

## Out of Scope

- A navigator for the schedule or the table.
- Bars, stacks, matrices or state bands in the preview, at first.
- Several windows; a navigator that is not an x axis' overview.
