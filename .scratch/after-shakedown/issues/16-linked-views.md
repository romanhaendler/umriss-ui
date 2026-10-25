# Linked views

Type:   grilling
Status: resolved

## Question

How do a table, a chart and a schedule on one screen follow each other - shared selection, cross-filter,
cross-highlight, drill-down, an active row?

Three personas built it by hand (`.scratch/shakedown/composed-app.md`, `reports-bi.md`, `core-screens.md`).
Already decided: a chart reports a range and holds no selection (ADR-0056, open-points-roadmap C1), and "a
chart filters a table" is a scenario, not a feature (X6, in `.scratch/chart-range-selection-and-navigator/`).

- After that spec, what is still missing: a row click / active row on the table that a chart can highlight,
  a highlight a chart takes from outside, drill-down along a time hierarchy (`reports-bi.md`, ~20 lines)?
- A feature (a shared key the views agree on) or more scenarios with recipes?
- Does any of it need a chart to hold state, against ADR-0056?

## Answer

Decided 2026-10-25 by the agent, under the maintainer's delegation. Technical decisions are marked
*(agent)*; the two product calls are marked *(agent, product - for review)*.

- **Linked views stay scenarios, not a feature** *(agent, product - for review)*. There is no shared key, no
  context and no coordinator across the packages. The application holds the one key the screen follows, and
  each view takes it in through a prop it has and hands it back through a handler it has. A coordinator would
  make the packages know of each other, against ADR-0016 and ADR-0022, and every view below already speaks
  in keys and handlers.
  - **Cross-filter** is covered: a chart's range filters a table in `.scratch/chart-range-selection-and-navigator/`
    (R11, its scenario ticket 05); slicers through `setFilter` feeding `filtered` into a chart already work
    (`reports-bi.md`, held up).
  - **A chart takes a highlight from outside without new API.** ADR-0056 stands: the application draws what
    it keeps - a series with its own `data` over the chosen rows (stacked bars for a Power BI cross-highlight),
    a `LimitLine` or `LimitBand` with `orientation="x"` for an instant or a stretch, `showOnly` for a series.
    No chart holds state.
  - **A chart hands its choice back** through `onSelect` (`hit.points[i].datum`), and a range through `onRange`
    once that spec is built.
  - **The schedule already takes and reports one key:** `selectedTask` and `onSelectedTaskChange` (controlled),
    which mute every other task. Linked views need nothing more from it; a lane highlight from outside is a
    single wish of the schedule (ticket 23), not a need of linking.
- **The one gap is the table's: a Current row** *(agent, product - for review)*. One row the reader chose
  for the rest of the screen to follow - umriss's answer to `onRowClick`. It is a third state beside the
  selection (the checked set) and the Active cell, derived from neither (ADR-0003). The table marks it and
  reports it, and holds none of it, as the chart holds no chosen hit (ADR-0056).
  - `Table` takes `currentRow?: string | null`, the row key it marks, and
    `onCurrentRowChange?: (key: string, row: Z) => void`, called on every choice, also of the row already
    current; the application decides *(agent)*. No uncontrolled fallback: a caller that links views holds the
    key anyway.
  - **Pointer** *(agent)*: a primary click on a body row that does not land on a control inside it (the
    checkbox, the expander, an action, a link or button a column renders). Group headers, details and the
    footer report nothing. In grid mode a click that opens an editor also chooses its row.
  - **Keyboard** *(agent)*: in a native table the row header's content becomes a button, one tab stop per
    row as a checkbox is, and Enter or Space on it chooses the row. In grid mode there is no button; Enter on
    a cell that neither edits nor holds a control chooses its row (Space stays the selection's). Without a
    `rowHeader` column the development build warns once that the keyboard cannot choose, as `onSelect`
    warns without a `Tooltip`.
  - **Mark** *(agent)*: a bar in the accent at the row's inline start, drawn inside its first cell, so it
    stands beside the selection's ground; it holds in forced colours. `aria-current="true"` on the row and on
    its button. No new token and no new wording key.
  - **Into view** *(agent)*: when `currentRow` names a row of the filtered set that is not in view, the table
    goes to its page or scrolls it in, virtual included, without moving focus. A row filtered out is not
    drawn and nothing is reported.
- **Drill-down is no feature** *(agent, product - for review, with the first call)*. A drill stack over
  `onSelect` took about 20 lines and worked first try (`reports-bi.md`, held up); Highcharts' Drilldown would
  make a chart keep a level, against ADR-0056. It gets one example in the charts' demo: year to month to day
  on a category axis, the stack in the example's state, a way back.
- **Explicitly out:** a shared selection model or `syncId` for tables; a `highlighted` prop on a chart
  (MUI's `highlightedItem`); several current rows; clearing by a click on nothing; the Active cell or an arrow
  walk making a row current; a double click; a click that ends a text selection being told apart; a lane
  highlight (ticket 23).
- **Costly to reverse: yes, the Current row** - a public state, a change to the native table's row header
  and to what a click on a row means. An ADR, as the spec's first ticket. The rest is commit messages.
- **Touches:** `@umriss-ui/table` (the Current row, its example and `API.md`), the charts' demo (the drill-down
  example), core's demo (a scenario where a table, a schedule and a chart follow one batch). No source of
  charts, schedule or core changes.
- **Becomes the spec** `.scratch/linked-views/`.
