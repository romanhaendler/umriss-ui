# Research: data tables and grids

Gathered 11 Sep 2026 for `.scratch/umriss-table/spec.md`, from primary sources. Where nothing was found, it says so — "no evidence" means searched and not found. Weighted towards API shape (point 4), because the package's target is developer ergonomics.

## 1. Feature landscape

- **Ubiquitous:** sorting, simple filters, paging, row selection and bulk actions.
  - AG Grid Community includes them ([pricing](https://www.ag-grid.com/license-pricing/)).
  - Carbon: sorting, a toolbar of at most five actions, a batch action bar, five row heights, zebra stripes ([usage](https://github.com/carbon-design-system/carbon-website/blob/main/src/pages/components/data-table/usage.mdx)).
  - Atlassian dynamic table: paging, sorting, reordering ([examples](https://atlassian.design/components/dynamic-table/examples)).
- **Rare or paid:**
  - AG Grid Enterprise: grouping, aggregation, pivot, Excel export, clipboard, range selection, master/detail, sparklines ([pricing](https://www.ag-grid.com/license-pricing/)).
  - MUI X: grouping and aggregation in Premium only ([aggregation](https://mui.com/x/react-data-grid/aggregation/)).
- **Minimal:** GOV.UK covers captions and right-aligned numbers, nothing on sorting or responsiveness ([table](https://design-system.service.gov.uk/components/table/)).
- **Very large data:** Glide Data Grid renders to canvas and "scales to millions of rows"; it describes its own accessibility as incomplete ([repo](https://github.com/glideapps/glide-data-grid)).
- **Narrow screens:** the UI5 responsive table moves columns into a pop-in area below the row under a breakpoint ([UI5](https://sdk.openui5.org/docs/topics/38855e06486f4910bfa6f4485f7c2bac.html), search excerpt only). The Fiori guidelines returned HTTP 403 and are unverified.
- **Keyboard:** the WAI-ARIA APG distinguishes a static table from a grid with arrow-key navigation and a navigation/editing mode switch (Enter, F2, Escape) ([grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), [table](https://www.w3.org/WAI/ARIA/apg/patterns/table/)).

## 2. Known usability weaknesses

- **Losing context:**
  - Nielsen Norman Group recommends freezing the header and the first column, making the first column a readable identifier, and avoiding modals that hide neighbouring rows ([data tables](https://www.nngroup.com/articles/data-tables/)).
  - Jumping to the top of the page after filtering disorients users ([applying filters](https://www.nngroup.com/articles/applying-filters/)).
- **Understanding filters:** filters need to be discoverable, have clear syntax and visibly show that they are active ([data tables](https://www.nngroup.com/articles/data-tables/)).
- **Mobile and horizontal scroll:** it must be evident that more columns exist; ellipsis cues get missed ([mobile tables](https://www.nngroup.com/articles/mobile-tables/)).
- **Hover-only controls:**
  - Carbon shows the sort icon of unsorted columns on hover only ([usage](https://github.com/carbon-design-system/carbon-website/blob/main/src/pages/components/data-table/usage.mdx)).
  - NN/g: "Don't: Tuck them away in hover-only states" ([contextual menus](https://www.nngroup.com/articles/contextual-menus-guidelines/)).
- **Grid keyboard navigation:** Sarah Higley: "most out-of-the-box grid components … have pretty poor accessibility"; grids are harder to learn than tables ([grids, part 1](https://sarahmhigley.com/writing/grids-part1/)).
- **Tablets on the shop floor (gloves, touch):** no evidence in table documentation.

## 3. Live data, limits, stale values

**Sorting under updates**

- MUI X: "Whenever the rows are updated, the Data Grid has to apply sorting and filters"; the only brake is `throttleRowsMs` ([row updates](https://mui.com/x/react-data-grid/row-updates/)).
- AG Grid re-sorts and re-filters on transactions and animates rows to their new positions ([transactions](https://www.ag-grid.com/react-data-grid/data-update-transactions/), [blog](https://www.ag-grid.com/blog/streaming-updates-in-javascript-datagrids/)). The alternative is coarse: `suppressModelUpdateAfterUpdateTransaction` stops re-sorting altogether and does not cover added or removed rows (same source).
- After a cell edit AG Grid deliberately does not re-sort: "if a user edits a cell, then the row should not jump location" ([change detection](https://www.ag-grid.com/react-data-grid/change-detection/)).
- A table that holds rows still while pointer or focus rests on them: **no evidence**.
- WCAG 2.2.2 requires a way to pause, stop or control auto-updating content ([understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)); Infragistics' live-data demo offers "stop the data feed" ([demo](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/live-data)).

**Highlighting changes**

- AG Grid: `enableCellChangeFlash` and delta renderers such as `agAnimateShowChangeCellRenderer` ([flashing cells](https://www.ag-grid.com/react-data-grid/flashing-cells/)).
- DevExtreme: `highlightChanges` ([blog](https://community.devexpress.com/blogs/javascript/archive/2018/10/19/devextreme-real-time-ui-updates-and-new-push-api-v18-2.aspx)).
- MUI X: nothing in the row-update documentation ([row updates](https://mui.com/x/react-data-grid/row-updates/)).

**Limits as a built-in concept**

- Found only at SAP: the OData UI vocabulary has `CriticalityCalculation` with `ImprovementDirection` (Minimize, Target, Maximize) and acceptance, tolerance and deviation ranges ([UI vocabulary](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/UI.md)). Fiori Elements highlights line items by criticality, with an icon rather than colour alone by default ([highlighting](https://github.com/SAP-docs/sapui5/blob/main/docs/06_SAP_Fiori_Elements/highlighting-line-items-based-on-criticality-0d501b1.md)).
- Grafana colours table cells by thresholds ([table panel](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/table/)).
- AG Grid has no threshold concept, only `cellClassRules` ([cell styles](https://www.ag-grid.com/react-data-grid/cell-styles/)).

**Stale values**

- In web grids: **no evidence**. Grafana has only a "No value" placeholder.
- HMI software: Ignition has quality codes (such as `Uncertain_LastKnownValue`) with overlays on components ([quality codes](https://www.docs.inductiveautomation.com/docs/8.1/platform/tags/quality-codes-and-overlays)).

## 4. API shape: columns as JSX or as an array

For each library: (a) how the table learns its columns, (b) whether wrapper components around a column work, (c) how the row type reaches a column, (d) how columns are reused, (e) stated drawbacks.

### Columns as JSX

**React Aria Components (`<Column>`, `<Row>`, `<Cell>`)**

- (a) Children are rendered through a portal into a small fake DOM, where leaf components appear as host elements ([RFC](https://github.com/adobe/react-spectrum/blob/main/rfcs/2023-react-aria-components.md)).
- (b) Wrappers work; that is the purpose of the design. Previously `<Item>` had to be a direct child (RFC).
- (c) The row type arrives through `TableBody items`: the child function receives a typed `item`, and `Row<T>` is generic ([Table](https://react-aria.adobe.com/Table)). `<Column>` has no accessor; cells are matched to columns by position, so in the documented `item[column.id]` the compiler does not check that column and cell belong together (observation).
- (d) Reuse through the caller's own wrappers, such as `Row<T>` in the documentation.
- (e) Per the RFC: two render passes on every change, and `id` instead of `key`. When rendering depends on outside state, `dependencies` is needed, which recomputes the whole collection ([collections](https://react-aria.adobe.com/collections)).

**PrimeReact (`<Column>` children)**

- (a) `React.Children.toArray(props.children)` reads the children's props directly ([source](https://github.com/primefaces/primereact/blob/master/components/lib/datatable/DataTable.js)).
- (b) Wrappers are silently ignored; the wrapper's code never runs ([#6028](https://github.com/primefaces/primereact/issues/6028)). Edit mode breaks as well ([#5604](https://github.com/primefaces/primereact/issues/5604)).
- (c) `body?: (data: any, …)`, `field?: string`; `ColumnProps` is not generic ([column.d.ts](https://github.com/primefaces/primereact/blob/master/components/lib/column/column.d.ts)).
- (d) No official route; #6028 recommends customising through `Column`'s props.

**KendoReact (`<GridColumn>`)**

- (a, b) A Telerik employee confirms "internal logic to check for the displayName". Wrappers work only with a hand-set `displayName`, and break again with `React.memo` or MobX `observer` ([forum](https://www.telerik.com/forums/custom-data-grid-column-component-as-an-data-grid-child)).
- (c) `dataItem` is `any` ([GridCellProps](https://www.telerik.com/kendo-react-ui/components/grid/api/gridcellprops)).

**Syncfusion (`<ColumnsDirective>` / `<ColumnDirective>`)**

- (a) Directive classes extend `ComplexBase` and carry static `moduleName` and `propertyName` ([source](https://github.com/syncfusion/ej2-react-ui-components/blob/master/components/grids/src/grid/aggregate-columns-directive.tsx)), suggesting the children are translated into the options object of the underlying JavaScript widget. The base class source returned HTTP 404; unverified.
- (b) No evidence.
- (c) Templates are `(props: any)` in the TypeScript examples; `Column` is not generic ([columns](https://ej2.syncfusion.com/react/documentation/grid/columns/columns), [API](https://ej2.syncfusion.com/react/documentation/api/grid/column/)).

**Blueprint (`<Column cellRenderer>`)**

- (a, b) The table validates its children ("Children of Table must be Columns"), which rules out wrappers; the issue is unresolved ([#3588](https://github.com/palantir/blueprint/issues/3588)).
- (c) `cellRenderer(rowIndex, columnIndex)` receives indices only, no row.

**Angular Material (`matColumnDef` templates; not React)**

- (a) Columns are templates collected by `@ContentChildren`. A table wrapped in a component of one's own needs every column registered by hand with `table.addColumnDef()` ([example](https://github.com/angular/components/blob/main/src/components-examples/material/table/table-wrapped/table-wrapped-example.ts)).
- (c) `let element` is `any`, because the cell template does not inherit the parent table's `dataSource` type; the issue is open at P3 ([#22290](https://github.com/angular/components/issues/22290)). A community workaround uses a custom directive with `ngTemplateContextGuard` ([blog](https://nartc.me/blog/typed-mat-cell-def/)).
- (d) The official reusable column is `mat-text-column` ([docs](https://github.com/angular/components/blob/main/src/material/table/table.md)).
- A build step that evaluates JSX columns at compile time: not found in any React library. Angular's template compiler is the closest thing.

### Columns as an array

**TanStack Table**

- (a) Plain objects.
- (c) `createColumnHelper<TData>()` gives "the highest type-safety possible"; `getValue()` is typed in `cell` ([column defs](https://tanstack.com/table/v8/docs/guide/column-defs)).
- (e) The array must be memoised, or every render reprocesses all columns ([column defs](https://tanstack.com/table/latest/docs/guide/column-defs)). A mixed `ColumnDef<T>[]` fails on the value type: "`ColumnDef<Product,string>` is not assignable to `ColumnDef<Product,unknown>`" ([#4382](https://github.com/TanStack/table/issues/4382), [discussion #5794](https://github.com/TanStack/table/discussions/5794)).

**AG Grid**

- (a) `columnDefs`. JSX columns (`AgGridColumn`) were removed in v29, with no reason given ([upgrading to 29](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-29/)).
- (c) `ColDef<TData, TValue>`; callback parameter types sometimes have to be given explicitly ([generics](https://www.ag-grid.com/react-data-grid/typescript-generics/)).
- (d) `defaultColDef` and `columnTypes` for shared properties, e.g. `type: ['currency', 'shaded']` ([column definitions](https://www.ag-grid.com/react-data-grid/column-definitions/)).

**MUI X**

- (a) The `columns` array "should keep the same reference between two renders", or width and order are lost ([column definition](https://mui.com/x/react-data-grid/column-definition/)).
- (c) `GridColDef<R, V, F>` for row, value and formatted value ([PR #4064](https://github.com/mui/mui-x/pull/4064)).
- (e) Users describe the mix of props and imperative API as a "hot mess of race conditions" ([#10205](https://github.com/mui/mui-x/issues/10205)).

## Gaps (observations, not recommendations)

1. **Live updates move rows.** Grids either re-sort on every update (MUI X, AG Grid) or not at all (an AG Grid option). AG Grid applies "rows do not jump" only after editing, not under pointer or focus. No evidence of a table that holds rows still under hover or focus.
2. **Limits as a data model.** Tolerance and deviation ranges with a direction exist only in SAP's vocabulary (and as thresholds in Grafana). React grids offer style rules.
3. **Stale or uncertain values.** Present in HMI software (Ignition), in none of the web grids examined.
4. **Typed columns in JSX.** Every JSX table examined types the row as `any`, passes indices only, or matches cells by position. Wrappers work only in React Aria, at the cost of two render passes. Array APIs are typed but demand stable references and struggle with mixed value types in one array.
5. **Hover-only controls and grid accessibility.** Carbon hides sort icons until hover against NN/g's advice; Higley finds ready-made grid components generally weak on accessibility.
