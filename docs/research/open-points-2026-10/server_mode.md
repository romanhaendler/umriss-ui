# The table's server mode beside three other grids

Gathered on 2026-10-11 for the grilling of the open points, from the repository at 5d31cd85 and the cited pages.

## 1. umriss today (packages/table, read from source; CONTEXT.md "Server mode"/"Request" agree)

- Opt-in: `server: true`, `rowCount: number`, `onRequest(request)`, optional `filterOptions(column) => readonly unknown[]`, `loading`. Types: packages/table/src/types.ts ~L600-660. `server` is a discriminated union: childRows/defaultBranches become `never`.
- Request (`TableRequest`, model/view.ts): `{search, conditions, sort, page, pageSize}`, all five always present, defaults included. Reported in a useEffect after commit, once at first stand and once per change, deduped by `requestKey` (JSON of the five). Width/order/pin/fold/hidden columns do not trigger it (`onViewChange` hears those).
- Caller hands back: `rows` = one page, in the server's order; `rowCount` = size of the server's filtered set. Nothing else (no group rows, no aggregates, no cursor, no error channel).
- Model (tableModel.ts ~L204): rows pass through untouched; only `pageCount = ceil(rowCount/pageSize)` and the page clamp are the table's. No sort, search, filter or page slicing.
- Sorting/search/conditions: go out in the request; table does nothing locally. `preFilter` ignored (DEV warn).
- List filter values: `filterOptions(columnId)`; without it the list offers only the page's values and warns once in DEV (filter.tsx ~L62).
- Grouping and aggregates: not supported. A grouping is dropped (DEV warn), `groupable` ignored (warn), footer aggregates not shown (`!snapshot.server`). Group rows from the server are not modelled.
- Tree rows: not supported (`childRows` and `defaultBranches` are `never` in server mode).
- Selection: keys of rows off the page stay selected. "Select all" selects the page only; its aria-label is `selectAllOnPage`. The table keeps the row objects it saw (`seenRows`) so a bulk action receives selected rows from earlier pages, but only those it has seen. There is no select-all-matching state.
- Export: writes the page; the button says so (`exportPageLabel`).
- Pagination vs virtualisation: pages only. `virtual` is ignored (warn). No infinite or lazy scroll, no cache. Each page change is a request.
- Loading/late answers: `loading` shows the previous page dimmed with skeleton rows, keeps column widths, sets `aria-busy`. Toolbar count is the server count only. The table has no request id, no abort, no stale-answer check, no cache. Out-of-order answers are the caller's to handle: rows and rowCount are simply whatever is passed in.
- Specs: .scratch/table-server-mode/spec.md (done, 2026-09-24; M3 grouping and "infinite scroll (paging only)" out of scope; decided on standing trust). .scratch/table-server-mode-2/spec.md (needs-triage; research first, then a grilling).

## 2. Capability matrix

| Capability | umriss | AG Grid free (Infinite) | AG Grid Enterprise (SSRM) | MUI X | TanStack |
|---|---|---|---|---|---|
| Request shape | `onRequest` push, 5 fields, pages | `getRows({startRow,endRow,sortModel,filterModel})` pull, `successCallback(rows,lastRow)` | `getRows(params.request)` adds `rowGroupCols`, `groupKeys`, value cols; `params.success({rowData})` / `fail()` | `dataSource.getRows(params)` returns a Promise of `{rows,rowCount}` | `manual*` flags plus controlled state; caller fetches |
| Sort/filter | Sent out | Sent out | Sent out; a filter change purges the cache | Sent out (server modes set automatically) | `manualSorting`, `manualFiltering` |
| Load on scroll | No | Yes, blocks | Yes, blocks | Lazy loading (Pro, "deprecated" label on the older row-updates page), `lazyLoading` with the data source (Pro) | Not provided |
| Page cache | None | `cacheBlockSize`, `maxBlocksInCache`, purge/refresh | Same, plus route-based purge | `GridDataSourceCacheDefault`, 5 min TTL, pluggable | None |
| Select all | Page only, says so | Not supported (header checkbox, Ctrl+A do nothing) | State `{selectAll, toggledNodes}`; works across unloaded rows by row ID | `keepNonExistentRowsSelected`; select-all uses an exclude model by default | State only; row set is what was passed in |
| Export | Page, labelled | Not covered by sources read | Not covered by sources read | Only rows in the grid; load all first via `updateRows()` | Caller's own |
| Grouping + aggregates | None | None | Server groups; `aggFunc` columns sent; grand total via `grandTotalData` | Premium: `groupFields`+`groupKeys`, `getAggregatedValue` | `manualGrouping`: caller groups |
| Tree rows | None | None | `isServerSideGroup`, `getServerSideGroupKey`, `groupKeys` | Pro: `getGroupKey`, `getChildrenCount` | Caller supplies sub-rows |
| List filter values | `filterOptions` | Not covered | Not covered | Not covered | Faceting with manual: not covered |

## 3. Best contract per capability

- Load on scroll: AG Grid `getRows({startRow,endRow,...})` with `lastRow` as the total (null/-1 until known) and `successCallback(rows,lastRow)` / `failCallback()` (https://www.ag-grid.com/react-data-grid/infinite-scrolling/). MUI's alternative is a known `rowCount` with skeleton rows, or -1 for infinite (https://mui.com/x/react-data-grid/server-side-data/lazy-loading/).
- Select all beyond the page: AG Grid SSRM keeps `{selectAll, toggledNodes}` by `getRowId`. The server never has to send the rows (https://www.ag-grid.com/react-data-grid/server-side-model-selection/). `getSelectedRows()` only works when all selected rows are loaded.
- Export beyond the page: neither AG Grid nor MUI offers a contract. MUI's documented recipe is to load all rows temporarily, then export (https://mui.com/x/react-data-grid/export/).
- Server grouping with aggregates: AG Grid sends `rowGroupCols`, `groupKeys` and value columns, and the response can carry `grandTotalData` (https://www.ag-grid.com/react-data-grid/server-side-model-grouping/). MUI Premium sends `groupFields`+`groupKeys` and reads aggregates through `getAggregatedValue(row, field)` (https://mui.com/x/react-data-grid/server-side-data/aggregation/).
- Server tree rows: both use a path of keys. AG Grid: `groupKeys` plus `isServerSideGroup` and `getServerSideGroupKey` (https://www.ag-grid.com/react-data-grid/server-side-model-tree-data/). MUI Pro: `getGroupKey`, `getChildrenCount` (-1 means unknown) (https://mui.com/x/react-data-grid/server-side-data/tree-data/).
- Page cache: MUI `dataSourceCache` with `set/get/clear`, TTL, `dataSourceCache={null}` to disable, `skipCache` per fetch (https://mui.com/x/react-data-grid/server-side-data/). AG Grid uses block size, a max block count and `blockLoadDebounceMillis` (https://www.ag-grid.com/react-data-grid/server-side-model-configuration/).
- Also relevant to the "late answers" gap: MUI has `dataSourceKeepPreviousData` (flat data only) and `onDataSourceError` (https://mui.com/x/react-data-grid/server-side-data/). AG Grid has `fail()`. umriss has neither an error nor a stale-answer contract.

Other URLs: TanStack manual pagination (`manualPagination`; `rowCount` or `pageCount`; -1 means unknown; auto-reset of pageIndex is off) https://tanstack.com/table/v8/docs/guide/pagination. Manual grouping ("not currently many known easy ways") https://tanstack.com/table/v8/docs/guide/grouping. `manualFiltering`: https://tanstack.com/table/v8/docs/guide/column-filtering. `manualSorting`: https://tanstack.com/table/v8/docs/guide/sorting. AG Grid SSRM overview (marked `enterprise: true`): https://www.ag-grid.com/react-data-grid/server-side-model/. Datasource: https://www.ag-grid.com/react-data-grid/server-side-model-datasource/. MUI selection: https://mui.com/x/react-data-grid/row-selection/. Do not read the plan assignments for MUI as final (see below).

## 4. Not established

- Page fetches worked, so the plan labels in 2026 are as the pages showed them: lazy loading Pro; nested lazy loading with tree data Pro, with row grouping Premium; server tree data Pro; server grouping and aggregation Premium. The base Data Source page gave no plan label. Pages are fetched through a summarising model, so these are readings, not quotes.
- AG Grid: the claim that the Infinite Row Model is free is only implied (the page says Enterprise is not required). The SSRM caching page URL (`.../server-side-model-caching/`) returned 404 and `.../server-side-model-api/` returned 404, so purge/refresh details come from the infinite page and the configuration page. The full `request` field list (`rowGroupCols`, `groupKeys`, `sortModel`, `filterModel`, `valueCols`) was not on the datasource page and rests on the grouping, tree-data and infinite pages. Export under SSRM and under the Infinite Row Model: not found on the CSV export page; nothing established. The AG Grid default for `selectAll` under the free model is read from the infinite page ("not supported").
- MUI: select-all across unloaded rows, and export of unloaded rows, are only indirectly documented (see above). The lazy-loading page does not mention select all. Whether the server-side rows are a Premium or Pro feature for flat data was not shown.
- TanStack: anything about select-all or export under manual pagination (row-selection guide failed to load, 404 on raw GitHub and 500 on the main site). Faceted values with manual filtering: the guide is silent. Who computes aggregates under `manualGrouping`: the page does not say explicitly.
- Nothing was checked about what archives and histories need (ADR-0035) or in docs/research/library-comparison-2026-09 (data_grids.md was not read).
