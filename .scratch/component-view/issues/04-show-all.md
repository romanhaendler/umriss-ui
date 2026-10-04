# 04: 'Show all'

**What to build:** Once a zoomable axis shows less than its whole domain, the chart shows a quiet control of its own that brings every zoomed axis back to its whole domain. It is a tab stop of its own outside the plot's application role, its label comes from the wording, it is styled through tokens only, and it disappears when nothing is zoomed, handing focus to the plot.

**Blocked by:** 01 (Chart: zoom through the view)

**Status:** done

- [x] Appears on zoom, restores by click and by key, disappears
- [x] Label in both wordings; one screenshot

## Comments

**2026-10-04, delivered.** `Chart` renders 'Show all' (`ShowAll` in `Chart.tsx`) whenever the view has `domains` - which holds only spans of zoomable x axes, so a chart without one never shows it - and the plot area is laid out (no button in SSR). It is a `<button class="uc-show-all">` beside `.uc-plot`, not in it: a tab stop of its own after the plot's, outside its `role="application"`. It lies over the plot area's top right corner, 6 px in; at the bottom right where a legend - or the data key's own line - stands above the plot. Its place is measured after each layout (the plot's offset in the root plus the layout's plot rect). A click or Enter/Space calls the scene's `resetZoom()` (ex `doubleClick()`, renamed: the double click, the key 0 and the button share it): every zoomable axis back to its own `domain`, the view reported once. Whenever it goes while it has the focus - its own click, a `setDomain(id, null)`, a view handed in -, a layout-effect cleanup hands the focus to the plot before the button leaves the document; focus elsewhere is left alone. Hidden with the plot while the data table is open.

Wording: `showAll` - "Show all" / "Alles zeigen". Styling: `--uc-*` tokens only (the tooltip's surface and border, the legend entry's hover, pressed and focus ring, `--uc-transition-state`); the ring as `outline: 2px solid transparent` + `box-shadow`, so forced colours keep it; no transition under reduced motion.

Tests: `tests-unit/showAll.jsdom.test.tsx` (absent unzoomed; a button outside the plot on `setDomain`, on +, on a view handed in; German label; one click restores both zoomed axes of two, reported once as `{}`, and goes; focus to the plot on its click and on `setDomain(null)`; focus elsewhere untouched; never on a chart without a zoomable axis, neither by `initialView` nor `setDomain`). Interaction: "zoom: 'Show all' brings the whole back by key and by click" (Ctrl+wheel, Tab from the plot reaches it, Enter restores the week, it goes, the plot has the focus; then by click).

Demo: the 'Zoom and pan' page's about names it; example 01's lead names it beside the double click and 0. No new example. Capability row in `docs/capabilities.md`.

Pictures (all inspected, light and dark): new - show-all (the gestures example zoomed by Ctrl+wheel, pointer away); renewed - page-zoom-and-pan (one paragraph more), zoom-and-pan--gestures-and-keys (lead), zoom-and-pan--visible-domain (starts zoomed: the button shows), zoom-and-pan--zoom-limits and --cursor-sync (a sub-pixel shift under the longer page head; content identical). The CHANGELOG entry is 08's.
