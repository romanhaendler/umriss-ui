# The server mode asks and is answered; the application names the answer

Status: accepted
Date:   2026-10

The server mode shows one page a server answered and trusts the application to
hand back the right one. Four faults follow that nobody can mend from outside: a
late answer is shown as current, "select all" selects the page, the export writes
the page, and a sum over one page would be called the sum. The table never holds
the rows, so it cannot mend them; it can only say what it asked and be told what
was answered. Like ADR-0023, the component reports and the application decides.

**The request goes out and is answered.** `onRequest(request)` reports what the
table needs; the rows that arrive are the application's answer, and the table
holds no copy, cache or id of its own.

- **`answers` names the answered request.** `answers?: TableRequest` is compared by
  `requestKey` with the table's current request, which the snapshot carries as
  `request`. Not equal: the table is busy as `loading` makes it, and the older rows
  never stand as current; the search, the conditions and the page already show
  the new request. Without `answers` the rows are taken as current and nothing is
  warned; with it, development warns once when it has matched none of the
  requests reported - a shape that can never be equal.
- **`error` is the answer's failure.** A message the application wrote, shown in
  place of the rows with "Try again", which reports the current request once
  more, past the dedupe. With `answers` the error belongs to that request and
  shows only while it is the current one.
- **The selection of all that match is a state in the request's terms:** all that
  match, except these keys, for the request it was made under. A change of search
  or conditions clears it; a bulk action receives `{ request, except }` instead of
  rows, and its type says which.
- **The export asks the application for the matches.** `exportRows(request)`
  returns a promise of every match; the table writes the file in its own columns.
  The library sets no cap; a refusal is a rejected promise whose message the user
  reads.
- **The totals come with the rows.** `totals`, by column id, fill the footer over
  every match; while the rows are late the cells are skeleton, never the old values.

## Considered Options

- **A pull contract (`getRows`), as AG Grid's server-side model has it.** Rejected:
  the table would own fetching, retry, abort and ordering, and every application
  with its own data layer would wrap it in a second one.
- **A request id of the table's own.** Rejected: the application would have to echo
  an opaque value; the request already is the id, and an application that
  keeps its request keeps the proof.
- **A cache of answered pages.** Rejected until a case needs it: what is stale,
  and for how long, is the application's knowledge.
- **Loading everything before exporting, as MUI X does.** Rejected: the table would
  fetch, or hold, what only the server can serve.

## Consequences

An application that passes none of the new props sees no change, apart from the
type of a server-mode bulk action's argument. An application that passes
`answers` and builds it in another shape than it was given is busy for ever, and is
told so in development. Research: `docs/research/open-points-2026-10/server_mode.md`.

*Amended 2026-10-30 (ADR-0080):* in a filled frame the page is the fitted page. The first request waits for the first measurement and carries it, and a resize sends one request once the size has held 300 ms; until the answer the rows stay, new slots show placeholders and surplus rows leave.
