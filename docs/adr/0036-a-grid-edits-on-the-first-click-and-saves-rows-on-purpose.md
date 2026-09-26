# A grid edits on the first click, and saves rows on purpose

Status: accepted
Date:   2026-09

ADR-0034 opened an editor on Enter, F2 or a typed key, and a click only made
its cell the **Active cell**. Used with a mouse that reads as broken: a person
clicks a setpoint and nothing happens. Every edit was also reported the
moment its cell was left, so a record whose fields belong together - a shift's
start, end and crew - was written half-changed in between.

**A click on a cell that edits opens its editor.** The arrows and Tab still
walk without editing, so the keyboard keeps a pure walk; the mouse gets what
it asks for. A cell that edits says so under the pointer: a text cursor over a
text or a number, a pointer over a select, a day or an editor of its own, and
the hover tint of the interaction-state canon. No mark at rest: a table that
edits would otherwise look different from one that reads all the time.

**`editMode="row"` edits a row as one Row draft.** Every editable cell of the
row opens at once; a column the table adds, pinned at the end, carries Save
and Discard; Enter saves, Escape discards. There is at most one draft, and a
row with one is left only by saving or discarding it - a draft is never
dropped without a word, as ADR-0034 already held for a cell. The save is
reported as `onRowSave({ rowKey, changes, row })` with the changed columns
only, and applied by nobody but the application (ADR-0023). Editing cell by
cell stays the default: a comment or a single setpoint needs no save step.

**Rows are added and deleted by the table's own buttons, in both modes.** A
new row is always a Row draft - a record without a key cannot be reported cell
by cell - standing above the body's rows whatever the sort, filter or page;
saved, it is reported whole through `onRowAdd({ values })` and appears when
the application puts it into the rows. A delete asks inside its row before it
reports `onRowDelete({ rowKey, row })`: losing a row by one stray click is
data loss, and a guard every application would rebuild belongs in the table.

**A click outside the grid ends an edit of one cell, never a Row draft.** In
cell mode it is what a click on another cell is: the draft reported where it
validates, left open with its message where not - and the focus stays where
the click put it; pulling it back out of a search field or a menu would be
worse than the message standing. A click in a panel the editor opened (a
day's calendar) is inside. A Row draft ignores a click elsewhere on the page:
it waits for its Save or Discard, and only a click into another row is
refused with a word.

## Considered options

- *Second click, or a double click, opens the editor* (Excel, AG Grid). Kept
  the keyboard's walk for the mouse too, and was exactly what read as broken.
- *Row mode as the only mode.* Makes a comment column a two-step chore.
- *Saving on leaving the row.* Undoes the point: the person decides when.
- *Several drafts at once.* A table of half-saved rows, each with its own
  buttons, and no answer to which is being worked on.
- *Delete key deletes the row.* In a spreadsheet it clears a cell.

## Consequences

- A draft row keeps its place while it is open: sort and filter see the stored
  values; a new `rows` leaves the draft alone; a row gone from `rows` takes
  its draft with it.
- `validate` runs over every open cell on Save; a row-wide check is left until
  a case asks for it.
