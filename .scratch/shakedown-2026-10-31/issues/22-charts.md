# 22: Charts

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: earlier-runs-open charts.md 1, 2, 5, design-family 3/zoom 5, design-family 4, zoom 2, P10-12,
P11-8, P12-5, cross-package 11, settle 4, settle 6.

- [ ] A theme switch on any ancestor (a `.dark` class or `color-scheme` on a container, not only `<html>`) repaints the canvas (`charts/src/theme.ts:181-183`).
- [ ] Ticks of values near 1e-9 are told apart (scientific or more places), and the tooltip value too (`format.ts:63,75`).
- [ ] A series naming a field no row has warns once in DEV.
- [ ] Tick, title and legend sizes are in `rem` and grow with the root size (`charts.css:41-50`); limit labels too.
- [ ] An empty chart shows "No data" without legend and placeholder axes.
- [ ] Pinch zoom of the page works over the plot (`touch-action` allows `pinch-zoom`; `sceneLayout.ts:173`).
- [ ] The summary's extremes name their position (day or category); the legend comes before the plot in Tab order where it stands above it.
- [ ] "Show all" is never covered by the tooltip, and hovering it leaves no empty tooltip stub.
- [ ] A waterfall at 375 px keeps every category readable (shortened, wrapped or turned labels) or says how to read the dropped ones.
- [ ] The docs say how generic wrappers name fields (`Extract<keyof Z, string>`), as the table's do.
- [ ] `pnpm check charts`; looked at as a user, light and dark, 375 px and root 32 px.

## Comments
