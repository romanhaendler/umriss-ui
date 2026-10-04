# 01: Chart: zoom through the view

**What to build:** A chart zooms without a line of state in the application: `XAxis zoomable` turns on the gestures and keys that exist today, `zoomLimits` clamps (default: at most the data's extent, at least three data steps), and the zoomed span is part of the chart's view - handed in through `initialView`, applied whenever it differs in content from the last one, reported whole through `onViewChange`, and on the hook as `domains` and `setDomain(axisId, span | null)`. Two charts handed one shared view zoom together. `onDomainChange` and the controlled `domain` go; `domain` stays configuration and the start of a zoomable axis. The demo gets the page 'Zoom and pan', with the zoom examples moved there.

**Blocked by:** `charts-bound-to-rows` 01 (one seam) and 07 (contract)

**Status:** done

- [x] Zoom by every gesture and key only where the axis is `zoomable`
- [x] Zoom stays within `zoomLimits`
- [x] Two charts in step through the view; handing in what they reported changes nothing; the Active point survives
- [x] Unknown axis ids in a view fall out
- [x] Page 'Zoom and pan' with screenshots; ADR-0047's keys statement holds

## Comments

**2026-10-04, delivered.** `useChart(rows, { initialView, onViewChange })` with `ChartView = { domains?: Record<axisId, [number, number]>, hidden?: string[] }` (src/view.ts: `viewKey` - ids and names as sets, an empty part as none -, `onlyKnown` for axis ids, `zoomSpan`, `defaultLimits`, and `Echoes`, the schedule's and the table's echo rule of component-view 07 copied as it is, since charts depends on nothing). `hidden` is typed and keyed, not built (02). The scene holds the view behind the seam "The view (ADR-0047)": `domainOf` gives a zoomable x axis the span the view names and its own `domain` otherwise (also for a y axis with `domain="visible"`); gestures and keys move the span directly and the view goes out with the frame that draws it, so a pan is reported at most once per frame; `setDomain` and a view handed in publish at once. The scene now lives in the hook (one per `useChart`), `Chart` is bound to it once, the parts keep their identity and the return value is a new object only when the view changes. On the return value: `view`, `domains`, `setDomain(axisId, span | null)` - `null` = the axis' own `domain`; a double click and 0 do the same for every zoomable axis. A lone x axis is `"x"`.

`XAxis zoomable` turns the gestures and keys on; `zoomLimits: { min, max }` clamps every zoom step (default: at most the data's extent, at least three data steps - the smallest distance between neighbouring points over the axis' series, measured once per materialisation). A pan keeps its width and is not clamped; a view handed in or set is taken as given. Gone: `XAxis onDomainChange` and the controlled use of `domain`. New exports: `ChartOptions`, `ChartView`, `ZoomLimits`; `ChartParts` carries the view and `setDomain`.

One `Chart` per `useChart` now - it holds the view. Two places drew one hook's `Chart` twice and became two calls: Chart/03 (keyboard and screen reader, ex 04 - the English and the German chart in step through a shared view) and the charts scenario 'watch latency against its objective' (the error-rate chart). The scene warns in DEV when one hook's `Chart` is bound twice at once.

Tests: `tests-unit/view.test.ts` (by content, unknown ids, Echoes, zoom limits, default limits); `tests-unit/zoomKeys.jsdom.test.tsx` rewritten (keys and Ctrl+wheel only where zoomable, the limits named and the default ones, `setDomain`/`domains`, the start unreported, unknown ids falling out, two charts in step, a late echo ignored and applied once it has passed, the Active point across a view handed in); `readout` and `sceneFrame` migrated (the double-click test became "zoom on a single point puts no span of no width in view").

Demo: page 'Zoom and pan' (rubric Chart, after Axis) with 01 gestures-and-keys (ex Axis/05 zoom-and-pan), 02 zoom-limits (new), 03 visible-domain (ex Axis/06, start through `initialView`), 04 cursor-sync "Keep charts in step" (ex Chart/03, three `useChart` calls sharing one view). Axis and Chart renumbered without gaps; Benchmark/02 and Tooltip/07 use `zoomable`. The shell forwards moved page ids only, not example anchors: `/axis/#zoom-and-pan`, `/axis/#visible-domain` and `/chart/#cursor-sync` land on their old page without the example. Visual interaction tests follow the new addresses. Capability rows for zoom, the view, the echo rule, the limits and charts in step in `docs/capabilities.md`.

Pictures (all inspected, light and dark): new - page zoom-and-pan, examples zoom-and-pan--gestures-and-keys, --zoom-limits, --visible-domain, --cursor-sync; changed text - page heads chart, axis; moved by a pixel under the shorter Axis page only - axis--aligned-ticks, axis--every-kind-on-a-second-axis. Removed: axis--zoom-and-pan, axis--visible-domain, chart--cursor-sync. The CHANGELOG entry is 08's.
