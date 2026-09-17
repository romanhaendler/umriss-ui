# 02 — View state to and from a query string

Status: done

Spec: `.scratch/table-surface/spec.md`

## Scope

One pure pair of functions: view state to query string, query string to view
state. Covers the search term, the sort levels, the page, the page size, the
hidden columns and the column order.

The parsing direction is **total**. Unknown keys are ignored. Malformed values
fall back to defaults. A page beyond the range is clamped. A sort naming a column
that does not exist is dropped. A hidden-column list naming columns that no
longer exist drops those names. A malformed query string never throws.

The stateful companion takes an optional adapter so the application decides how
and when the address bar is written. The library does not depend on a router and
does not touch browser history itself.

## Acceptance

- Round-trip tests for a fully populated view state and for an empty one.
- Tolerance tests for every degradation listed above.
- Demo: the table tile reflects its view state in the address bar and restores
  from it on load.

## Notes

This is the item worth doing even if everything else in the spec slips. It is
small, pure, testable in isolation, and it converts a table from something a
person has in front of them into something they can hand to a colleague. Nothing
else here changes what the product can do by as much for as little.

Keep the encoding readable. A query string a human can glance at and understand
is one they can also hand-edit and report bugs about; an opaque encoded blob is
not.
