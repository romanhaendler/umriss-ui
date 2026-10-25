# 01 - The ADR: the Current row is the application's

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/linked-views/spec.md`

## What to build

The decision record, before any code.

- Take the next free number in `docs/adr/` at the time of writing.
- Add its row to `docs/adr/README.md`, area: table.
- Put the term **Current row** into `CONTEXT.md` beside **Active cell**, with its _Avoid_ line, unless the map's coordinating session has already put it there.

The ADR's text is below. Write it in the voice of the ADRs that stand, with ADR-0056 as the model, and change
nothing of its substance.

> **Title:** The current row is the application's; the table marks it and reports it
>
> A screen that links views - a table, a chart, a schedule - follows one row the reader chose. The table has
> two row states, and neither is that row. The selection (the checked set) is any number of rows for bulk
> actions. The Active cell, in grid mode, is where the keys stand, and walking chooses nothing (ADR-0003,
> ADR-0034).
>
> **The Current row is a third state, held by the application.** `Table` takes `currentRow`, the key it
> marks, and `onCurrentRowChange(key, row)`, which it calls on every choice, including a choice of the row
> already current. The table keeps no copy and has no uncontrolled fallback. The current row is never derived
> from the selection or the Active cell, and neither of them is derived from it.
>
> - **Pointer.** A primary click on a body row that does not land on a control inside it. Group headers, spans,
>   details, the footer and a new-row draft report nothing.
> - **Keyboard.**
>   - In a native table the row header's content is rendered inside a button: one tab stop per row, as a
>     checkbox is, and a screen reader hears a button named by the row.
>   - In grid mode there is no button. Enter on a cell that neither edits nor holds a control chooses its row.
>   - Without a row header, the development build warns once.
> - **Mark.** An accent bar at the row's inline start, inside its first cell, beside the selection's ground. It
>   holds in forced colours. `aria-current="true"` goes on the row and on its button.
> - **Into view.** When the current row is in the filtered set but not in view, the table brings it in - its
>   page, or a scroll to it - without moving focus.
>
> **Considered options.**
> - `onRowClick`, as AG Grid and MUI have it: a native table's rows take no focus, so it is mouse-only.
> - Focusable rows (`tabindex` on `tr`): a tab stop with no role, which a screen reader cannot name as
>   something to press.
> - A single-row selection mode: it would merge two states, which ADR-0003 keeps apart.
> - A linking context across the packages, or a `syncId` for tables: the packages would know of each other
>   (ADR-0016, ADR-0022), and every view already takes a key and reports one.
> - A table that keeps the current row itself: every caller that links views holds the key already, for the
>   other views.
>
> **Consequences.** A table with `onCurrentRowChange` renders a button in its row header. A control that a
> column puts into its row-header cell then stands inside that button; the property's documentation warns
> against it. Without either prop, the table renders the same DOM as before.

## Acceptance criteria

- [ ] The ADR stands in `docs/adr/` with the next free number, `Status: accepted`, and the date of writing.
- [ ] Its row stands in `docs/adr/README.md`, and the count in that README's first sentence goes up by one.
- [ ] `CONTEXT.md` defines **Current row** in one paragraph that points at the ADR, with
      `_Avoid_: active row, selected row, focused row, highlighted`.
- [ ] `pnpm check:site` passes.
