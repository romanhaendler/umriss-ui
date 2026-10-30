# Monitoring, HMI and everyday products: tables in fixed panes (state 2026-10-30)

Method note. Source code, pull requests, issues and comments were read on 2026-10-30 through the GitHub API (`gh api`). Counts ("+N" reactions on the first post, "cN" comments) are that day's, and code is the `main` branch of that day unless a tag is named. Vendor docs and help centres were read through a fetch tool that summarises, so short quotes come through it. Apple's docs were read as their JSON source. A claim seen only in a search-result summary is marked [S]. A claim from a third party (a blog, a reseller, a non-staff forum post) is labelled as such. Anything I recall but did not re-read today stands under Inferences or Gaps, never under Cited Findings. I ran none of these products, so nothing here is a screenshot judgement.

## 1. Grafana's Table panel: does it fill the panel, and how is the page size set?

### Takeaway
Grafana is the clearest real precedent for option (1). The table fills its panel. With "Enable pagination" on, the page size is computed from the panel's height: `floor((height − header − footer − pager chrome) / row height)`. The docs say "the page size automatically adjusts to the height of the table". Viewers get no page-size selector at all. On resize, the table keeps the page *index* and clamps it to the last page. It does not keep the first visible row. Grafana got here by a winding path:
- Grafana 6: a fixed "Rows per page", default 100.
- Grafana 7: no paging, virtual scrolling instead.
- Users asked to get paging back (#26022, +23).
- 8.5 (2022): paging returned, with the size taken from the height only.
- August 2026: an experimental "Page size" option, hidden from the docs. It is set by the dashboard author, its placeholder reads "auto", and it sits behind a feature toggle.

So even the product that defined "page size = what fits" is now adding a fixed size back. The totals footer is computed over the whole result, not one page. It is pinned to the bottom of the grid, with the pager under it. With few rows, blank panel surface stands between the last row and the pinned footer and pager. With 0 rows, a placeholder shows and the pager is hidden.

### Cited Findings
Docs
- The "Enable pagination" option: "Toggle the switch to control how many table rows are visible at once." and "When switched on, the page size automatically adjusts to the height of the table." Cell height: "Choose from Small, Medium, or Large." Footer: "The table footer displays the results of calculations (and reducer functions) on fields." — [Table visualization docs](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/table/)

Source: TableNG (the current table)
- `usePaginatedRows`:
  - Option doc: "When set to a positive value, fixes the number of rows per page instead of deriving it from the panel height."
  - Otherwise `rowAreaHeight = height - headerHeight - footerHeight - getPaginationChromeHeight(noPanelPadding) - frameHeight` and `rowsPerPage = floor(rowAreaHeight / avgRowHeight)`, at least 1.
  - With variable row heights it averages the first 100 rows. With auto-sized rows it assumes `MAX_CELL_HEIGHT` (48 px).
  - [hooks.ts](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/hooks.ts)
- On resize, a `useLayoutEffect` commented "safeguard against page overflow on panel resize" runs: `if (page > numPages - 1) setPage(Math.max(0, numPages - 1))`. The page index survives, and only an overflow is clamped. The same file carries the comment "TODO: allow persisted page selection via url". — [hooks.ts](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/hooks.ts)
- Pager chrome is 30 px plus an 8 px margin. One helper keeps three places in agreement: the pager's margins, the grid's reserved height, and the row arithmetic. Its comment says the three separate numbers "no longer added up: the grid reserved 38px against a 37px chrome, so the grid plus the controls overflowed the panel." — [constants.ts](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/constants.ts)
- The grid frame is `blockSize: enablePagination ? calc(100% - <chrome>px) : '100%'`, and the grid itself is `blockSize: '100%'`, so the table fills the panel whatever the row count. — [styles.ts](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/styles.ts)
- Rendering details:
  - The pager shows only when `enablePagination && numRows > 0`.
  - 0 rows render `noRowsFallback: <EmptyTablePlaceholder noValue={noValue} />`.
  - The range text is `{{ itemsRangeStart }} - {{ displayedEnd }} of {{ numRows }} rows`, hidden below 750 px width (`PAGINATION_LIMIT`).
  - `omitFinalRowBorder = tableRefreshEnabled && visibleRowsHeight >= bodyHeight`: when the rows do not fill the body, the last row keeps its bottom rule and plain surface follows.
  - [TableDataGrid.tsx](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/TableDataGrid.tsx), [constants.ts](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/constants.ts)
- The footer is react-data-grid's `bottomSummaryRows`. When `clientHeight > totalRowHeight` (rows do not fill), RDG gives the summary row `top = gridHeight - summaryRowHeight * …`, which pins it to the grid's bottom edge rather than placing it directly under the last row. — [react-data-grid DataGrid.tsx](https://github.com/adazzle/react-data-grid/blob/main/src/DataGrid.tsx), [TableDataGrid.tsx](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/TableDataGrid.tsx)
- Cell heights: `Sm` 36 px, `Md` 42 px, `Lg` 48 px. The schema default is `cellHeight` `"sm"`, and `enablePagination` is optional with no default, so paging is off unless switched on. — [utils.ts](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/utils.ts), [panelcfg.cue](https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/table/panelcfg.cue)

Source: the legacy react-table implementation
- `pageSize = Math.round(listHeight / tableStyles.rowHeight) - 1`. When the data changes and the page overflows, it calls `gotoPage(0)`, so it goes back to the first page rather than the last. — [TableRT/Table.tsx](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableRT/Table.tsx)

History
- Grafana 6.7 (Angular): editor field "Rows per page" (placeholder 100) and `const pageSize = panel.pageSize || 100`. The body scrolled within a `max-height`. — [module.ts@v6.7.0](https://github.com/grafana/grafana/blob/v6.7.0/public/app/plugins/panel/table/module.ts), [editor.html@v6.7.0](https://github.com/grafana/grafana/blob/v6.7.0/public/app/plugins/panel/table/editor.html)
- 7.x dropped paging. torkelo (Grafana co-founder), 2020-08-05: "the new table panel has a virtualized scrolling so pagination is no longer needed for performance reasons". — [#26801](https://github.com/grafana/grafana/issues/26801)
- #26022 "Table Panel: Add back pagination option" (+23, c11, 2020-07-02 → closed 2022-03-31). The reporter: "When working (reading/analyzing) tables with lots of records (example of 2000+) it is cumbersome to constantly scroll. It is much more comfortable to paginate. In addition the pagination allows to understand where exactly we are looking at the table" and "-> Feedback from my operations team using it every day." — [#26022](https://github.com/grafana/grafana/issues/26022)
- PR #45732 "Table: New pagination option" (merged 2022-03-31, 8.5) set the design:
  - amy-super (design): "I believe the best approach here since it's in a panel is to encourage either pagination or full scroll but try to avoid both".
  - dprokop: "I think `auto` option for page size would possibly make sense- when chosen the page size would be dynamically determined based on the panel size. Given a possibility to have a fixed length page size, we won't avoid situations when both scroll and paging is available."
  - torkelo moved the pager below the footer and asked: "showing totals for a single page, when is that ever interesting?"
  - dprokop: "the pagination will be handled per results set, not page."
  - The accepted doc line: "When enabled, the page size automatically adjusts to the height of the table."
  - [PR #45732](https://github.com/grafana/grafana/pull/45732)
- PR #129606 "Table: allow configuring a fixed page size for paginated tables" (merged 2026-08-05):
  - "the table page size is currently derived solely from the panel height. This adds an optional **Page size** panel option".
  - Feature toggle `table.paginationPageSize`: `FeatureStageExperimental`, `HideFromDocs: true`, described as "Enables configuring a fixed page size for paginated tables instead of deriving it from the panel height".
  - The editor's option text: "Number of rows per page. When empty, the page size is based on the panel height.", placeholder `'auto'`.
  - [PR #129606](https://github.com/grafana/grafana/pull/129606), [registry.go](https://github.com/grafana/grafana/blob/main/pkg/services/featuremgmt/registry.go), [addTableCustomPanelOptions.ts](https://github.com/grafana/grafana/blob/main/public/app/features/panel/table/addTableCustomPanelOptions.ts)

What users ask for
- Community threads (no staff badge shown):
  - 2024-01-15: "there is no option to set the page size … It seems to be calculated automatically". The reply: "So, just give more or less height to your table". — [community #111985](https://community.grafana.com/t/table-panel-pagination/111985)
  - 2024-12-17: "I would like to enable some dropdown for the user so they can configure the number of rows in each page"; the reply: "isn't a built-in feature". — [community #138540](https://community.grafana.com/t/how-can-pagination-have-configurable-number-of-rows-per-page/138540)
- #24901 "Table Panel: auto height and max rows property" (+20, c28, open since 2020-05-20):
  - "Ideally, tables should be able to grow to a maximum number of rows, then paginate, and if row count is under the maximum, the height of the table should dynamically shrink to fit other content below it." (2023-06-07)
  - "For me the best unit to set the hight would be "rows"" (2022-02-16)
  - "scrolling through pages of empty tables is less than ideal" (2024-04-11)
  - [#24901](https://github.com/grafana/grafana/issues/24901)
- Grafana is now building that model for dashboards. Auto-height panels with a max-height cap shipped behind the flag `grafana.dashboardsAutoHeightPanels`.
  - The Text v2 panel paginates within the cap: "with a max height, pages fit the cap instead of truncating … Uncapped panels still grow to fit."
  - Table follow-up #136072 (open, 2026-10-26): "In fit-content mode, Table sizes itself from all rows rather than the layout's maximum height. Pagination then uses that oversized height", and the plan is to "Preserve natural growth when uncapped and configured page-size behavior."
  - [PR #136044](https://github.com/grafana/grafana/pull/136044), [PR #136045](https://github.com/grafana/grafana/pull/136045), [#136072](https://github.com/grafana/grafana/issues/136072)
- Bugs around derived paging:
  - #60963: "the calculation for rows per page was slightly off so sometimes the scrollbar was shown even when pagination was enabled" (torkelo, 2023-01-06).
  - #118278 (open, v12.0.2): after a filter shrinks the data, the page index stays and the panel shows "No data". The current TableNG clamps the index, as quoted above.
  - [#60963](https://github.com/grafana/grafana/issues/60963), [#118278](https://github.com/grafana/grafana/issues/118278)

### Inferences
- Grafana's model is option (1) without a viewer selector. A page size taken from the height and a user's page-size selector do not combine. AG Grid hides its selector in auto mode (§6). Grafana never offered one. If umriss keeps its `[10, 25, 50]` selector, option (1) needs either no selector in fill mode or an explicit "Fit" entry beside the numbers.
- Keeping the page index on resize moves the user's place. On page 3 at 10 rows the user sees rows 21–30. Grow the pane to 15 rows and page 3 shows rows 31–45, and rows 21–30 are now on page 2. Anchoring on the first visible row, `page = floor(firstRow / newSize)`, would avoid this. None of the sources does it (see §6).
- Grafana panels are sized by dashboard authors and are rarely resized by viewers. umriss's panes have splitters, so viewers resize them more often. Page-size churn on resize would happen more often there than in Grafana.
- Grafana's footer rule works well for a filling table: totals cover the whole result, sit pinned to the bottom of the frame, and the pager sits under them. The blank area then lies between the last row and the footer, not under the footer.
- The +20 request in #24901 ("grow to a maximum number of rows, then paginate … shrink") is a third model besides options (1) to (3). There the frame follows the content up to a cap. That decision belongs to the parent layout, not the table.

### Gaps
- The motive for the fixed-size option is in a private planning issue ("Closes grafana/hyperion-planning#632"). The public PR gives no user quote.
- I did not see how the blank area under a short last page looks in the refreshed design (`table.refresh`), beyond the last-row border logic.

## 2. Kibana and Elastic EUI: EuiDataGrid, EuiBasicTable, Lens, Discover

### Takeaway
EUI is the opposite precedent, and it matches umriss's current behaviour almost exactly:
- A fixed page size (default 10, options `[10, 25, 50]`, the same as umriss), with a "Rows per page" menu and "Show all rows" as option 0.
- The grid shrink-wraps its rows unless its height is constrained, by a `height` prop or by CSS. Then it fills that height and virtualises.
- The height of the first render is held across pages, so the pager does not jump.

In 2020 the EUI design team rejected blank padding rows on the last page. Their reason: the grid is read-only, and blank cells "look like blank rows of data which it isn't". That is the case against option (3), from a design-system team. Kibana's Lens table also uses a fixed page size (10; 10/20/30/50/100) inside a container of `height: 100%`. Discover shows 100 rows per page from a 500-document sample, with an end-of-results message offering to load more.

### Cited Findings
- `EuiDataGridPaginationProps.pageSize`: "How many rows should initially be shown per page. Pass `0` to display the selected "Show all" option and hide the pagination. @default 10". `pageSizeOptions`: "@default [10, 25, 50]", and "Pass an empty array to hide "Rows per page" select button." — [data_grid_types.ts](https://github.com/elastic/eui/blob/main/packages/eui/src/components/datagrid/data_grid_types.ts)
- `height`: "Sets the grid's height, forcing it to overflow in a scrollable container with cell virtualization." `gridStyle.stickyFooter`: "If set to true, the footer row will be sticky @default true". — [data_grid_types.ts](https://github.com/elastic/eui/blob/main/packages/eui/src/components/datagrid/data_grid_types.ts)
- Docs:
  - "When wrapped inside a container, like a dashboard panel, the grid will start hiding controls and adopt a more strict flex layout."
  - "if **EuiDataGrid** is unable to render at the full dimensions it needs due to screen real estate or other DOM constraints, it will overflow within a scrollable container and only render the visible cells."
  - A warning: "Never toggle the height between a value and `undefined`."
  - [Container constraints](https://eui.elastic.co/docs/components/data-grid/container-constraints/)
- `useFinalGridDimensions` measures the wrapper again when the wrapper resizes and when `rowCount` changes. It uses the wrapper height when that differs from the unconstrained height (the sum of the rows); otherwise `finalHeight = height || unconstrainedHeight`. — [grid_height_width.ts](https://github.com/elastic/eui/blob/main/packages/eui/src/components/datagrid/utils/grid_height_width.ts)
- The pager hides when "Rows count is less than min pagination option (rows per page)". With 5 rows and `[10, 25, 50]` there is no pager. — [data_grid_pagination.tsx](https://github.com/elastic/eui/blob/main/packages/eui/src/components/datagrid/pagination/data_grid_pagination.tsx)
- `EuiTablePagination` (shared with EuiBasicTable and EuiInMemoryTable) has defaults `itemsPerPage: 10`, `itemsPerPageOptions: [10, 25, 50]`. Its button reads "Rows per page: {n}" or "Showing all rows", and its menu items read "{rowsPerPage} rows" or "Show all rows". There is no "x–y of n" range text in this component. — [table_pagination.tsx](https://github.com/elastic/eui/blob/main/packages/eui/src/components/table/table_pagination/table_pagination.tsx), [table_pagination_defaults.ts](https://github.com/elastic/eui/blob/main/packages/eui/src/components/table/table_pagination/table_pagination_defaults.ts), [pagination_bar.tsx](https://github.com/elastic/eui/blob/main/packages/eui/src/components/basic_table/pagination_bar.tsx)
- #4309 "[EuiDataGrid] Fixed number of rows" (2020-11-25). The request was: "I'd like it so that the last page of a datagrid has `pageSize` rows with empty rows to pad it out … prevents things jumping around the page."
  - elizabetdev (EUI design): "The design I suggest is to grow the table in height. So the table always has a fixed height."
  - cchaos (EUI design): "EuiDataGrid is not like Excel or other tabular applications because there is no input. The data is completely read-only. Therefore, having visibly blank cells is a misnomer because what that looks like is blank rows of **data** which it isn't." And: "Where it gets tricky is if the dataset only has 1 row of data, but the grid is set to `100` rows per page. Do we still force this at this point or should the table **only** grow **if** there are multiple pages?" Later: "Yes, this should be the default behavior and no prop to turn it off."
  - The reporter agreed: "the changing height is more readable and more natural; like @cchaos says, blank rows implies they editable."
  - chandlerprall (EUI maintainer) on the virtualisation branch: "the grid's initial render height is kept for all pages … The initial height is recorded & held onto."
  - [#4309](https://github.com/elastic/eui/issues/4309)
- Kibana Lens table:
  - `DEFAULT_PAGE_SIZE = 10` and `PAGE_SIZE_OPTIONS = [DEFAULT_PAGE_SIZE, 20, 30, 50, 100]`. A page-size change is saved to the panel (`onEditAction({ action: 'pagesize', … })`) and the page index goes back to 0. "active page isn't persisted". After a data change the index is clamped to the last page.
  - The container style is `height: 100%; overflow: auto hidden`.
  - [table_basic.tsx](https://github.com/elastic/kibana/blob/main/x-pack/platform/plugins/shared/lens/public/visualizations/datatable/components/table_basic.tsx)
- Kibana docs (tables):
  - "Navigation controls appear at the bottom of the table when the table contains at least 10 items." and "By default, 10 rows appear per page. Users of the dashboard will be able to select a different number." Without paging: "all rows appear in a scrollable view".
  - Density: "Compact … Normal … (default) … Expanded".
  - "Summary row: Add a row at the bottom of the table".
  - [Build tables with Kibana](https://www.elastic.co/docs/explore-analyze/visualize/charts/tables)
- Kibana Discover: "The default is 100 results per page." Sample size: "any number between 10 and `discover:sampleSize`". End of data: "On the last page of the table, a message indicates that you've reached the end of the loaded search results." and "you can choose to load more results". — [Customize the Discover view](https://www.elastic.co/guide/en/kibana/master/document-explorer.html) (canonical: [document-explorer](https://www.elastic.co/docs/explore-analyze/discover/document-explorer))
- `discover:sampleSize` defaults to 500 and `discover:sampleRowsPerPage` to 100 [S]. — [Advanced settings](https://www.elastic.co/docs/reference/kibana/advanced-settings)

### Inferences
- EUI's held height is what umriss does now: "a page keeps the most lines it has shown". It is a well-trodden design, and the people who chose it also chose the blank, unruled surface below.
- EUI hides the pager when the rows fall below the smallest option. That removes the "10 rows and a big blank surface" problem for small data sets. It does not help a large result set in a tall pane.

### Gaps
- I did not verify whether the Lens table visibly fills a tall dashboard panel with blank surface under 10 rows, or shrinks. The container is `height: 100%`, but the grid's inner height logic decides.

## 3. Other monitoring and BI: Datadog, Splunk, Power BI, Tableau

### Takeaway
None of them takes the page size from the height. Splunk pages at a fixed `count` of 10. Dashboard Studio also offers "Dynamic height", where the table grows or shrinks to fit its rows; that is the Grafana #24901 model. Power BI's table visual does not page at all: it scrolls and loads data in windows of 500 rows. Datadog's table widget docs speak only of a row `limit`.

### Cited Findings
- Datadog table widget: `limit` is "the number of lines to show in the table". When the widget is small, Datadog "prioritizes displaying the data on the widget and hides the search bar". The page says nothing about pagination or scrolling. — [Table widget](https://docs.datadoghq.com/dashboards/widgets/table/)
- Splunk Simple XML `<table>`: `count` is an integer, default `10`, "The maximum number of rows to display."; `showPager` is boolean, default `true`, "Toggle pagination on or off."; `totalsRow` defaults to `false`. — [Simple XML Reference 9.4](https://help.splunk.com/en/splunk-enterprise/create-dashboards-and-reports/simple-xml-dashboards/9.4/simple-xml-reference/simple-xml-reference)
- Splunk Dashboard Studio table:
  - `count` is a number, default `10`, "Specify the maximum number of rows to display."; `paginateDataSourceKey` defaults to `primary`, "the data source key for pagination and sorting." — [Dashboard Studio 10.0 table](https://help.splunk.com/en/splunk-enterprise/create-dashboards-and-reports/dashboard-studio/10.0/visualizations/table)
  - "Use Dynamic height to allow a table to grow or shrink in view mode so the visualization height fits the displayed data." and "When Dynamic height is turned off, the table uses the height configured in the dashboard layout." — [Dashboard Studio 10.6 table](https://help.splunk.com/en/splunk-cloud-platform/create-dashboards-and-reports/dashboard-studio/10.6/visualizations/table)
- Power BI table: "Values: Virtualization (data windowing) by using Window of 500 rows at a time." Data windowing lets users "scroll through the data in a visual by progressively loading fragments of the overall semantic model." — [Data point limits](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-data-points). The table article covers headers, a totals row and column auto-size ("Grow to fit": "Columns automatically expand to fill the visual container"), but says nothing on vertical fill or paging. — [Table visualizations](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-tables)

### Inferences
- In BI tools, "fill the visual" is described for width (Power BI "Grow to fit"). Height is left to scrolling. Paging in a visual is a Splunk and Grafana habit, not a Power BI one.

### Gaps
- Tableau text tables and the Datadog Log Explorer list (infinite scroll or paging) were not covered. No primary doc turned up in one search each.
- Whether Splunk's fixed-height table shows blank surface below `count` rows is not documented.

## 4. Industrial HMI and SCADA: Ignition, WinCC Unified, AVEVA

### Takeaway
Control-room alarm lists either page at a fixed, operator-chosen count (Ignition, AVEVA Plant SCADA) or scroll (WinCC Unified panels). No vendor documents a page size taken from the component's height, and none documents filling the pane with empty lines. Ignition's Perspective Table has `pager.options` and `pager.activeOption`, a top and a bottom pager, a minimum row height, and virtualisation. Its Alarm Status Table pages by default, "to improve performance". The sources here are thinner than for Grafana and EUI.

### Cited Findings
- Ignition Perspective Table, pager:
  - `options`: "Rows to show per pager option."
  - `activeOption`: "Determines how many rows the table displays when first rendered", and it "must exist as an available option". Since 8.1.45 it can change at runtime; it replaced `initialOption`.
  - `top` and `bottom`: "Enables top pager." and "Enables bottom pager." The pager "displays the current page and Previous … and Next … icons for navigation."
  - `activePage` "corresponds to the value of the page jump input field."
- Ignition Perspective Table, rows and states:
  - `rows.height`: "A minimum height value applied to all rows. A row cannot be shorter than this value", with "auto" as the default.
  - `virtualized`: "only shows a portion of the underlying data".
  - `emptyMessage.noData` and `emptyMessage.noFilterResults` are separate messages.
  - `enableFooter` defaults to false.
  - No property derives rows per page from the component's height.
  - [Perspective Table 8.1](https://docs.inductiveautomation.com/docs/8.1/appendix/components/perspective-components/perspective-display-palette/perspective-table), [Perspective Table 8.3](https://www.docs.inductiveautomation.com/docs/8.3/appendix/components/perspective-components/perspective-display-palette/perspective-table)
- Perspective Table row floor: "It seems the rows have a minHeight of 30px." (dillonu, 2020-05-02). ynejati (Inductive Automation): "This was intentional. It's there as a row virtualization measurement calculation optimization." — [FEATURE-16567 thread](https://forum.inductiveautomation.com/t/feature-16567-perspective-table-row-height/33466)
- Sizing the table to its rows. The asker: "I want them to grow to the rows per page setting and shrink to show only the actual rows." Flex `basis: auto` "downsizes the component so that only the header is visible" while virtualised. The fix: "Try setting the table's `virtualized` property to `false`." No staff badge was shown on these posts. — [Perspective table auto size in flex](https://forum.inductiveautomation.com/t/perspective-table-auto-size-in-flex/39781)
- A search summary attributes to a forum reply that "When virtualized, the body will fill with rows based upon the available space" [S]. I could not find the post.
- Ignition Perspective Alarm Status Table:
  - `pager.enabled`: "Enables the pager to be displayed. Default is true."
  - `pager.options`: "Rows to show per pager option."; `pager.initialOption`: "The initial option to use when the table first loads."
  - User interface: "Long lists of alarm events are spread across multiple pages to improve performance." and "Rows to Display: Determines how many rows are shown per page."
  - [Alarm Status Table 8.1](https://www.docs.inductiveautomation.com/docs/8.1/appendix/components/perspective-components/perspective-display-palette/perspective-alarm-status-table)
- Siemens WinCC Unified, Comfort Panels: "Scroll bars are not available in the alarm view. Use the touchscreen to move the contents of the alarm view horizontally or vertically." Also: "The "Show recent" function is only supported in conjunction with ascending sort order." — [Readme WinCC Unified V18 Upd1 SR1, §6.1, p. 32 (PDF)](https://support.industry.siemens.com/cs/attachments/109807124/ReadmeRTUniUpdate_V18.0Upd1SR1_enUS.pdf)
- AVEVA Plant SCADA (formerly Citect) [S]:
  - `AlarmDsp(AN, Count, …)`: "Count is the number of alarms to display".
  - `AlarmDspNext` "scrolls the alarms displayed by the AlarmDsp function" and is normally bound to a key; `AlarmDspPrev` "displays the previous page of alarms".
  - The docs site renders by script and could not be fetched. — [Plant SCADA docs](https://docs.aveva.com/bundle/plant-scada/page/1033462.html)
- Third-party only (a reseller's knowledge base, not Siemens): the WinCC Unified Alarm Control has "a 1000-row display limit". — [industrialmonitordirect.com](https://industrialmonitordirect.com/blogs/knowledgebase/wincc-unified-alarm-control-1000-row-limit-fix)

### Inferences
- In HMI the count per page is a project setting or an operator choice from a list, as in umriss's selector. It is never "whatever fits". A likely reason: operators talk about "page 2 of the alarm list" across shifts and screens, and a page that changes with the pane's size breaks that shared reference.
- The Ignition forum shows the same wish as Grafana #24901: grow to the rows-per-page setting, then shrink to the actual rows. Virtualisation fights it, because the body fills the available space.

### Gaps
- Defaults for Ignition `pager.options` and `activeOption` are not in the docs.
- I found no public docs on WinCC Unified PC's Alarm Control, the AVEVA System Platform or InTouch alarm grid, or AVEVA's alarm client that state what fills the space under the last alarm.
- ISA-18.2 and EEMUA 191 guidance on alarm-list layout was not checked. Both are paywalled.

## 5. Everyday products as mental models

### Takeaway
The everyday precedents fall into three groups:
- Mail, issue trackers and Notion use a fixed count with a "next" step: Gmail's "Maximum page size", Notion's "Load limit" and its "Load x more" row.
- Spreadsheets draw ruled empty cells under the data, but those cells are an editing canvas, and Sheets ends the canvas with "more rows at the bottom" and an Add button.
- Desktop list views fill their pane. macOS draws alternating stripes as the table's *background*, and as far as I can tell they continue below the last row. That is the one real "empty ruled lines" precedent, and it applies to stripes, not to rules or cells.

None of them takes the page size from the window height.

### Cited Findings
- Gmail, Multiple Inboxes: "Next to "Maximum page size," enter the number of emails you want to view in the section." — [Gmail Help](https://support.google.com/mail/answer/9694882?hl=en). The general setting (Settings → General → Maximum page size, 10 to 100) is described only by third-party tutorials [S], e.g. [PCWorld](https://www.pcworld.com/article/491831/gmail-42.html).
- Jira Cloud issue search shows 50 results per page [S]. An Atlassian community answer says this holds "irrespective of the updated settings" and links bug JRACLOUD-83321. — [community thread](https://community.atlassian.com/forums/Jira-questions/How-to-change-the-count-of-the-search-results-displayed-per-page/qaq-p/2656924)
- Notion:
  - "Select `Load limit` and select a number of pages." with the example "you may want to only see 10 project pages at a time, or many more." — [Timelines help](https://www.notion.com/help/timelines)
  - Release notes, 2022-04-14: "Now, your databases only load what you need, when you need it." and "Fixed a bug that caused the "Load 50 more" button to appear on Table view databases with less than 50 rows", plus a fix for the "Load x more" row. — [Notion releases 2022-04-14](https://www.notion.com/releases/2022-04-14)
- Airtable:
  - Grid row heights: "Short (the most dense option, and the default height for new views)", Medium, Tall, Extra Tall. — [Grid view](https://support.airtable.com/articles/7905594155-airtable-grid-view)
  - "The summary bar is located at the bottom of some view types within a table." — [Summary bar](https://support.airtable.com/articles/7344081006-using-the-summary-bar-in-airtable-views)
- Google Sheets: "On your spreadsheet, scroll to the bottom." then "Next to "more rows at the bottom," enter the number of rows you'd like to add." then "Click Add." — [Add or move columns & cells](https://support.google.com/docs/answer/54813?hl=en&co=GENIE.Platform%3DDesktop)
- AppKit `NSTableView.usesAlternatingRowBackgroundColors`: "A Boolean value indicating whether the table view uses alternating row colors for its background." and "When the value of this property is true, the table uses the standard alternating row colors for the background." — [Apple docs](https://developer.apple.com/documentation/appkit/nstableview/usesalternatingrowbackgroundcolors). `gridStyleMask`: "The default value of this property is NSTableViewGridNone." — [Apple docs](https://developer.apple.com/documentation/appkit/nstableview/gridstylemask)
- Apple HIG: "macOS defines a bordered style that uses alternating row backgrounds to help make large tables easier to use" and "Consider using alternating row colors in a multicolumn table. Alternating colors can help people track row values across columns, especially in a wide table." — [HIG: Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)
- A developer blog (not primary): "the enclosing table view itself will still draw the system default background to fill the space below the last row". — [Christian Tietze, 2017](https://christiantietze.de/posts/2017/05/draw-alternating-table-view-rows/)
- Win32 list view (the control behind Explorer's details view): `LVS_EX_GRIDLINES` "Displays gridlines around items and subitems. This style is available only in conjunction with the LVS_REPORT style." — [Extended List-View Styles](https://learn.microsoft.com/en-us/windows/win32/controls/extended-list-view-styles)

### Inferences
- macOS is a real, mass-market precedent for continuing the row rhythm into the empty area: Finder list view, Mail and Music show stripes to the bottom of the pane. But they are stripes on a background that cannot be clicked: no rules, no hover, no selection. That differs from option (3) as drafted ("empty ruled rows"). A filler painted in the row rhythm, unruled and inert, would follow macOS and stay clear of EUI's objection ("blank rows of data"). I am inferring "continues below the last row" from the docs' word "background" and a non-primary blog, not from an Apple sentence.
- Spreadsheets teach users that empty ruled cells can be typed into. That is the mental model EUI warned against for read-only data.
- The everyday web products (Gmail, Jira, Notion, GitHub) page at a fixed number and let the page scroll. They do not fill a pane at all. A table filling a fixed pane belongs to desktop list views and dashboards.

### Gaps
- Not verified in primary sources:
  - GitHub's issues-list page size and pager.
  - Linear's list loading: its docs cover display options and API cursors (50 per query), not UI loading.
  - Airtable's "+" add-record line under the last record: the help pages found speak of "the + icon at the bottom of your base" [S].
  - Excel's grid.
  - Windows Explorer's look below the last item.
  - Gmail's range text ("1–50 of N").
- Whether the Win32 `LVS_EX_GRIDLINES` lines continue below the last item is not stated in the docs.

## 6. Anything that would make users go "wow"

### Takeaway
A page size that adapts to the pane exists in two widely used grid libraries:
- AG Grid's `paginationAutoPageSize` changes the page size on resize and hides the page-size selector in that mode.
- MUI's `autoPageSize` cannot be combined with `autoHeight`.

Among products, Grafana's table is the shipped example. Its range text ("21 - 30 of 120 rows") is the nearest to "rows 21–34 of 120". I found no product or library that documents keeping the first visible row, selection or focus across a change of page size. Grafana keeps the page index, Lens and EUI's examples go back to page 0, and the legacy Grafana table jumped to page 0. Keeping the first visible row would set umriss apart, as far as these sources show.

### Cited Findings
- AG Grid:
  - With `paginationAutoPageSize=true` "the grid will automatically show as many rows in each page as it can fit", and "if you resize the display area of the grid, the page size automatically changes."
  - "the grid will not show the page size dropdown selector in the pagination panel" and "`paginationPageSizeSelector` will be ignored."
  - Caveats: "Each pagination page must have the same number of rows". With auto row height "the page height will be calculated using the default row height and not the actual row heights", so "the rows will not fit perfectly into the page if these features are mixed."
  - Range summary: "e.g. `1 to 10 of 50`".
  - [AG Grid row pagination](https://www.ag-grid.com/react-data-grid/row-pagination/)
- MUI X Data Grid: "Use the `autoPageSize` prop to auto-scale the `pageSize` to match the container height and the max number of rows that can be displayed without a vertical scroll bar." and "You cannot use both the `autoPageSize` and `autoHeight` props at the same time because `autoHeight` scales the height of the Data Grid according to the `pageSize`." "By default, each page contains 100 rows." — [MUI pagination](https://mui.com/x/react-data-grid/pagination/)
- Grafana's page index survives resize and only an overflow is clamped. The range text is "{start} - {end} of {n} rows". — §1, [hooks.ts](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/hooks.ts), [TableDataGrid.tsx](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Table/TableNG/TableDataGrid.tsx)
- Kibana Lens resets `pageIndex: 0` when the page size changes. — [table_basic.tsx](https://github.com/elastic/kibana/blob/main/x-pack/platform/plugins/shared/lens/public/visualizations/datatable/components/table_basic.tsx)
- EUI holds the grid height across pages: "The initial height is recorded & held onto." — [#4309](https://github.com/elastic/eui/issues/4309)

### Inferences
- Taken together, the behaviours that would read as "wow" and that nobody documents:
  - Anchor on the first visible row when the page size changes, by resize or by selector.
  - Keep the selected row and focus in view, landing on the page that holds it.
  - Range text that stays true while resizing ("21–34 of 120").
  - No pager jump on the last page, with the pager and totals pinned to the bottom as Grafana does.
- AG Grid and MUI both refuse to combine "auto" with something else: AG Grid drops the selector, MUI drops auto height. Their maintainers found the two modes conflicting. The same conflict arises in umriss between "page size follows the height" and "the selector offers 10, 25 and 50".

### Gaps
- I did not check how AG Grid and MUI choose the current page after an auto-size change, only that the size changes.
- No primary source documents smooth row transitions on a page change in any product here.

## Summary for the design question

| Product | Fills a fixed pane? | Pages? | Page size from height? | Under the last row | Range text |
|---|---|---|---|---|---|
| Grafana Table (TableNG, 2026) | Yes, grid at 100 % of panel | Optional, off by default | Yes, the default; fixed override experimental and hidden (2026-08) | Blank panel surface; last row keeps its rule; totals footer and pager pinned at the bottom | "21 - 30 of 120 rows" (hidden below 750 px) |
| Grafana 6 table (Angular) | Scrolls within max-height | Yes, "Rows per page" (default 100) | No | — | Page numbers only |
| EuiDataGrid | Only when height is constrained; otherwise shrink-wraps; first-render height held across pages | Yes, 10 of `[10, 25, 50]`, "Show all"; pager hidden below the smallest option | No | Blank; padding rows rejected by EUI design | None ("Rows per page: 10") |
| Kibana Lens table | Container `height: 100%` | Toggle; 10 of `[10, 20, 30, 50, 100]`, saved per panel | No | Not verified | None |
| Kibana Discover | Main view | 100 per page from a 500-row sample | No | End-of-results message with "load more" | Not verified |
| Splunk Simple XML | Panel | Yes, `count` 10 | No | Not documented | Not documented |
| Splunk Dashboard Studio | Layout height, or "Dynamic height" (grows and shrinks to the data) | Yes, `count` 10 | No | Not documented | Not documented |
| Power BI table | Visual container (width "Grow to fit") | No; scrolls, 500-row windows | — | Not documented | — |
| Datadog table widget | Widget | Not documented (`limit` only) | No | Not documented | — |
| Ignition Perspective Table | Component; virtualised body fills [S] | Pager top and/or bottom, `options` / `activeOption` | No property for it | Not documented | Page jump field |
| Ignition Alarm Status Table | Component | Pager on by default, "Rows to Display" | No | Not documented | Not documented |
| WinCC Unified alarm view (Comfort Panel) | Pane | No; touch scroll, "Show recent" | — | Not documented | — |
| AVEVA Plant SCADA alarm page [S] | Page | Fixed `Count`, Next/Prev page | No | Not documented | — |
| AG Grid `paginationAutoPageSize` (library) | Yes | Yes | Yes; selector hidden | Fits exactly with fixed row height | "1 to 10 of 50" |
| MUI `autoPageSize` (library) | Yes | Yes | Yes; not with `autoHeight` | Fits | Not verified |
| Gmail / Jira / Notion | No; the page scrolls | Fixed count / "Load x more" | No | Next page / load-more row | Gmail "1–50 of N" (not verified) |
| Google Sheets | Ruled editing canvas | No | — | Empty editable cells, then "more rows at the bottom" + Add | — |
| macOS NSTableView (Finder list) | Yes | No | — | Alternating stripes as background, inert (inference) | — |

What this means for options (1) to (3):
- Option (1), page size from height, has a shipped precedent (Grafana, and AG Grid and MUI as libraries). But all three treat it as an exclusive mode: no viewer selector (Grafana, AG Grid), no auto height (MUI). Grafana keeps the page index on resize, so the user's place moves. And Grafana has just added a fixed size back.
- Option (2), only scrolling tables fill, matches EUI's and the HMI vendors' fixed page sizes. EUI holds the height across pages and leaves the surface below blank, which is what umriss does today.
- Option (3), empty ruled rows, was rejected in EUI #4309 on exactly the grounds the owner suspects. The only mass-market cousin is macOS's inert stripes, with no rules and no interaction.
- A fourth model has strong user demand (Grafana #24901, +20; the Ignition forum; Splunk's "Dynamic height"): grow to the page size, then shrink to the rows. It is a decision for the parent layout, not the table.
