# Shakedown: @umriss-ui/table 0.40.4

Status: needs-triage

A Vite 8 host (TS strict, `skipLibCheck:false`) with core and table from the packed tarballs, Chromium
(WebKit only launch-checked), axe, react-hook-form, 2026-10-24. Not run: a production build. Build, server
and test findings that touch the table (hydration across time zones, functions across the server boundary,
Jest and `import.meta`, happy-dom crash) are in `cross-package.md`.

## Findings

1. ✓ ~~**[Break, security] CSV export does not neutralise formula injection.**~~ `field()` in
   `src/model/csv.ts:50` quotes only for separators, quotes and line breaks; cells starting with `=`, `+`,
   `-`, `@` are written raw (`=1+1`, `+SUM(A1)`, `@SUM(1)`, `"=HYPERLINK(""http://evil"")"`). Any app that
   exports user-entered text and has it opened in Excel is exposed. ADR-0061 does not mention it. Idea:
   prefix `'` (or a tab) for text cells that start with those characters, leave numbers alone; check the
   XLSX export (`.scratch/table-xlsx/`) the same way. **Fixed 2026-10-24** (spec `.scratch/shakedown-defects/`).
2. **[Misfit] `virtual` without `maxHeight` silently renders every row:** 20,000 rows give 20,002 `tr`
   and 371k nodes in 9.5 s; 100,000 crash the tab. A fixed-height flex parent does not count as a scroll
   area. Documented ("a virtualised table needs it"), but no dev warning and no recipe for a flexible parent.
3. **[Misfit] `stickyHeader` sticks only inside the table's own frame**, never to the page: under a 64 px
   sticky app bar the head scrolls away; no offset token.
4. **[Misfit] Ghost selection when row ids change on every fetch:** after four re-fetches
   `selection.count` is 4 while no checkbox is checked. The README says the count "follows the rows there
   are"; the hook's `count` contradicts it.
5. **[Misfit] Search sends one `onRequest` per keystroke in server mode** (7 characters, 7 requests).
6. **[Misfit] After a failed server request the pager says 2/100** while the rows shown are still page 1;
   no way to roll back the requested page.
7. **[Misfit] Numbers given as strings sort as text** ("10","9","2","100","1","-3" → -3, 1, 10, 100, 2, 9).
   `sortValue` exists; idea: a Collator with `numeric: true`.
8. **[Look] Print shows the toolbar, search field and paging bar**, and only the current page.
9. **[Trap] Beginner mistakes give white screens with raw errors, or silence** (Vite JavaScript template):
    no `rowKey` → `reading 'initialView'`; `rows={undefined}` while loading → `reading 'filter'`; an object
    instead of an array → `e.filter is not a function`; a column naming a field that does not exist → "— No
    value" in every cell, no message; amounts as "12,50" and dates as "24.10.2026" → left-aligned text,
    wrong sort; rows without ids → React's key error that never names `rowKey`. The calculation's messages
    ("name the thing and say what to write") are the bar.
10. **[Misfit] CSV dates are ISO UTC** even with German conventions (documented, ADR-0061): for a Berlin
    user's 3 September the file says `2026-09-02T22:00:00.000Z`, a day off when read as a date, and Excel
    reads it as text. `1e21` exports as `1e+21`.

## Wishes

- **Shift-click range selection of rows.** Gave up (Shift-click checks two boxes). About 15 lines with a
  capture handler and controlled `selection`. Elsewhere: AG Grid, MUI DataGrid. Unlisted: ADR-0032 rules
  out cell ranges, not row ranges.
- **A sticky-header offset below an app bar.** Workaround: `maxHeight`. Elsewhere: MUI `stickyHeader` with
  a theme offset. Unlisted.
- **Injection-safe export and a date format option for CSV.** Workaround: `exportValue` per column (not
  built). Elsewhere: AG Grid `processCellCallback`. Unlisted.
- **Drag reorder of columns; debounced server search.** Workaround: ColumnMenu move buttons; none for the
  debounce. Elsewhere: AG Grid, TanStack with dnd-kit, MUI DataGrid `filterDebounceMs`. Unlisted.
- No "never" item was reached for (pivot, cell ranges, undo).

## Held up

0 and 1 rows clean · 100,000 rows with `virtual` and `maxHeight`: first render about 0.6 s, sort 65 ms,
search 156 ms, 22 rows and about 440 DOM nodes; grouped the same; paged 289 nodes · German sorting through
the language's Collator (ä beside a, ß with ss), emoji/Hebrew/Arabic fine, nulls last both ways · `lang=de`:
`;`, decimal comma, ja/nein, `tabelle.csv`, BOM · new row arrays every 500 ms keep selection, scroll, an
open ColumnMenu and the search focus · CSV quoting of commas, quotes, CR/LF and `;` correct · server paging
past the end and a shrinking total clamp · no page overflow in a flex child, an `overflow:hidden` card, a
Modal, a Drawer, at 375 px or with 40 columns; dark fine · axe clean in basic and grid mode · grid arrows,
Home, End, Ctrl+Home; the ColumnMenu fully keyboard-reachable, Escape returns focus; search announces
"11 of 30" · URL round trip with `initialView`/`onViewChange` · react-hook-form works.
