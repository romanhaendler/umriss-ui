# A table, a chart and a schedule follow one row

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Linked views" (its Answer holds every decision
below); findings `.scratch/shakedown/composed-app.md` (wishes), `reports-bi.md` 6 and its wishes;
ADR-0003, ADR-0034, ADR-0056. The cross-filter half - a chart's range filters a table - is
`.scratch/chart-range-selection-and-navigator/` (R11) and is not repeated here.

## Problem Statement

Three personas built a screen where a table, a chart and a schedule follow each other, and each wrote the
glue by hand. Most of it was short and worked: a chart already reports a chosen hit (`onSelect`), a schedule
already takes and reports a selected task, a chart draws what the application keeps with a series or a limit
of its own. One part had no good answer: **the table has no row the reader chose.**

- A click on a row reports nothing. The workaround - a data attribute through `rowProps` and a click
  delegated on the table - is four lines, and it works with a mouse only: a native table's rows are not
  focusable, so a keyboard user cannot choose one unless the cell holds a button.
- Nothing marks the chosen row for a screen reader. `rowProps` passes classes and data attributes, not
  `aria-current`.
- When another view chooses a row - a click on the chart, a task in the schedule - the table does not bring
  that row into view. In a paged or virtual table of 2,000 rows the reader does not see that it followed.

Drill-down along a time hierarchy was asked for as well. It took about 20 lines over `onSelect` and worked;
no example shows it.

## Solution

- **The table gets a Current row.** One row the reader chose for the rest of the screen to follow. It is a
  third state beside the selection and the Active cell, derived from neither. The application holds it: the
  table marks the row named in `currentRow` and reports every choice through `onCurrentRowChange`.
  - A click on the row outside its controls chooses it.
  - With the keyboard: in a native table the row header is a button; in grid mode Enter on a plain cell.
  - The row is marked with an accent bar and `aria-current`, and is brought into view when it is set from
    outside.
- **Linked views are a scenario, not a feature.** A scenario in core's demo shows a table, a schedule and a
  chart following one batch: each takes the key by a prop it has and hands it back by a handler it has. No
  view learns of another, and no chart holds state.
- **Drill-down is an example**, not a feature: year to month to day in the charts' demo, the stack in the
  example's state.

## User Stories

1. As a developer, I want the table to report the row a reader chose, so that I do not delegate clicks
   through data attributes.
2. As a developer, I want the report to carry the row's key and the row, so that I update the other views
   without a lookup.
3. As a developer, I want the table to mark the row I hold as current, so that the reader sees which row the
   screen follows.
4. As a developer, I want the table to hold nothing, so that the key I give the chart and the schedule is the
   one truth.
5. As a developer, I want a click on the row's checkbox, expander, actions or a button of my own not to
   change the current row, so that the row's controls keep their meaning.
6. As a developer, I want the current row and the selection to be independent, so that choosing a row for
   the detail pane does not tick it, and ticking does not move the detail pane.
7. As a developer, I want a report also for the row already current, so that I decide whether a second click
   clears it.
8. As a developer without `onCurrentRowChange`, I want the table to behave as it did, so that nothing changes
   by upgrading.
9. As a developer, I want a warning in development when my table has no row header, so that I learn that the
   keyboard cannot choose a row.
10. As a reader, I want to click anywhere on a row to choose it, so that I do not aim at one cell.
11. As a keyboard user of a native table, I want to Tab to a row's header and press Enter, so that I reach
    what a pointer reaches.
12. As a keyboard user of a grid, I want Enter on a cell to choose its row, so that I do not leave the grid's
    walk.
13. As a screen-reader user, I want to hear that a row is current, so that I know which row the screen
    follows.
14. As a reader, I want the current row marked apart from the selection, so that I tell both at a glance when
    a row is both.
15. As a reader in forced colours, I want the mark to stay, so that the current row does not vanish.
16. As a reader, I want the table to bring a row chosen in the chart or the schedule into view, so that I see
    the table follow.
17. As a reader, I want my focus left where it was when the table follows another view, so that I keep my
    place.
18. As a developer, I want a scenario where a table, a schedule and a chart follow one key, so that I copy
    the pattern rather than invent a context.
19. As a developer, I want the scenario to show a chart drawing the current item with a limit band of its
    own, so that I see how a chart takes a highlight without holding one.
20. As a developer, I want an example of drill-down over `onSelect`, so that I build year to month to day
    without a drill-down feature.
21. As a coding agent reading `llms.txt`, I want the Current row in the text, so that I generate it rather
    than a delegated click.

## Implementation Decisions

- **The decision record.** The Current row gets an ADR: costly to reverse, since it is public state and it
  changes the native table's row header and what a click on a row means. Its text stands in ticket 01.
- **The props.** On `Table`, beside `rowProps`:
  - `currentRow?: string | null`, the key of the row to mark;
  - `onCurrentRowChange?: (key: string, row: Z) => void`, called on every choice, the current row's too.

  The table keeps no state for it and has no uncontrolled fallback. `currentRow` alone marks; the handler
  alone reports.
- **The pointer.** A primary-button click on a body row reports, unless the target lies in a control inside
  the row - the selector the grid already uses for a cell's own controls. These lines report nothing: a group
  header, a group span, a detail, the footer, a new-row draft. In grid mode a click that opens an editor also
  reports its row.
- **The keyboard, native table.** With `onCurrentRowChange`, the content of the row-header cell is rendered
  inside a button. The controls the table itself puts into that cell, such as a tree row's toggle, stay
  beside it, not inside. The button takes the cell's text style and adds a focus ring only. Enter and Space
  are the button's own. Nesting a control of one's own in the row header then nests it in a button; the
  property's documentation says so.
- **The keyboard, grid mode.** No button is rendered. Enter on a cell that neither edits nor holds a control
  chooses its row. Space stays the selection's, and Enter on a cell with controls still enters them.
- **No row header.** With `onCurrentRowChange` and no column marked `rowHeader`, the development build warns
  once through the table's `warnOnce`. Pointer choice still works.
- **The mark.** The current row carries an accent bar at its inline start, inside its first cell, so the row
  does not grow. It stands beside the selection's ground. In forced colours it is drawn in a system colour
  and is still told apart from the selection's lines. `aria-current="true"` goes on the row, and in a native
  table on its button too. There is no new token and no new wording key.
- **Into view.** When `currentRow` changes to a row of the filtered set:
  - a paged table goes to that row's page;
  - the scroll area brings the row in at the nearest edge, virtual included, with the mechanism that brings
    the grid's Active cell back into the window.

  Focus does not move. A key outside the filtered set marks nothing and moves nothing.
- **The scenario.** Core's demo, the only one that reaches table, schedule and charts. It comes after the
  scenarios that stand, "A chart filters a table" included once that is built. "Trace a batch": a table of
  the shift's batches, the shift's schedule, a kiln temperature trend.
  - The batch key is held in the scenario's state.
  - The table takes it as `currentRow`, the schedule as `selectedTask`, and the chart draws the batch's
    stretch as a `LimitBand` on x.
  - Each view hands it back: `onCurrentRowChange`; `onSelectedTaskChange`; `onSelect` on the trend, giving
    the batch that ran at the chosen instant.
- **The drill-down example.** On the charts' Tooltip page after "Choose a hit": bars per year, `onSelect`
  goes to that year's months and then a month's days, and a demo button goes back up a level. The stack is
  the example's state; the category axis changes with the level.

## Testing Decisions

- A good test chooses a row the way a reader does - a click, a Tab and Enter, Enter in a grid - and asserts
  on what the handler received and on roles and `aria-current`. It never asserts on class names.
- **Mounted in jsdom** (`tests-unit/currentRow.test.tsx`, in the manner of `gridMode.test.tsx` and
  `rows.test.tsx`):
  - pointer:
    - a click on a cell reports the key and the row;
    - a click on the checkbox, the expander, an action or a button in a cell reports nothing;
    - a group header and a detail report nothing;
    - a click on the current row reports again;
  - keyboard:
    - the row header holds a button that reports on Enter;
    - in grid mode, Enter on a plain cell reports, Space still selects and Enter on a cell with controls enters them;
  - mark and view:
    - `currentRow` sets `aria-current` on that row only;
    - selection and current row stay independent;
    - a `currentRow` on another page moves the page;
  - no `onCurrentRowChange`, no change in the DOM;
  - no row header, one development warning.
- **Types** (`types.test-d.tsx`): the handler's row is typed at the table's row.
- **Visual** (`tests-visual/screenshots.spec.ts`, `forced-colors.spec.ts`): the example with a current row that is
  also selected, light and forced colours. In a browser, a current row far down a virtual table scrolls into view.
  Screenshots are looked at before they are accepted.
- **Accessibility**: the example page and the scenario pass the accessibility check that runs on every page.
- **The scenario and the drill-down example** are covered by the demos' smoke tests and the own-data check,
  as the other scenarios and examples are. The scenario's lookup from an instant to a batch gets a unit test of its own.

## Out of Scope

- **A shared selection model, a linking context or a `syncId` for tables:** the application holds the key
  (ADR-0016, ADR-0022).
- **A highlight held by a chart** (a `highlighted` prop, MUI's `highlightedItem`): ADR-0056 stands; the
  application draws with a series of its own `data` or a limit on x.
- **Drill-down as a chart feature** (Highcharts Drilldown, ECharts `universalTransition`).
- **Cross-filtering:** `.scratch/chart-range-selection-and-navigator/` and `setFilter`.
- **Several current rows; clearing by a click on nothing; a double click.** Telling a click that ends a text
  selection apart.
- **The Active cell or the arrow walk making a row current:** walking chooses nothing (ADR-0034, ADR-0003).
- **A lane highlight from outside:** a single wish of the schedule (map ticket 23).
- **A current row in the toolbar, the export or the view** (`t.view`): it is the application's state, not
  the table's.

## Further Notes

- Ticket 01 is the decision; ticket 02 is the tracer bullet through the table's props, its click and its
  mark. No prefactor is needed: the controls selector and the window's scroll-to-row exist for grid mode
  and are reused.
- The stale-closure trap of a `value` that reads an outer variable (`composed-app.md` 1) loses its most common
  cause here - a star column for the chosen row. The trap itself is the dev-warnings ticket's.
