# The table over data the browser does not hold

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

An alarm archive or a batch history with millions of rows does not fit in the
browser. Every grid of the comparison offers a server-side model (TanStack's
manual mode for free, MUI's data source, AG Grid's SSRM in Enterprise); umriss's
table expects all rows. Its view state is already one object - the right seam.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| M1 | Shape | Manual mode: `<Table rows={page} rowCount={total} manual onViewChange={view => …}>`. Sorting, filters, search and the page go out as the view object; rows and the total come in. The table does no sorting, filtering or paging of its own in manual mode. |
| M2 | Loading | `loading` shows the existing skeleton rows over the previous page (no jump), with `aria-busy`. |
| M3 | Grouping | Not in manual mode in this spec: a grouped server model needs group rows and aggregates from the server - a later spec if a caller asks. `groupable` is ignored with a DEV warning. |
| M4 | List filters | A list filter's values come from `filterOptions(columnId)` the caller provides; the table cannot count what it does not hold. |
| M5 | Selection | Keys of rows not on the page stay selected; "select all" in manual mode selects the page and says so. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | Manual mode in the model | M |
| 02 | Loading, list filters, selection | M |
| 03 | A fake server example | S |

## Testing

The model's manual mode as pure tests; interaction tests against a fake
server with delays.

## Out of scope

Grouping over a server model (M3); infinite scroll (paging only).
