# Documentation of data-heavy component libraries (charts, grids, schedulers, formula engines), state 2025–2026

Scope: how AG Grid, TanStack Table, MUI X, Highcharts, ECharts, Observable Plot, Nivo, Bryntum, HyperFormula and industrial/dashboard design systems (Siemens iX, Grafana Saga/@grafana/ui, Carbon Charts) document large, nested, generic option APIs. The goal is patterns umriss-ui (charts, table, schedule, calculation) can adopt so that every option is explained, typed and demonstrated.

Method note: several of the docs sites are JS-rendered single-page apps (api.highcharts.com, echarts.apache.org option manual and example editor, ag-grid.com reference tables, nivo.rocks, bryntum.com docs). WebFetch got only the page shells or partial tables for them, so where possible the findings come from the **docs source code on GitHub** (the authoring formats). That is in fact the more useful evidence for "how completeness is enforced". nivo.rocks failed DNS and observablehq.com returned 429. Both were covered through their GitHub sources.

## 1. How do the major libraries document their APIs (reference + feature pages + examples)?

### Takeaway
Every mature data library splits the docs into two layers that link to each other. One layer is **feature/guide pages**, organized by task and full of live demos. The other is an **exhaustive reference**, organized by type/option tree and generated from source. They differ in where the per-option example lives. Highcharts and ECharts attach demos or live controls to each individual option in the source comment. Nivo turns each prop into a playground control. AG Grid, MUI X and TanStack keep reference rows short and push examples to the feature pages.

### Cited Findings

**AG Grid (grid)**
- The Column Properties reference is split into categories that mirror the feature docs: "Columns: Accessibility, Aggregation, Calculated Columns, Display, Editing, Events, Filter, Find, Formulas, Header, Integrated Charts, Pinned, Pivoting, Rendering and Styling, Row Dragging, Row Grouping, Sort, Spanning, Tooltips, Width", plus "Groups" for column-group properties. Each row has Property / Type / Default / Description columns. Callback types are shown by name (e.g. `valueGetter: string | ValueGetterFunc`, `EditableCallback`). — [AG Grid Column Properties](https://www.ag-grid.com/react-data-grid/column-properties/)
- The Grid Options reference has 30+ categories (Accessories, Clipboard, Column Definitions, Editing, Filtering…). Section headers link to the matching feature guide (e.g. Filtering → filtering-overview). Typed entries include `rowData: TData[] | null`, `getRowId: GetRowIdFunc`, `autoGroupColumnDef: AutoGroupColumnDef`. The reference states that `TData` is used when provided via `GridOptions<TData>` and defaults to `any` otherwise. — [AG Grid Grid Options](https://www.ag-grid.com/javascript-data-grid/grid-options/)
- "A small number of Grid Options do not support updating their value… These options are marked as **Initial** on the Options Reference". So the reference carries a lifecycle badge per option, and the guide explains its meaning once. — [AG Grid Grid Overview / grid-interface](https://www.ag-grid.com/react-data-grid/grid-interface/) (via search summary)
- (Caveat: the fetched HTML showed empty Description/Default cells. That is almost certainly a client-side rendering artifact of the fetch, not missing content. I could not verify the expandable-description behaviour in this session.)

**TanStack Table (headless grid, generics-heavy)**
- The hand-written API page uses one heading per option, a TS code block with the exact signature (with generics), and one or two sentences of prose. Examples: `accessorKey?: string & typeof TData`, `accessorFn?: (originalRow: TData, index: number) => any`, and `cell?: string | ((props: { table: Table<TData>; row: Row<TData>; column: Column<TData>; cell: Cell<TData>; getValue: () => any; renderValue: () => any }) => unknown)`. — [TanStack ColumnDef APIs](https://tanstack.com/table/v8/docs/api/core/column-def)
- Feature-specific column-def options (sorting, filtering, grouping…) are **not** on the core ColumnDef page. They are documented on each feature's API page, mirroring the library's feature-plugin architecture. — [TanStack ColumnDef APIs](https://tanstack.com/table/v8/docs/api/core/column-def)
- In addition there is an **auto-generated TypeDoc reference** (`/docs/reference/...`) that renders type parameters with constraints (e.g. `TFeatures extends TableFeatures`), each member's declaration (`optional accessorFn: AccessorFn<TData, TValue>`), a "Defined in" GitHub source link, and "Inherited from" links between interfaces (`Column_Column.accessorFn`). — [TanStack reference Column_Core](https://tanstack.com/table/latest/docs/reference/index/interfaces/Column_Core)
- The Columns Guide explains the `TData` generic in prose: whatever you pass to `data` becomes `TData` for the whole instance, and column defs must use the same `TData`. It shows `accessorKey` (dot notation for deep keys) next to `accessorFn` (e.g. combining first and last name). — [TanStack Columns Guide](https://tanstack.com/table/v8/docs/guide/column-defs); [Data Guide](https://tanstack.com/table/latest/docs/guide/data)

**MUI X Data Grid**
- The API page renders props as a table with Name / Type / Default / Description and a "Required" marker (e.g. `columns`, Required, `Array<object>`, "Set of columns of type GridColDef[]"). Function props show the **full signature**, e.g. `onRowClick: function(params: GridRowParams, event: MuiEvent, details: GridCallbackDetails) => void`. Unions are spelled out (`density: 'comfortable' | 'compact' | 'standard'`, default `standard`), and object arrays are inlined (`sortModel: Array<{ field: string, sort?: 'asc' | 'desc' }>`). Descriptions carry usage warnings (getRowId: "Ensure the reference of this prop is stable…"). — [MUI X DataGrid API](https://mui.com/x/api/data-grid/data-grid/)
- The same API page also has a "Demos" section linking back to feature pages, a "Slots" section (overridable sub-components with defaults), CSS classes (`.MuiDataGrid-cell` → `cell`), import variants per plan (Pro/Premium), and "New"/"Planned" badges. — [MUI X DataGrid API](https://mui.com/x/api/data-grid/data-grid/)
- Feature pages are Markdown with embedded live demos via `{{"demo": "BasicExampleDataGrid.js", "bg": "inline", "defaultCodeOpen": false}}`, plan badges inline on headings (Pro plan for multi-sorting), and a closing **"API" section** linking DataGrid / DataGridPro / DataGridPremium API pages. Some pages also have a "Selectors" section. — [mui-x docs/data/data-grid/sorting/sorting.md](https://raw.githubusercontent.com/mui/mui-x/master/docs/data/data-grid/sorting/sorting.md)

**Highcharts (charts)**
- Options are documented as JSDoc **in the library source next to the default value**. Tags include `@sample {highcharts} highcharts/plotoptions/series-allowpointselect-line/ Line` (product + demo path + human label), `@since 1.2.0`, `@type {boolean|Highcharts.AnimationOptionsObject}`, `@default {highcharts} true` (per-product defaults), and `@declare Highcharts.PointStatesHoverOptionsObject` (names the generated TS interface for a nested object). Partial types are written as `@type {boolean|Partial<Highcharts.AnimationOptionsObject>}`. — [highcharts ts/Core/Series/SeriesDefaults.ts](https://raw.githubusercontent.com/highcharts/highcharts/master/ts/Core/Series/SeriesDefaults.ts)
- api.highcharts.com renders this as a tree with sidebar navigation, a search box and breadcrumbs (`series.line.marker`). Child options are listed with defaults (`enabled: null`, `radius: 4`, `lineColor: var(--highcharts-background-color)`). Each `@sample` becomes a "Try it" demo link. — [Highcharts API series.line.marker](https://api.highcharts.com/highcharts/series.line.marker) (the tree and defaults were seen. The "Try it" rendering is inferred from the `@sample` tags because the SPA's demo links did not come through in the fetch)
- The API docs are built from the source by a JSDoc pipeline (`api-docs` + `highcharts-docstrap` repos, `gulp jsdoc`). — [search summary, Highcharts GitHub](https://github.highcharts.com/highcharts.js)
- Demo pages (highcharts.com/demo) show a live chart with a code tab per framework (JS, TS, React, Angular, Vue, Svelte), a theme switcher (Auto/Light/Dark), "Edit in StackBlitz", previous/next navigation, links to the API reference, and a categorized gallery (Line, Area, Column/bar, Pie, Scatter/bubble, 3D, Gauges, Heat maps…). — [Highcharts line chart demo](https://www.highcharts.com/demo/highcharts/line-chart)

**Apache ECharts (charts)**
- Options are authored in Markdown + etpl templates in the separate `echarts-doc` repo. The heading format declares name, type and default together: `## propName(type) = defaultValue`, with union types such as `number|string` and defaults from template variables (`= ${someVar|default(123)}`). — [apache/echarts-doc README](https://raw.githubusercontent.com/apache/echarts-doc/master/README.md)
- **Per-option interactive examples** are embedded in the option doc. `<ExampleBaseOption name="cartesian-bar" title="...">…</ExampleBaseOption>` declares a base chart, and UI controls such as `<ExampleUIControlBoolean default="true" />` and `<ExampleUIControlNumber default="8" step="0.5" />` let the reader change *that* option live on the preview. — [apache/echarts-doc README](https://raw.githubusercontent.com/apache/echarts-doc/master/README.md)
- Option blocks shared across series types (label, itemStyle, markPoint…) are written once as `{{ target: block-name }}` and reused with `{{ use: block-name(varA = value) }}`, with a dynamic prefix for the nesting path. This is how one shared "label" doc appears correctly under every series. — [apache/echarts-doc README](https://raw.githubusercontent.com/apache/echarts-doc/master/README.md)
- The site exposes an `llms.txt` documentation index. — [ECharts option page (shell)](https://echarts.apache.org/en/option.html)

**Observable Plot (charts)**
- Mark pages are narrative first. They open with a basic live example, then build complexity (derived values → colour → size → binning → specialized forms such as lollipop and beeswarm via the dodge transform), with live code blocks (```` ```js eval ```` in the VitePress source) and interactive inputs (e.g. a checkbox toggling sort). Then comes an **options section** that separates *channels* (x, y, r, rotate, symbol) from *constant options* with defaults, and finally a **function signature section** (`dot(data, options)`, `dotX`, `dotY`, `circle`, `hexagon`) with short examples and "added in" version badges. — [observablehq/plot docs/marks/dot.md](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/dot.md)

**Nivo (React charts)**
- Every chart's props are declared as data in `website/src/data/components/<chart>/props.ts`. Each entry has `key`, `group`, `help` (one-liner), `description` (long form, often with code), `type` (TS type string), `required`, `defaultValue` (taken from the library's exported `commonDefaultProps`, so docs cannot drift from code), `flavors` (`svg`/`canvas`/`api`), and `control` (UI control type + props, e.g. a switch for `enablePoints` or a choices control for `curve` populated from `lineCurvePropKeys`). Groups: Base, Style, Customization, Points, Interactivity, Legends, Accessibility. — [nivo website line/props.ts](https://raw.githubusercontent.com/plouc/nivo/master/website/src/data/components/line/props.ts)
- The site renders one page per chart where these props drive a **live playground**: the controls change the chart, and the reference is the same list. (Rendering details not re-verified: nivo.rocks did not resolve in this session.)

**Bryntum Scheduler/Gantt**
- Docs are a "Docs browser" with API class pages (e.g. `api/Core/widget/Editor`), guides (`guide/Scheduler/customization/eventedit`), an "API Diff Table" between versions, a separate examples gallery, and live code demos on the overview pages. — [Bryntum Scheduler docs](https://bryntum.com/products/scheduler/docs/api/Core/widget/Editor); [Gantt docs](https://bryntum.com/products/gantt/docs/api/Gantt/view/Gantt); [Scheduler examples](https://www.bryntum.com/products/scheduler/examples/)
- (The class pages are JS-rendered. Their configs/properties/events layout and inline editable examples could not be verified in this session.)

**HyperFormula (formula/calculation engine)**
- Its 423 built-in functions are documented on one "Built-in functions" guide page in 13 categories (Array manipulation, Database, Date and time, Engineering, Financial, Information, Logical, Lookup and reference, Math and trigonometry, Matrix, Operator, Statistical, Text). Each table has three columns: Function ID / Description / Syntax. Function names are localized into 17 languages. — [HyperFormula built-in functions](https://hyperformula.handsontable.com/guide/built-in-functions.html)
- No per-function worked examples or sandboxes were visible on that page. The reference is a table, not one page per function. — [same](https://hyperformula.handsontable.com/guide/built-in-functions.html)

### Inferences
- The libraries that *guarantee* per-option demos (Highcharts, ECharts, Nivo) all put the demo reference **in the same source unit as the option** (a JSDoc tag next to the default, a doc block next to the type, a props.ts entry next to the control). Where demos live only on feature pages (AG Grid, MUI X, TanStack), coverage is by feature, not by option.
- For umriss-ui: TanStack's split (core ColumnDef page plus per-feature option pages) matches @umriss-ui/table's feature list (sorting, filters, grouping, tree rows, pinning, editing, server mode). AG Grid's category-per-feature reference with links to the guide is the same idea in a single table.

### Gaps
- AG Grid's exact UI for expanding nested interfaces and callback params ("More" / expandable rows) could not be captured, because the reference is client-rendered.
- I found no Vega-Lite, visx, Recharts, FullCalendar or DHTMLX Gantt sources within the tool budget, so nothing is reported for them.

## 2. How are nested option objects and generics rendered (interface trees, expandable rows, type links, Partial<…>)?

### Takeaway
Four rendering strategies appear. (a) **Option tree with paths** (Highcharts, ECharts): every nested key gets its own addressable page or anchor (`series.line.marker.radius`) with breadcrumbs. (b) **Flat table with inlined or linked types** (MUI X, AG Grid): object types are inlined if small and linked by name if large, and callback types show the full signature. (c) **Signature blocks per member** (TanStack hand-written docs). (d) **Generated TypeDoc** with type parameters, "Defined in" and "Inherited from" (TanStack reference, Carbon Charts).

### Cited Findings
- Highcharts names nested option objects as TS interfaces in source (`@declare Highcharts.PointStatesHoverOptionsObject`) and writes partial objects explicitly as `Partial<Highcharts.AnimationOptionsObject>`. One annotation feeds both the API tree and the generated `.d.ts`. — [Highcharts SeriesDefaults.ts](https://raw.githubusercontent.com/highcharts/highcharts/master/ts/Core/Series/SeriesDefaults.ts)
- Highcharts' API tree uses dotted paths and breadcrumbs (`series.line.marker`), so every nested option is linkable. — [api.highcharts.com series.line.marker](https://api.highcharts.com/highcharts/series.line.marker)
- ECharts reuses shared nested blocks through `{{ use: … }}` with a dynamic prefix, so nested options appear in full under each parent path rather than as "see type X". — [echarts-doc README](https://raw.githubusercontent.com/apache/echarts-doc/master/README.md)
- MUI X inlines small structural types (`Array<{ field: string, sort?: 'asc' | 'desc' }>`) and spells out callback signatures with named param types (`GridRowParams`, `GridCallbackDetails`). Large types are referenced by name in prose ("Set of columns of type GridColDef[]"). — [MUI X DataGrid API](https://mui.com/x/api/data-grid/data-grid/)
- AG Grid documents the generic at the top of the reference (`TData` from `GridOptions<TData>`, otherwise `any`) and then uses `TData` inside member types (`rowData: TData[] | null`). Callbacks are referenced by named function types (`GetRowIdFunc`, `ValueGetterFunc`). — [AG Grid Grid Options](https://www.ag-grid.com/javascript-data-grid/grid-options/); [Column Properties](https://www.ag-grid.com/react-data-grid/column-properties/)
- TanStack shows generics verbatim in signature blocks (`Table<TData>`, `Row<TData>`). Its TypeDoc reference lists type parameters with `extends` constraints and links inheritance between interfaces. — [TanStack ColumnDef](https://tanstack.com/table/v8/docs/api/core/column-def); [Column_Core](https://tanstack.com/table/latest/docs/reference/index/interfaces/Column_Core)
- Carbon Charts publishes a TypeDoc API site (`/api/modules/interfaces`, `/api/types/charttabulardata`, `/api/classes/chartmodel`). For example, `ChartTabularData = Record<string, any>[]`. — [Carbon Charts API](https://charts.carbondesignsystem.com/api/types/charttabulardata); [interfaces module](https://charts.carbondesignsystem.com/api/modules/interfaces.html)
- Nivo stores the type as a display string in its props data (`type: 'object'`, `'string'`, `'boolean'`). Nested config like `xScale` gets a nested control rather than a type tree. — [nivo line/props.ts](https://raw.githubusercontent.com/plouc/nivo/master/website/src/data/components/line/props.ts)

### Inferences
- Pure TypeDoc output on its own (Carbon, TanStack reference) is complete but not inviting, and it says nothing about defaults or effects. Every library that is praised for its docs adds a hand-curated layer (descriptions, defaults, demos) on top of the types, or attaches that layer to the types in source (Highcharts JSDoc).
- For callback-heavy configs (column `cell`/`valueGetter`, series formatters), the useful pattern is MUI X's: show the full signature with named parameter types, and link each named type.
- For `Partial<…>`/deep-partial configs (series/theme options), Highcharts' approach is the clearest: name the nested interface (`@declare`), document each leaf in the tree, and write `Partial<…>` in the type line instead of hiding it.

### Gaps
- No primary source found for an "expand nested interface inline" widget (AG Grid is reputed to have one, but it could not be captured).

## 3. Example galleries: thumbnails, categories, live editors, and option ↔ example cross-links

### Takeaway
Galleries are categorized by chart or feature type, with thumbnails and an editable live code view (Highcharts: StackBlitz + per-framework tabs + theme switch; ECharts: an in-site editor). The bidirectional link **option → demo** is strongest in Highcharts (`@sample` per option) and ECharts (per-option UI controls). **Demo → options** is usually only a generic link to the API reference. MUI X closes the loop at page level (feature page "API" section ↔ API page "Demos" section).

### Cited Findings
- Highcharts: option → demo through `@sample {product} path label` in the option's source comment (several samples per option are possible). — [SeriesDefaults.ts](https://raw.githubusercontent.com/highcharts/highcharts/master/ts/Core/Series/SeriesDefaults.ts)
- Highcharts demo page: live chart, code in JS/TS/React/Angular/Vue/Svelte, Light/Dark/Auto theme switcher, "Edit in StackBlitz", prev/next, link to the API reference, and a gallery grouped into Line, Area, Column/bar, Pie, Scatter/bubble, 3D, Gauges, Heat maps and more. — [Highcharts line-chart demo](https://www.highcharts.com/demo/highcharts/line-chart)
- ECharts: per-option live mini-examples with UI controls (`ExampleUIControlBoolean`, `ExampleUIControlNumber`) inside the option manual. — [echarts-doc README](https://raw.githubusercontent.com/apache/echarts-doc/master/README.md)
- ECharts has a separate examples gallery and editor (`/examples/en/index.html`, `/examples/en/editor.html?c=line-simple`). Its UI could not be captured (SPA). — [ECharts examples editor](https://echarts.apache.org/examples/en/editor.html?c=line-simple)
- MUI X: the feature page embeds demos (`{{"demo": "...", "defaultCodeOpen": false}}`) and ends with an "API" link list, while the API page has a "Demos" list that links back to the feature pages. — [MUI X sorting.md](https://raw.githubusercontent.com/mui/mui-x/master/docs/data/data-grid/sorting/sorting.md); [MUI X DataGrid API](https://mui.com/x/api/data-grid/data-grid/)
- Observable Plot: examples are interleaved with prose on the mark page itself, progressing from simple to advanced, with interactive inputs. — [Plot dot.md](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/dot.md)
- Bryntum maintains a standalone examples gallery per product (Scheduler, Scheduler Pro) next to the docs browser, and offers CodePen live demos that import the module bundle. — [Bryntum Scheduler examples](https://www.bryntum.com/products/scheduler/examples/); [Bryntum Scheduler Pro examples](https://bryntum.com/products/schedulerpro/examples/); [CodePen live demo](https://codepen.io/burnit/pen/WNYrPMP)
- Siemens iX "Code" tab per component lists named example variations (Basic, Filled, Selected, Predefined item height, Custom item height, Compact), each a runnable example, followed by API tables. — [Siemens iX event list / code](https://ix.siemens.io/docs/components/event-list/code)

### Inferences
- "Every option has a demo" is easiest to guarantee when the demo ID sits in the option's own doc comment (Highcharts) or doc block (ECharts). A build step can then fail on options without a sample. That last part is my inference: I found no published Highcharts/ECharts lint rule that enforces it.
- Reverse links (demo → options it uses) were not found as an explicit feature in any primary source. They could be generated by scanning demo source for option keys, which would be a differentiator.

### Gaps
- No primary evidence was found for a "this demo uses options X, Y, Z" index in Highcharts or ECharts.
- The ECharts example editor's controls (JS/TS, renderer, dark mode) could not be verified.

## 4. Per-option demo coverage guarantees and options search

### Takeaway
No library was found to *publicly state* an enforced rule that "every option has an example". The practical guarantees come from **single-sourcing**: docs live in the type/default source (Highcharts JSDoc, generated MUI X API tables, TanStack TypeDoc), so *type and description coverage* follows from compilation and review, while *example coverage* is a convention. Nivo comes closest for per-prop interaction, because every documented prop entry carries a `control`, so it is demonstrable in the playground by construction. Search over the option tree is standard for tree-style references (Highcharts sidebar search).

### Cited Findings
- Highcharts: descriptions, types, defaults, version and samples are all written as tags on the default-options object in `ts/…`, then turned into API pages by the JSDoc generator. — [SeriesDefaults.ts](https://raw.githubusercontent.com/highcharts/highcharts/master/ts/Core/Series/SeriesDefaults.ts); [Highcharts build notes (search summary)](https://github.highcharts.com/highcharts.js)
- Nivo: the `defaultValue` of each documented prop is imported from the library's `commonDefaultProps`, and each entry has a `control`. Defaults in the docs therefore cannot drift, and each prop is interactive. — [nivo line/props.ts](https://raw.githubusercontent.com/plouc/nivo/master/website/src/data/components/line/props.ts)
- ECharts: type and default are mandatory parts of the option heading syntax `## propName(type) = defaultValue`. — [echarts-doc README](https://raw.githubusercontent.com/apache/echarts-doc/master/README.md)
- TanStack: the TypeDoc reference gives full type coverage with source links automatically. Prose coverage depends on JSDoc. — [TanStack Column_Core](https://tanstack.com/table/latest/docs/reference/index/interfaces/Column_Core)
- Grafana @grafana/ui: props are documented with `/** */` comments that react-docgen turns into the props table. MDX docs must contain "When and why the component should be used", "Best practices – dos and don'ts", "Usage examples with code" and the generated props table. Stories must use Storybook `args`/controls (knobs are deprecated), with explicit `argTypes` for complex prop types. Stories are colocated as `SomeComponent.story.tsx`. — [grafana contribute/style-guides/storybook.md](https://github.com/grafana/grafana/blob/main/contribute/style-guides/storybook.md)
- Highcharts API site has sidebar search over the option tree. — [api.highcharts.com](https://api.highcharts.com/highcharts/series.line.marker)

### Inferences
- A cheap completeness gate for umriss-ui would be a test that walks the exported option interfaces (via the TS compiler API or a TypeDoc JSON dump) and asserts that each leaf has a JSDoc description, a `@default` where applicable, and at least one `@example`/demo reference. This is the Highcharts model plus a CI check.
- Nivo's "props as data with control" model suits the umriss demo shell (ADR-0020): a single props table that drives both the reference table and a live control panel.

### Gaps
- No public statement of an enforced per-option demo coverage rule was found for any library (AG Grid, MUI X, Highcharts, ECharts).
- How MUI X's API JSON is generated (`docs:api` script / proptypes) was not verified in this session.

## 5. Industrial/HMI and dashboard design systems (Siemens iX, Grafana Saga, Carbon Charts, EUI)

### Takeaway
The industrial and dashboard systems document charts mostly by **wrapping a mainstream engine** and documenting the theme plus thin component APIs (Siemens iX → ECharts theme; Siemens Element → `SiChartComponent` API pages). Their component pages follow a design-system template (Usage / Code tabs, named variations, Properties/Events/Slots tables, dos and don'ts). The domain-specific additions are themes tuned for accessibility in dark and light control-room modes, and explicit usage guidance (when to use which chart), rather than deeper option references.

### Cited Findings
- Siemens iX charts: provided as a theme for ECharts (`npm install --save @siemens/ix-echarts`) with brand-dark, brand-light, classic-dark and classic-light themes. The colours are "optimized for accessibility and readability". — [Siemens iX charts overview](https://ix.siemens.io/docs/components/charts-overview)
- Siemens iX component pages have Usage and Code tabs. The Code tab lists example variations and then API tables per sub-component (`ix-event-list`: Properties, Slots; `ix-event-list-item`: Properties, Events, Slots), with a framework switcher. — [ix.siemens.io event-list/code](https://ix.siemens.io/docs/components/event-list/code)
- Siemens Element (Angular) documents charts with per-component generated API pages (`SiChartComponent`, `SiChartProgressComponent`) and guide pages (Charts, Generic chart). — [Element SiChartComponent](https://element.siemens.io/api/siemens/charts-ng/components/SiChartComponent/); [Element Charts](https://element.siemens.io/components/charts/)
- Grafana Saga: its repository was archived on 5 June 2026 and component docs now live on the @grafana/ui Storybook. A components-status page tracks readiness across Figma, Storybook and Saga docs. — [Saga overview](https://grafana.com/developers/saga/about/overview/); [Saga components status](https://grafana.com/developers/saga/components/components-status/) (archive date from search summary of [grafana/design-system](https://github.com/grafana/design-system))
- An open Grafana issue asked for sample code and component previews in the @grafana/ui Storybook, which shows that bare Storybook was felt to lack code examples. — [grafana/grafana#58190](https://github.com/grafana/grafana/issues/58190)
- Carbon Charts: a TypeDoc-generated API site plus Storybook examples, and data-viz usage guidance on the Carbon site ("Get started", "Simple charts"). — [Carbon Charts API](https://charts.carbondesignsystem.com/api/modules); [Carbon data-viz getting started](https://v10.carbondesignsystem.com/data-visualization/getting-started/)

### Inferences
- For an HMI/industrial audience, umriss-ui could combine (i) Siemens-style Usage/Code split pages with named variations, (ii) a component-status matrix (Grafana), and (iii) a dark/light theme toggle on every live example (Highcharts demo pages have one). Control rooms often run dark themes, so examples should be checked in both.
- Elastic EUI was not researched within the budget.

### Gaps
- Elastic EUI: not covered.
- No source was found describing HMI-specific doc conventions (e.g. documenting update rates, alarm states or real-time streaming options per component). This appears to be an open space rather than an established practice.
