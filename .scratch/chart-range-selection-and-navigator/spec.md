# A chart selects a range, and a navigator shows the whole course

Status: needs-triage
Date:   2026-10-11
Origin: the feature scan of 10 Oct 2026; the maintainer asked for a spec with
the open questions instead of code. It decides nothing: it lays out what
exists, what collides, the options and a recommendation per question, for a
grilling.

## Problem Statement

Two things a reader of a long course asks for are missing:
1. **Marking a span** - "from here to there". The chart reports a point under
   the pointer (the hit) and the span in view (the view); not a span the
   reader marked.
2. **A navigator.** On a long course a zoomed chart shows a slice and nothing
   says where it lies. `packages/charts/docs/capabilities.md`, "Later", wants
   "a small overview of the whole course under the plot, its window the span
   in view, dragged to pan and stretched to zoom".

They meet in one gesture: on a zoomable chart a drag already pans.

## What exists

- **The view** (ADR-0047, `packages/charts/src/view.ts`). A chart holds its own
  view: `domains` (the span each zoomable x axis shows, by axis `id`) and
  `hidden`. `initialView` in, `onViewChange` out, always the whole view; a view
  handed in is applied when it differs in content (`viewKey`), `Echoes` swallows
  a report coming straight back. `zoomLimits` clamps; the chart shows its own
  "Show all". No controlled pairs. ADR-0047 says a selection is not view state
  and "keeps its own arrangement; making that uniform is a decision of its own".
- **The gestures** (`packages/charts/src/scene.ts`, "Zoom and pan", ~line 3505).
  Ctrl/Cmd+wheel (a pinch) zooms, a horizontal wheel or Shift pans, the plain
  wheel is the page's; a drag pans (`pointerDown`/`drag`/`pointerUp`, pointer
  captured, primary button only); two fingers pinch; a double click resets.
  With a zoomable axis the container gets `touch-action: pan-y` (~line 1972).
  All of it only on an axis that is `zoomable` (ADR-0047: on a screen of twelve
  small charts a drag must not move every one).
- **The keys** (`scene.ts` `zoomKey`; ADR-0030 and its amendment of 2026-10-10).
  A chart with a tooltip or a zoomable axis is one tab stop,
  `role="application"`. +/-, Shift+Left/Right, 0 zoom, pan and reset. Arrows
  walk the hits; with no tooltip they do nothing. After a key the polite live
  region reads the span ("From 10 to 90."); after a pointer gesture nothing.
- **The Active point is no selection** (ADR-0030 after ADR-0003: "where am I"
  and "what have I picked" are two states). Escape clears it only.
- **`syncId`** (`Chart.tsx`, `scene.ts` `syncGroups`) shares the pointer's x in
  domain units, per axis id, and the Active point. Zoom is explicitly not
  shared: charts zoom together by handing each other their view.
- **Intents** (ADR-0023): the component reports what the reader wants; the data
  moves only if the caller moves it.
- **`onSelect`** (decided 2026-10-10, built separately): a click or Enter on a
  hit is reported; the chart holds no selection. A range must fit beside it.
- **The schedule's Miniature** (`packages/schedule/src/sceneDraw.ts`, `rows.ts`
  `RowKind = "miniature"`; CONTEXT.md **Miniature**; schedule README). Not a
  navigator: a folded lane group as thin strips in the schedule's own canvas.
  It shrinks rows, not the time axis, and has no window. What carries over is
  the principle, "the real work, smaller - never a summary".
- **Loading and empty** (`Chart.tsx`): `loading` dims a course kept, takes no
  pointer, sets `aria-busy`; `empty` shows in the plot when no visible series
  has a point (wording `empty`, "No data").
- **Other libraries.** `docs/research/library-comparison-2026-09/charts_industrial.md`
  (lines 29, 42, 62): MUI X zoom (Pro tier) has a range slider under the axis
  with an optional preview; AG Charts Enterprise a navigator; the report lists
  "a navigator/overview mini-chart" among umriss' gaps. Not read for this spec,
  from memory, to check first: Recharts `Brush` is a child of the chart
  (`startIndex`/`endIndex`, `onChange`) drawing one series
  (https://recharts.org/en-US/api/Brush); MUI X has a `zoomSlider`
  (https://mui.com/x/react-charts/zoom-and-pan/). ADR-0032 lists neither as "never".

## Open questions

### Q1 - Which gesture selects a range, and what does a touch do?

A drag pans on every zoomable chart today.

- **A. A modifier.** Alt+drag selects, a plain drag pans. Costs callers
  nothing; discoverable only through the summary. Touch has no modifier.
- **B. A mode on the chart** (`select` prop or a toolbar toggle). Familiar; a
  way in for touch; costs a visible control and a mode the reader forgets.
- **C. Only on charts that are not zoomable.** No collision; leaves out exactly
  the long courses that want it.
- **D. By the chart.** Not zoomable: a plain drag selects. Zoomable: Alt+drag.

Touch (one finger pans): none; long press then drag; the mode of B.
**Recommendation:** D, and on touch only the mode, set by the caller's prop in
the first cut. Whether the toolbar toggle ships is the grilling's call.

### Q2 - What is reported, does the chart draw it, who zooms to it?

- **Report.** `onRangeSelect({ axisId, from, to })`, in the axis' units, from <
  to, clamped to the domain, once on release; none while dragging. A drag of a
  few pixels is a click and must reach `onSelect`.
- **Draw.** (a) report only (ADR-0023); (b) a band while the pointer is down,
  forgotten on release; (c) kept until the caller hands one back.
  **Recommendation: (b)**, a Ghost, not a selection. (c) makes the chart hold a
  selection: a `selectedRange` in, a clear key, and the view-or-not question
  ADR-0047 left open. A caller who wants it kept draws it with the bands it has.
- **Zoom to it.** The caller's business: it hands `initialView` back with
  `domains` set, one line (ADR-0047). A `zoomOnSelect` prop is sugar; not yet.

### Q3 - How does a keyboard select, and what does a screen reader hear?

ADR-0030: a keyboard reaches what a pointer reaches; one tab stop; polite
live region; nothing spoken after a pointer move.

- **A. Shift+arrows.** Taken (they pan).
- **B. Two steps.** Space anchors at the Active point, the walk moves it, Space
  ends, Escape cancels. Needs a tooltip. Not Enter: that is `onSelect`'s.
- **C. "Select the span in view"**, one key. Cheap; what zoom-then-select needs.
- **D. Pointer only.** Breaks ADR-0030's principle.

Live region, in the axis' own format and the `visibleRange` voice: "Range from
{x} started.", "From {a} to {b}.", "Selected from {a} to {b}." - two new
wording keys in both languages. The summary names the key where
`onRangeSelect` is set.
**Recommendation:** B, on a chart with a tooltip; without one, D stays (no
Active point to anchor). C later.

### Q4 - Does a selection travel over `syncId`?

Options: no; the drag in flight as a band on the other charts (a new synced
shape, and a drawn selection). **Recommendation:** no. The caller has the range
and may hand `initialView` to the others (ADR-0047). Revisit with a caller.

### Q5 - The navigator: a component of its own or a prop?

- **A. `<Navigator />` inside `<Chart>`**, like `Tooltip` and `Legend`: it
  shares scene, view, data and axis, and sits under the plot in the chart's
  layout.
- **B. A component beside the chart.** Free placement; the caller wires
  `view`/`onViewChange` both ways (the boilerplate ADR-0047 removed), and its x
  would not align with the plot's left axis band.
- **C. A prop `navigator`.** Short, but an object once it names a series or a
  height.

**Recommendation:** A.

### Q6 - What does it draw?

- **A. One series**, named by the caller: cheap, legible; Recharts' way.
- **B. Every visible series, downsampled** (`downsample.ts`): "the real work,
  smaller"; a pass per series, and a hidden series must follow the legend or lie.
- **C. The caller's choice**: `series` a name or a list; default all visible.

Line or area only; bars and stacks left out at first. **Recommendation:** C,
default every visible series.

### Q7 - Its height, how it reads and sets the view

- **Height:** a `height` prop, default about 48 px, added to the chart's height.
- **Reads:** the window is `domains[axisId]`, the whole the axis' `domain`; the
  axis is the one zoomable x axis, else a prop names it.
- **Sets:** through the scene's own pan and zoom entry points: `onViewChange`
  fires as for a drag, `zoomLimits` clamps, no second view (ADR-0047).
- **Window:** drag the body to pan, an edge to zoom, click outside to centre,
  double click to reset. No zoomable axis: it renders nothing, warns in dev.

### Q8 - Its keys and its role

Its own tab stop after the plot; the plot's stop is not widened. Role:
`role="group"` with a label and two `role="slider"` thumbs (start, end), with
`aria-valuemin/max/now` and `aria-valuetext` in the axis' format - the WAI-ARIA
multi-thumb slider pattern. Arrows move a thumb, Home/End go to the ends,
PageUp/Down take larger steps; the live region reads the span in view after a
key. One `role="application"` as the plot has is heavier than needed.
**Recommendation:** the two sliders.

### Q9 - Loading and empty

Follow the chart. `loading`: it dims, takes no pointer. Empty or all hidden: it
draws and says nothing ("No data" is said once) and keeps its height.

### Q10 - Do the schedule's Miniature and the navigator share anything?

Different canvases, different questions. **Recommendation:** nothing now.
Miniature stays the schedule's word (CONTEXT.md); the charts say **navigator**.
The schedule's span (`packages/schedule/src/view.ts`) could take one later
(ADR-0022).

## A first cut into tickets (sizes are guesses)

1. **ADR and CONTEXT** (S): the decisions; the terms Range, Navigator.
2. **Range gesture and `onRangeSelect`, pointer only** (M): Q1, Q2.
3. **Range by keyboard** (M): Q3; live region, summary, German; after 2.
4. **Touch mode** (S-M): Q1's mode; after 2.
5. **`<Navigator />`: drawing and the window's drag** (L): Q5-Q7.
6. **Navigator keys, role, loading, empty** (M): Q8, Q9; after 5.
7. **Docs and demo** (S): README, `capabilities.md`, a demo page. (2-4 and
   5-6 are independent chains.)

## Out of Scope

- **Cross-filtering between a chart and a table.** The caller hands the range
  to the table's conditions; neither knows the other (ADR-0016).
- **Lasso and a box over two axes**; **y ranges** (the y axis does not zoom).
- **A chart that holds a selection** (a kept, clearable range or hit): the
  decision ADR-0047 left open and `onSelect` avoided.
- **A navigator for the schedule or the table**; several ranges at once;
  editing a range's edges after release.
