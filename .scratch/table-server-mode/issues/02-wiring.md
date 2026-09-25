# 02 - Loading, list filters, selection

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/table-server-mode/spec.md`

## Scope

M2, M4, M5.

## Acceptance

- jsdom/Playwright tests; axe clean.

## Comments

- 2026-09-25: M2 - `loading` in manual mode shows as many placeholders as the page had rows (a page size before the first answer), measured to the previous rows' height and columns' widths, with `aria-busy`; without the measurement a page of placeholders was 95 px lower and the columns shifted (seen in the browser).
- M4 - a list filter offers `filterOptions(column)`; without it the page's values, with a warning in development.
- M5 - keys off the page stay selected (they always did); "select all" selects the page and is named "Select all on this page"; a bulk action receives every selected row the table has seen, kept only while selected.
- Decided beyond the spec: the export writes the page, and its button reads "Export page"; there is no footer in manual mode (its aggregates would be the page's under the filtered set's name, as M3 says of groups); `preFilter` and `virtual` are passed over with a warning; the toolbar's count is the server's ("1,204 entries"), since the total beside it would be a second request; the empty body offers the way back when a search or condition finds nothing. Grid mode needed nothing: the Active cell stands at the same place on the next page.
- New wording in core: `selectAllOnPage`, `exportPageLabel`; `pageOfPages` now groups its numbers ("Page 1 of 100,000").
- Tests: `manualMode.test.tsx` (jsdom), `features-server.spec.ts` (Playwright); axe green on the table page with the new example.
- Review (code-review against `main`): fixed - the example's loading could stay on when a view went back to the one on screen before its successor was answered; `pageOfPages` now takes the numbers in the provider's formats (an optional third argument) instead of formatting them itself; the view key is one pure function (`manualViewKey`, unit-tested); a column's `groupable` warns in manual mode as the table's does. Left, knowingly: a total of 0 means "not known yet" as well as "none", so a page beyond an emptied result is not clamped until the next condition resets it to one; a condition of one's own holding a `Set` or `Map` compares as JSON and would not be reported; the kept selected rows are written during render, idempotently, as the registry's writes are.
