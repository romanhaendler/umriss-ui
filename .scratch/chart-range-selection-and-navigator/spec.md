# A chart reports a range

Status: ready-for-agent
Date:   2026-10-11
Origin: the feature scan of 10 Oct 2026, the research of 11 Oct 2026
(`docs/research/open-points-2026-10/range_and_navigator.md`) and the design
session of the same day (`.scratch/open-points-roadmap/spec.md`, rows C1-C4
and X6). The earlier version of this file was a list of open questions; it is
rewritten to the decisions. The navigator left it and waits in
`.scratch/chart-navigator/spec.md`.

## Problem Statement

A reader of a long course wants to mark a stretch - "from here to there" - and
have the rest of the screen answer: the table below shows the alarms of that
stretch, the figures beside it sum it. The chart reports the point under the
pointer (`onSelect`, ADR-0056) and the span in view (`onViewChange`, ADR-0047);
it does not report a stretch the reader marked. A developer who wants one
writes pointer handlers over the plot and re-derives the scale.

The two meet in one gesture: on a zoomable chart a drag already pans.

## What exists

Checked against the code and the research note on 11 Oct 2026.

- **The view** (ADR-0047, `src/view.ts`): `domains` by axis `id` and `hidden`;
  `initialView` in, `onViewChange` out; `zoomLimits` clamps. A range is no view
  state, and zooming into one is handing it back as the view.
- **The gestures** (`src/scene.ts`: `wheel`, `pointerDown`, `drag`, `pointerUp`,
  `click`; `Chart.tsx` ~line 318). Ctrl/Cmd+wheel zooms, a horizontal wheel or
  Shift pans, a drag pans (primary button or touch, pointer captured), two
  fingers pinch, a double click resets - all only on an axis that is
  `zoomable`. With a zoomable axis the container gets `touch-action: pan-y`
  (`scene.ts` ~line 2024). A press that travelled more than 4 px before its
  click is a drag and not a click (`travelled`, ADR-0056).
- **The keys** (`scene.key`, `zoomKey`; ADR-0030 and its amendments). One tab
  stop, `role="application"`, where there is a tooltip or a zoomable axis.
  Arrows walk the hits, +/-/0 and Shift+arrows zoom and pan, Enter reports the
  Active point, Escape clears it. Space is unused on the plot. After a key the
  polite live region says the span ("From 10 to 90."); after a pointer gesture
  nothing.
- **The Active point is no selection** (ADR-0030, ADR-0003).
- **`onSelect`** is built and released (charts 0.15.0, ADR-0056): in
  `ChartOptions` of `useChart`, the latest handler read when the reader acts,
  `selectHelp` in the summary. A range sits beside it and copies its shape.
- **`syncId`** shares the pointer's x and the Active point, never zoom.
- **A category axis** (ADR-0052) is the numeric axis with the library keeping
  the map: a category is a whole-number place in the x channel, `Categories`
  in `scene.ts` maps it both ways. A calendar axis reads working time.
- **Other libraries** (the research note). Highcharts resolves the same
  collision with a held modifier (`zooming.key`); MUI X keeps the brush a
  separate, opt-in feature that reports no event; uPlot's drag is the select
  and the caller decides what it zooms; Recharts' Brush is the navigator, not
  a range. None offers a keyboard way to mark a range.

## Decisions

Rows C1-C4 are the maintainer's, of the session of 11 Oct 2026, and are not
argued again. Rows marked *(spec)* are this spec's, where the code forced a
choice.

| # | Question | Decision |
| --- | --- | --- |
| R1 | What it is | A **Range** (`CONTEXT.md`): reported, never kept. The word "selection" stays out of the charts. |
| R2 | The report | `onRange({ axisId, from, to })` in the options of `useChart`, beside `onSelect`; once, on release. `from` is not after `to` whichever way the reader dragged. The latest handler is read when the reader acts. |
| R3 | What is drawn | A band over the plot while the pointer is down, forgotten on release; nothing after. It is a band in the chart's overlay, not a selection. |
| R4 | No travel | A range does not travel over `syncId`. To zoom into it, or to hand it to another chart, is the application's, as the view. |
| R5 | The pointer | On a zoomable chart: Alt with a drag. Where no x axis is zoomable: a plain drag. A touch gets no range on a zoomable chart - one finger pans. |
| R6 | Click or drag | A press that travels less than 4 px stays a click and reaches `onSelect`. A range reports nothing to `onSelect`. |
| R7 | The keyboard | Space sets the start at the Active point; the walk moves; Space sets the end; Escape cancels. It needs a `<Tooltip>`. Built in the same version as the pointer. |
| R8 | Category axis | `from` and `to` are the first and the last category covered (ADR-0052). |
| R9 | Time and numeric axes | Milliseconds on a time axis, numbers on a numeric one. |
| R10 | Wording | New required keys of `ChartsWording`, English default and German. See R19: three, not two. |
| R11 | The scenario | "A chart filters a table": no feature, built with the range (X6). |
| R12 | Category values *(spec)* | On a category axis `from` and `to` are the category strings as the rows hold them, not places. The covered categories are those whose place, a band of half a step either side, the dragged stretch touches. The caller knows the order by its `categories` list or by its rows' first occurrences. The type of `from` and `to` is a number on numeric and time axes and a string on a category axis; the first ticket settles its form so that a numeric caller needs no cast. |
| R13 | Pointer ends *(spec)* | The ends are the pointer's x at press and at release, clamped to the plot (the pointer is captured, so a release outside reports the edge). On a numeric or time axis they are values of the scale, not snapped to a point. |
| R14 | Calendar axis *(spec)* | The ends are wall-clock instants, through the mapping the axis uses; an end in removed time lands at the edge the mapping gives it. |
| R15 | Several x axes *(spec)* | The pointer reports once per x axis, in registration order, each with its own `axisId`. The keyboard reports for the axis of the Active point. |
| R16 | Without `onRange` *(spec)* | Nothing changes: no gesture, no cursor, no summary sentence; Alt with a drag still pans. |
| R17 | Touch where it is allowed *(spec)* | On a chart with no zoomable axis and an `onRange`, the container takes `touch-action: pan-y`, as a zoomable one does, so a horizontal finger drag makes a range and a vertical one scrolls the page. |
| R18 | While dragging *(spec)* | The tooltip is not shown, as MUI X does by default; Escape cancels the drag; a pointer cancel reports nothing. |
| R19 | The keys of the wording *(spec)* | `rangeStarted(x)`: "Range from {x} started."; `rangeMade(from, to)`: "Range from {a} to {b}."; `rangeHelp`: "Space starts a range at the point and ends it, Escape cancels." - the summary names the key only where `onRange` is given and a tooltip stands, as `selectHelp`. Values in the axis' own format (`xLabel`). |
| R20 | Keyboard details *(spec)* | Space twice on one point reports `from === to` (one category is a range). An end before the start is swapped. Escape with a start set cancels that, and does not clear the Active point; a second Escape does. Cancelling says nothing. Focus leaving the plot cancels. Shift+Space and Space with Ctrl, Alt or Cmd are left alone. |
| R21 | `onRange` without a Tooltip *(spec)* | The pointer works; the keyboard has no Active point. The development build warns once (`warnOnce`) that the keyboard needs a `<Tooltip>`, as `onSelect` does. |

## User Stories

1. As a developer, I want `onRange` beside `onSelect`, so that "a stretch" is reported as "a hit" is.
2. As a developer, I want `from` before `to` whichever way the reader dragged, so that I do not sort them.
3. As a developer, I want the range once, on release, so that a table does not refilter on every pixel.
4. As a developer, I want `from` and `to` in the axis' own values, so that I filter my rows without converting.
5. As a developer with a category axis, I want the first and the last category covered, so that I filter by the names my rows hold.
6. As a developer with a time axis, I want milliseconds, so that I compare them with my instants.
7. As a developer with a calendar axis, I want real instants, so that a range over a weekend holds the weekend's dates.
8. As a developer, I want a drag of less than 4 px to stay a click, so that `onSelect` and `onRange` do not fight.
9. As a developer, I want no range to travel over `syncId`, so that one chart marking a stretch does not move the others.
10. As a developer, I want to zoom into a range by handing it back as the view, so that I decide whether the chart zooms.
11. As a developer, I want a chart without `onRange` to behave as it did, so that nothing changes by upgrading.
12. As a reader of a zoomable chart, I want Alt with a drag to mark a stretch, so that a plain drag still pans.
13. As a reader of a chart that cannot zoom, I want a plain drag to mark it, so that I need no modifier.
14. As a reader, I want a band while I drag, so that I see what I am marking.
15. As a reader, I want the band gone on release, so that the chart does not claim to hold my choice.
16. As a reader, I want Escape to cancel a drag, so that I can change my mind.
17. As a reader on a touch screen, I want a drag to mark a stretch where the chart cannot zoom, so that I am not left out.
18. As a keyboard user, I want Space to start a range at the point I stand on and Space to end it, so that I reach what a pointer reaches (ADR-0030).
19. As a screen-reader user, I want to hear where the range started and what it became, so that I know the key did something.
20. As a screen-reader user, I want the summary to name the key, so that I find it.
21. As a keyboard user, I want Escape to cancel the start, and a second Escape to clear the point, so that each key undoes one thing.
22. As a German-speaking reader, I want the announcements in German, so that the chart speaks one language.
23. As a developer, I want a scenario where a chart filters a table, so that I see the range doing its work.
24. As a coding agent reading `llms.txt`, I want the range in the text, so that I generate it rather than pointer handlers.

## Out of Scope

- **The navigator**: `.scratch/chart-navigator/spec.md`.
- **A kept or drawn selection**, a `selectedRange` prop, a clear key, an edge to drag after release: the chart reports and holds nothing (ADR-0056).
- **y ranges** (the y axis does not zoom), a lasso or a box over two axes.
- **Several ranges at once.**
- **A touch range on a zoomable chart**; a long press or a mode may come with a caller.
- **A `zoomOnRange` prop**: handing the range back as the view is one line.
- **Cross-filtering as a feature**: the scenario shows it; neither chart nor table learns of the other (ADR-0016).

## Testing Decisions

- **Mounted, through `useChart`, jsdom** (`tests-unit/range.jsdom.test.tsx`, in the manner of `onSelect.jsdom.test.tsx` and `zoomKeys.jsdom.test.tsx`): Alt with a drag on a zoomable chart reports once on release and a plain drag pans and reports nothing; a plain drag on a chart with no zoomable axis reports; 3 px stays a click and reaches `onSelect`, 5 px reports and does not; `from` before `to` for a drag to the left; a release outside the plot clamps; Escape and a pointer cancel report nothing; no `onRange`, no change; a category axis reports names, a time axis milliseconds, a calendar axis wall-clock instants.
- **Keys**: Space, walk, Space reports; the live region says the start and the range in the axis' format; Escape cancels the start and then clears the point; blur cancels; no tooltip, no keyboard, a DEV warning; the summary names the key only with both `onRange` and a tooltip; German wording.
- **Types** (`useChart.test-d.tsx`): the handler's argument; `from` and `to` need no cast on a numeric axis.
- **Interaction and visual** (`tests-visual/features-interaction.spec.ts`): a real drag with Alt draws the band, one baseline of it mid-drag, in forced colours too; the band gone after release. Screenshots are looked at before they are accepted.
- **The scenario** is covered by the demo's smoke test and the own-data check, as the other scenarios are; its filtering by a unit test of the filter it holds.
- A new required key is a break for a wording written out in full: the changelog says so, as it did for `selectHelp`.

## Tickets

In `issues/`, in the order they can be built.

1. `01-the-pointer-and-on-range` (L): ADR, gesture, band, `onRange`.
2. `02-the-keyboard-and-the-readout` (M), blocked by 01.
3. `03-a-category-and-a-time-axis` (S), blocked by 01.
4. `04-examples` (S), blocked by 01, 02, 03.
5. `05-scenario-a-chart-filters-a-table` (M), blocked by 01, 02, 03.
6. `06-documents-and-release` (S), blocked by 01-05.

## Decided while writing

- R12: category ends are the strings the rows hold.
- R13: ends are the pointer's x at press and release, clamped, not snapped.
- R14: a calendar axis reports wall-clock instants.
- R15: the pointer reports once per x axis, the keyboard for the Active point's axis.
- R16: without `onRange` nothing changes, Alt-drag still pans.
- R17: `touch-action: pan-y` on a non-zoomable chart with `onRange`.
- R18: no tooltip while dragging; Escape cancels the drag.
- R19: three wording keys (`rangeStarted`, `rangeMade`, `rangeHelp`), where the roadmap counted two.
- R20: Space twice on one point is a range; Escape undoes one thing at a time; cancelling is silent.
- R21: a DEV warning for `onRange` without a Tooltip.
- The scenario lives in core's demo, the only one that reaches both charts and table; the range examples go on the Zoom and pan page and the Bar page.
