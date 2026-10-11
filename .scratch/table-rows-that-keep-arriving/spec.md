# A table under rows that change every second

Status: done
Date:   2026-10-11
Origin: session of 2026-10-11 (`.scratch/open-points-roadmap/spec.md`, row X3); the facts are in `docs/research/open-points-2026-10/five_topics.md`, section 1 ("Streaming / live").

## Problem Statement

A table on a plant's status, a queue or a list of orders is handed `rows` that
change every second: values move, a row appears, one goes, the order a sort
asks for shifts. Nothing says what then holds. `useChart` reads whatever rows
it is given (ADR-0052) and the table does the same, but a table has state a
chart has not - a sort, a scroll position, a selection, an open Row draft, an
active cell - and a reader cannot tell from the documents whether a draft
survives the second tick or the row under the cursor jumps.

The maintainer decided: no new API (X3). The table already reads its rows as
they come; what is missing is a proof, and a sentence.

## Solution

A test that renders a table over rows that change on a clock, and a sentence in
the table's documents that says what holds. A fault the test finds is not
fixed in the test's ticket: it becomes a ticket of its own.

## What already holds, and what is unknown

From the code (`packages/table/src`), unproved by a test of this kind:

- **Selection** is held by `rowKey`. Automatic mode keeps keys; a key whose row is
  gone stays in the set until cleared (to be confirmed: what `count` says).
- **A Row draft** is closed when its row is gone from `rows` (`parts.tsx`, ADR-0036);
  a draft that is open while its row changes values: unknown.
- **The active cell** is remembered by key and, where the key is gone, "the cell
  now at that index takes over" (`grid.tsx`, top comment). Whether a re-sort
  under it moves the focus to another row: unknown.
- **Rows are keyed** by `rowKey` in the markup, so a row keeps its DOM across
  ticks; whether a cell being edited keeps its input and caret: unknown.
- **The sort** is a view state, applied again to every new `rows`; a row that moves
  because its value changed will jump. Whether the FLIP motion of `motion.ts`
  (made for grouping and folds) also runs for a re-sort: unknown.
- **The scroll position** of a plain table and of a `virtual` one under rows that
  are replaced as a new array every second: unknown; a `virtual` table measures
  the pitch itself (ADR-0042).
- **`preFilter`** may change in the call and the page is clamped (research).
- **Cost**: the benchmark of the charts has a live mode; the table has none.

## User Stories

1. As a developer, I know from the documents that selection, sort and a draft
   survive a tick, or which of them does not.
2. As a user, I do not lose the row I am typing in because the list refreshed.
3. As a user scrolling a long list, I am not thrown to the top by a tick.
4. As a maintainer, a faulty case found by the test is its own ticket.

## Implementation Decisions

- **No API, no option, no code in the table** in this spec. Tests and a sentence.
- **The test** (`tests-unit/rowsThatKeepArriving.test.tsx`, jsdom, fake timers) renders
  a table with a `rowKey` over rows that are a new array each second: values
  change, a row is added, one removed, one moves under the sort. It asserts, per
  state, what must hold:
  - sort: the same sort stays; rows stand in the new order;
  - scroll position (a scrollable table, and `virtual` with a stand-in scroller):
    unchanged when the tick adds or removes a row below the window;
  - virtualisation: the window shows the same rows by key, and the filler heights follow the count;
  - selection: a ticked row stays ticked as its values change; what the count says
    when a ticked row goes;
  - an open Row draft: stays open and keeps what was typed while its row's values
    change; closes only when the row is gone;
  - an active cell: stays on the same row by key while a re-sort moves it, and
    where its row is gone takes the documented neighbour.
  What the test cannot show in jsdom (real scroll, focus under motion) is
  named and goes to a browser test in `tests-visual` or the real-browser suite.
- **The sentence** goes in the table's README and the capability record, in the
  words of what the test proved: "Rows may change every second; the sort, the
  selection by key, ... hold; ...".
- **A fault found** is written as `.scratch/table-rows-that-keep-arriving/issues/NN-<what>.md`,
  `Status: ready-for-agent`, with the failing test kept and marked as known,
  and is not fixed inside ticket 01. The test of a known fault is kept skipped with a
  pointer to its ticket, so that the sentence says nothing false.

## Testing Decisions

The ticket is the test. Prior art: `tests-unit/serverMode.test.tsx` for the clock
and the answers, `rowEditing.test.tsx` for the draft, `gridMode.test.tsx` for the
active cell, `rowPitch.test.tsx` for the virtual window.

## Out of Scope

- Any API for appending, windows, or throttling; fetching or polling (the application's).
- A cost budget or an update-rate recommendation; the benchmark is the charts'.
- Server mode (a late answer is its own spec: `.scratch/table-server-mode-2/`).
- Grouping and tree rows under changing rows, unless the first test shows a cheap
  case; they are named in the sentence as not proved.

## Decided while writing

- The fault found becomes its own ticket, in this directory, the test skipped with a pointer.
- jsdom first; a real-browser case only for scroll and focus that jsdom cannot show.
- Grouping and tree rows are named as not proved, not tested.

## Comments

Delivered by `issues/01` and `issues/02`. The test found no fault, so no ticket of a fault was produced and none is open. Open: a live example for the four `fixme` browser cases of `tests-visual/rows-that-keep-arriving.spec.ts`; the FLIP motion under a re-sort is not asserted.
