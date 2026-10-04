# Every component holds its own view

Status: ready-for-agent
Date:   2026-10-04
Origin: charts research "zoom and the legend" and its grilling, 2026-10-04; ADR-0047.
Blocked by: per ticket - the chart's view waits for `.scratch/charts-bound-to-rows/` 07, the schedule's for 08.
Released with: `.scratch/charts-bound-to-rows/`.

## Problem Statement

Zooming a chart or hiding a series from its legend costs every caller a
`useState` and a toggle function, because the charts keep no view of their own
(charts-review Q17, Q19). The table keeps its view but takes a start only once;
the schedule keeps its span but has controlled pairs and reports each part on
its own. The research of 2026-10-04 found the legend's toggle on by default in
Highcharts, Chart.js and AG Charts, the solo double-click in Plotly and AG
Charts, and a visible reset in Highcharts - none of which umriss offers
without the caller building it.

## Decisions (grilling 2026-10-04)

| # | Question | Decision |
|---|---|---|
| Q2 | Who owns the view | The component. No controlled pairs for view state; `domain` on an axis stays configuration (`"nice"`, `"data"`, `"visible"`, a pair) and is the start of a zoomable axis. |
| Q3 | Term | **View**, widened to table, chart and schedule (CONTEXT.md). |
| Q4 | The schedule | Comes along. |
| Q5 | When a view handed in applies | When it differs in content from the last one handed in; the same again changes nothing. A new `key` still restarts. |
| Q6 | Reporting | `onViewChange(view)` in all three, once per change, always the whole view. Replaces the schedule's `onDomainChange` and `onCollapsedGroupsChange`. |
| Q8 | The schedule's pairs | `collapsedGroups`/`defaultCollapsedGroups`/`onCollapsedGroupsChange` go into the view. `selectedTask` is a selection, not view, and stays. |
| Q9 | On by default? | Legend toggles by default. Zoom only with `XAxis zoomable`. The schedule zooms always, as now. |
| Q10 | Keys of a chart's view | `{ domains?: Record<axisId, [number, number]>, hidden?: string[] }`. A lone x axis needs no `id` (a default id). Series are hidden by `name`; a series without one cannot be. Unknown ids and names fall out. |
| Q11 | Migration | Old props removed, not deprecated. |
| Q12 | Zoom limits | `XAxis zoomLimits: { min, max }`, the schedule's shape. Default: at most the data's extent, at least three data steps. |
| Q13 | Way back | The chart shows a "Show all" control of its own once an axis is zoomed; its words from the wording. |
| Q14 | Charts in step | Through the view (`initialView={shared}`, `onViewChange={setShared}`); `syncId` keeps sharing the pointer only. |
| Q20 | Demo | Charts: pages "Zoom and pan", "Legend", "View". Schedule: page "View". The scattered examples move there. |
| Q21, Q24, Q25 | The table's server mode | Kept; `manual` → `server`, its report `onViewChange` → `onRequest(request)` with the **Request** (search, conditions, sort, page, page size). `onViewChange` is the general report in every mode. |
| Q22 | The chart hook's state | `view`; `domains` + `setDomain(axisId, span \| null)` (`null` = all); `hidden` + `toggleSeries(name)` + `showOnly(name)` + `showAllSeries()`. |
| - | Legend gestures (agreed before the grilling) | Click toggles at once. Double click shows only that series; Alt/⌥+click and Shift+Enter do the same. A double click on the only visible series shows all. Any gesture that would leave nothing visible shows all instead, and the live region says so. |

### Decided in writing, not in the grilling

- **The schedule without `initialView.domain`** shows the extent of its
  subtasks, within `zoomLimits` - the chart's `"data"` default. Until now
  `initialDomain` was required; with the view optional the schedule needs a
  start of its own. Confirmed by the user on 2026-10-04.
- **The schedule's view keys** are `domain` and `folded`, the table's word for
  folded groups.

## Solution

Each ticket is a vertical slice: model, interaction, tests, example and its
demo page together.

| Ticket | Scope | Blocked by |
|---|---|---|
| 01 | Chart: zoom through the view; page "Zoom and pan" | `charts-bound-to-rows` 01, 07 |
| 02 | Chart: hiding series through the view; pages "Legend", "View" | 01 |
| 03 | The legend's gestures | 02 |
| 04 | "Show all" | 01 |
| 05 | Table: a view applies by content, reported in every mode | - |
| 06 | Table: manual mode becomes server mode | 05 |
| 07 | Schedule: the view; page "View" | `charts-bound-to-rows` 08 |
| 08 | Records and release | all |

## Testing

Pure tests for the view model of each component (apply by content, unknown
keys fall out, defaults absent, clamping to `zoomLimits`). Interaction tests:
zoom by every gesture only where `zoomable`; two charts in step through the
view; legend click, double click, Alt-click, Shift+Enter, the never-empty rule
and its announcement; the table in server mode asks nothing on a width drag;
two schedules in step without remount. The keyboard walk keeps the **Active
point** across a view handed in.

## Out of Scope

- Y zoom, rectangle zoom, a navigator: not asked; the navigator would build on
  the view and waits for a caller (record it under "Later" in 07).
- A uniform selection across the packages: next candidate, own decision.
- The server mode's own gaps: `.scratch/table-server-mode-2/`.
