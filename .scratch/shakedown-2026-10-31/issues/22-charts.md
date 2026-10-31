# 22: Charts

Status:     done
Blocked by: None (can start immediately)

Sources: earlier-runs-open charts.md 1, 2, 5, design-family 3/zoom 5, design-family 4, zoom 2, P10-12,
P11-8, P12-5, cross-package 11, settle 4, settle 6.

- [x] A theme switch on any ancestor (a `.dark` class or `color-scheme` on a container, not only `<html>`) repaints the canvas (`charts/src/theme.ts:181-183`).
- [x] Ticks of values near 1e-9 are told apart (scientific or more places), and the tooltip value too (`format.ts:63,75`).
- [x] A series naming a field no row has warns once in DEV.
- [x] Tick, title and legend sizes are in `rem` and grow with the root size (`charts.css:41-50`); limit labels too.
- [x] An empty chart shows "No data" without legend and placeholder axes.
- [x] Pinch zoom of the page works over the plot (`touch-action` allows `pinch-zoom`; `sceneLayout.ts:173`).
- [x] The summary's extremes name their position (day or category); the legend comes before the plot in Tab order where it stands above it.
- [x] "Show all" is never covered by the tooltip, and hovering it leaves no empty tooltip stub.
- [x] A waterfall at 375 px keeps every category readable (shortened, wrapped or turned labels) or says how to read the dropped ones.
- [x] The docs say how generic wrappers name fields (`Extract<keyof Z, string>`), as the table's do.
- [x] `pnpm check charts`; looked at as a user, light and dark, 375 px and root 32 px.

## Comments

**Delivered (2026-10-31, run coordinator).** Theme switch on an ancestor followed (observer ignores
changes inside a chart); ticks and tooltips near 1e-9 in scientific form; a missing field warns once;
`--uc-size-*` in rem, the canvas reads them against the root; "No data" without legend or value ticks;
category/time extremes name their position; legend before the plot by `reading-flow` (Chromium only);
"Show all" above the tooltip, an empty tooltip hidden at once; waterfall at 375 px keeps every label,
shortened to two lines with an ellipsis (looked at: readable, full names in tooltip and table); README:
generic wrapper (`as never`, compile-checked), `encoding="marks"`, ancestor theme, rem sizes.
Decided: page pinch over a chart with `onRange` and no zoom (`pan-y pinch-zoom`, one test expectation
moved); a zoomable chart keeps its own pinch. Left: Tab order before the plot only where
`reading-flow` exists; numeric-axis extremes keep the old text (tests pin it).
