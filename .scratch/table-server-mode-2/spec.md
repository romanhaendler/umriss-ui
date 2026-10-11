# The server mode, worked out: a late answer, all that match, the export, the sums

Status: ready-for-agent
Date:   2026-10-11
Origin: grilling of 2026-10-04 (Q26): the maintainer wants the server mode worked out properly, after `.scratch/component-view/`. Session of 2026-10-11 (`.scratch/open-points-roadmap/spec.md`, rows T1-T4): the research is in `docs/research/open-points-2026-10/server_mode.md`; the decisions below are the maintainer's and are carried out here, not argued again.

## Problem Statement

The server mode (`.scratch/table-server-mode/`, done) shows one page a server
answered, and trusts the application to hand back the right one. Four things
follow that nobody can fix from outside.

- **A late answer is shown as the answer.** The table reports a request and
  shows whatever `rows` arrive next. A user types "ab", then "abc"; the answer
  to "abc" comes first and the one to "ab" after it: the search field says
  "abc", the rows are those of "ab", and nothing says so. The table has no
  error either - a failed fetch leaves the old page standing, as if current.
  This is a fault, not a missing feature.
- **"Select all" selects the page.** A user who wants to delete 12,400
  matches ticks 50 and is told, rightly, that this is the page.
- **The export writes the page** and says so - honest, and useless for the one
  thing an export is for.
- **There is no footer**, because a sum over one page would be called the sum.

The other grids differ. AG Grid's server-side model keeps `{selectAll,
toggledNodes}`, MUI X selects with an exclude model and has
`onDataSourceError`, AG Grid has `fail()`; none has a contract for exporting
beyond the page (MUI: load everything first). umriss decides all four.

## Solution

Four pieces, built in this order.

1. **A late answer and an error (T1).** The application says which request its
   rows answer: `answers={request}`. While that is not the table's current
   request the table is loading. `error="message"` shows the message in place
   of the rows, with "Try again", which reports the same request once more.
2. **Selecting all that match (T2).** With the page ticked, a line offers
   "Select all 12,400 that match". The selection is then a state - all that
   match, except these - and a bulk action receives `{ request, except }`
   instead of rows.
3. **Exporting all that match (T3).** `exportRows(request)` returns a promise of
   every match; the table writes the file in its own columns. Without it the
   button stays "Export page".
4. **Sums from the server (T4).** `totals`, handed in beside the rows, fill the
   footer's aggregates over every match.

Nothing changes for an application that passes none of the new props, except
the type of a server-mode bulk action's argument (below).

## User Stories

1. As a developer, I say which request my rows answer, so that the table never
   shows the answer to "ab" under a search field that says "abc".
2. As a developer who passes no `answers`, I see the table behave as it did.
3. As a user, I see the previous rows dimmed while the answer to my newest
   request is out, and never a page of the wrong request as current.
4. As a developer, I hand in a message when my fetch failed, and the user sees
   it where the rows were.
5. As a user, I press "Try again" and the same request goes out once more.
6. As a screen-reader user, I hear that the fetch failed, and reach "Try
   again" by Tab.
7. As a user, after ticking a page I am offered "Select all 12,400 that match".
8. As a user, I untick a row and "12,399 selected" stands in the toolbar.
9. As a user, I change the search and the selection is gone, not silently
   applied to another set.
10. As a developer, a bulk action's type tells me whether it got rows or "all
    that match, except these", and I cannot ignore the second.
11. As a developer who holds the selection outside, I can store and restore
    the state.
12. As a user, I export every match, I see that it is working, and why it
    failed if it did.
13. As a developer, I refuse an export of two million rows with a message the
    user reads.
14. As a user, I read a column's sum over all matches, and nothing misstated
    while the sums are on their way.
15. As a developer, I give only the sums I have; the other cells say they are
    absent.

## Implementation Decisions

### The ADR

The first ticket writes the ADR for the server mode's contract (no number: the
next free number at the time): the request goes out and is answered; `answers`
names the answered request; `error` is the answer's failure; the selection of
all that match is a state in the request's terms; the export asks the
application for the matches; the totals come with the rows. It cites ADR-0023
(components report, the application decides) and the research. Its reasons
against a pull contract (`getRows`), a request id of the table's own and a
cache are the "Out of Scope" below.

### A late answer and an error (T1)

- **What `answers` is compared with.** `answers?: TableRequest`, an option of
  server mode, compared by `requestKey` with the table's *current* request -
  the one `onRequest` was last called with or is about to be (the object the
  report is made from; the snapshot gains `request`). Equal: the rows are the
  current answer. Different: they answer an older request.
- **What the table shows then.** Exactly what `loading` shows over rows already
  there: the previous rows dimmed after a moment, no pointer on them,
  `aria-busy`, column widths kept; skeleton rows where there are none. The
  search field, the conditions and the page number show the *new* request at
  once; the count and the pager read the old `rowCount` until the answer
  comes. Busy = `loading || answers is not the current request`.
- **A caller who passes no `answers`.** Nothing changes: the rows are taken as
  the current answer. DEV does not warn for the omission - it would punish
  every working caller. It warns once when `answers` is passed and has matched
  none of the requests the table reported (a shape that can never be equal,
  e.g. conditions rebuilt in another form): the table would be loading for
  ever.
- **What `error` accepts.** `error?: string`, a message the application wrote.
  Shown in place of the rows: header, toolbar and pager stay; the body holds the
  message and a "Try again" button, in the height of a page. With `answers`
  passed, the error is read as the failure of *that* request and shown only
  while it is the current one - a late failure of "ab" does not hide the rows
  of "abc". Without `answers` it shows as soon as it is set. The caller clears
  it, usually in `onRequest`. `error` wins over `loading`.
- **"Try again"** calls `onRequest(request)` with the current request directly,
  past the dedupe of `requestKey` (which stays: Strict Mode must not fetch
  twice). The table clears nothing; the application sets `error` and `loading`
  as it sees fit.
- **What a screen reader hears.** The message in a `role="alert"` when it
  appears; "Try again" is a button in the tab order the table does not focus.
  Loading stays as today (`aria-busy`); a new answer is heard through the
  toolbar's count, a status region.
- **Words.** One new required key: `tryAgain`. The message is the application's
  and is not translated by the table.

### Selecting all that match (T2)

- **The state.** `TableSelection` gains `allMatching: boolean`, `except:
  ReadonlySet<T>` and `selectMatching(): void`. While `allMatching`,
  `isSelected(id)` is `!except.has(id)`, `selected` is empty, and `count`
  still counts the keys in `selected` (so 0). With it false, every member
  behaves as before.
- **The offer.** A status line between toolbar and header, in the table's
  frame; server mode with a selection column only, when every row of the page
  is ticked and `rowCount` exceeds the page: "All 50 on this page are
  selected. Select all 12,400 that match" - the second sentence a button. When
  active: "All 12,400 that match are selected." with "Clear selection" (a key
  that exists). Role `status`, so it is said.
- **Unticking a row** while the state stands puts its key into `except`; ticking
  it again takes it out. The header checkbox is checked with no exceptions,
  indeterminate with some; pressing it clears the whole state.
- **A change of search or conditions** clears the selection - state and keys -
  because the exceptions were relative to another set. A change of sort, page
  or page size keeps it: the set is the same. The table calls
  `selection.clear()` after the commit, so this holds for a selection kept
  outside.
- **The bulk action's argument.** In automatic mode as today, `readonly Z[]`. In
  server mode a bulk `Action`'s `onSelect` is `(selected: readonly Z[] |
  AllMatching) => void`, `AllMatching = { request: TableRequest; except:
  readonly string[] }` (the current request, the keys); `Array.isArray`
  narrows. `useTable`'s return type carries the mode, so an automatic table's
  types do not change. With the state off, rows are handed over as before.
- **The count.** The toolbar says `rowCount - except.size` through the existing
  `selectedCount`; the bulk actions show for any count above 0.
- **Held outside.** `useTableSelection` builds the new members. A caller who
  hand-built a `TableSelection` must add them (required in the type); one who
  stores the selection stores `allMatching` and `except` with the keys. In
  automatic mode the table ignores `allMatching` and warns in DEV.

### Exporting all that match (T3)

- `exportRows?: (request: TableRequest) => Promise<readonly Z[]>`, server mode.
  The table hands over the current request unchanged; the application ignores
  `page` and `pageSize` and keeps the request's sort.
- **The button.** With it `Export` says `exportLabel` ("Export"), without it
  `exportPageLabel` ("Export page"), as today. One button, not two.
- **While it runs.** The button is disabled with `aria-busy`, and a status says
  "Preparing the export" (new key `exporting`). A second click is ignored. The
  file is written for the request of the click, even if the table has moved on.
- **Refusal and failure.** A rejected promise shows its `Error.message` (or a
  new key `exportFailed` when it has none) beside the button in a
  `role="alert"`, until the next click. No cap by the library.
- **The file.** The visible columns in their order, the export's values,
  written from the returned rows by the function that writes `asCsv`. The
  format is whatever `Export` is handed; `.scratch/table-xlsx/` and
  `.scratch/table-export-by-language/` are written by others and do not block.

### Sums from the server (T4)

- `totals?: Readonly<Record<string, unknown>>`, server mode, by column id: the
  value of the column's declared `aggregate` over every match. Handed in beside
  `rows` and bound to them - they are current when `answers` is.
- **Kinds.** Every kind a column can declare (`sum`, `avg`, `min`, `max`,
  `range`, `count`, `distinct`, and an aggregate of one's own): the server
  computes, the table formats with the column's format and the signs and words
  of the automatic footer. A `range` is `[min, max]`.
- **Shown** when `totals` is passed and some column declares an `aggregate` -
  the declaration decides the cells, as ever. A cell whose key is missing shows
  the absent value. While busy (loading or a late answer) the cells are
  skeleton, never the old values. Each carries, hidden, "all matches" (new key
  `footerOfMatches`). Without `totals` no footer, as today.

## Testing Decisions

- Pure tests of what is compared: `answers` against the request by key; an error
  read only for its request; `except` arithmetic; the clearing rules.
- Component tests in the manner of `serverMode.test.tsx`: out-of-order answers
  (the point of T1: "abc" answered before "ab" leaves the table loading, and the
  rows of "ab" arriving later never show as current); a retry past the dedupe;
  the offer line only for a ticked page with `rowCount` beyond it; a bulk
  action's argument per state; a rejected `exportRows`; footer cells in skeleton
  and in value.
- Type tests (`types.test-d.tsx`): `AllMatching` appears in server mode only.
- Accessibility: the alert, the status lines, the tab order, in the real
  browser tests.
- Visual: the error body, the offer line, the busy export, the footer skeleton.
- Prior art: `serverMode.test.tsx`, `serverModel.test.ts`,
  `useTableSelection.test.ts`.

## Out of Scope

- **Groups from the server** - the next piece, with its own spec and grilling.
- **Loading on scroll**, **tree rows from the server**, **a cache** - they wait
  for a case.
- An abort, or a request id of the table's own: `answers` is the id.
- Exporting the selection; the exceptions as rows.

## Decided while writing

- A retry bypasses the dedupe by calling `onRequest` directly.
- The error is read for the request `answers` names; without `answers`, at once.
- DEV warns only when an `answers` has matched no reported request.
- The snapshot gains `request` (server mode; `null` otherwise).
- A change of search or conditions clears the all-matching state and the keys.
- `count` stays the number of explicit keys; the toolbar derives the rest.
- `AllMatching = { request, except }`, narrowed by `Array.isArray`.
- One export button; with `exportRows` it exports all, labelled "Export".
- A click on a running export is ignored; its file belongs to the click's request.
- `totals` by column id, `range` as `[min, max]`; stale cells are skeleton.
- New wording keys: `tryAgain`, `exporting`, `exportFailed`, the offer line's two sentences and its active form, `footerOfMatches`.

## Glossary: what `CONTEXT.md` should gain or change

- **Answers** (new): the request a server mode's rows are the answer to, named by the application so that the table knows when they are late.
- **Late answer** (new): rows for a request older than the table's current one; the table is loading, not showing them as current.
- **All that match** (new): the selection as a state - every row the server's filtered set holds, except the **Exceptions** - for the request it was made under.
- **Exceptions** (new): the keys of rows unticked while all that match are selected.
- **Totals** (new): the aggregates of a server mode's columns over every match, handed in beside the rows.
- **Server mode** (change): select all, the export and the footer no longer "act on the page and say so" where `exportRows` and `totals` are given, and select all can reach every match.
- **Request** (change): the table's current one is what `answers` is compared with and what a bulk action and the export receive.

## Comments
