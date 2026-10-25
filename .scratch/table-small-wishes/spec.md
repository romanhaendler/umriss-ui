# The table's small wishes: row ranges, a column drag, a named aggregate, a view that survives JSON

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "The table's and the schedule's single wishes"
(`.scratch/after-shakedown/issues/23-the-tables-and-the-schedules-single-wishes.md`, the table's half; its
Answer holds every decision below that is not marked *(agent)*); findings `.scratch/shakedown/table.md` 3
and its wishes, `reports-bi.md` (conditional formatting, bookmarks), `audit-family.md` 6; `wishes.md`
section 3; ADR-0017, ADR-0032, ADR-0045, ADR-0047, ADR-0050. The debounce of server search and the CSV's
day-only dates are tickets in `.scratch/table-server-mode-2/` and `.scratch/table-xlsx/`, not here.

## Problem Statement

Six wishes, each from one persona, stand between a table and the screen it is built into.

- **Shift-click checks two boxes.** A reader who ticks row 3 and Shift-clicks row 40 gets two ticked rows,
  not 38. The application cannot fix it from outside: only the table knows the order the reader sees after
  sorting and grouping. A capture handler of about 15 lines got it wrong in the shakedown.
- **Columns move one place per press.** The ColumnMenu's move buttons work, and they are the keyboard's
  route. A pointer user who wants column 12 first presses eleven times. Users of AG Grid and MUI expect to
  drag.
- **An aggregate of one's own is called "Aggregate".** A median in the footer is read out as "Aggregate 42",
  because the table has no word for a function it did not write.
- **A bookmark loses its date filter.** `t.view` holds a `Date` in a date condition. After `JSON.stringify`
  and `JSON.parse` it is a string, the range filter rejects it as foreign, and the bookmark comes back
  without its date filter. A warning is logged in development; production says nothing.
- **A sticky head scrolls away under an app bar.** The head sticks inside the table's own scroll area, never
  to the page. The persona asked for an offset token, which cannot help.
- **Conditional formatting was asked for as rules.** It already takes about three lines per column through
  `children`, but no example shows it, so a reader of the docs goes looking for a rule set.

## Solution

- **Shift-click selects a range of rows.** A Shift-click on a row's checkbox sets every row from the last
  row toggled to this one, in the order shown, to the state the clicked row takes. Shift+Space on a row's
  checkbox and in grid mode does the same from the keyboard. It works with a selection held by the
  application, because `TableSelection` learns to set several keys at once.
- **Columns are dragged in the ColumnMenu's list.** Each entry of the list gets a grip. A drag on it moves
  the column within its block, with a mouse, a pen or a finger. The move buttons stay as the keyboard's
  route. A drag on the header is never offered: the header cell already takes the sort click, the resize
  grip, the pin blocks and, on touch, the pan.
- **An aggregate of one's own takes a name.** A column names its own function with `aggregateLabel`. The
  footer shows the name before the value, and a screen reader reads it. Median and standard deviation are
  not built in. They are four lines each, and the example shows them.
- **A view survives JSON.** On the way in, through `initialView` and `setView`, a built-in condition that
  holds a point in time also accepts the ISO text that JSON writes for it. The view keeps `Date` on the way
  out. An example keeps the view in the URL.
- **The "never" items get their examples.** A head under an app bar: the page's main area below the bar is
  the table's frame, or `maxHeight`. Conditional formatting: a demo page of its own, with the four cell
  presentations. ADR-0032 gains a line for each "never" of this triage, with its *Instead*.

Nothing changes for an application that uses none of it. The one exception is a hand-built
`TableSelection`, which must add the new member (below).

## User Stories

1. As a reader, I want to Shift-click a row's checkbox to tick every row between it and the row I ticked
   last, so that I select 38 rows with two clicks.
2. As a reader, I want a Shift-click on a ticked row to clear the range, so that the same gesture takes
   rows out again.
3. As a reader of a sorted or grouped table, I want the range to follow the order I see, so that a range
   never picks rows from elsewhere in the data.
4. As a reader, I want the range to cover only rows that search and filters leave, so that a range never
   ticks a row I cannot see.
5. As a reader who pages, I want a range from a row on page 1 to a row on page 3 to cover the rows between,
   so that paging does not break the gesture.
6. As a keyboard user, I want Shift+Space on a row's checkbox, and in a grid on any cell of the row, to
   select the range, so that I reach what Shift-click reaches.
7. As a reader, I want a Shift-click to leave no text marked, so that the page does not light up between
   the two rows.
8. As a developer who holds the selection, I want Shift-click to work with my `TableSelection`, so that I
   do not choose between holding the selection and ranges.
9. As a developer who builds a `TableSelection` by hand, I want the type to tell me the one new member, so
   that the compiler finds it rather than my users.
10. As a pointer user, I want to drag a column's entry in the ColumnMenu to its new place, so that I move it
    across eleven places in one gesture.
11. As a touch user, I want to drag an entry by its grip with a finger while a swipe elsewhere still
    scrolls the list, so that a long list stays usable.
12. As a pointer user, I want the other entries to make room while I drag, so that I see where the column
    will land before I let go.
13. As a pointer user, I want Escape to cancel a drag and put the entry back, so that a slip costs nothing.
14. As a pointer user of a table with 40 columns, I want the list to scroll when I hold an entry near its
    edge, so that I can drag past what the menu shows.
15. As a keyboard user, I want the move buttons to stay as they are, so that the drag adds a route and takes
    none away.
16. As a developer, I want the drag to respect the pinned blocks as the move buttons do, so that a column
    never lands where its pin puts it back.
17. As a report developer, I want to name my own aggregate, so that the footer says "Median 42" and not
    "Aggregate 42".
18. As a screen-reader user, I want to hear the name of an own aggregate, so that I know what the number
    in the footer is.
19. As a report developer, I want an example of a median and a standard deviation, so that I copy four
    lines rather than wait for built-in kinds.
20. As a developer, I want a warning in development when I name a built-in kind, so that I learn that its
    word is the wording's.
21. As a developer, I want a view I stored as JSON to come back with its date filter, so that a bookmark
    restores what the reader saw.
22. As a developer, I want `t.view` to hold `Date`s after it came in as text, so that my code reads one type
    whatever the source of the view.
23. As a developer, I want a text column whose values look like dates to keep its conditions as text, so
    that the revival does not change what a text filter matches.
24. As a developer, I want an example that keeps the view in the URL, so that a link and the back button
    restore the table.
25. As a developer of an application with a sticky app bar, I want an example of a table whose head stays
    visible below the bar, so that I stop looking for an offset.
26. As a report developer, I want a page that shows data bars, colour scales, icons and limits through
    `children`, so that I do not look for a rule set.
27. As a developer reading ADR-0032, I want each "never" of this triage listed with its *Instead*, so that
    the record answers the request before I file it.

## Implementation Decisions

### Row ranges

- **The gesture.** A click on a row's checkbox with Shift held, or Shift+Space on it, selects the range.
  So does Shift+Space in grid mode on any cell of a row, beside the plain Space that toggles the row today.
  A plain toggle sets the anchor; a range sets it too, to the row clicked. *(agent: Shift+Space is the
  keyboard route; a keyboard-activated click does not carry Shift reliably across browsers, so the key is
  read on the key itself)*
- **The state the range takes.** Every row of the range takes the state the clicked row takes, that is the
  opposite of its state before the click. *(agent)*
- **The order and the set.** The range runs over the rows a reader reaches by paging, in reading order:
  - a flat table: the filtered set in its sort;
  - a grouped table: the rows among the group lines; a folded group's rows are not part of it;
  - tree rows: the rows the flattening shows; a closed branch's children are not part of it;
  - server mode: the rows of the page the table holds.

  Rows on other pages are part of it. *(agent: "in the order shown" read as "reachable by paging", so that
  a folded group never takes rows the reader cannot see)*
- **The anchor.** The table keeps the key of the row toggled last. It is not part of `TableSelection` or of
  the view. When the anchor row is not in that set any more, or the selection was cleared, a Shift-click
  toggles one row and sets the anchor. "Select all" in the header does not set the anchor. *(agent)*
- **`TableSelection.set(ids, selected)`.** A new required member, built by `useTableSelection`. It sets
  every key in `ids` to `selected` in one state update. The table calls it for a range, and for nothing
  else. A caller who hand-built a `TableSelection` must add it; the changelog says so. In the state "all
  that match" of `.scratch/table-server-mode-2/` it takes keys out of `except` or puts them in. *(agent:
  the name `set`, required rather than optional, as server mode 2 makes its new members required)*
- **No marked text.** Shift on a pointer press in the selection column does not start a text selection.
- **The current row** of `.scratch/linked-views/` stays apart: a click on the checkbox, with or without
  Shift, chooses no current row.

### The column drag

- **The grip.** Each entry of the ColumnMenu's column list gets a grip at its inline start. The drag starts
  only on the grip, for every pointer type. The grip takes `touch-action: none`, so a finger on it drags
  and a swipe elsewhere scrolls the list. Under a coarse pointer it is at least 24 px, the floor of
  `.scratch/under-a-finger/`. *(agent: a grip rather than the whole entry, because the entry's label ticks
  its checkbox and its buttons move and pin)*
- **The grip is not focusable** and is hidden from the accessibility tree. The keyboard and the screen
  reader keep the move buttons, which are unchanged. *(agent)*
- **The drag.** The entry follows the pointer on the vertical axis. The other entries of its block make
  room. The drop place is clamped to the entry's pin block, as `movable` clamps a move. A drop calls
  `setOrder` once, and a drop in its own place calls nothing. Escape, a lost pointer capture or a
  `pointercancel` puts the entry back and leaves the order alone. While a drag runs, Escape cancels the drag
  only and does not close the menu. *(agent)*
- **A long list.** While the pointer is held within the list's top or bottom edge, the list scrolls.
  *(agent)*
- **Motion.** The others' move to make room uses the motion tokens, so reduced motion turns it off.
- **Focus.** It stays where it was. A drop is not announced: the moved entry stands where the pointer left
  it. *(agent)*
- **No header drag**, and no drag in the menu's grouping section. *(agent: the grouping order keeps its own
  controls)*
- **No new wording key** and no new prop. The dashboard's drag stays its own: the table depends on core
  only.

### A named own aggregate

- **The shape.** `aggregateLabel?: string` beside `aggregate`, on every column type that takes an
  aggregate of its own, `VerdictColumn` included. *(agent: a prop beside the function rather than an object
  in `aggregate`, so that every place that tells a built-in kind from a function stays as it is)*
- **Where it shows.** In the footer, the name stands in the place of a built-in kind's sign, before the
  value, and is the word a screen reader reads. In a group header, as for the built-in kinds, no word
  stands. The totals of server mode 2's T4 use the footer's words, so the name reaches them too.
- **A built-in kind** keeps its sign and its word. A name beside it is ignored, and development warns once
  per column through the table's `warnOnce`. *(agent: typed as plain `string`; a conditional type tied to
  `aggregate` would cost the inference of `aggregate` on every column)*
- **No built-in median or standard deviation.** The example on the Aggregate page writes both: a median, and
  the sample standard deviation (n − 1). *(agent: the sample form, since the rows are a sample of the
  process)*

### A view that survives JSON

- **The rule.** On the way in, through `initialView` and `setView`, a string in the form JSON writes for a
  `Date` (that is, the output of `toISOString`) is read as that `Date`:
  - as a bound of a range condition, whatever the column, since a range bound is a number or a point in
    time and never text;
  - as a value of a list condition, only on a column whose values are points in time.

  Any other string stays as it is, and a range bound that is still text is foreign, as today. *(agent: only
  JSON's own form, no day-only `YYYY-MM-DD`, which `Date` reads as UTC midnight and which would bring back
  the day-off fault)*
- **Where.** One function reads a condition in, at the place where a condition first meets its registered
  column, so that `initialView`, which arrives before the columns register, and `setView` share it. `t.view`
  and `onViewChange` then hold the `Date`. *(agent)*
- **The comparison.** `setView` compares by content (ADR-0047), and a `Date` and its JSON text give the
  same content. A view that comes back from the URL equal to the one shown changes nothing, so no JSON
  compare is needed in the application.
- **Not changed.** `setFilter` from the application's own control takes what it is given. A row filter or a
  filter of one's own receives its condition untouched: the table does not look inside it. The charts'
  views are not part of this.
- **The example** "Keep the view in the URL", on the View page. `onViewChange` writes the view as JSON into
  a query parameter with `history.replaceState`; `initialView` reads it at mount; `popstate` calls
  `setView`. A date range filter is set in the example's start, so the round trip shows the revival. *(agent:
  a query parameter, because the demo's hash is its router)*

### The "never" examples and ADR-0032

- **A head below an app bar.** An example on the Width-and-pinning page after "Sticky parts": a pane of
  fixed height with a bar at its top and a table that fills the rest, `stickyHeader`. Its lead names both
  ways: make the main area below the bar the table's frame (a parent of definite height,
  `.scratch/views-in-their-frame/` 01), or `maxHeight="calc(100dvh - 64px)"`. It says why no offset can
  help: the head sticks in the table's own scroll area, which carries the horizontal scroll, the pinned
  blocks and the virtual window.
- **Conditional formatting.** A demo page of its own, "Conditional formatting", under Columns. Its example
  has four columns: a data bar with `Meter`, a colour scale with `color-mix` over the tokens, an icon with
  `Badge`, limits with `VerdictColumn`. Its text says that a rule set would be a second way to present a
  cell beside `children` (ADR-0017), and that a class hook is not offered (ADR-0045). *(agent: a page, as
  the proposal names it, under Columns beside Formats)*
- **ADR-0032**, under "The table", gets four dated lines, each with its *Instead*:
  - conditional formatting as rules: `children`, the new page;
  - a sticky-head offset: the frame or `maxHeight`;
  - a column drag on the header: the drag in the ColumnMenu and the move buttons;
  - built-in median and standard deviation: an aggregate of one's own with its name.

  A field-name `rowKey` and a cancel token are not listed: the first is answered by
  `.scratch/server-components/`, the second by server mode 2's ADR. *(agent)*

## Testing Decisions

- A good test acts as the reader does - a Shift-click, Shift+Space, a drag with the pointer, a reload of a
  URL - and asserts on checked boxes, the column order in the header, the footer's text and accessible
  name, and the conditions in the toolbar. It never asserts on class names or the anchor itself.
- **Pure tests:** `set` in `useTableSelection`, with and without the state "all that match"; the range over
  a flat, a grouped and a tree order; the drop place from the pointer's position, clamped to a block; the
  reading-in of a condition (a range of JSON dates, a list on a date column, a list of ISO-looking text on a
  text column, a malformed string).
- **Mounted tests in jsdom**, in the manner of `rows.test.tsx`, `columnMenuFocus.test.tsx`,
  `aggregate.test.tsx` and `initialView.test.tsx`: a Shift-click range after a sort and in a grouping, with
  a handed-in selection; Shift+Space on the checkbox and in grid mode; a drag by pointer events with the
  boxes of the entries stubbed; Escape mid-drag; the footer's name and its accessible text; a view through
  `JSON.stringify` and `JSON.parse` into `initialView` and `setView`.
- **Type tests:** `set` is required on `TableSelection`; `aggregateLabel` is accepted on every column type
  that takes an aggregate.
- **Browser tests**, Chromium and WebKit: a Shift-click marks no text; a mouse drag of an entry reorders the
  header; the URL example restores its date filter after a reload. Touch takes the same pointer path; a
  phone check by hand is listed in the drag ticket.
- **Visual:** the ColumnMenu mid-drag, and the two new examples' screenshots, looked at before they are
  accepted.
- Prior art: `useTableSelection.test.ts`, `gridMode.test.tsx`, `columnMenuFocus.test.tsx`,
  `aggregate.test.tsx`, `initialView.test.tsx`, `tableView.test.ts`, `viewKey.test.ts`, and the dashboard's
  drag tests for driving a pointer drag in the browser.

## Out of Scope

- Cell ranges, and Ctrl+A in grid mode (ADR-0032: rows, not ranges).
- A drag on the header, a drag between pinned blocks, a drag of the grouping order.
- Built-in median, standard deviation or percentile kinds.
- A rule set, a class hook or a cell class callback for conditional formatting.
- A sticky-head offset token or prop.
- A view that survives JSON in the charts or the schedule.
- The debounce and the cancel token of server search (`.scratch/table-server-mode-2/` 08), the CSV's
  day-only dates (`.scratch/table-xlsx/` 05), a field-name `rowKey`.

## Further Notes

- Ticket 01 waits for two tickets that edit what it edits: the Current row's click handling
  (`.scratch/linked-views/` 02, which asserts that a checkbox click chooses no row) and the members of
  `TableSelection` (`.scratch/table-server-mode-2/` 03).
- Ticket 03 waits for `.scratch/table-columns-from-the-data/` 02, which deletes the `footer` overload from
  the same aggregate types and adds an example to the same page.
- Ticket 04 waits for `.scratch/root-contract/` 04, which changes the ColumnMenu's props and adds it to the
  shared guard.
- Ticket 05 amends ADR-0032 after the two others that amend it (`.scratch/table-columns-from-the-data/` 02,
  `.scratch/dashboard-small-wishes/` 05), and its sticky-head example needs the frame of
  `.scratch/views-in-their-frame/` 01.
- None of this is costly to reverse, so there is no ADR. No wording key is added, so core does not rise
  with the table.

## Comments
