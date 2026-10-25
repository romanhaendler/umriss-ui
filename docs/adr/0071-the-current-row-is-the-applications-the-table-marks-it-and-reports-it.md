# The current row is the application's; the table marks it and reports it

Status: accepted
Date:   2026-10

A screen that links views - a table, a chart, a schedule - follows one row the
reader chose. The table has two row states, and neither is that row. The
selection (the checked set) is any number of rows for bulk actions. The Active
cell, in grid mode, is where the keys stand, and walking chooses nothing
(ADR-0003, ADR-0034).

**The Current row is a third state, held by the application.** `Table` takes
`currentRow`, the key it marks, and `onCurrentRowChange(key, row)`, which it calls
on every choice, including a choice of the row already current. The table keeps
no copy and has no uncontrolled fallback. The current row is never derived from
the selection or the Active cell, and neither of them is derived from it.

- **Pointer.** A primary click on a body row that does not land on a control
  inside it. Group headers, spans, details, the footer and a new-row draft report
  nothing.
- **Keyboard.**
  - In a native table the row header's content is rendered inside a button: one
    tab stop per row, as a checkbox is, and a screen reader hears a button named by
    the row.
  - In grid mode there is no button. Enter on a cell that neither edits nor holds a
    control chooses its row.
  - Without a row header, the development build warns once.
- **Mark.** An accent bar at the row's inline start, inside its first cell, beside
  the selection's ground. It holds in forced colours. `aria-current="true"` goes on
  the row and on its button.
- **Into view.** When the current row is in the filtered set but not in view, the
  table brings it in - its page, or a scroll to it - without moving focus.

## Considered Options

- **`onRowClick`, as AG Grid and MUI have it.** Rejected: a native table's rows
  take no focus, so it is mouse-only.
- **Focusable rows (`tabindex` on `tr`).** Rejected: a tab stop with no role, which
  a screen reader cannot name as something to press.
- **A single-row selection mode.** Rejected: it would merge two states, which
  ADR-0003 keeps apart.
- **A linking context across the packages, or a `syncId` for tables.** Rejected:
  the packages would know of each other (ADR-0016, ADR-0022), and every view
  already takes a key and reports one.
- **A table that keeps the current row itself.** Rejected: every caller that links
  views holds the key already, for the other views.

## Consequences

A table with `onCurrentRowChange` renders a button in its row header. A control
that a column puts into its row-header cell then stands inside that button; the
property's documentation warns against it. Without either prop, the table renders
the same DOM as before.
