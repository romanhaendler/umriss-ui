# Leading React data grids (2025–2026): feature matrix vs. umriss/table

Scope: AG Grid, MUI X Data Grid, TanStack Table, Ant Design Table, Material/Mantine React Table, Glide Data Grid, Handsontable, KendoReact / DevExtreme / Syncfusion, RevoGrid. Research date 2026-09-24. Notes on umriss/table come from the brief plus a quick look at `packages/table/src` (native `<table>`, `role="treegrid"` only when group lines are shown; `stickyHeader`, `stickyRowHeader` = one pinned first column; `aria-rowcount`/`aria-rowindex`/`aria-level`/`aria-setsize`/`aria-posinset` present).

## Table stakes: which features almost every mature grid has

### Takeaway
Across the commercial grids, the baseline is: cell/row editing, column pinning, keyboard cell navigation (ARIA grid), server-side data, row virtualisation, CSV export, printing (MUI), tree data and row reordering. Clipboard, Excel export, pivoting, range selection, master/detail and grouping with aggregation are usually **paid** tiers. Compared with that baseline, umriss/table is clearly missing **cell editing**, **cell-level keyboard navigation (ARIA grid)**, **free column pinning**, **clipboard**, **XLSX export**, **server-side data mode**, **tree data**, **pivot** and **saved views/state persistence**. It is ahead of free tiers on grouping + multi-level aggregates, the column menu and row detail, all of which are paywalled in AG Grid and MUI.

### Cited Findings

**AG Grid (Community MIT vs Enterprise)**
- Community is MIT and "free for everyone, including production use". Enterprise is licensed per developer and per deployment, perpetual, with 1 year of support and updates — [AG Grid: Community vs Enterprise](https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/)
- Prices: Grid Enterprise $999 per developer; Charts Enterprise $499; Enterprise Bundle $1,498 — [AG Grid pricing](https://www.ag-grid.com/license-pricing/)
- Community has text/number/date filters, quick and external filters, CSV export, column pinning, undo/redo and an MCP server — [AG Grid pricing](https://www.ag-grid.com/license-pricing/)
- **Enterprise only**: set filter, multi filter, advanced filter, Excel export, PDF export, clipboard operations, row grouping, pivoting, aggregation, tree data, master/detail, formulas, find, cell notes, batch editing, cell range selection, row numbers, sparklines, integrated charts, column menu, context menu, tool panels, status bar, AI Toolkit — [AG Grid pricing](https://www.ag-grid.com/license-pricing/)
- The feature overview also lists the server-side row model, range selection, integrated charts, master/detail, "Row Grouping & Multi-Column Sorting", clipboard, tool panels and context menu/sidebars as Enterprise — [AG Grid: Community vs Enterprise](https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/)
  - Note: "Multi-Column Sorting" appears under Enterprise on that overview page. I believe multi-sort actually works in Community, so treat this as an unclear marketing grouping, not verified.

**MUI X Data Grid (Community MIT / Pro / Premium)**
- Open core: the Community edition is MIT and the advanced features need Pro or Premium — [MUI X quickstart](https://mui.com/x/react-data-grid/getting-started/)
- Prices per developer per year: Pro $299, Premium $599, Enterprise $1,399. Paid plans include a perpetual production licence and 12 months of maintenance — [MUI pricing](https://mui.com/pricing/)
- Community: editing, sorting, filtering, pagination, CSV export and print. Pro: column pinning, column/row reordering, multi-column filtering and sorting, tree data, master/detail. Premium: row grouping, aggregation, pivoting — [MUI pricing](https://mui.com/pricing/); [MUI X overview](https://mui.com/x/react-data-grid/)
  - **Conflict:** the pricing page puts Excel export and clipboard in Pro, but the docs overview puts "Excel export, copy/paste" in Premium ([MUI X overview](https://mui.com/x/react-data-grid/)). The docs are more likely to be right.
- v8 (2025) added pivoting, the AI Assistant "Ask Your Table" (natural language → filters, grouping, aggregation) and charts integration — [MUI blog: MUI X v8](https://mui.com/blog/mui-x-v8/)
- Data Grid v9 was released on 2026-04-08. Charts integration is now stable. Lazy loading and the server-side data source improved (caching, invalidation, nested data). The AI Assistant now applies filters, sorting, grouping, aggregation and pivoting visibly in the UI — [MUI blog: Data Grid v9](https://mui.com/blog/introducing-mui-x-data-grid-v9/)

**TanStack Table (headless, MIT)**
- v9 is the current documented version. It is a "headless engine for sorting, pagination, filtering, faceting, grouping, aggregation, row expansion, row and cell selection, cell spanning, row and column pinning, column ordering, visibility, resizing". It renders no markup or styles: "100% of the rendered result" is up to you — [TanStack Table](https://tanstack.com/table/latest)
- It has no built-in inline editing (headless) — [CoreUI comparison](https://coreui.io/compare/ag-grid-alternative/)

**Material React Table / Mantine React Table (MIT, built on TanStack)**
- MRT v3 (released 2024-09-05) sits on TanStack Table v8 and MUI v6. Features: sorting, column and global filtering, selection, full CRUD editing, export, resizing, column/row pinning, drag-and-drop column/row reordering, density toggle, fullscreen, virtualisation, pagination, detail panels, tree data, column grouping, aggregation, 30+ locales, row numbers, click-to-copy, keyboard navigation. Mantine React Table is the same library built on Mantine — [Material React Table](https://www.material-react-table.com/)

**Ant Design Table (MIT, v6.x)**
- Built in: multi-column sort (`sorter.multiple`), column filter menus (menu/tree mode, with search), fixed columns (`fixed`), grouped headers (`children`), hidden columns, expandable rows, tree data, checkbox/radio selection, virtual scrolling (`virtual`, since v5.9), pagination, summary rows (`Table.Summary`). Drag sorting, **resizable columns and editable cells exist only as examples**, not as APIs — [Ant Design Table](https://ant.design/components/table)

**Glide Data Grid (MIT, canvas)**
- Renders to HTML canvas for scrolling millions of rows. Features: many cell types, editing, resizable and movable columns, variable row heights, merged cells, single/multi select. Accessibility: "screen reader support", but the maintainers say they are not accessibility users themselves and gaps may exist — [glideapps/glide-data-grid](https://github.com/glideapps/glide-data-grid)

**Handsontable (commercial, spreadsheet-like)**
- Free only for non-commercial/hobby use. Commercial: Standard from $999 per developer, Priority from $1,299, Enterprise custom. Every paid tier has all features. 45-day trial — [Handsontable pricing](https://handsontable.com/pricing)
- Positioned for users who expect Excel behaviour (free cell editing, formulas via HyperFormula, pasting ranges) — [Sencha: 7 best React data grids 2026](https://www.sencha.com/blog/7-best-react-data-grids-in-2026-performance-features-and-pricing-compared/) (vendor blog, secondary source)

**KendoReact / DevExtreme / Syncfusion**
- KendoReact Grid grouping is part of "KendoReact premium" (paid). It supports controlled or auto-processed grouping, collapsed-state persistence, and expand/collapse all — [KendoReact Grid grouping](https://www.telerik.com/kendo-react-ui/components/grid/grouping)
- DevExtreme: $900 per developer per year (estimate). Syncfusion: quote-based, unpublished. AG Grid, Syncfusion and DevExtreme cover JS/React/Angular/Vue — [CoreUI comparison](https://coreui.io/compare/ag-grid-alternative/) (vendor comparison, secondary)
- Every grid compared there has row virtualisation, only AG Grid and MUI X also virtualise columns, and "most teams are over-gridded" — [CoreUI comparison](https://coreui.io/compare/ag-grid-alternative/)

**RevoGrid**
- RevoGrid's own blog puts itself in the "best grid 2026" comparisons against AG Grid, Handsontable, MUI X and Tabulator — [RevoGrid blog](https://rv-grid.com/blog/best-js-datagrid-in-2026). I did not fetch its feature list.

### Inferences
- A compact matrix follows. ✓ = built in (free), $ = paid tier, ex = example/recipe only, H = headless logic only, – = none/unknown. umriss/table is filled in from the brief and the code.

| Feature | AG Grid | MUI X | TanStack | MRT | AntD | Glide | Handsontable | umriss/table |
|---|---|---|---|---|---|---|---|---|
| Multi-level sort | ✓ | Pro | H | ✓ | ✓ | – | ✓ | ✓ |
| List/set filter | $ (set) | ✓ basic / Pro multi | H (faceting) | ✓ | ✓ | – | ✓ | ✓ (list/range/own) |
| Global search / quick filter | ✓ | ✓ | H | ✓ | – | – | ✓ | ✓ |
| Pagination | ✓ | ✓ | H | ✓ | ✓ | – | – | ✓ |
| Row virtualisation | ✓ | ✓ | – (TanStack Virtual) | ✓ | ✓ | canvas | ✓ | ✓ |
| Column virtualisation | ✓ | ✓ | – | ✓ | – | canvas | ✓ | – |
| Cell/row editing | ✓ | ✓ | – | ✓ | ex | ✓ | ✓ | **–** |
| Column pinning (any column) | ✓ | Pro | H | ✓ | ✓ | – | ✓ | first column only (`stickyRowHeader`) |
| Column show/hide/reorder | ✓ (menu $) | ✓ / Pro reorder | H | ✓ | hidden only | movable | ✓ | ✓ (column menu) |
| Column resizing | ✓ | ✓ | H | ✓ | ex | ✓ | ✓ | ✓ |
| Row selection | ✓ | ✓ | H | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cell range selection | $ | Premium | H | – | – | ✓ | ✓ | – |
| Clipboard copy/paste | $ | Pro/Premium (conflict) | – | copy | – | ✓ | ✓ | – |
| CSV export | ✓ | ✓ | – | ✓ | – | – | ✓ | ✓ (CSV/text) |
| Excel/XLSX export | $ | Pro/Premium (conflict) | – | – | – | – | ✓ | – |
| Print | – | ✓ | – | – | – | – | – | – (not verified) |
| Row detail / master-detail | $ | Pro | H (expanding) | ✓ | ✓ | – | – | ✓ |
| Tree data | $ | Pro | H | ✓ | ✓ | – | nested rows | – |
| Row grouping + aggregation | $ | Premium | H | ✓ | – | – | – | ✓ (multi-level) |
| Footer/total aggregates | $ | Premium | H | ✓ | ✓ (Summary) | – | – | ✓ |
| Pivot | $ | Premium | – | – | – | – | – | – |
| Row drag & drop | ✓ | Pro | – | ✓ | ex | – | ✓ | – |
| Undo/redo | ✓ | – | – | – | – | – | ✓ | – |
| Server-side row model | $ (SSRM) | ✓ data source | ✓ manual | ✓ | ✓ | lazy | – | – |
| Integrated charts / sparklines | $ | Premium | – | – | – | – | – | share bars (inline) |
| AI / natural-language control | $ (AI Toolkit) | ✓ (AI Assistant, tier unverified) | – | – | – | – | – | – |
| Verdict column / alarm list | – | – | – | – | – | – | – | ✓ (unique) |

- Where umriss/table is ahead: grouping with multi-level aggregates, the column menu and row detail are **free** in umriss but paid in AG Grid (Enterprise) and MUI (Pro/Premium). Share bars roughly match what AG Grid sells as Enterprise sparklines. The verdict column and alarm list have no counterpart anywhere, because they are domain features.
- Clearly missing: editing, clipboard, XLSX export, free column pinning, tree data, pivot, server-side data, row drag, undo/redo, cell range selection, state persistence/saved views.

### Gaps
- I could not fetch MUI's full per-feature plan table (it renders client-side), so the exact tiers for clipboard, Excel export and the AI Assistant are unverified (see the conflict above).
- State persistence/save views: not checked in the docs (AG Grid has a grid-state API and MUI has `exportState`/`restoreState` from memory, **not cited**).
- Syncfusion, DevExtreme and RevoGrid feature lists and prices come only from secondary vendor articles.
- Printing support was only confirmed for MUI.

## Grouping and aggregation UX (for comparison with umriss's group header/span model)

### Takeaway
The standard model is: grouped **group rows** that expand/collapse, aggregates shown **on the group row** or in an optional **group footer / grand total row**, users choosing an aggregation function per column in the **column menu**, and a drag-and-drop **"group by" panel** above the grid (AG Grid, DevExtreme, Kendo). Built-in functions are sum/avg/min/max/count (AG Grid adds first/last; MUI adds a true/false count).

### Cited Findings
- AG Grid built-in aggregations: `sum`, `min`, `max`, `count`, `avg`, `first`, `last`, plus custom functions (for example a "mode" function). Values appear in group rows, group total rows and grand total rows. Users change the aggregation through the column menu and the tool panel. Headers get auto-named, e.g. "sum(Gold)". Group rows can be edited, with the value distributed to the child rows. Enterprise only — [AG Grid aggregation](https://www.ag-grid.com/react-data-grid/aggregation/)
- AG Grid Row Group Panel: drag columns into the panel to group by them (`rowGroupPanelShow: "always" | "onlyWhenGrouping"`, per column `enableRowGroup`). The panel also appears in the Columns tool panel and the toolbar, with sort indicators on the pills, and groups can be locked — [AG Grid Row Group Panel](https://www.ag-grid.com/react-data-grid/grouping-group-panel/)
- MUI aggregation (Premium): `sum`, `avg`, `min`, `max`, `size` (plus true/false counts). Shown in the footer row (root), in group rows and in tree data rows. `getAggregationPosition` → `"footer"` \| `"inline"` \| `null` per group. Users pick the function in the column menu's "Aggregation" section. Custom functions use `apply`, `label`, `columnTypes`, `getCellValue`, `valueFormatter` — [MUI aggregation](https://mui.com/x/react-data-grid/aggregation/)
- MUI v8 pivoting groups related data and computes sums, averages and counts side by side — [MUI blog: MUI X v8](https://mui.com/blog/mui-x-v8/)
- DevExtreme: a group panel for drag-and-drop column headers or context-menu grouping (hidden automatically on small screens). `autoExpandAll`, `expandMode` (button or whole row), `allowCollapsing`, per column `groupIndex`/`allowGrouping`, `expandAll`/`collapseAll` API, and expand/collapse events — [DevExtreme DataGrid grouping](https://js.devexpress.com/React/Documentation/Guide/UI_Components/DataGrid/Grouping/)
- KendoReact: `groupable`, controlled grouping via `onGroupChange`/`onDataStateChange`, collapsed-state persistence, expand/collapse all. Premium — [KendoReact grouping](https://www.telerik.com/kendo-react-ui/components/grid/grouping)
- Ant Design only offers `Table.Summary` footer rows, with no grouping — [Ant Design Table](https://ant.design/components/table)

### Inferences
- umriss's group header/span model roughly matches "aggregation inline on the group row". Other grids differ from it in three ways: (1) an optional separate **group footer / grand total** position (MUI `getAggregationPosition`, AG Grid total rows), (2) the **user** chooses the aggregation function in the column menu, and (3) a drag-and-drop group-by panel. Whether umriss needs any of these is a product decision. The group-by panel mostly serves ad-hoc analysis.

### Gaps
- I did not fetch AG Grid's group display types (singleColumn / multipleColumns / groupRows) or the exact grand-total options.

## Accessibility (ARIA grid vs. table)

### Takeaway
The big grids use the **ARIA grid/treegrid composite widget**: one tab stop, then arrow-key navigation from cell to cell. umriss/table uses a native `<table>` (treegrid only when group lines are shown), which is valid for read-mostly data but lacks cell-level keyboard navigation. Virtualisation is the known weak spot for screen readers in every grid.

### Cited Findings
- AG Grid uses `role="grid"`, or `role="treegrid"` with tree data or grouping. It sets aria-rowcount/colcount/rowindex/colindex/selected/expanded/sort and targets WCAG 2.0 AA (and so Section 508/ADA). Tested with JAWS and VoiceOver — [AG Grid accessibility](https://www.ag-grid.com/react-data-grid/accessibility/)
- AG Grid's documented limitations: virtualisation breaks DOM order, so it recommends `ensureDomOrder=true` or turning virtualisation off, or using pagination. Grouped column headers can confuse some screen readers. State changes on the focused element may go unannounced. The server-side row model cannot announce a total row count — [AG Grid accessibility](https://www.ag-grid.com/react-data-grid/accessibility/)
- MUI follows the WAI-ARIA APG grid pattern. Keys: arrows, Home/End, Ctrl+Home/End, PageUp/Down, Shift+Space to select a row, Ctrl+A. Densities: standard, compact, comfortable. Aims at WCAG AA. Row header cells stay mounted during column virtualisation so screen readers can announce them — [MUI Data Grid accessibility](https://mui.com/x/react-data-grid/accessibility/)
- v9 improved keyboard flow and selection patterns — [MUI blog: Data Grid v9](https://mui.com/blog/introducing-mui-x-data-grid-v9/)
- Glide (canvas) claims screen reader support but admits gaps — [glideapps/glide-data-grid](https://github.com/glideapps/glide-data-grid)
- MRT advertises "comprehensive keyboard navigation" — [Material React Table](https://www.material-react-table.com/)

### Inferences
- umriss's recent charts work already uses the "one tab stop, one active point" pattern (commit 8447d92). The same pattern would be the natural route to an ARIA grid mode for the table, if editing or range selection ever comes.
- umriss sets `aria-rowcount`/`aria-rowindex` with virtualisation, which avoids AG Grid's DOM-order problem as long as rows are rendered in order.

### Gaps
- No independent screen reader audits of these grids were found. All claims above are the vendors' own.

## Licensing and paywalls

### Takeaway
The paywall line is the same in every commercial grid: the **analytics layer** (grouping, aggregation, pivot, tree data, master/detail), **Excel export, clipboard, range selection** and **server-side row model** cost money. Basic sort/filter/paginate/edit/CSV are free.

### Cited Findings
- AG Grid: $999/dev perpetual (+1 yr updates); Bundle with Charts $1,498 — [AG Grid pricing](https://www.ag-grid.com/license-pricing/)
- MUI X: Pro $299, Premium $599, Enterprise $1,399 per dev per year; licensed developers = the maximum number of concurrent front-end developers — [MUI pricing](https://mui.com/pricing/)
- Handsontable: from $999/dev; non-commercial use free — [Handsontable pricing](https://handsontable.com/pricing)
- KendoReact grouping is premium — [KendoReact grouping](https://www.telerik.com/kendo-react-ui/components/grid/grouping)
- DevExtreme ~$900/dev/yr, Syncfusion quote-based — [CoreUI comparison](https://coreui.io/compare/ag-grid-alternative/)
- Free/MIT: TanStack Table, Material/Mantine React Table, Ant Design Table, Glide Data Grid, AG Grid Community, MUI X Community — sources above

### Inferences
- An MIT table that ships multi-level grouping with aggregates, a column menu, row detail and footer aggregates competes directly with features that cost $599–$999 per developer. The only free equivalents are MRT/Mantine React Table (via TanStack).

### Gaps
- The exact tier of the MUI AI Assistant and its usage costs (it runs through the MUI Console / API keys) are not verified.
