# 08 — Toolbar, search, column menu, export, pagination, filters

Status: done

Blocked by: 06

Spec: `.scratch/umriss-table/spec.md`

## Scope

- `Toolbar`, `Search`, `ColumnMenu`, `Export`, `Pagination` as free imports reading the table they are placed in; `of={t}` outside it.
- `ColumnMenu` as a real building block — today the demo builds one by hand with `"✓ "` prefixed to the item text — covering hiding **and reordering**, keyboard-operable. Reordering has had no user interface at all so far.
- `filter="list"` on a column and the active-filter strip with its match ratio and "clear all".
- `Export` hands text to a callback or starts a download; decide which, since the old rule was that the library returns text and the application makes the file.
- Settle the open item on empty and loading states.

## Acceptance

- Component tests: the column menu hides and reorders, and the rendered columns follow; the strip lists active conditions and removes one without the others; the export contains the filtered set in visible order.
- Keyboard: the column menu is fully operable without a pointer.

## Comments

**Delivered**: `packages/table/src/frei.tsx` (`Toolbar`, `Search`, `ColumnMenu`, `Export`, `Pagination`), `filter.tsx` (the list filter in the header and the strip of active conditions). Tests: `leiste.test.tsx` (11 cases).

- **Export decision: the building block makes the file.** Without `onExport`, `<Export filename="…" />` starts a download; with `onExport` it hands over the text and makes nothing. The old rule — the library returns text, the application makes the file — survives as `onExport` and as `t.alsCsv()`, for the applications that want more than a file.
- **Empty and loading are props of `Table`** (`empty`, `loading`). They are states of the one body, not parts placed somewhere, and a building block would need a registration that gains nothing. Empty because search or list filters leave nothing is recognised by the table itself: "Nichts passt zu Suche und Filtern" with "Alles zurücksetzen", distinct from `empty` for a table without rows.
- **`ColumnMenu`** hides and reorders: a checkbox and a pair of move buttons per column, all native controls and so operable without a pointer; the row header's checkbox is disabled. Moving keeps focus on the pressed button, or on its sibling once the column reaches the end — a moved DOM node loses focus in the browser, so focus is restored explicitly.
- The strip appears on its own when search or a list filter is active, shows "43 von 1.204" and removes one condition without the others. Filter conditions are not part of the view link (glossary: View).
- **A table without a `Pagination` does not page** — it shows the whole filtered set, and `pageSize` applies once a `Pagination` is placed. Found while re-expressing `AlarmList` (ticket 13): a table that silently stopped at its tenth row because nobody placed a pagination bar is a trap. `Pagination` renders below the table wherever it stands in the JSX (a portal), and not at all for a virtualised table.

**After review:** the export's default filename is the wording entry `exportDateiname` ("tabelle.csv") instead of a literal. `tests-unit/stilwache.test.ts` and `wortlautwache.test.ts` apply `@umriss/ui`'s stylesheet and wording guards to this package's sources (one named duration, the loading shimmer's `1.6s`, with its reason).
