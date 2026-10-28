# P22 Tobias (data-grid specialist, new) - 2026-10-28, 0.48.0
Host: p22-table-critic (Vite 8, React 19, TS strict; core/table; Chromium dev + prod build). Pages big (100k), wide (150 cols), edit (grid), grp, state, srv; src/Types.tsx. matrix.md: ~90 features, V/D/-.
Not covered: WebKit, visual bar, mobile, editMode="row"/onRowAdd/onRowDelete, RowActions, VerdictColumn, streaming under scroll, server+virtual run, axe.

Findings (unverified until ✓):
1. Break: virtual table scrolled deep goes blank when Search shrinks the result (100k -> 1,111 "Item 99"): scrollTop ~3.58M, scrollHeight ~3.59M, 0 rows in DOM; height drops ~8.6k px / 500 ms; wheel up doesn't fix. Also from scrollTop 200000. node check1c.mjs (dev), check1cp.mjs (prod, preview 4371). shots/search-after-scroll.png. README claims window stays on same rows for changed rows; filter case not covered.
2. Misfit: no column virtualisation (150 th, 150 td per row). check1.mjs.
3. Misfit: grid mode - paste, Delete, Ctrl+Z, Shift+Arrow do nothing, no hint; Ctrl+C works (suggests Ctrl+V). check4.mjs. Idea: onCellEdit on paste/Delete keeps "report, don't apply".
4. Trap: dev mode ~10x slower than capabilities figures (sort 100k: 3530 ms dev vs 332 ms prod). Idea: one README sentence.
5. Minor: pageSize without Pagination dev warning fires 3x (once per render).

Wishes, ranked by real-app need:
- range selection + copy range: never ADR-0032; Instead (rows + selectionAsText) holds for rows, fails for column blocks.
- paste from Excel, Delete to clear, fill handle: paste open (ADR-0032 ties clipboard to ranges), Delete/fill unlisted.
- undo/redo: never ADR-0032; Instead (app history via onCellEdit, ~15 lines) holds.
- text filter with operators (contains/starts/equals, AND/OR): unlisted; columnFilter workaround 5 lines + own UI.
- infinite scroll / block cache server rows: not yet (server groups next), infinite unlisted.
- column groups / header bands: unlisted.
- auto-size and flex widths: unlisted (flex is a type error).
- context menu row/cell: unlisted (RowActions per row).
- header drag reorder: never ADR-0032; Instead ColumnMenu holds but drag in header does nothing - discoverability gap.
- pivot: never ADR-0032 (amended); Instead holds for known keys, fails for runtime-chosen dimension.
- styled Excel (styles, group rows, formulas, sheets), print: not yet ADR-0073; print unlisted. xlsx plain works.
- pinned top/bottom rows, status bar, side bar: unlisted.
- row drag, cell merge, formulas, integrated charts, RTL: unlisted; RTL never ADR-0032, Instead fails.

Held up: 100k prod sort 183-332 ms, search 66 ms, select all 34 ms, 20 rows in DOM; multi-sort Shift-click numbered + aria-sort; list/range filters, Search, view/initialView JSON restore; 2-level grouping with aggregates, share bars, tree, RowDetail; grid keyboard (one tab stop, arrows, Home/End, Ctrl+Home, PageDown, type-over, Enter, validate); shift-click row range; resize drag; locale CSV; small xlsx; server mode + precise dev warnings; strong types.

Verdict: enough for read-heavy data-dense screens (ops/monitoring, admin lists, audit, report viewers with grouping/totals/filters/CSV, light editing). Not for spreadsheet-like tools (paste blocks, fill, undo, ranges, styled Excel), BI pivots, very wide grids, infinite server feeds, RTL. Fix blank-after-search before a log viewer.

Verified by coordinator: 1 ✓ reproduced (prod: [190768,191268,0] -> after wheel [163480,163980,0]). Root cause core/src/lib/virtual.ts:69-80 visibleWindow does not clamp firstVisible to count: stale scrollTop beyond the shrunken list gives from>to (0 rows) and before=from*rowHeight keeps the old scroll height alive, so the browser never clamps scrollTop. Shared useVirtual -> also TreeView, MultiSelect, listbox. Fix in the one shared function.
