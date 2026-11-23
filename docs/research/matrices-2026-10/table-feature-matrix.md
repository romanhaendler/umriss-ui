# Feature matrix, @umriss-ui/table 0.51.0 (V = verified in host, D = docs only, - = not in package)

Updated from the 0.48.0 matrix (2026-10-28). `[0.49+]` marks a row that is new or changed since then. Host: Vite + React 19, packed tarballs, Chromium (Playwright), dev server for behaviour and a production build for timings; probes in `probes/`.

Competitors: AG = AG Grid Enterprise, MUI = MUI X Data Grid (Pro/Premium), TS = TanStack Table, HT = Handsontable, DX = DevExtreme DataGrid, BR = Bryntum Grid, GL = Glide Data Grid.

## Data and scale
| Feature | umriss | Elsewhere |
|---|---|---|
| Row virtualisation | yes `virtual` (V: 100k rows, 19 rows in DOM, scrollHeight 3.6M px) | AG, MUI, TS+virtual, DX |
| Column virtualisation | no (V again: 150 columns = 151 th and 151 td per row) | AG "Column Virtualisation", MUI, DX |
| 100k+ rows client-side | yes (V prod build: sort 136 ms, group 135 ms, select all 101 ms, search 69 ms) | all |
| Server-side paging | yes `server`, `onRequest`, `rowCount` (V: one request per typed word, 300 ms debounce) | AG SSRM, MUI, DX |
| [0.49+] Server mode with a fitted page | yes (V: first request waits for the measure and carries it; 5 jittered resizes = 1 request; resize at the last page keeps the top row) | - |
| Infinite scroll / block cache | no; `server`+`virtual` now warns "`virtual` is passed over in server mode" (V) | AG "Infinite Row Model", MUI "Infinite loading" |
| Server-side grouping/aggregation | no ("No groups in server mode", D) | AG SSRM grouping, MUI Premium |
| Streaming updates | partial: new `rows` array keeps sort/selection/editor (V: editor stayed open through two row updates); no delta API, no flash | AG transactions + flash, MUI `updateRows` |
| Lazy tree children | no ("no branches loaded on demand yet", D) | AG, MUI |
| [0.49+] Loading state while a server answers | partial: the app sets `loading`; without it old rows stand under the new range (V: "1-4 of 237" over page-57 rows for 800 ms) | AG loading overlay + block placeholders |

## Columns
| Feature | umriss | Elsewhere |
|---|---|---|
| Resize | yes `resizable` (V: drag, Alt+Arrow 8 px steps; Escape during a drag does not cancel it) | all |
| Reorder by header drag | no (never, ADR-0032) (V: drag Dept onto Name: order unchanged, no sort) | AG, MUI, DX, BR |
| Reorder via menu | yes ColumnMenu; keeps a column inside its group (V) | - |
| Pin start/end | yes (V; a group split by pinning shows its label over each part) | AG, MUI Pro |
| Hide/show | yes ColumnMenu (V; a group disappears with its last column) | all |
| [0.49+] Column groups / header bands | yes `ColumnGroup`, one level (V: colSpan, scope=colgroup, sticky with the head, export "Money · Amount", survives hide/pin/reorder). No nested groups, no collapsible group | AG "Column Groups", MUI, DX "Band columns" |
| [0.49+] Auto-size to content | yes `autoSizeColumns()`, "Fit all columns", grip double-click. BUG: never shrinks a column that has a `width` or `flex` (V: 300 -> 301, flex 288 -> 289, table then gets a horizontal scroll) | AG `autoSizeColumns`, MUI `autosizeColumns` |
| [0.49+] Flex / min width | yes `flex`, `minWidth` (V: 2:1:1 split of 1000 px, hand resize ends flex); no `maxWidth` | AG `flex`, MUI `flex` |
| Column types (number/date/bool) | yes by value, `format`, `numeric` (V; boolean shows Yes/No and filters as list) | AG "Column Types" |
| Header tooltip / custom header | no: `label` is a string; an ellipsis shows the full name on hover | AG headerComponent / headerTooltip, MUI renderHeader |
| Per-column header menu (pin, hide, autosize) | no: one global ColumnMenu | AG column menu, MUI column menu |
| Column spanning / cell merge | no | AG colSpan, HT mergeCells, BR |
| Wrapped text / auto row height | no ("Nothing in a cell wraps and no row grows", D; V: nowrap + ellipsis) | AG `wrapText`+`autoHeight`, MUI `getRowHeight:'auto'`, DX `wordWrapEnabled` |

## Sort / filter
| Feature | umriss | Elsewhere |
|---|---|---|
| Multi-sort | yes, Shift-click, levels numbered (V) | all |
| Custom comparator | partial `sortValue` | AG comparator |
| Filter list (set) | yes `filter="list"` (V) | AG "Set Filter" |
| Filter number/date range | yes `filter="range"` (V) | AG Number/Date Filter |
| [0.49+] Text filter with operators | yes `filter="text"`: contains, not contains, starts, ends, equals, is empty; two terms AND/OR; case-insensitive; null counts as "not contains"; JSON in `view`; chip; no regex, no trim (V in popover, `setFilter`, de wording; an invalid condition warns in dev and is ignored). The Filter page's "Known limits: No text filter per column" is stale | AG "Text Filter", MUI filter operators |
| Multi-condition AND/OR per column | partial: text only (2 terms); range has none | AG, MUI, DX filter builder |
| Quick filter | yes `Search` (V) | AG, MUI |
| External filter | yes `preFilter`, `rowFilters` (D) | AG |
| Filter state persistence | yes `view`/`initialView` (V: 9 kinds of state through a reload, view identical, chips restored) | AG `getFilterModel`, MUI `initialState` |
| Filter row / floating filters | no (panel behind the header button) | AG, DX filterRow |
| Server-side filter options | `filterOptions` (D) | AG |

## Grouping / aggregation
| Feature | umriss | Elsewhere |
|---|---|---|
| Row grouping, 3 levels | yes (V: 2 levels; pager counts rows, not group lines: "10-18 of 200"; "continued" header on a split group) | AG, MUI Premium |
| Group by date part | yes `group="month"` (D) | DX |
| Aggregates | yes group header + footer (V; footer follows the filtered set) | AG, MUI Premium |
| Footer totals | yes, but inside the scroll area, not pinned (V: position static, off-screen at 50 rows) | AG pinned totals |
| Pivot | no (never ADR-0032) | AG, MUI Premium, DX |
| Tree data | yes `childRows` (V: unfold, search keeps ancestors "on the path to a match", sort, select) | AG, MUI Pro |
| Master / detail | yes `RowDetail` (V) | AG, MUI Pro |
| Group select as whole | yes (V: group checkbox selected 50 rows) | AG |

## Editing
| Feature | umriss | Elsewhere |
|---|---|---|
| Cell editing | yes `grid`, `edit` (V; ONE click opens the editor with the caret at the END, so typing appends: "49" + "0" = 490; type-over replaces only from a keyboard-focused cell) | all |
| Row editing | yes `editMode="row"`, `onRowSave` (V: validation message keeps the draft; draft survives search, paging, sort) | AG, MUI |
| Validation | yes `validate` (V, cell and row) | MUI preProcessEditCellProps |
| Add / delete rows | yes `newRow`, `onRowAdd`, `onRowDelete` (V: inline "Delete? Delete/Keep") | DX |
| Text/number/date/select editors | yes (V). Date editor is date-only: a timestamp loses its time of day on edit (01:30 -> 00:00); no date-time editor | AG, MUI dateTime |
| Boolean / checkbox editor | no built-in; own editor via `edit={fn}` works (V, 3 lines) | AG agCheckboxCellEditor, MUI boolean |
| Undo / redo | no (never; README recipe) (V: Ctrl+Z nothing) | AG, HT, BR |
| Fill handle | no | AG, MUI Premium |
| Paste into cells | no (V: Ctrl+V, no onCellEdit) | AG, HT, MUI Premium |
| Clear with Delete | no (V) | AG |
| Bulk edit | no | AG |
| Type-over starts edit | yes from a focused cell (V) | AG |
| An edit that moves the row | focus stays at the same grid position (V) | AG |

## Selection / keyboard / a11y
| Feature | umriss | Elsewhere |
|---|---|---|
| Row selection, checkbox, select all (filtered) | yes (V: 100k in 101 ms prod). The selection outlives filter and removed rows: after a search the toolbar says "11 selected" while `selection.count` and `onSelectionChange` hold 200; rows deleted from the data stay as ghost keys | all |
| [0.49+] `onSelectionChange(keys)` | yes, once per change, never at mount (V: 5 actions = 5 calls) | AG `onSelectionChanged`, MUI `onRowSelectionModelChange` |
| Shift-click row range | yes (V) | AG, MUI |
| Select all matching on server | yes `allMatching` (D); server mode drops the selection when the search changes (V), client mode keeps it | MUI |
| Cell range selection | no (never) (V: Shift+Arrow moves the active cell) | AG Range Selection, MUI Premium, HT |
| Spreadsheet keyboard | yes (V: arrows, Home/End, Ctrl+Home, Space selects the row, Enter/F2, Escape; Ctrl+A does not select all) | AG, MUI |
| ARIA grid roles | yes (V: role=grid, 1 tab stop; `aria-rowcount`/`aria-rowindex` count the whole set: first row of page 2 = index 13 with 2 head rows) | AG, MUI |
| [0.49+] Paging announced | yes polite status "11-20 of 200" (V); the text stays stale after a search | |
| Screen-reader sort/state | yes aria-sort (V) | |

## Paging
| Feature | umriss | Elsewhere |
|---|---|---|
| [0.49+] Range text | yes "13-24 of 120" + "Page 2 of 10" (V; de: "11-20 von 200") | MUI, AG |
| [0.49+] First/last, glyph steps | yes, named by aria-label (V) | AG |
| [0.49+] Fitted page ("Fit") | yes: a filled frame holds whole lines, groups and footer counted, no scrollbar, no cut row (V: 20 heights 260-700 px, flat and grouped, no overflow; below that a dev warning) | AG `paginationAutoPageSize` |
| [0.49+] A picked size wins over Fit, kept in the view; Fit never written | yes (V: view `{}`, 0 `onViewChange` on resize) | |
| [0.49+] Page-size change keeps the row you look at | yes (V: top row stays on the page); a resize waits while focus is in the rows (V: page stays unfitted until focus leaves; documented) | |
| Page size selector | yes Fit/10/25/50 | all |

## Export
| Feature | umriss | Elsewhere |
|---|---|---|
| CSV | yes, locale aware (V: BOM, group label "Money · Amount", hidden columns left out, pinned order); dates as UTC ISO text, not as shown | all |
| [0.49+] Excel | yes `@umriss-ui/table/xlsx` (V: valid zip, typed numbers, dates as serials with a date style, widths, header with group labels, visible columns in screen order; 56 kB for 200x5). No styles, formulas, groups, multi-sheet (D) | AG, MUI Premium, DX |
| Clipboard copy rows / active cell | yes (V: "Item 2") | AG |
| Copy range | no | AG, MUI Premium |
| Print | no button; CSS only (D) | MUI, DX |
| PDF | no | DX, MUI |

## Customisation
| Feature | umriss | Elsewhere |
|---|---|---|
| Cell renderer | yes `children(value,row)`; array values need it (type error otherwise) | AG |
| Custom header | no | AG, MUI |
| Row class/attrs | yes `rowProps` (D) | AG rowClass |
| Current row | yes `currentRow` (D) | |
| Context menu | no (V) | AG, MUI Pro, DX |
| Column menu | yes ColumnMenu (V): Fit all columns, pin, order, grouping | AG |
| Row actions | yes `RowActions`/`Action`, bulk in toolbar (V) | AG |
| Sidebar / tool panels | no | AG, MUI Pro |
| Status bar | partial: "x of y", selected count, footer aggregates | AG |
| Pinned rows top/bottom | no | AG, MUI Pro |
| Row drag / reorder | no | AG, MUI Pro |
| Density | yes `density` | MUI |
| Theming | yes tokens; dark mode (V, group head readable) | AG Theming |
| Narrow screen | yes: toolbar wraps, fitted page recomputes (V 375 px: 8 rows) | |

## State
| Feature | umriss | Elsewhere |
|---|---|---|
| Save/restore whole state | yes `view` (V) | AG Grid State, MUI exportState |
| Column state | yes in view: order, widths, pin, hidden (V) | |
| URL state | partial: `view` is JSON | |

## Other
| Feature | umriss | Elsewhere |
|---|---|---|
| Charts from range | no | AG |
| Sparklines in cells | no (charts package, app glues) | AG, MUI |
| Formulas | no | HT, BR, AG |
| i18n | en + de (V: whole filter popover, pager, aria-labels in de) | AG localeText |
| RTL | no (never) | AG, MUI |
| Loading overlay / Empty state | yes `loading`, `empty` | |
| Scroll to row / focus cell API | yes (V) | AG ensureIndexVisible |
