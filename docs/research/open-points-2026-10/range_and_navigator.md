# Selecting a range and a navigator in six chart libraries

Facts from primary docs and source, with gaps named at the end. Cells marked (?) are not confirmed by a page I read. Links are in the list at the end.

Gathered on 2026-10-11 for the grilling of the open points.

## Q1 Gesture, and what a plain drag does

| Lib | Range gesture | Plain drag | Modifier / mode / component |
|---|---|---|---|
| Recharts Brush | none on the plot; dragging the Brush window or its travellers | no pan or zoom in the plot | separate child component; "Highlight and Zoom" is a caller recipe (not read) |
| MUI X zoom (Pro/Premium) | `brush` zoom interaction: drag a box, then it zooms | wheel zooms, drag pans by default | modes in `zoomInteractionConfig`: `tapAndDrag`, `pressAndDrag`, `brush`, `doubleTapReset`, `keyboard`. Config replaces the defaults. |
| MUI X `brushConfig` | click-drag a region | not stated | opt-in `brushConfig.enabled` (default false); separate from zoom; `preventTooltip` and `preventHighlight` default true. Plan not stated. |
| ECharts brush | rect, polygon, lineX or lineY drag | not stated | toolbox buttons (default rect, polygon, keep, clear); `brushType` default rect; `takeGlobalCursor` action (not read) |
| ECharts dataZoom inside | none | drag pans (`moveOnMouseMove`, default true) | `zoomOnMouseWheel`, `moveOnMouseMove` and `moveOnMouseWheel` accept true, shift, ctrl or alt |
| ECharts dataZoom slider | `brushSelect` (default true) on the slider only | n/a | same component |
| uPlot | drag on the overlay, x on by default | the drag is the select | `cursor.drag.x/y`, `dist` (default 0 in the d.ts); no built-in pan |
| Highcharts Stock | drag, with `chart.zooming.type` x, y or xy | drag zooms (zooming wins if pan is also on) | `zooming.key` is a held modifier for zoom; `panKey` for pan |
| Grafana time series | horizontal drag zooms the time range | same | Ctrl/Cmd+drag adds a region annotation (annotation docs) |

## Q2 Reported, drawn, zoom to selection

| Lib | Reported | Band after release | Zoom to selection |
|---|---|---|---|
| Recharts | Brush `onChange` (fires only if the indices differ), `onDragEnd` with final startIndex and endIndex; index-based, not x values | n/a: the window is the state | n/a |
| MUI zoom | `onZoomChange` gets `[{axisId, start, end}]` as percentages | brush zoom: not stated | built in; `zoomData` is controlled |
| MUI brush | no event API documented; read `useBrush()` giving `start` and `current` `{x, y}` | none by default; add `ChartsBrushOverlay` | the caller's |
| ECharts brush | `brushSelected` has `batch[].areas[].coordRange` and per-series `dataIndex`; `brushEnd` and `brush` payloads not documented | `removeOnClick` default true, `brushMode` single or multiple, `transformable` default true, so the box is kept and editable | the caller's |
| ECharts dataZoom | `datazoom` has `start` and `end` as 0-100, and `startValue`/`endValue` only for toolbox zooms | the window is the state | built in |
| uPlot | `setSelect` hook after completion; `setSelect(opts, fireHook)` sets the box | `mouseUp` ends the drag then calls `setDragRange`; the box is not specified | built in via `drag.setRange` (return null to cancel); Grafana sets `drag.setScale:false` |
| Highcharts | `chart.events.selection`: `event.xAxis[0].min/max` | not stated | built in; `preventDefault()` or return false cancels it |
| Grafana | changes the dashboard time range | n/a | built in (the range is the zoom) |

## Q3 Touch

| Lib | Touch |
|---|---|
| Recharts | Brush has touchstart and touchmove handlers on the travellers and the slide |
| MUI | pinch; `tapAndDrag` zoom; `pressAndDrag` pan; double-tap reset; `pointer` can be limited to mouse or touch |
| ECharts | slider doc: "touch drag" is mentioned only for `zoomLock`; inside pinch and drag not documented on the pages read |
| uPlot | no built-in touch; a zoom-touch demo adds it |
| Highcharts | `singleTouch` default null; enabling it takes the one-finger gesture and blocks vertical page scroll; two-finger `pinchType` |
| Grafana | not established |

## Q4 Keyboard and screen reader

| Lib | Support |
|---|---|
| Recharts | each traveller has tabIndex 0 and role="slider"; ArrowLeft and ArrowRight move one index; aria-label from the `ariaLabel` prop or "Min value: .., Max value: .."; `aria-valuenow` is the pixel x |
| MUI | zoom `keyboard` is default: +/=, -/_, 0 reset, Shift+arrows pan; announced ("Showing 5% to 95% of the horizontal axis."); off if `disableKeyboardNavigation`. Brush: none stated. |
| ECharts | none documented for brush, slider or inside; an `aria` option exists (not read) |
| uPlot | no keyboard or touch handlers in the source file; the README says nothing about accessibility |
| Highcharts | the Accessibility module exists; the pages read do not say whether the navigator or zoom is keyboard-operable (?) |
| Grafana | dashboard shortcuts `t-` zoom out and `t+` zoom in; none for the panel drag found |

## Q5 Navigator / zoom slider

| Lib | Draws | Height | Separate component / link |
|---|---|---|---|
| Recharts | a single child chart element, cloned with `compact` and `data` (nothing renders for zero or several children); background, slide rect, 2 travellers, start/end labels | 40, `travellerWidth` 5 | child of the chart; writes `startIndex`/`endIndex` to the chart's Redux state |
| MUI | optional `preview` (bar, line, area, scatter, candlestick); `preview.seriesIds` picks series | `zoom.slider.size`, default not stated | `zoom.slider.enabled` or the `ChartsZoomSlider` component; there is no prop named `zoomSlider`; the zoom state is shared |
| ECharts slider | "data shadow", a miniature trend (`showDataShadow` default auto) | 30 | `dataZoom` component; `xAxisIndex` links axes; `realtime` default true; `zoomLock`; `filterMode` default filter |
| Highcharts | the first series by default as areaspline; `series.showInNavigator` and `navigator.series` choose others | 40; margin 22 | in the chart, with its own xAxis and yAxis; a Standalone Navigator syncs charts; linked to a scrollbar by default |
| uPlot, Grafana | none | n/a | n/a |

## Q6 Shared across synchronised charts

- Recharts: `useBrushChartSynchronisation` emits `{startIndex, endIndex}` for a matching `syncId`; `syncMethod` is not read on that path.
- MUI: sync is done by controlling the zoom state yourself.
- ECharts: `connect()` is listed, but I read nothing about what it shares.
- uPlot: `cursor.sync` needs the same `key`. `scales` defaults to `[xScaleKey, null]` and syncs by value. `pubSync` publishes mousemove, mousedown, mouseup and dblclick, so the drag is mirrored, and other plots draw the box by reading `src.select`.
- Highcharts: Standalone Navigator, no detail read.
- Grafana: the time range is dashboard-wide. Shared crosshair not confirmed.

## Repo: Miniature (5 lines)

1. It is the folded Lane group, drawn as one row of thin strips, one per lane, inside the schedule's own canvas (`rows.ts` `RowKind = "miniature"`, `MINIATURE_INSET` 4; `sceneDraw.ts`, `geometry.ts`).
2. Strips show the real tasks in their own colours, with no label, no summary and no packing (CONTEXT.md line 1194, "Miniature").
3. A strip can be hovered and selected, and dependencies and findings still arrive at it. Folding is view state, not an intent.
4. It shrinks rows, not time. It has no window and no gesture of its own; a fold toggles on the group head.
5. README ~line 116 describes it. The Q10 reading in the spec holds: it is not a navigator.

## Repo: charts gestures today (5 lines)

1. `scene.ts` ~3606 comment: Ctrl/Cmd+wheel zooms (a trackpad pinch arrives as that), a horizontal wheel or Shift pans, the plain wheel stays the page's. `Chart.tsx` 196 registers the wheel listener as non-passive.
2. A drag pans (`Chart.tsx` 318, `scene.pointerDown`), two fingers pinch, and a double click resets (`Chart.tsx` 325). All of it applies only to an axis with `zoomable` set (`scene.ts` 3567).
3. ADR-0030, amended by ADR-0047 and on 2026-10-10: one tab stop, `role="application"`, +/-, Shift+arrows and 0 zoom, pan and reset; arrows walk the hits and do nothing without a tooltip; Escape only clears the Active point.
4. The polite live region reads "From a to b." after a key and says nothing after a pointer gesture.
5. I did not re-verify `touch-action: pan-y` or the primary-button check; the spec states them.

## Contradictions with the spec

- Lines 64-66: Recharts Brush draws one child chart element. It is not tied to a series, and the indices are data indices, not x values.
- Line 67: MUI has no `zoomSlider` prop. It is `zoom.slider.enabled` or the `ChartsZoomSlider` component. The zoom page is titled Pro/Premium; the spec says only Pro (line 62).
- Lines 84 and 77: "Touch has no modifier" is true for the existing gestures, but MUI offers `tapAndDrag` and `pressAndDrag`.
- MUI ships brush as its own feature (`brushConfig`) that reports no events, separate from the brush zoom gesture.
- Highcharts uses a modifier key option (`zooming.key`) to resolve the drag collision, which is the spec's option A.

## Not established

- Recharts: whether Brush `onChange` carries a payload other than the indices, and the "Highlight and Zoom" recipe.
- MUI: brush-zoom and `brushConfig` events and plan; the zoom slider's default height and its role and aria markup.
- ECharts: `takeGlobalCursor`, the `brushEnd` payload, touch behaviour, any keyboard support, and `connect()` semantics.
- uPlot: the `drag.dist` default, whether the band stays after release, and the docs-page `setSelect` text.
- Highcharts: the default drag behaviour, the navigator's keyboard and ARIA, and the `afterSetExtremes` payload.
- Grafana: shared crosshair, touch, and what the drag draws after release.

## Sources

- https://recharts.github.io/en-US/api/Brush/
- https://raw.githubusercontent.com/recharts/recharts/main/src/cartesian/Brush.tsx
- https://raw.githubusercontent.com/recharts/recharts/main/src/synchronisation/useChartSynchronisation.tsx
- https://mui.com/x/react-charts/zoom-and-pan/
- https://mui.com/x/react-charts/brush/
- https://echarts.apache.org/en/llms-documents/option-parts/option.brush.md
- https://echarts.apache.org/en/llms-documents/option-parts/option.dataZoom-slider.md
- https://echarts.apache.org/en/llms-documents/option-parts/option.dataZoom-inside.md
- https://echarts.apache.org/en/llms-documents/api-parts/api.events.md
- https://raw.githubusercontent.com/leeoniya/uPlot/master/dist/uPlot.d.ts
- https://raw.githubusercontent.com/leeoniya/uPlot/master/src/uPlot.js
- https://raw.githubusercontent.com/leeoniya/uPlot/master/README.md
- https://raw.githubusercontent.com/grafana/grafana/main/packages/grafana-ui/src/components/uPlot/config/UPlotConfigBuilder.ts
- https://www.highcharts.com/docs/stock/navigator
- https://api.highcharts.com/highstock/navigator
- https://api.highcharts.com/highstock/chart.zooming.key
- https://api.highcharts.com/highstock/chart.zooming.type
- https://api.highcharts.com/highstock/chart.zooming.singleTouch
- https://api.highcharts.com/highstock/chart.events.selection
- https://api.highcharts.com/highstock/accessibility.keyboardNavigation
- https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/time-series/
- https://grafana.com/docs/grafana/latest/dashboards/use-dashboards/
- https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/annotate-visualizations/
- Repo: packages/charts/src/scene.ts, packages/charts/src/Chart.tsx, docs/adr/0030-a-chart-is-one-tab-stop-that-walks-its-hits.md, CONTEXT.md
