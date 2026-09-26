# The table becomes a grid only on request

Status: accepted, amended by ADR-0036 (the first click edits)
Date:   2026-09

`@umriss-ui/table` renders a native `<table>`: every control in it is a stop
of its own, a screen reader reads it with its table keys, and nothing in it is
edited. Every mature grid does it the other way - one tab stop, arrows from
cell to cell, a cell edited in place (the ARIA grid pattern) - and a plant
screen edits daily: setpoints, comments, the text an acknowledgement carries
(`.scratch/table-grid-mode/spec.md`).

**The grid is opt-in.** `<Table grid>` makes the table `role="grid"`
(`treegrid` once it is grouped), one tab stop with one **Active cell** the
arrows walk; Home and End go to the row's ends, Ctrl+Home and Ctrl+End to the
table's, PageUp and PageDown by the rows in view. A cell's own controls leave
the tab order and are reached with Enter or F2 and left with Escape - the APG
grid's widget mode. A column that declares `edit` is edited in place, and the
edit is reported through `onCellEdit`, never applied. Without `grid` the table
is what it was: the same DOM, the same roles, the same pictures.

## Why not always

A table read far more often than it is edited loses by the grid. A native
table hands a screen reader its own table navigation in browse mode, with no
mode to switch; a grid takes the arrows for itself, and a reader has to know
it is in one. The header's sort and filter buttons, a row's checkbox and
actions are one Tab away in a native table and one Enter away in a grid. And
a person who never meant to walk cells now has a table that swallows the
arrow keys a page would have scrolled with. A report, an alarm history, a
list of orders keeps all of that. The grid is worth its cost where the reader
works in the cells - where they edit.

## Why one prop and not a second component

A `DataGrid` beside `Table` would have to repeat every column, filter,
grouping, pinned block and virtual window the table has, and the two would
drift. The grid changes how the keys and the focus move over the lines the
table already renders, and which cell renders an editor - nothing else. So it
is a mode of the one table, and every other part keeps working inside it.

## Why the Active cell is state

It holds on to its line's key and its column's id, not to a DOM node. A sort
moves its row, a filter removes it, a fold hides it, a virtual window renders
it away (AG Grid's `ensureDomOrder` lesson): the Active cell follows its row,
or stands where its row stood, and the grid brings it back into the window
when a key walks to it. It is never a selection (ADR-0003): nothing is
chosen by walking.

## Why the edit is reported and not applied

The application owns the rows, as it owns a schedule's plan (ADR-0023). A
table that wrote into them would hold a second copy that goes stale, and an
application that refuses an edit - a setpoint outside what the plant allows -
would have to undo what the table already did. So an edit ends in
`onCellEdit({ rowKey, columnId, value, row })`, and the cell shows the new
value when the rows passed in carry it. A `validate` per column keeps a draft
that does not pass open, with its message in a popover beneath the cell - the
editor lies over the cell at its size, and nothing in the table shifts; the
check the application makes after the report is its own.

## Consequences

- A column declares `edit` - `"text"`, `"number"`, `"select"`, `"date"` or an
  editor of its own - and gets the core field for it (`Input`, `NumberInput`,
  `Select`, `DatePicker`; ADR-0016). Enter, F2 or typing starts an edit,
  Enter commits, Escape cancels, Tab commits and moves on to the next cell
  that edits.
- Range selection, a clipboard and undo stay out (ADR-0032): the grid walks
  cells, it does not select them.
- The cells' tab stops are written onto the DOM after every render rather
  than threaded through every cell the table renders; a control a
  presentation mounts between two renders of the table is quieted at the next
  one.
- The Active cell rings itself with the shared ring drawn inside its edges:
  the scroll area cuts an outer ring away, and the neighbours paint over it.
