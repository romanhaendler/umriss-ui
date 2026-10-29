# Feature matrix, @umriss-ui/table 0.48.0 (V = verified in host, D = docs only, - = not in package)

Competitors: AG = AG Grid Enterprise, MUI = MUI X Data Grid (Pro/Premium), TS = TanStack Table, HT = Handsontable, DX = DevExtreme DataGrid, BR = Bryntum Grid, GL = Glide Data Grid.

## Data and scale
| Feature | umriss | Elsewhere |
|---|---|---|
| Row virtualisation | yes `virtual` (V: 100k rows, 20 rows in DOM) | AG "Row Virtualisation", MUI, TS+virtual, DX "Virtual Scrolling" |
| Column virtualisation | no (V: 150 columns = 150 th and 150 td per row in DOM) | AG "Column Virtualisation", MUI, DX |
| 100k+ rows client-side | yes (V prod build: sort 100k 183-332 ms, search 66 ms, select all 34 ms) | all |
| Server-side paging | yes `server`, `onRequest`, `rowCount` (V) | AG "Server-Side Row Model", MUI "Server-side data", DX |
| Infinite scroll / block cache | no (page only; `server`+`virtual` type-checks, not run) | AG "Infinite Row Model", MUI "Infinite loading", DX |
| Server-side grouping/aggregation | no ("next piece") | AG SSRM grouping, MUI Premium |
| Streaming updates | partial: new `rows` array keeps sort/selection (D: unit test; no delta API, no flash) | AG "Transaction updates + cell flash", MUI `updateRows` |
| Lazy tree children | no | AG, MUI "Lazy loading tree" |

## Columns
| Feature | umriss | Elsewhere |
|---|---|---|
| Resize | yes `resizable` (V: drag 187 -> 262 px) | all |
| Reorder by header drag | no (never, ADR-0032; ColumnMenu list) (V: header drag does nothing) | AG, MUI, DX, BR |
| Reorder via menu | yes ColumnMenu `setOrder` (V: menu shows list) | - |
| Pin start/end | yes `pin`, `setPin` (V screenshot) | AG "Column Pinning", MUI Pro |
| Hide/show | yes ColumnMenu (V) | all |
| Column groups / header bands | no (V: `group` is for dates only) | AG "Column Groups", MUI "Column grouping", DX "Band columns" |
| Auto-size to content | no | AG `autoSizeColumns`, MUI `autosizeColumns`, DX |
| Flex / min / max width | no (`width` px only) (V: `flex` type error) | AG `flex`, MUI `flex` |
| Column types (number/date/bool) | yes by value, `format`, `numeric` (V) | AG "Column Types" |
| Header tooltip / custom header | no custom header | AG headerComponent, MUI renderHeader |
| Column spanning / cell merge | no | AG colSpan, HT mergeCells, BR |

## Sort / filter
| Multi-sort | yes, Shift-click, levels numbered (V) | all |
| Custom comparator | partial `sortValue` | AG comparator |
| Filter list (set) | yes `filter="list"` (V) | AG "Set Filter" (Enterprise) |
| Filter number/date range | yes `filter="range"` (V) | AG "Number/Date Filter" |
| Text filter (contains/starts/regex, operators) | no built-in; `columnFilter` custom (V: compiles, ~5 lines) | AG "Text Filter", MUI filter operators |
| Multi-condition AND/OR per column | no | AG, MUI, DX filter builder |
| Quick filter | yes `Search` (V) | AG "Quick Filter", MUI quickFilter |
| External filter | yes `preFilter`, `rowFilters` (D) | AG "External Filter" |
| Filter state persistence | yes `view`, `initialView`, JSON-safe (V: search + sort restored after reload) | AG `getFilterModel`, MUI `initialState` |
| Filter row / floating filters | no (panel behind header button) | AG "Floating Filters", DX filterRow |
| Server-side filter options | `filterOptions` (D, dev warning V) | AG |

## Grouping / aggregation
| Row grouping, 3 levels, by column | yes `defaultGrouping`, user group in ColumnMenu (V) | AG "Row Grouping", MUI Premium |
| Group by date part | yes `group="month"` (D) | DX |
| Aggregates (sum/avg/min/max/count/custom) | yes group header + footer (V) | AG, MUI Premium |
| Footer totals | yes (V: sigma row) | AG "Pinned totals" |
| Pivot | no (never ADR-0032) | AG "Pivot Mode", MUI Premium, DX PivotGrid |
| Tree data | yes `childRows` (V: A, A1, A2, B) | AG "Tree Data", MUI Pro |
| Master / detail | yes `RowDetail` (V: renders) | AG "Master Detail", MUI Pro "Detail panels" |
| Group select as whole | yes (D) | AG |

## Editing
| Cell editing | yes `grid`, `edit` (V) | all |
| Row editing | yes `editMode="row"`, `onRowSave` (D) | AG "Full Row Editing", MUI "Row editing" |
| Validation | yes `validate` (V: message, editor stays open) | MUI preProcessEditCellProps |
| Add / delete rows | yes `onRowAdd`, `onRowDelete` (D) | DX |
| Select/date/number editors | yes (V) | AG |
| Undo / redo | no (never ADR-0032) (V: Ctrl+Z nothing) | AG "Undo/Redo", HT, BR |
| Fill handle | no (V: none) | AG "Fill Handle", MUI Premium "Cell selection", HT |
| Paste into cells | no (V: Ctrl+V no onCellEdit) | AG "Clipboard", HT, MUI Premium |
| Clear with Delete | no (V) | AG |
| Bulk edit | no | AG |
| Type-over starts edit | yes (V) | AG |

## Selection / keyboard / a11y
| Row selection, checkbox, select all (filtered) | yes (V: 100k in 34 ms) | all |
| Shift-click row range | yes (V: 4 checked) | AG, MUI |
| Select all matching on server | yes `allMatching` (D) | MUI |
| Cell range selection | no (never ADR-0032) (V: Shift+Arrow 0 cells) | AG "Range Selection" (Ent), MUI Premium "Cell selection", HT |
| Spreadsheet keyboard | yes (V: arrows, Home/End, Ctrl+Home, PageDown, Enter, typing) | AG, MUI |
| ARIA grid roles | yes (V: role=grid, 1 tab stop) | AG, MUI |
| Screen-reader sort/state | yes aria-sort (V) | |

## Export
| CSV | yes, locale aware (V: BOM, comma, ISO dates) | all |
| Excel | yes basic `xlsx` (V: 5.5 kB file for 50 rows); no styles, formulas, groups, multi-sheet | AG "Excel Export", MUI Premium (exceljs), DX |
| Clipboard copy rows / active cell | yes (V) | AG |
| Copy range | no | AG, MUI Premium |
| Print | no | MUI "Print export", DX |
| PDF | no | DX, MUI |

## Customisation
| Cell renderer | yes `children(value,row)` (D, used in docs) | AG cellRenderer |
| Custom header | no | AG, MUI |
| Row class/attrs | yes `rowProps` (D) | AG rowClass |
| Row detail on click, current row | yes `currentRow` (D) | |
| Context menu | no (V: right-click nothing) | AG "Context Menu", MUI Pro "Context menu", DX |
| Column menu | yes ColumnMenu (V) | AG |
| Sidebar / tool panels | no | AG "Side Bar / Tool Panels", MUI Pro |
| Status bar | partial: toolbar "x of y", footer aggregates | AG "Status Bar" |
| Pinned (frozen) rows top/bottom | no | AG "Row Pinning", MUI Pro |
| Row drag / reorder | no | AG "Row Dragging", MUI Pro "Row reordering" |
| Density | yes `density` | MUI density |
| Theming | yes tokens / layers | AG Theming API |

## State
| Save/restore whole state | yes `view` (V) | AG "Grid State", MUI `exportState` |
| URL state | partial: `view` is JSON; app writes it | |
| Column state (order, width, pin, hidden) | yes in view (D) | |

## Other
| Charts from range | no (charts package separate, no link) | AG "Integrated Charts" |
| Sparklines in cells | no cell sparkline (charts package, app glues) | AG, MUI |
| Formulas | no | HT, BR, AG |
| i18n | en + de, others by own wording object (D) | AG localeText |
| RTL | no (never) | AG, MUI |
| Master/detail nested grids | via RowDetail containing a table (D) | AG |
| Accessibility audit | design claims | AG partial |
| Loading overlay | yes `loading` | |
| Empty state | yes `empty` | |
| Scroll to row / focus cell API | yes `scrollToRow`, `focusCell` | AG ensureIndexVisible |
