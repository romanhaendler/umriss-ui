# 01 - The text of the selection

Status: done
Type: task
Size: M

Blocked by: `.scratch/table-export-by-language/issues/01-conventions-from-formats-and-wording.md`
Spec: `.scratch/table-copy-rows/spec.md`

## What to build

The text a copy writes, and the function that hands it over - no key yet.

- `packages/table/src/model/csv.ts` (or a sibling `model/tabbed.ts` if the file grows past its purpose): a writer for tab-separated text taking the same `CsvConventions` minus the separator: `\t`, `\n`, no BOM, no trailing line break, a field holding a tab, line break or `"` quoted with doubled quotes. Numbers use the conventions' decimal mark, booleans the yes/no words, dates ISO.
- `packages/table/src/export.ts`: `selectionText(registry, formats, wording)` - the visible columns as `csvOf` filters them (share the column list; do not copy it), the selected rows within the filtered set in the export's order (`hook.selectedRows`, else the filtered rows whose key is selected), no Level column, no group rows.
- `TableSnapshot.selectionAsText(): string` in `types.ts` and `useTable.tsx`; `""` with no selection. Documented as "the text Ctrl+C writes".
- Core `wording.ts` and `de.ts`: `copiedRows(count, formatted)`, `copiedCell`, `copyFailed`; the count formatted as `selectedCount`'s is.

## Acceptance

- [ ] Selected rows come out header first, in the screen's column order, hidden columns absent, pinned blocks in shown order.
- [ ] Values equal the CSV's; the decimal mark follows the formats (point in English, comma in German).
- [ ] A selected tree branch and its unselected children: only the branch; closed branches count; no Level column.
- [ ] A selected row outside the filter is not written; no group line is written.
- [ ] Fields with tab, newline and quote are quoted.
- [ ] Three wording keys in English and German; wording completeness test passes.
- [ ] Unit tests of the writer; a mounted test of `selectionAsText()`.

## Comments

Delivered 2026-10-11. `asTabbed` in `model/csv.ts` shares the column and quoting code with `asCsv`; `selectionText`, `selectedInOrder` and `cellText` in `export.ts`; `selectionAsText()` on the snapshot; wording keys `copiedRows`, `copiedCell`, `copyFailed` in English and German (`copiedRows` says "1 row copied" for one). Tests in `copyRows.test.tsx`.
