# 02: Chart: hiding series through the view

**What to build:** A legend hides and shows series without a prop or state in the application. The hidden series are part of the chart's view, by `name`, and stand on the hook as `hidden`, `toggleSeries`, `showOnly` and `showAllSeries`. `hidden` on a series and `Legend onToggle` go. A hidden series looks and behaves as today: struck through, out of the extent and the walk, its colour kept. The demo gets the pages 'Legend' and 'View' - the latter keeps a chart's view across a reload, as the table's View page does.

**Blocked by:** 01 (Chart: zoom through the view)

**Status:** done

- [x] A click on an entry toggles at once, through the view
- [x] Unknown names in a view fall out; a series without a name has no button
- [x] The view survives a reload in the 'View' example
- [x] Pages 'Legend' and 'View' with screenshots

## Comments

**2026-10-04, delivered.** The hidden series are the view's `hidden`, by `name` (src/view.ts: `onlyKnown(view, axes, names)` now drops names no series carries as it drops axis ids; `toggleHidden` and `showOnly` with the never-empty rule - where nothing would be left to see, all are shown; a series without a name counts as visible, since it cannot be hidden). The scene holds `hiddenInView` beside `domainsInView` behind the seam "The view (ADR-0047)"; `isHidden` reads it by name, and a name of a series not declared at the moment is kept, so the series comes back hidden. A change re-sums a stack only where a stacked member's state changed; nothing else is materialised again. On the hook: `hidden`, `toggleSeries(name)`, `showOnly(name)`, `showAllSeries()`; the scene also has `toggleNames(names)` for a state's entry, which speaks for every band showing it.

`<Legend>` toggles by default: every entry of a named series is a button with `aria-pressed`, a click goes through the view at once; an unnamed series' entry stays text. Gone: `Legend onToggle` and `hidden` on every series kind (and on `SeriesBase`). A view handed in is taken as given - it may hide every series (the empty state says so); only the click and the setters obey never-empty. The double click, Alt-click, Shift+Enter and the announcement are 03's.

Tests: `view.test.ts` (unknown names out, toggling, never-empty, showOnly), `legendToggle.jsdom.test.tsx` rewritten (buttons only for named series, click toggles through the view and reports, the last visible one shows all, setters and their reports, unknown name falls out of `initialView`, a hidden series out of the extent and the walk, a state's entry hides its band by name); `scene`, `sceneFrame`, `stacking`, `boxPlot`, `dataTable`, `emptyState` migrated to the view. Interaction: "a view kept outlives a reload and comes back on restore" (View page, the schedule's test imitated: hide, zoom, keep, reload, restore, start over).

Demo: "Tooltip & Legend" split - page 'Tooltip' (01 x-or-nearest, 02 own-content, 03 value-format, 04 data-table, 05 a-week-as-a-table) and page 'Legend' (01 hide-a-series, ex Tooltip/05 toggling-legend, with `initialView` and `showOnly`/`showAllSeries` buttons; 02 above-or-below, ex Tooltip/03 legend-placement). Page 'View' (rubric Chart, after Zoom and pan): 01 keep-and-restore, a zoomable chart with a legend, its view kept in localStorage. Area/03, Bar/04, BoxPlot/05, StateBand/02, Tooltip/04 lost their state and toggle. Old example anchors `/tooltip/#toggling-legend` and `#legend-placement` land on the Tooltip page without the example. Capability rows in `docs/capabilities.md`.

Pictures (all inspected): new - page-legend, page-view, legend--hide-a-series, legend--above-or-below, view--keep-and-restore (light and dark); removed - tooltip--toggling-legend, tooltip--legend-placement; renewed - page-tooltip (shorter head), area--stacked, bar--stacked, boxplot--grouped (lead text without inline code), and a sub-pixel shift of 1 px under those changed leads and the Tooltip head: area--shares, bar--percent, boxplot--objective, boxplot--detailed, tooltip--data-table, open-data-table (the same tests pass on HEAD, the layout boxes are identical). The CHANGELOG entry is 08's.
