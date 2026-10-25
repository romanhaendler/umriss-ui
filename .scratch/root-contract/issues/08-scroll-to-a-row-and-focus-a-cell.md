# 08 - Scroll to a row and focus a cell

Status: ready-for-agent
Type: task
Size: M

Blocked by: `04-the-table-is-a-composite.md`
Spec: `.scratch/root-contract/spec.md`

## What to build

Two functions on `useTable`'s return, for a caller who acts on the table from outside it: a click on an
alarm elsewhere brings its row into view.

- **`scrollToRow(key)`** brings the row with that key into view and returns `true`.
  - In a paged table it moves to the row's page, as `setPage` does.
  - In a scroll area, virtual or not, it scrolls the row into view, computing the offset from the row pitch
    (ADR-0042). It does not wait for the row to be rendered.
  - In server mode it reaches only the rows of the page it holds.
- **`focusCell(key, column)`**, in grid mode: it does what `scrollToRow` does, then makes that cell the
  **Active cell** and moves the focus to it. Outside grid mode it returns `false`.
- **Both return `false` and change nothing** for:
  - a key the table does not have, or a column it does not show;
  - a row the search, a condition or the `preFilter` hides;
  - a row inside a folded group or branch;
  - a table that is not mounted.

  Neither function unfolds anything or clears a filter.
- **Demo:** one example in the table's demo. A list beside a virtual table scrolls to the row that is picked
  in the list. In grid mode, a button focuses a cell.

## Acceptance criteria

- [ ] In jsdom, through the hook: on a paged table, `scrollToRow` of a row on page 3 shows page 3. On a
      virtual table the scroll offset is set so that the row stands in the window. Each `false` case
      returns `false` and changes neither the page nor the scroll.
- [ ] In grid mode, `focusCell` leaves the focus on that cell, and the arrows walk on from it.
- [ ] One `@quick` visual check in Chromium: after `scrollToRow` on a virtual table of 10,000 rows, the
      row is visible.
- [ ] `API.md` lists both functions with their first sentences.
- [ ] `pnpm check table` and `pnpm check:site` pass, and `pnpm test:visual:quick table` passes.
- [ ] The changelog notes both under Added.
