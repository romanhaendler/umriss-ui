# 01 - Shift-click selects a range of rows

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/linked-views/issues/02-the-current-row-by-the-pointer.md`, `.scratch/table-server-mode-2/issues/03-the-state-all-that-match.md`
Spec: `.scratch/table-small-wishes/spec.md`, "Row ranges"

## What to build

A reader ticks row 3, Shift-clicks row 40 and has 38 rows ticked, in the order the table shows them. A
Shift-click on a ticked row clears the range the same way.

- **`TableSelection.set(ids, selected)`.** A new required member: every key in `ids` takes `selected`, in
  one state update. `useTableSelection` builds it. In the state "all that match" it moves the keys in or out
  of `except` instead. The type's documentation says what it does in the voice of the members around it.
- **The anchor.** The table keeps the key of the row toggled last, by a plain toggle or a range. "Select
  all" does not set it, and clearing the selection drops it. It is in neither `TableSelection` nor the view.
- **The range.** From the anchor to the clicked row, every row takes the state the clicked row takes. It
  runs over the rows a reader reaches by paging, in reading order:
  - a flat table: the filtered set in its sort, across pages;
  - grouped: the rows among the group lines, without a folded group's rows;
  - tree rows: the rows the flattening shows;
  - server mode: the page the table holds.

  Without an anchor in that set, the click toggles one row and sets the anchor.
- **The gestures.**
  - A click with Shift on a row's checkbox.
  - Shift+Space on a row's checkbox, read on the key.
  - Shift+Space in grid mode on any cell of the row, beside the plain Space of today.

  A pointer press with Shift in the selection column marks no text. A checkbox click, with or without
  Shift, still chooses no current row.
- **The example.** The Selection page's first example says in its lead that Shift-click and Shift+Space
  select a range. "Hold the selection yourself" shows that the range works with a handed-in selection, with
  no change to its code.
- **Docs.** The Selection page's keys list Shift+click and Shift+Space; the grid mode page lists
  Shift+Space. `API.md` is regenerated.

## Acceptance criteria

- [ ] `useTableSelection.test.ts`: `set` selects and clears several keys in one update, keeps keys outside
      `ids`, and in the state "all that match" changes `except` instead.
- [ ] Mounted tests:
  - a Shift-click range on a table sorted by a column ticks the rows between in the shown order;
  - a range in a grouped table skips a folded group's rows;
  - a range from page 1 to page 3 ticks the rows between;
  - a Shift-click on a ticked row clears the range;
  - rows a search hides are not ticked;
  - with a handed-in `selection` the range reaches the application's state;
  - Shift+Space on a checkbox and in grid mode selects the range;
  - without an anchor a Shift-click toggles one row;
  - a Shift-click on a checkbox chooses no current row.
- [ ] `types.test-d.tsx`: a hand-built `TableSelection` without `set` is a type error.
- [ ] A browser test in Chromium and WebKit: a Shift-click range leaves no text marked.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog notes the range under Added, and `set` under Changed as the one member a hand-built
      `TableSelection` must add.
