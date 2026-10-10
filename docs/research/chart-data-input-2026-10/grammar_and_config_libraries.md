# Data-input model of grammar-of-graphics and configuration-driven chart libraries (state: 10 October 2026)

Method note for the report writer. Versions were read from the npm registry on 2026-10-10. Documentation text and code were read from the documentation sources in each project's repository at the default branch on the same day (Observable Plot `main`, Vega-Lite `main`, `apache/echarts-handbook` and `apache/echarts-doc` `master`, Chart.js `master`, Highcharts `master`, plotly.js `master` and `plotly/graphing-library-docs`, `ag-grid/ag-charts` `latest`, ApexCharts `main`); links point to the published page that the source renders to. Code blocks marked "verbatim" are copied unchanged; nothing else is invented. Two ApexCharts pages (`/docs/series/`, `/docs/parsing-data/`) and two paper landing pages were read through a summarising fetch tool, so their wording is reported as fragments, not as full quotes.

## Versions and state as of October 2026

### Takeaway
All eight libraries are alive; three changed their data-input story since 2025: Highcharts 13 (June 2026) added a shared `dataTable` with `dataMapping`, ApexCharts 5.3 (July 2025) added a `parsing` option for raw objects, and Plotly.js 3.0 (January 2025) removed its declarative `transforms`. Observable Plot has had no release since February 2025.

### Cited Findings
- Observable Plot: latest `0.6.17`, published 2025-02-14; still `latest` on 2026-10-10. — [npm registry](https://registry.npmjs.org/@observablehq/plot), [CHANGELOG](https://github.com/observablehq/plot/blob/main/CHANGELOG.md)
- Vega-Lite: latest `6.5.0`, published 2026-10-08; official examples carry `"$schema": "https://vega.github.io/schema/vega-lite/v6.json"`. — [npm registry](https://registry.npmjs.org/vega-lite), [example bar_grouped](https://vega.github.io/vega-lite/examples/bar_grouped.html)
- Apache ECharts: latest `6.1.0`, published 2026-05-19 (changelog date 2026-05-18); `6.0.0` precedes it; `5.6.0` is the last v5 minor in the changelog. — [npm registry](https://registry.npmjs.org/echarts), [changelog](https://echarts.apache.org/en/changelog.html)
- The ECharts 6 upgrade guide lists as breaking changes the default theme, label position, and rich text inheritance; none concerns `dataset`, `encode` or `transform`. It states: "In most cases, developers do not need to do anything extra for this upgrade, as echarts has always tried to keep the API stable and backward compatible." — [ECharts 6 Upgrade Guide](https://echarts.apache.org/handbook/en/basics/release-note/v6-upgrade-guide/)
- Chart.js: latest `4.5.1`, published 2025-10-13; still `latest` on 2026-10-10 (no v5). — [npm registry](https://registry.npmjs.org/chart.js)
- Highcharts: latest `13.1.1`, published 2026-09-20. `13.0.0` (2026-06-11): "Added support for providing data as DataTable through the new options `dataTable`, `series.dataTable` and `series.dataMapping`." — [npm registry](https://registry.npmjs.org/highcharts), [changelog 13.0.0](https://github.com/highcharts/highcharts/blob/master/changelog/highcharts/13.0.0.md)
- Highcharts `12.0.0`: "Added support for data.x values as date strings. These can now be defined for example as `'2024-10-03'` as a more human readable alternative to timestamps." — [changelog 12.0.0](https://github.com/highcharts/highcharts/blob/master/changelog/highcharts/12.0.0.md)
- Plotly.js: latest `4.1.2` (2026-10-05); `4.0.0` on 2026-08-24; `3.0.0` on 2025-01-27. — [CHANGELOG](https://github.com/plotly/plotly.js/blob/master/CHANGELOG.md)
- Plotly.js `3.0.0`, section "Removed": "Drop `transforms` from the API [#7240, #7254]". The deprecation dates from `2.0.0` (2021-06-07): "Deprecate `transform` attributes [#5657]". — [CHANGELOG](https://github.com/plotly/plotly.js/blob/master/CHANGELOG.md)
- Plotly.js `4.0.0`, section "Removed": "Remove all `*src` attributes, as well as `layout.hidesources` attribute, from the schema" and "Remove internal `trace._fullInput` property and other dead code related to the removed `transforms` feature." — [CHANGELOG](https://github.com/plotly/plotly.js/blob/master/CHANGELOG.md)
- AG Charts: `ag-charts-community` latest `14.2.0`, published 2026-09-16. — [npm registry](https://registry.npmjs.org/ag-charts-community)
- ApexCharts: latest `8.0.0`, published 2026-10-09 (one day before this research); `7.0.0` on 2026-08-25, `6.0.0` on 2026-07-17, `4.0.0` on 2024-10-29. The 8.0 notes concern bundle splitting ("8.0 takes three chart types and four features out of the default bundle"), not the data format. — [GitHub releases](https://github.com/apexcharts/apexcharts.js/releases)
- ApexCharts `5.3.0` (2025-07-21): "Data Parsing capabilites. ApexCharts now supports direct parsing and mapping of raw data objects, eliminating the need for manual data transformation." — [release v5.3.0](https://github.com/apexcharts/apexcharts.js/releases/tag/v5.3.0)
- ApexCharts now carries licence-gated code: the 7.0.0 notes say "24% of the 6.10.0 default bundle was licence-gated Premium code", and the 7.7.0 notes describe a licence threshold of "$2M" in "total revenue, funding or financial resources". — [GitHub releases](https://github.com/apexcharts/apexcharts.js/releases)

### Inferences
- The direction of travel among configuration-driven libraries is towards "one table, fields named per series" (ECharts `dataset` since v4, AG Charts root `data`, Highcharts `dataTable` since v13, ApexCharts `parsing` since v5.3). Plotly.js is the exception: it withdrew its declarative transform layer and stayed on per-trace arrays.
- Plot's documentation on `main` contains features without a released version (version badges with a pull-request number only, e.g. the `pool` mark option and the line mark's `z` default); facts in these notes that carry a version number are released.

### Gaps
- Documentation was read at the default branch, not at the release tags; a difference between HEAD and the latest release cannot be excluded except where a version badge or changelog entry is cited.
- The reason Plotly.js gave for removing `transforms` was not researched (pull requests #7240 and #7254 were not read).
- ApexCharts released four majors (5 to 8) within about fifteen months; only the release notes and the type file were checked for data-model changes, not every minor.

## Canonical data shape, accepted alternatives, one dataset shared by all series?

### Takeaway
The two grammars take tidy (long) rows as the canonical shape and derive everything else from channel declarations; the configuration-driven libraries take wide rows (one column per series) at best, and per-series arrays at worst. A table shared by all series exists in Plot (per mark), Vega-Lite, ECharts, AG Charts and Highcharts 13; Chart.js, Plotly.js and ApexCharts attach data to each series.

### Cited Findings
- Plot: "Plot favors tidy data structured as an array of objects, where each object represents an observation (a row), and each object property represents an observed value; all objects in the array should have the same property names (the columns)." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-have-tidy-data)
- Plot alternatives: "For greater efficiency, Plot also supports columnar data: you can use an Apache Arrow table as data instead of an array of objects" (since 0.6.16); "You can even pass parallel arrays of values, or Apache Arrow vectors, to each channel." Data may be "any iterable or value compatible with Array.from". — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-have-tidy-data)
- Plot has no chart-level dataset: "Each mark supplies its own data; a quick way to combine multiple datasets into a chart is to declare a separate mark for each." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-are-layered)
- Vega-Lite: data is `values` (inline), `url`, or a named source; the JSON format "Assumes row-oriented data, where each row is an object with named attributes." "If the input data is simply an array of primitive values, each value is mapped to the `data` property of a new object." CSV, TSV, DSV and TopoJSON are loaded by the library. — [Vega-Lite: Data](https://vega.github.io/vega-lite/docs/data.html)
- Vega-Lite: one `data` per view, shared by all layers and encodings; top-level `datasets` exists so that "the same data should be inlined in different places in the spec". — [Vega-Lite: Data](https://vega.github.io/vega-lite/docs/data.html)
- ECharts `dataset.source` accepts three table formats: a "2d array, where dimension names can be provided in the first row/column", a "Row based key-value format (object array), where the keys indicate dimension names", and a "Column based key-value format, where each value represents a column of a table." — [ECharts option: dataset.source](https://echarts.apache.org/en/option.html#dataset.source)
- ECharts: "Although you can set the data in `series.data` for every series, we recommend you use the `dataset` to manage the data since ECharts 4 so that the data can be reused by multiple components and convenient for the separation of 'data and configs'." — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- ECharts canonical dataset is wide: the handbook's standard example has the header `['product', '2015', '2016', '2017']` and one `{ type: 'bar' }` series per value column. — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- Chart.js: "The `data` property of a dataset can be passed in various formats." Documented formats: `Primitive[]` with a parallel `data.labels` array, `Array[]` of `[index, value]` tuples, `Object[]` of `{x, y}`, `Object[]` with custom properties named through `parsing`, and a plain `Object` whose "property name is used for the `index` scale and value for the `value` scale". — [Chart.js: Data structures](https://www.chartjs.org/docs/latest/general/data-structures.html)
- Chart.js has no chart-level table. The documented way to feed several datasets from the same rows is to pass the same array to each dataset and name a different key per dataset (`parsing: { yAxisKey: 'net' }`, `'cogs'`, `'gm'`). — [Chart.js: Data structures, "parsing"](https://www.chartjs.org/docs/latest/general/data-structures.html#parsing)
- Highcharts `series.data` "can be presented in three ways": "A list of numerical values" (x computed), "A list of arrays with two or more values", "A list of objects with named values" (point configuration objects). — [Highcharts: Series](https://www.highcharts.com/docs/chart-concepts/series)
- Highcharts 13: "Highcharts since v13 offers the `dataTable` and `dataMapping` options as a structured way to work with tabular data." The table is columnar: `new Highcharts.DataTable({ columns: { month: ['Jan', 'Feb', 'Mar'], sales: [100, 120, 110] } })`; it can be set at chart level and shared by all series. — [Highcharts: Working with data](https://www.highcharts.com/docs/working-with-data/data-intro), [Using DataTables with Series](https://www.highcharts.com/docs/working-with-data/using-datatables-in-series)
- Highcharts Data module: sources are CSV, HTML tables and Google Spreadsheets; "By default, the first row of the CSV data is interpreted as series names, the first column signifies category names or X values/dates, and subsequent columns hold data values." — [Highcharts: Data module](https://www.highcharts.com/docs/working-with-data/data-module)
- Plotly.js: each trace carries parallel arrays; the official bar example is `{ x: ['giraffes', 'orangutans', 'monkeys'], y: [20, 14, 23], type: 'bar' }`. — [Plotly.js: Bar charts](https://plotly.com/javascript/bar-charts/)
- AG Charts: "AG Charts expects data as an array of objects, where each object represents a data point." "All series use the root-level `data` option by default, and this approach is recommended for best performance. However, to support scenarios where different data sources are needed, each individual series can declare its own `data` option." — [AG Charts: Data Configuration and Update](https://www.ag-grid.com/charts/javascript/data-configuration/)
- ApexCharts `series[].data` formats: single values with `xaxis.categories`; `{x, y}` objects ("the recommended format for axis charts for ease of use"); `[x, y]` pairs; `[timestamp, value]` pairs; `{x: '05/06/2014', y: 54}` date strings. — [ApexCharts: Series](https://apexcharts.com/docs/series/)
- ApexCharts type file: series `data` is `(number | null)[]` or objects with `x: string | number | Date` ("A category label, a timestamp, or a `Date`"). — [types/apexcharts.d.ts](https://github.com/apexcharts/apexcharts.js/blob/main/types/apexcharts.d.ts)

### Inferences
- Shape by library: long rows are first-class only in Plot and Vega-Lite. ECharts, AG Charts, Highcharts 13 and Chart.js (via shared array plus `parsing`) are first-class for wide rows. Plotly.js and ApexCharts (without `parsing`) want per-series arrays.
- None of the eight asks the caller for an index per category; every one accepts the category value itself in the row or array.

### Gaps
- Whether `Highcharts.DataTable` also accepts an array of row objects was not verified; the docs read show only `columns`.
- Whether AG Charts accepts anything other than an array of objects (e.g. columnar input) was not found in the pages read.

## Mapping fields to channels: field names, accessor functions, `encode`; the shortest form

### Takeaway
Every library except Plotly.js names fields by string; only Plot also takes an accessor function per channel, and only the two grammars have a general channel vocabulary (x, y, colour, facet, offset, detail). The configuration libraries map per series with a fixed pair of keys (`xKey`/`yKey`, `encode.x`/`encode.y`, `dataMapping`, `parsing`).

### Cited Findings
- Plot: "To use a channel, supply it with a column of data, typically as: a field (column) name, an accessor function, or an array of values of the same length and order as the data." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-have-channels)
- Plot shortest form (verbatim): `Plot.barY(alphabet, {x: "letter", y: "frequency"}).plot()`. — [Plot: Bar mark](https://observablehq.com/plot/marks/bar)
- Plot: "While a column name such as `"units"` is the most concise way of specifying channel values, values can also be specified as functions for greater flexibility, say to transform data or derive a new column on the fly." Example: `Plot.dot(sales, {x: (d) => d.units * 1000, y: (d) => d.fruit})`. — [Plot: Marks, "Mark options"](https://observablehq.com/plot/features/marks#mark-options)
- Plot: a cost of functions: "Note that when accessor functions or parallel arrays are used instead of field names, automatic axis labels (*hour* and *value*) are lost. These can be restored using the **label** option on the *x* and *y* scales." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-have-tidy-data)
- Plot disambiguates constants from fields by value: "if you set the **fill** option to *purple*, Plot interprets it as a literal color. Whereas if the **fill** option is a string but *not* a valid CSS color, Plot assumes you mean the corresponding column of the data and interprets it as a channel." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-have-channels)
- Plot facet channels are `fx` and `fy`; the series channel is `z`, which defaults to `fill` or `stroke`. — [Plot: Group transform](https://observablehq.com/plot/transforms/group)
- Vega-Lite: a channel is an object, `"x": {"field": "a", "type": "nominal"}`; channels include position (`x`, `y`), "Position Offset Channels: `xOffset`, `yOffset`", mark properties (`color`, ...), "Level of Detail Channel: `detail`", and "Facet Channels: `facet`, `row`, `column`". No accessor functions; derived values use a `calculate` transform with an expression string. — [Vega-Lite: Encoding](https://vega.github.io/vega-lite/docs/encoding.html), [Transformation](https://vega.github.io/vega-lite/docs/transform.html)
- ECharts `series.encode`: "To the left of the colon: Specific name of axis or label. To the right of the colon: Dimension name (string) or number(int, count from 0), to specify one or several dimensions (using array)." Example: `encode: { x: 'amount', y: 'product' }`; further keys `tooltip`, `seriesName`, `itemId`, `itemName`. — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- ECharts default mapping without `encode`: "If there is category axis (axis.type = 'category'), map the first column(row) to the axis and each subsequent column(row) to each series. If both axes is not the category, then map every two columns in one series to two axes." — [ECharts handbook: Dataset, "Default series.encode"](https://echarts.apache.org/handbook/en/concepts/dataset/)
- Chart.js: `options.parsing: { xAxisKey: 'id', yAxisKey: 'nested.value' }`; for pie, doughnut, radar and polarArea a single `key`; dots in key names are escaped with a double backslash. `parsing` can be set "at chart options or dataset". — [Chart.js: Data structures](https://www.chartjs.org/docs/latest/general/data-structures.html)
- Highcharts 13 `dataMapping`: "The keys of the `dataMapping` object correspond to the properties of the data points (e.g. `x`, `y`, `name`), and the values are objects that specify which column from which data table to use for that property." "The values can also be strings, in which case they are interpreted as column id's from the first data table." Shared columns go in `plotOptions.series.dataMapping`; "The series name defaults to the column ID of the main data column in the mapping." "If the columns of the DataTable have keys matching the series keys, the data mapping is not necessary." — [Highcharts API: series.line.dataMapping](https://api.highcharts.com/highcharts/series.line.dataMapping), [Using DataTables with Series](https://www.highcharts.com/docs/working-with-data/using-datatables-in-series)
- Highcharts older route, still present: `series.keys`, "An array specifying which option maps to which key in the data point array" (since 4.1.6), for arrays of arrays. — [Highcharts API: plotOptions.series.keys](https://api.highcharts.com/highcharts/plotOptions.series.keys)
- Plotly.js: no field mapping; the caller extracts arrays (`x: [...]`, `y: [...]`) per trace. — [Plotly.js: Bar charts](https://plotly.com/javascript/bar-charts/)
- AG Charts: "Every series in a chart has `_Key` properties for connecting the visualisation elements to the data fields. These properties include `xKey` and `yKey` for cartesian charts, `colorKey` for heatmap and `angleKey` for pie series." "By default, AG Charts supports dot notation for accessing nested properties in your data." — [AG Charts: Data Configuration and Update](https://www.ag-grid.com/charts/javascript/data-configuration/)
- ApexCharts `parsing` (since 5.3.0): type `{ x?: string; y?: string | string[]; z?: string }`, available at the top level and per series; the docs page shows a global `x: 'date'` with per-series `y: 'revenue'` and `y: 'profit'`, and dot notation for nested fields (`x: 'product.name'`). — [ApexCharts: Parsing Data](https://apexcharts.com/docs/parsing-data/), [types/apexcharts.d.ts](https://github.com/apexcharts/apexcharts.js/blob/main/types/apexcharts.d.ts)

### Inferences
- "A field name or a function of the row", which umriss already offers for `value`, is exactly Plot's channel model; the gap in umriss is that the x channel cannot be named the same way.
- Shortest forms: Plot `{x: "letter", y: "frequency"}`; AG Charts `{ type: 'bar', xKey: 'quarter', yKey: 'iphone' }`; ECharts nothing at all when the first column is the category (`series: [{ type: 'bar' }, ...]`); Highcharts `dataMapping: { y: 'Cost' }` with a shared `name` or `x`.
- Accessor functions are rare outside Plot. The configuration libraries are serialisable option objects and stay with strings plus dot paths.

### Gaps
- Whether AG Charts `xKey`/`yKey` accept functions was not found in the pages read; the docs describe keys as field names only.
- Vega-Lite's `calculate` expression language was not examined beyond one official example.

## How the scale or axis type is decided

### Takeaway
Plot infers the scale type from the JavaScript type of the first value (string or boolean gives ordinal, Date gives UTC time, anything else linear) and from the mark (a bar forces a band scale). Vega-Lite does not infer from data at all: the type is declared as a level of measurement, with `nominal` as the default and a few spec-based defaults. AG Charts and Plotly.js infer from data; ECharts, Highcharts and (for numeric and time x) ApexCharts want a declaration; Chart.js derives it from the chart type and the presence of `labels`.

### Cited Findings
- Plot, exact rule: "A scale's **type** is most often inferred from associated marks' channel values: strings and booleans imply an *ordinal* scale; dates imply a *utc* scale; anything else is *linear*. Plot assumes that your data is consistently typed, so inference is based solely on the first non-null, non-undefined value. We recommend typed CSV (passing `{typed: true}` to Observable's FileAttachment csv method) or explicitly coercing types when loading data (*e.g.*, d3.autoType)." — [Plot: Scales, "Type inference"](https://observablehq.com/plot/features/scales#type-inference)
- Plot: "If a scale's **domain** is specified explicitly, the scale's **type** is inferred from the **domain** values rather than channels as described above. However, if the **domain** or **range** has more than two elements, the *ordinal* type (or *point* for position scales) is used." — [Plot: Scales, "Type inference"](https://observablehq.com/plot/features/scales#type-inference)
- Plot: the mark has a say: "Some marks mandate a particular scale type: for example, barY requires that the *x* scale is a *band* scale." A *point* scale "is the default scale type for ordinal data on the *x* and *y* scale"; "If the associated marks have no effective width along the ordinal dimension — such as a dot, rule, or tick — then use a *point* scale; otherwise, say for a bar, use a *band* scale." — [Plot: Scales](https://observablehq.com/plot/features/scales#scale-options)
- Plot ties mark choice to data type: "use rect when both *x* and *y* are quantitative; use barX when *x* is quantitative and *y* is ordinal; use barY when *x* is ordinal and *y* is quantitative; use cell when both *x* and *y* are ordinal". — [Plot: Marks, "Marks imply data types"](https://observablehq.com/plot/features/marks#marks-imply-data-types)
- Plot merges nominal into ordinal: "Because nominal values often need some arbitrary order for display purposes — often alphabetical — Plot uses the term *ordinal* to refer to both ordinal and nominal data." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-imply-data-types)
- Plot: numbers on a bar's x become categories: "Because the barY mark implies an ordinal *x* scale, the gap is hidden"; the fix is the `interval` option, which makes a regular ordinal domain so that missing steps show. — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-imply-data-types)
- Vega-Lite: "If a field is specified, the channel definition **must** describe the encoded data's type based on their level of measurement. The supported data types are: `"quantitative"`, `"temporal"`, `"ordinal"`, `"nominal"`, and `"geojson"`." — [Vega-Lite: Type](https://vega.github.io/vega-lite/docs/type.html)
- Vega-Lite default when `type` is omitted (schema description of `type`): "For a data `field`, `"nominal"` is the default data type unless the field encoding has `aggregate`, `channel`, `bin`, scale type, `sort`, or `timeUnit` that satisfies the following criteria: `"quantitative"` is the default type if (1) the encoded field contains `bin` or `aggregate` except `"argmin"` and `"argmax"`, (2) the encoding channel is `latitude` or `longitude` channel or (3) if the specified scale type is a quantitative scale. `"temporal"` is the default type if (1) the encoded field contains `timeUnit` or (2) the specified scale type is a time or utc scale. `"ordinal"` is the default type if (1) the encoded field contains a custom `sort` order, (2) the specified scale type is an ordinal/point/band scale, or (3) the encoding channel is `order`." — [Vega-Lite: Type](https://vega.github.io/vega-lite/docs/type.html), [JSON schema](https://github.com/vega/vega-lite/blob/main/build/vega-lite-schema.json)
- Vega-Lite: "type is required for a field if: (1) the field is not nominal and the field encoding has no specified `aggregate` (except `argmin` and `argmax`), `bin`, scale type, custom `sort` order, nor `timeUnit` or (2) if you wish to use an ordinal scale for a field with `bin` or `timeUnit`." — [JSON schema, `type` description](https://github.com/vega/vega-lite/blob/main/build/vega-lite-schema.json)
- Vega-Lite: "Data `type` describes the semantics of the data rather than the primitive data types (number, string, etc.). The same primitive data type can have different types of measurement. For example, numeric data can represent quantitative, ordinal, or nominal data." — [JSON schema, `type` description](https://github.com/vega/vega-lite/blob/main/build/vega-lite-schema.json)
- Vega-Lite: a temporal field on a bar gives a continuous time scale; to get discrete bands the field is cast: "If you want to use a discrete scale instead, you can cast the field to have an `"ordinal"` type. This casting strategy can be useful for time units with low cardinality such as `"month"`." — [Vega-Lite: Bar](https://vega.github.io/vega-lite/docs/bar.html)
- ECharts: `xAxis.type` defaults to `'value'`; options are `'value'`, `'category'`, `'time'`, `'log'`. "If type is not specified, but `axis.data` is specified, the type is auto set as `'category'`." "If type is specified as `'category'`, but `axis.data` is not specified, `axis.data` will be auto collected from series.data." — [ECharts option: xAxis.type](https://echarts.apache.org/en/option.html#xAxis.type), [xAxis.data](https://echarts.apache.org/en/option.html#xAxis.data)
- ECharts dataset dimension types (`number`, `ordinal`, `time`, `float`, `int`): "In most cases, you don't need to define the dimension type because the ECharts will automatically judge it. If the judgment is inaccurate, you can define it manually." The axis type is still declared: the dataset examples all write `xAxis: { type: 'category' }`. — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- Chart.js: for the category scale, "Specifying any of the settings above [`data.labels`, `xLabels`, `yLabels`] defines the x-axis as `type: 'category'` if not defined otherwise." Other types (`linear`, `logarithmic`, `time`, `timeseries`) are set in `options.scales[id].type`. — [Chart.js: Category axis](https://www.chartjs.org/docs/latest/axes/cartesian/category.html), [Cartesian axes](https://www.chartjs.org/docs/latest/axes/cartesian/)
- Highcharts: `xAxis.type` "Can be one of `linear`, `logarithmic`, `datetime` or `category`", default `linear`. "In a category axis, the point names of the chart's series are used for categories, if not a categories array is defined." Setting `xAxis.categories` makes names be "used instead of numbers for that axis." — [Highcharts API: xAxis.type](https://api.highcharts.com/highcharts/xAxis.type), [xAxis.categories](https://api.highcharts.com/highcharts/xAxis.categories)
- Plotly.js: axis `type` values are `'-'`, `'linear'`, `'log'`, `'date'`, `'category'`, `'multicategory'`, default `'-'`: "By default, plotly attempts to determined the axis type by looking into the data of the traces that referenced the axis in question." `autotypenumbers` (default `'convert types'`): "a numeric string in trace data may be treated as a number during automatic axis `type` detection." — [plotly.js layout attributes (source of the reference)](https://github.com/plotly/plotly.js/blob/master/src/plots/cartesian/layout_attributes.js), [reference: layout.xaxis](https://plotly.com/javascript/reference/layout/xaxis/)
- AG Charts: "In most cases, specifying an axis type is unnecessary as an appropriate axis will be inferred from the data and series type used in the chart. By default, the x-axis uses a Category, Time or Number axis based on the data type, whilst the y-axis defaults to a Number axis." — [AG Charts: Axis Types](https://www.ag-grid.com/charts/javascript/axes-types/)
- ApexCharts: `xaxis.type` is `'category' | 'datetime' | 'numeric'`. The series docs say of single values: "Data in this format is considered a category chart by default", and of numeric pairs: "don't forget to set the `xaxis.type: 'numeric'` as the X values contain numbers." — [ApexCharts: Series](https://apexcharts.com/docs/series/), [types/apexcharts.d.ts](https://github.com/apexcharts/apexcharts.js/blob/main/types/apexcharts.d.ts)
- ApexCharts infers a numeric x in part: the 7.4.0 notes describe a fix where "Numeric XY parsing sets `isXNumeric`, but an omitted `xaxis.type` stays configured as `category` on a vertical bar chart", after which "Inferred numeric axes now carry their own semantics". — [release v7.4.0](https://github.com/apexcharts/apexcharts.js/releases/tag/v7.4.0)

### Inferences
- Two schools. Data-typed inference (Plot, AG Charts, Plotly.js): string means category, Date means time, number means linear. Declared semantics (Vega-Lite, ECharts, Highcharts): the caller says what the field means. Vega-Lite's argument for declaring is in its own docs: the same primitive type can be quantitative, ordinal or nominal.
- In both schools a categorical axis is a scale type the library owns; the caller never computes positions, ticks or a tick formatter for categories.
- Plot's rule "barY requires a band x scale" means a bar chart over numbers or years is categorical unless the caller picks `rectY` or sets `interval`. That is a deliberate design, and Plot documents the trap it creates (the hidden missing year).

### Gaps
- AG Charts' exact inference rule (which JavaScript types map to which axis, and how the series type enters) was not found beyond the quoted sentence.
- Plotly.js' autotype algorithm (how many values are sampled, the threshold between category and linear) was not read.

## Deriving series from long-format data versus one series per wide column

### Takeaway
Only Plot and Vega-Lite derive series from a field of the rows (`fill`/`stroke`/`z`, respectively `color`/`detail`/`xOffset`). In all six configuration libraries a series is a declared object, so long rows must be split: ECharts can do the split declaratively with one `filter` transform per series; the others leave it to the caller.

### Cited Findings
- Plot: "a line mark isn't even guaranteed to produce a single polyline — there can be multiple polylines, as in a line chart with multiple series (using **z**)": `Plot.lineY(bls, {x: "date", y: "unemployment", z: "division"}).plot()`. With the sensor example: `Plot.lineY(linedata, {x: "hour", y: "value", stroke: "sensor"}).plot()`. — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-have-tidy-data)
- Plot: "You can partition groups using **z**. If **z** is undefined, it defaults to **fill** or **stroke**, if any. In conjunction with the barY mark's implicit stackY transform, this will produce stacked bars." — [Plot: Group transform](https://observablehq.com/plot/transforms/group)
- Plot grouped bars are a facet, not a series option: "This is accomplished by setting the **fx** channel to facet horizontally on *sport*, while the **x** channel is used within each facet to draw side-by-side bars for each *sex*." — [Plot: Group transform](https://observablehq.com/plot/transforms/group)
- Vega-Lite: "Adding color to the bar chart (by using the `color` attribute) creates a stacked bar chart by default." — [Vega-Lite: Bar](https://vega.github.io/vega-lite/docs/bar.html)
- Vega-Lite grouped bars: "`xOffset` and `yOffset` position channels determine additional offset to the `x` or `y` position"; the official grouped example sets `"xOffset": {"field": "group"}` and `"color": {"field": "group"}`. — [Vega-Lite: Encoding, "Position Offset Channels"](https://vega.github.io/vega-lite/docs/encoding.html#position-offset), [example bar_grouped](https://vega.github.io/vega-lite/examples/bar_grouped.html)
- Vega-Lite `detail`: "Additional levels of detail for grouping data in aggregate views and in line, trail, and area marks without mapping data to a specific visual channel." — [Vega-Lite: Encoding](https://vega.github.io/vega-lite/docs/encoding.html#detail)
- Vega-Lite goes both ways between shapes: `fold` "collapses (or 'folds') one or more data fields into two properties: a _key_ property (containing the original data field name) and a _value_ property" (`{"fold": ["gold", "silver"]}`), and `pivot` "maps unique values from a field to new aggregated fields (columns) in the output stream", "acting as an inverse to the fold transform" (`{"pivot": "type", "groupby": ["country"], "value": "count"}`). — [Vega-Lite: Fold](https://vega.github.io/vega-lite/docs/fold.html), [Pivot](https://vega.github.io/vega-lite/docs/pivot.html)
- ECharts `seriesLayoutBy`: "`'column'`: Default value. The series are placed above the column of `dataset`. `'row'`: The series are placed above the row of `dataset`." It chooses the orientation of a wide table; it does not derive series from a category column. — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- ECharts for long data: data transform lets users "Partition data into multiple series"; the documented pattern is one derived dataset per series, `transform: { type: 'filter', config: { dimension: 'Year', value: 2011 } }`, and `datasetIndex: 1` on the series. — [ECharts handbook: Data Transform](https://echarts.apache.org/handbook/en/concepts/data-transform/)
- ECharts `groupId` is unrelated to series derivation: "The group ID of a data item. When `universalTransition` is enabled, the data items from the old option and those from the new one, if sharing a same group ID, will then be matched and applied to a proper animation after `setOption` is called." With a dataset, `encode.itemGroupId` names the dimension. — [ECharts option: series-bar.data.groupId](https://echarts.apache.org/en/option.html#series-bar.data.groupId)
- Chart.js: one entry in `data.datasets` per series; the shared-array example declares three datasets with `yAxisKey: 'net'`, `'cogs'`, `'gm'`. — [Chart.js: Data structures](https://www.chartjs.org/docs/latest/general/data-structures.html#parsing)
- Highcharts 13: one series per mapped column: `series: [{ dataMapping: { y: 'Cost' } }, { dataMapping: { y: 'Revenue' } }]`. — [Highcharts: Using DataTables with Series](https://www.highcharts.com/docs/working-with-data/using-datatables-in-series)
- Plotly.js: one trace per series (`var data = [trace1, trace2]`). The former `groupby` transform that split one trace by a column belonged to `transforms`, removed in 3.0.0. — [Plotly.js: Bar charts](https://plotly.com/javascript/bar-charts/), [CHANGELOG 3.0.0](https://github.com/plotly/plotly.js/blob/master/CHANGELOG.md)
- AG Charts: one series object per `yKey` (`{ type: 'bar', xKey: 'quarter', yKey: 'iphone', yName: 'iPhone' }`, `{ ..., yKey: 'mac', ... }`). — [AG Charts: Bar Series](https://www.ag-grid.com/charts/javascript/bar-series/)
- ApexCharts: one entry in `series` per series, each with `name` and `data`. — [ApexCharts sample basic-column](https://github.com/apexcharts/apexcharts.js/blob/main/samples/vanilla-js/column/basic-column.html)

### Inferences
- The split is clean: grammar libraries treat "series" as a consequence of a channel on long rows; configuration libraries treat "series" as a declared thing bound to one wide column. umriss's "one series per JSX element" sits with the configuration libraries (the same as AG Charts, ECharts, Highcharts); what the grammars add is the second route, a channel that fans out.
- In a JSX API the two routes would look like `<Bar value="actual" />` (wide, as today) and something like a series channel on a single element (long). No researched library is a JSX library, so the JSX form is an extrapolation.
- Where a wide-only library meets long rows, the documented escape is a pivot outside the chart (Chart.js, Highcharts, Plotly.js, AG Charts, ApexCharts) or a filter per series inside it (ECharts).

### Gaps
- That Plotly.js' removed `transforms` contained `groupby`, `aggregate`, `filter` and `sort` is from prior knowledge, not from a page read in this research; the changelog line names only "`transforms`".
- Whether AG Charts 14 or ApexCharts 8 has any series-from-field option was not found in the pages read; absence in the bar and data pages is not proof of absence.

## Built-in, declared transforms: group/aggregate, bin, stack, normalise, sort by value, filter, pivot/fold

### Takeaway
Plot and Vega-Lite ship a full declared transform set (aggregate, bin, stack, normalise, sort by another channel, filter, reshape). ECharts ships only `filter` and `sort` (plus `boxplot`) and defers aggregation to external transforms. The rest stop at layout arithmetic: stacking, percent stacking and, in Plotly.js and Highcharts, ordering categories or points by value.

### Cited Findings
- Plot, the principle: "**Transforms** derive data as part of the plot specification. This accelerates what is often the most onerous task in visualization: getting data into the right shape." Built-ins listed: "bin, centroid, dodge, filter, group, hexbin, interval, map, normalize, reverse, select, shuffle, sort, stack, tree, and window." — [Plot: Transforms](https://observablehq.com/plot/features/transforms)
- Plot group (verbatim): `Plot.barY(olympians, Plot.groupX({y: "count"}, {x: "sport"}))`. "The groupX transform groups on **x**. The *outputs* argument (here `{y: "count"}`) declares desired output channels (**y**) and the associated reducer (*count*)." — [Plot: Group transform](https://observablehq.com/plot/transforms/group)
- Plot reducers: "*first*, *last*, *count*, *sum*, *proportion*, *proportion-facet*, *min*, *min-index*, *max*, *max-index*, *mean*, *median*, *mode*, *pXX*, *deviation*, *variance*, *identity*", plus `x`, `y` (0.6.12) and `z` (0.6.14), or a function. "Most reducers require binding the output channel to an input channel; for example, if you want the **y** output channel to be a *sum* (not merely a count), there should be a corresponding **y** input channel specifying which values to sum. If there is not, *sum* will be equivalent to *count*." — [Plot: Group transform, "Group options"](https://observablehq.com/plot/transforms/group#group-options)
- Plot bin (verbatim): `Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex"})).plot()`. — [Plot: What is Plot?](https://observablehq.com/plot/what-is-plot)
- Plot stack is implicit: "The areaY mark applies the stackY transform implicitly if you do not specify either **y1** or **y2**. The same applies to barY and rectY. You can invoke the stack transform explicitly as `Plot.stackY({x: "date", y: "deaths", fill: "cause"})` to produce an identical chart." — [Plot: Stack transform](https://observablehq.com/plot/transforms/stack)
- Plot normalise to proportion: "The *normalize* **offset** is again worth special mention: it scales stacks to fill the interval [0, 1], thereby showing the relative proportion of each layer." Declaration: `Plot.stackY({offset: "normalize", order: "group", reverse: true}, {x: "year", y: "revenue", z: "format", fill: "group"})`. Offsets: null (zero baseline), *normalize*, *center*, *wiggle*, or a function. The scale option `percent: true` multiplies by 100 for display. — [Plot: Stack transform](https://observablehq.com/plot/transforms/stack), [Bar mark](https://observablehq.com/plot/marks/bar)
- Plot sort categories by value (since 0.2.0): `Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y"}})`, shorthand for `sort: {x: "y", reduce: "max", order: "ascending"}`; descending as `sort: {x: "-y"}`; also `reverse: true` and `limit: 5`. "The sort option is an object whose keys are ordinal scale names, such as *x* or *fx*, and whose values are mark channel names, such as **y**, **y1**, or **y2**." — [Plot: Scales, "Sort mark option"](https://observablehq.com/plot/features/scales#sort-mark-option)
- Plot pivot: the `find` reducer (since 0.6.12) "may be used with the group or bin transform to implement a 'pivot wider' transform; for example, a 'tall' dataset with separate rows for male and female observations may be transformed into a 'wide' dataset with separate columns for male and female values." There is no fold (wide to long) transform in the list of built-ins. — [Plot: Group transform](https://observablehq.com/plot/transforms/group), [Transforms](https://observablehq.com/plot/features/transforms)
- Plot transforms compose as option objects: "Plot's transforms typically take two *options* objects as arguments: the first object contains the *transform* options (above, `{y: "count"}`), while the second object contains *mark* options to be 'passed through' to the mark". And they are optional: "Transforms are never required — you can always aggregate and derive data yourself outside of Plot, and then pass in the binned values." — [Plot: Transforms](https://observablehq.com/plot/features/transforms)
- Vega-Lite has two places: "Data transformations in Vega-Lite are described via either view-level transforms (the `transform` property) or field transforms inside `encoding` (`bin`, `timeUnit`, `aggregate`, `sort`, and `stack`). When both types of transforms are specified, the view-level `transform`s are executed first based on the order in the array. Then the inline transforms are executed in this order: `bin`, `timeUnit`, `aggregate`, `sort`, and `stack`." — [Vega-Lite: Transformation](https://vega.github.io/vega-lite/docs/transform.html)
- Vega-Lite view-level transforms: Aggregate, Bin, Calculate, Density, Extent, Filter, Flatten, Fold, Impute, Join Aggregate, Lookup, Pivot, Quantile, Regression and Loess, Sample, Stack, Time Unit, Window. — [Vega-Lite: Transformation](https://vega.github.io/vega-lite/docs/transform.html)
- Vega-Lite aggregate in the encoding: `"y": {"aggregate": "sum", "field": "people"}`. "If at least one fields in the specified encoding channels contain `aggregate`, the resulting visualization will show aggregate data. In this case, all fields without aggregation function specified are treated as group-by fields in the aggregation process." As a transform: `"aggregate": [{"op": ..., "field": ..., "as": ...}], "groupby": [...]`. — [Vega-Lite: Aggregate](https://vega.github.io/vega-lite/docs/aggregate.html), [example stacked_bar_normalize](https://vega.github.io/vega-lite/examples/stacked_bar_normalize.html)
- Vega-Lite aggregate operations (as listed on the page): count, valid, values, missing, distinct, sum, product, mean, average, variance, variancep, stdev, stdevp, stderr, median, q1, q3, ci0, ci1, min, max, argmin, argmax, exponential, exponentialb. — [Vega-Lite: Aggregate](https://vega.github.io/vega-lite/docs/aggregate.html)
- Vega-Lite stack: `stack` is `"zero"` or `true`, `"normalize"` ("stacking with normalized domain"), `"center"`, or `null`/`false` ("No-stacking. This will produce layered bar and area chart"). Default: "`zero` for plots with all of the following conditions are true: (1) the mark is `bar`, `area`, or `arc`; (2) the stacked measure channel (x or y) has a linear scale; (3) At least one of non-position channels mapped to an unaggregated field that is different from x and y. Otherwise, `null` by default." — [Vega-Lite: Stack](https://vega.github.io/vega-lite/docs/stack.html)
- Vega-Lite sort by value: "To sort data by another encoding channel, the `sort` property can be an encoding channel name to sort by (e.g., `"x"` or `"y"`) with an optional minus prefix for descending sort"; `"sort": "-x"` equals `"sort": {"encoding": "x", "order": "descending"}`; or a sort field definition with `field`, `op`, `order`. — [Vega-Lite: Sorting](https://vega.github.io/vega-lite/docs/sort.html)
- ECharts: "`Data transform` has been supported since Apache ECharts 5. ... This feature enables users to process data in a declarative way and provides users several common 'transform functions' to make such tasks work 'out-of-the-box'." Named as built-in on the page: `filter` ("Transform type 'filter' is a built-in transform"), `sort` ("Another built-in transform is 'sort'") and "the built-in boxplot transform". — [ECharts handbook: Data Transform](https://echarts.apache.org/handbook/en/concepts/data-transform/)
- ECharts declarations: `transform: { type: 'filter', config: { dimension: 'Year', value: 2011 } }`; `transform: { type: 'sort', config: { dimension: 'Year', order: 'desc' } }`; piped as an array; relational operators such as `gte`, `lt`; `parser: 'time' | 'trim' | 'number'`. — [ECharts handbook: Data Transform](https://echarts.apache.org/handbook/en/concepts/data-transform/)
- ECharts aggregation is external: "Besides built-in transforms (like 'filter', 'sort'), we can also use external transforms to provide more powerful functionalities", registered with `echarts.registerTransform(...)`. The official aggregate example loads `echarts-simple-transform` and declares `type: 'ecSimpleTransform:aggregate'` with `config: { resultDimensions: [{ name: 'min', from: 'Income', method: 'min' }, ...], groupBy: 'Country' }`. — [ECharts handbook: Data Transform, "Use External Transforms"](https://echarts.apache.org/handbook/en/concepts/data-transform/), [example data-transform-aggregate](https://echarts.apache.org/examples/en/editor.html?c=data-transform-aggregate)
- ECharts stacking is a series option: "You need to set the same string type value for a group of series in `stack`. The series with the same `stack` value will be in the same category." — [ECharts handbook: Stacked Bar Chart](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/stacked-bar/)
- Chart.js stacking: "By default, data is not stacked. If the `stacked` option of the value scale (y-axis on horizontal chart) is `true`, positive and negative values are stacked separately. Additionally, a `stack` option can be defined per dataset to further divide into stack groups". The only data reduction documented is the decimation plugin for line charts. — [Chart.js: Axes](https://www.chartjs.org/docs/latest/axes/), [Performance](https://www.chartjs.org/docs/latest/general/performance.html)
- Highcharts stacking: "Most of the series support two available options, `"normal"` stacking and `"percentage"` stacking. Normal stacking stacks the data series on top of each other in order. Percent stacking fills the plot area and draws each point of data with a relative percentage to all the points in the same category." (The official demo sets `stacking: 'normal'`; the prose on the same page writes both "percentage" and "percent".) — [Highcharts: Stacking charts](https://www.highcharts.com/docs/advanced-chart-features/stacking-charts)
- Highcharts sort by value: `dataSorting: { enabled: true, sortKey: 'value' }`; since 13.0.0 "The `dataSorting` feature now requires the `modules/data-sorting.js` file." — [Highcharts: Using DataTables with Series](https://www.highcharts.com/docs/working-with-data/using-datatables-in-series), [changelog 13.0.0](https://github.com/highcharts/highcharts/blob/master/changelog/highcharts/13.0.0.md)
- Plotly.js layout arithmetic: `barmode` is `'stack' | 'group' | 'overlay' | 'relative'`, default `'group'`; `barnorm` is `'' | 'fraction' | 'percent'`: "With *fraction*, the value of each bar is divided by the sum of all values at that location coordinate. *percent* is the same but multiplied by 100 to show percentages." — [plotly.js bar layout attributes](https://github.com/plotly/plotly.js/blob/master/src/traces/bar/layout_attributes.js)
- Plotly.js category order by value: `categoryorder` values include `'trace'` (default), `'category ascending'`, `'category descending'`, `'array'`, `'total ascending'`, `'total descending'`, and min, max, sum, mean, geometric mean, median, each ascending or descending. — [plotly.js cartesian layout attributes](https://github.com/plotly/plotly.js/blob/master/src/plots/cartesian/layout_attributes.js)
- AG Charts: "To stack bars enable the `stacked` series option." "The `normalizedTo` series option allows normalising bar totals to any non-zero value" (`stacked: true, normalizedTo: 100`); `stackGroup` forms separate stacks. — [AG Charts: Bar Series](https://www.ag-grid.com/charts/javascript/bar-series/)
- ApexCharts: `chart.stacked` with `stackType?: 'normal' | '100%'`. — [types/apexcharts.d.ts](https://github.com/apexcharts/apexcharts.js/blob/main/types/apexcharts.d.ts)

### Inferences
- Synthesis of the cited findings (yes = declared in the chart, ext = via registered external transform, no = caller's code; "n.f." = not found in the pages read):

| Step | Plot 0.6.17 | Vega-Lite 6.5 | ECharts 6.1 | Chart.js 4.5 | Highcharts 13.1 | Plotly.js 4.1 | AG Charts 14.2 | ApexCharts 8.0 |
|---|---|---|---|---|---|---|---|---|
| Group and aggregate (sum, count, mean) | yes (`groupX`) | yes (`aggregate`) | ext | no | n.f. | no (removed in 3.0) | n.f. | n.f. |
| Bin | yes (`binX`) | yes (`bin`) | n.f. | no | n.f. | n.f. | n.f. | n.f. |
| Stack | yes, implicit | yes, implicit with colour | yes (`stack`) | yes (`stacked`) | yes (`stacking`) | yes (`barmode`) | yes (`stacked`) | yes (`chart.stacked`) |
| Normalise to percent | yes (`offset: "normalize"`) | yes (`stack: "normalize"`) | n.f. | n.f. | yes (percent stacking) | yes (`barnorm`) | yes (`normalizedTo`) | yes (`stackType: '100%'`) |
| Sort categories by value | yes (`sort: {x: "-y"}`) | yes (`sort: "-y"`) | yes (`sort` transform) | no | yes (`dataSorting`, module) | yes (`categoryorder`) | n.f. | n.f. |
| Filter | yes (`filter`) | yes (`filter`) | yes (`filter` transform) | no | n.f. | no (removed in 3.0) | n.f. | n.f. |
| Long to wide (pivot) | partly (`find` reducer) | yes (`pivot`) | no | no | no | no | no | no |
| Wide to long (fold) | no | yes (`fold`) | no | no | no | no | no | no |

- The line the state of the art draws: every library takes over layout arithmetic that depends on the other series (stacking, grouping side by side, percent of the stack). Aggregation across rows is taken over only by the grammars. Reshaping (pivot and fold) is taken over fully only by Vega-Lite.
- For umriss's "sums per category must be reduced by the caller": that is the norm in six of eight libraries. The two that do it declare it next to the channel (`groupX({y: "sum"}, ...)`, `"aggregate": "sum"`) and not as a separate data step.
- Plot's and Vega-Lite's implicit stacking shows a second principle: when rows share an x value and a series channel is present, the library stacks without being asked; opting out is explicit (`y2` instead of `y` in Plot, `stack: null` in Vega-Lite).

### Gaps
- "n.f." cells are not negative findings. In particular: histogram or bin series in ECharts, Highcharts, Plotly.js, AG Charts and ApexCharts; Highcharts Stock `dataGrouping`; percent stacking in ECharts 6 and Chart.js; AG Charts and ApexCharts category sorting were not checked.
- The ECharts handbook's opening sentence lists `aggregate` and `regression` among possible transform functions; the same page marks only `filter`, `sort` and `boxplot` as built-in. Whether ECharts 6.1 core registers an `aggregate` transform itself was not verified in the source; the official example still loads it from `echarts-simple-transform`.

## Dates: Date objects, ISO strings, timestamps; is sorting required?

### Takeaway
All eight accept more than a millisecond number: Date objects are documented for five (Plot, ECharts, Plotly.js, AG Charts, ApexCharts), date strings for six (Vega-Lite, ECharts, Highcharts since 12, Plotly.js, AG Charts, ApexCharts), and Chart.js takes whatever its date adapter parses. Plot is the strict one (a Date gives a time scale; a string is a category unless the scale is declared `utc`). On order, the libraries split: Vega-Lite sorts line points itself; Plot, Highcharts and Chart.js (with `parsing: false`) put sorting on the caller, and Plot offers a declared `sort` for it.

### Cited Findings
- Plot: "If the domain is dates, Plot will default to a UTC scale. This is a linear scale with ticks based on the Gregorian calendar." "To force a UTC scale, say when the data is milliseconds since UNIX epoch rather than Date instances, pass *utc* as the **type** option. Though we recommend coercing strings and numbers to more specific types when you load data, rather than relying on scales to do it." — [Plot: Scales](https://observablehq.com/plot/features/scales#continuous-scales)
- Plot coercion under a declared time scale: "time scales coerce channel values to dates; numbers are assumed to be milliseconds since UNIX epoch, while strings are assumed to be in ISO 8601 format." — [Plot: Scales, "Scale options"](https://observablehq.com/plot/features/scales#scale-options)
- Plot: UTC by default: "UTC is recommended over local time as charts in UTC time are guaranteed to appear consistently to all viewers whereas charts in local time will depend on the viewer's time zone. Due to limitations in JavaScript's Date class, Plot does not yet support an explicit time zone other than UTC." — [Plot: Scales, "Scale options"](https://observablehq.com/plot/features/scales#scale-options)
- Plot order: "points in lines are connected in input order: the first point is connected to the second point, the second is connected to the third, and so on. Line data is typically in chronological order. Unsorted data may produce gibberish." "If your data isn't sorted, use the sort transform": `Plot.lineY(d3.shuffle(aapl.slice()), {x: "Date", y: "Close", sort: "Date"}).plot()`. — [Plot: Line mark](https://observablehq.com/plot/marks/line)
- Vega-Lite: "Data values for a temporal field can be either a date-time string (e.g., `"2015-03-07 12:32:17"`, `"17:01"`, `"2015-03-16"`. `"2015"`) or a timestamp number (e.g., `1552199579097`)." — [Vega-Lite: Type](https://vega.github.io/vega-lite/docs/type.html)
- Vega-Lite parsing: `format.parse`: "If set to `null`, disable type inference based on the spec and only use type inference based on the data. Alternatively, a parsing directive object can be provided for explicit data types." "For `"date"`, we parse data based using JavaScript's `Date.parse()`"; specific formats with d3-time-format syntax (`{foo: "date:'%m%d%Y'"}`), UTC variants with `utc:`. — [Vega-Lite: Data, "Format"](https://vega.github.io/vega-lite/docs/data.html#format)
- Vega-Lite order: "the line's path (order of points in the line) is determined by data values on the temporal/ordinal field by default. However, a field can be mapped to the `order` channel for determining a custom path." "Setting `order` to `{"value": null}` makes the line marks use the original order in the data sources." — [Vega-Lite: Line](https://vega.github.io/vega-lite/docs/line.html), [Encoding: order](https://vega.github.io/vega-lite/docs/encoding.html#order)
- Vega-Lite `timeUnit` (e.g. `year`, `yearmonth`, `month`, `hours`) buckets a temporal field inside the encoding: `"x": {"timeUnit": "month", "field": "date", "type": "ordinal"}`. — [example stacked_bar_weather](https://vega.github.io/vega-lite/examples/stacked_bar_weather.html)
- ECharts time axis values: "a timestamp, like `1484141700832`, which represents a UTC time"; "a date string" in "a subset of ISO 8601" such as `'2012-03'`, `'2012-03-01'`, `'2012-03-01 05:06'`, "all of these are treated as local time unless timezone is specified"; or "a JavaScript Date instance created by user". The axis is declared `type: 'time'`. — [ECharts option: series-line.data](https://echarts.apache.org/en/option.html#series-line.data)
- Chart.js: "The time scale **requires** both a date library and a corresponding adapter to be present." "When providing data for the time scale, Chart.js uses timestamps defined as milliseconds since the epoch (midnight January 1, 1970, UTC) internally. However, Chart.js also supports all of the formats that your chosen date adapter accepts. You should use timestamps if you'd like to set `parsing: false` for better performance." — [Chart.js: Time Cartesian Axis](https://www.chartjs.org/docs/latest/axes/cartesian/time.html)
- Chart.js order: "If parsing is disabled, data must be sorted and in the formats the associated chart type and scales use internally." And: "Chart.js is fastest if you provide data with indices that are unique, sorted, and consistent across datasets and provide the `normalized: true` option to let Chart.js know that you have done so." — [Chart.js: Data structures](https://www.chartjs.org/docs/latest/general/data-structures.html), [Performance](https://www.chartjs.org/docs/latest/general/performance.html)
- Highcharts: "In a datetime axis, the numbers are given in milliseconds"; since 12.0.0 date strings are accepted for x ("If the first value is a date string and the x-axis is of type `datetime`, the string is parsed into a date"). — [Highcharts API: xAxis.type](https://api.highcharts.com/highcharts/xAxis.type), [Series](https://www.highcharts.com/docs/chart-concepts/series)
- Highcharts order, error #15 "Highcharts expects data to be sorted": "This happens when creating a line series or a stock chart where the data is not sorted in ascending X order. For performance reasons, Highcharts does not sort the data, instead it requires that the implementer pre-sorts the data." — [Highcharts error #15](https://www.highcharts.com/errors/15/)
- Plotly.js: date strings "should have the form: `-?YYYY-mm-dd<sep>HH:MM:SS.sss<tzInfo>?`", separator "space (our normal standard) or T or t (ISO-8601)", time zone info "we THROW IT AWAY"; "May truncate after any full field"; the same function accepts "a date object". Official example: `x: ['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00']` with no axis type declared. — [plotly.js src/lib/dates.js](https://github.com/plotly/plotly.js/blob/master/src/lib/dates.js), [Plotly.js: Time series](https://plotly.com/javascript/time-series/)
- AG Charts: "Time values may be supplied as: A JavaScript `Date` object. A numeric Unix epoch, in milliseconds since 1 January 1970 (UTC). A `bigint` Unix epoch, for values beyond the safe range of `number` (2⁵³ − 1). An ISO 8601 date or date-time string." Three time axes: "Unit Time Axis - Each 'unit' has a dedicated band within the domain", "Ordinal Time Axis - Only provided values are shown, with missing values omitted", "Continuous Time Axis - Data is shown on a continuous scale." — [AG Charts: Data Configuration and Update](https://www.ag-grid.com/charts/javascript/data-configuration/), [Axis Types](https://www.ag-grid.com/charts/javascript/axes-types/#time)
- ApexCharts: timestamps as `[1324508400000, 34]` pairs or date strings as `{ x: '05/06/2014', y: 54 }`; "The DateTime String which you provide should return `true` when parsed through JavaScript's Date.parse() function." The type file adds `Date` for `x`. — [ApexCharts: Series](https://apexcharts.com/docs/series/), [types/apexcharts.d.ts](https://github.com/apexcharts/apexcharts.js/blob/main/types/apexcharts.d.ts)

### Inferences
- Under Plot's inference rule (strings imply ordinal), an ISO date string column is treated as categories unless the scale is declared `type: "utc"` or the caller parses on load. Plot's docs recommend parsing on load in two places. This is the strictest position among the eight and it is argued, not accidental.
- "Milliseconds as a number only", as in umriss, is below every researched library: even Chart.js and Highcharts, which are millisecond-based inside, accept Date-adapter formats or date strings at the boundary.
- On sorting there are three positions: the library sorts (Vega-Lite); the caller sorts, with a declared helper (Plot `sort: "Date"`, ECharts `sort` transform); the caller sorts, with an error or undefined behaviour otherwise (Highcharts error 15, Chart.js with `parsing: false`). Highcharts states the reason: performance.
- Bars over time expose a design choice: time as a continuous axis (Vega-Lite temporal, Plot `rectY` with `interval`) or time as bands (Vega-Lite ordinal cast, Plot `barY` with scale `interval`, AG Charts unit time axis). AG Charts names all three variants as axis types.

### Gaps
- Whether ECharts, Plotly.js, AG Charts and ApexCharts require x-sorted input for line series was not found in the pages read.
- Whether Chart.js sorts object data when `parsing` is on (the default) was not found stated; the docs state only the requirement for `parsing: false`.
- Time zone handling beyond the quoted sentences (Highcharts `time.timezone`, ECharts `useUTC`) was not researched.

## Missing values: null, NaN, undefined

### Takeaway
The common rule is: an invalid value in a line or area breaks the path; an invalid value in a point or bar mark drops the mark; bridging the gap is an opt-in switch (`connectNulls`, `connectgaps`, `spanGaps`, `connectMissingData`). Plot and Vega-Lite document the distinction between "invalid value" and "row absent", and Vega-Lite can fill absent rows with `impute`.

### Cited Findings
- Plot: "Missing and invalid data are handled specifically for each mark type and channel. In most cases, if the provided channel value for a given datum is null, undefined, or (strictly) NaN, the mark will implicitly filter the datum and not generate a corresponding output. ... Plot.line and Plot.area will stop the path before any invalid point and start again at the next valid point, thus creating interruptions rather than interpolating between valid points." — [Plot: Marks, "Mark options"](https://observablehq.com/plot/features/marks#mark-options)
- Plot: "Supplying undefined values is not the same as filtering the data: the latter will interpolate between the data points." — [Plot: Line mark](https://observablehq.com/plot/marks/line)
- Plot: scales coerce: "Quantitative scales, as well as identity position scales, coerce channel values to numbers; both null and undefined are coerced to NaN." — [Plot: Scales, "Scale options"](https://observablehq.com/plot/features/scales#scale-options)
- Plot: absent steps on a band axis are made visible with `interval`: "When ordinal data is regular, such as the yearly observations of the time-series bar chart of world population below, use the **interval** option to enforce uniformity and show gaps for missing data." — [Plot: Bar mark](https://observablehq.com/plot/marks/bar)
- Vega-Lite `mark.invalid` modes: `"filter"`, `"break-paths-filter-domains"`, `"break-paths-show-domains"`, `"show"`, and "`"break-paths-show-path-domains"` (default) — This is equivalent to `"break-paths-show-domains"` for path-based marks (line/area/trail) and `"filter"` for non-path marks." Invalid means "`null` and `NaN` in continuous scales". — [Vega-Lite: Modes for Handling Invalid Data](https://vega.github.io/vega-lite/docs/invalid-data.html)
- Vega-Lite: "Vega-Lite does _not_ consider `null` and `NaN` in categorical scales and text encodings as invalid data: Categorical scales can treat nulls and NaNs as separate categories". — [Vega-Lite: Modes for Handling Invalid Data](https://vega.github.io/vega-lite/docs/invalid-data.html)
- Vega-Lite impute: "The impute transform groups data and determines missing values of the `key` field within each group. For each missing value in each group, the impute transform will produce a new tuple with the `impute`d field generated based on a specified imputation `method` (by using a constant `value` or by calculating statistics such as mean within each group)." Methods: `"value"`, `"mean"`, `"median"`, `"max"`, `"min"`. — [Vega-Lite: Impute](https://vega.github.io/vega-lite/docs/impute.html)
- ECharts: "`'-'` or `null` or `undefined` or `NaN` can be used to describe that a data item does not exist (ps：*not exist* does not means its value is `0`). For example, line chart can break when encounter an empty value, and scatter chart do not display graphic elements for empty values." `connectNulls` (default `false`): "Whether to connect the line across null points." — [ECharts option: series-line.data](https://echarts.apache.org/en/option.html#series-line.data), [series-line.connectNulls](https://echarts.apache.org/en/option.html#series-line.connectNulls)
- Chart.js: "`null` can be used for skipped values." Line `spanGaps`: "If true, lines will be drawn between points with no or null data. If false, points with `null` data will create a break in the line. Can also be a number specifying the maximum gap length to span." Bar `skipNull`: "If `true`, null or undefined values will not be used for spacing calculations when determining bar size." — [Chart.js: Data structures](https://www.chartjs.org/docs/latest/general/data-structures.html), [Line chart](https://www.chartjs.org/docs/latest/charts/line.html), [Bar chart](https://www.chartjs.org/docs/latest/charts/bar.html)
- Highcharts `connectNulls` (default `false`): "Whether to connect a graph line across null points, or render a gap between the two points on either side of the null. In stacked area chart, if `connectNulls` is set to true, null points are interpreted as 0." — [Highcharts API: plotOptions.series.connectNulls](https://api.highcharts.com/highcharts/plotOptions.series.connectNulls)
- Plotly.js `connectgaps` (default `false`): "Determines whether or not gaps (i.e. {nan} or missing values) in the provided data arrays are connected." The official example uses `null` in `y`. — [plotly.js scatter attributes](https://github.com/plotly/plotly.js/blob/master/src/traces/scatter/attributes.js), [Plotly.js: Line charts](https://plotly.com/javascript/line-charts/)
- AG Charts: "Data points with a `yKey` value of positive or negative `Infinity`, `null`, `undefined` or `NaN` will be rendered as a gap in the line. Set `connectMissingData: true` to draw a connecting line between points either side of a missing point. Data points with invalid `xKey` values will be ignored." — [AG Charts: Line Series, "Missing Data"](https://www.ag-grid.com/charts/javascript/line-series/#missing-data)
- ApexCharts: the type of series data admits `null` (`(number | null)[]`, `y: number | null | ...`). — [types/apexcharts.d.ts](https://github.com/apexcharts/apexcharts.js/blob/main/types/apexcharts.d.ts)

### Inferences
- The default is the same everywhere it is documented: gap, not bridge, not zero. Bridging is a named option on the series.
- A second, quieter problem is the absent row (a category or time step with no row at all). Only Plot (`interval`), Vega-Lite (`impute`) and AG Charts (unit time axis against ordinal time axis) address it in the pages read.

### Gaps
- How ApexCharts draws `null` (gap or bridge) and whether it has a connect option was not found; only the type signature was read.
- How each library treats a missing value inside a stack (zero or hole) was read only for Highcharts.

## Category order and category labels

### Takeaway
Defaults differ and matter: Plot and Vega-Lite sort a categorical domain in natural ascending order unless told otherwise; Plotly.js documents data order as its default, and Chart.js and Highcharts take the order of the caller's labels or categories array (ECharts collects categories from the data; its order, and that of AG Charts and ApexCharts, was not found stated). Explicit order is a domain array everywhere; order by value is declared in Plot, Vega-Lite, Plotly.js, ECharts (transform) and Highcharts (module). A label field different from the key field is first-class in none of the pages read; the common route is a tick formatter or separate value and name fields per point.

### Cited Findings
- Plot: "For ordinal scales, the default domain is the set of all distinct values associated with the scale in natural ascending order; for a different order, set the domain explicitly or add a **sort** option to an associated mark." And: "Ordinal domains are sorted naturally (alphabetically) by default." — [Plot: Scales, "Scale options"](https://observablehq.com/plot/features/scales#scale-options), [Bar mark](https://observablehq.com/plot/marks/bar)
- Plot: keeping input order needs an explicit null: "Setting **order** to null will disable sorting, preserving the order of the data. (When an aggregating transform is used, such as group or bin, note that the data may already have been sorted and thus the order may differ from the input data.)" — [Plot: Scales, "Sort mark option"](https://observablehq.com/plot/features/scales#sort-mark-option)
- Plot labels: axis text comes from the scale's `tickFormat` (examples: `x: {tickFormat: ""}`, `tickFormat: (x) => x < 0 ? `${-x} BC` : `${x} AD``) and the axis title from `label`; with field names the axis label is automatic. — [Plot: Bar mark](https://observablehq.com/plot/marks/bar), [Marks](https://observablehq.com/plot/features/marks)
- Vega-Lite: for discrete fields `sort` is `"ascending"` (default, "sort by the field's value in ascending order" in JavaScript natural order), `"descending"`, an encoding channel name, a sort field definition, "an array specifying the field values in preferred order ... followed by any unspecified values in their original order", or "`null` indicating no sort". For `month` and `day` time units the array may hold month or day names. — [Vega-Lite: Sorting](https://vega.github.io/vega-lite/docs/sort.html)
- Vega-Lite: "If an encoding includes a custom sort order, Vega-Lite uses the ordinal type by default". — [Vega-Lite: Type](https://vega.github.io/vega-lite/docs/type.html)
- ECharts: a category axis takes its categories from `xAxis.data` or collects them from the series or dataset: "Category data can be auto retrieved from series.data or dataset.source, or can be specified via xAxis.data." Reordering is a `sort` transform on the dataset. — [ECharts option: xAxis.type](https://echarts.apache.org/en/option.html#xAxis.type), [Data Transform](https://echarts.apache.org/handbook/en/concepts/data-transform/)
- Chart.js: the order is the `labels` array; "The values for the labels have to be provided in an array." With object data, "the `category` scale uses integers as an internal format, where each integer represents an index in the labels array; but, if parsing is enabled, it can also parse string labels." — [Chart.js: Data structures](https://www.chartjs.org/docs/latest/general/data-structures.html)
- Highcharts: `xAxis.categories: ['Apples', 'Bananas', 'Oranges']`, or `type: 'category'` with point names; `uniqueNames` (default `true`): "points are placed on the X axis according to their names. If the same point name is repeated in the same or another series, the point is placed on the same X position as other points of the same name." "However, if you have multiple series, best practice remains defining the `categories` array." — [Highcharts API: xAxis.uniqueNames](https://api.highcharts.com/highcharts/xAxis.uniqueNames), [xAxis.categories](https://api.highcharts.com/highcharts/xAxis.categories)
- Highcharts separates key and label per point: `dataMapping: { x: 'timestamp', y: 'sales', name: 'product' }`, where `name` is the point name used on a category axis. — [Highcharts: Using DataTables with Series](https://www.highcharts.com/docs/working-with-data/using-datatables-in-series)
- Plotly.js: `categoryorder`: "By default, plotly uses *trace*, which specifies the order that is present in the data supplied." "Set `categoryorder` to *array* to derive the ordering from the attribute `categoryarray`. If a category is not found in the `categoryarray` array, the sorting behavior for that attribute will be identical to the *trace* mode." — [plotly.js cartesian layout attributes](https://github.com/plotly/plotly.js/blob/master/src/plots/cartesian/layout_attributes.js)
- AG Charts: "Category values may be any type. Strings are used directly; other values are converted with `toString()`." A hierarchy of categories is an array value: "To use a grouped category axis, the `xKey` needs to reference an array of strings, with each string representing a level in the hierarchy." Series display names are `yName`. — [AG Charts: Data Configuration and Update](https://www.ag-grid.com/charts/javascript/data-configuration/), [Axis Types](https://www.ag-grid.com/charts/javascript/axes-types/#grouped-category)
- ApexCharts: `xaxis.categories` is "a flat array for a single row of labels, or a 2-D array (`[group, label][]`) to render grouped category axes"; with `{x, y}` data the category is the `x` string. — [types/apexcharts.d.ts](https://github.com/apexcharts/apexcharts.js/blob/main/types/apexcharts.d.ts)

### Inferences
- The alphabetical default of the two grammars is the one default in this area that surprises callers who hand over rows in a meaningful order (months, funnel steps); both libraries document the opt-out (`sort: {x: null ...}`/explicit domain, `"sort": null`). The configuration libraries default to data order.
- What umriss asks of the caller today (index per row, explicit ticks, a formatter that looks up the name) is what Chart.js describes as its internal format ("integers ... where each integer represents an index in the labels array"). Chart.js parses string labels into that format itself; the caller never sees it unless `parsing: false`.
- A key field and a separate label field: Highcharts (`x` plus `name`) and ECharts (`encode.itemName`) come closest; in Plot and Vega-Lite the idiom is a formatter on the scale or axis.

### Gaps
- No page read documents a general "label field" option for a categorical axis in Plot, Vega-Lite, AG Charts, Chart.js or ApexCharts; Vega-Lite's `axis.labelExpr` and AG Charts' label formatters were not read.
- The default category order of ECharts (when categories are collected from the data), AG Charts and ApexCharts was not found stated.

## Minimal code for a categorical bar chart with two (or more) series, grouped and stacked, from official docs

### Takeaway
From long rows, Vega-Lite needs four channel declarations for a grouped chart and three for a stacked one; Plot needs one mark with `x`, `y`, `fill` (plus `fx` for grouped). The configuration libraries need one series declaration per column plus a stacking switch.

### Cited Findings
- Observable Plot 0.6.17, stacked, long rows, counting rows per category (verbatim). — [Plot: Group transform](https://observablehq.com/plot/transforms/group)

```js
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {grid: true},
  color: {legend: true},
  marks: [
    Plot.barY(olympians, Plot.groupX({y: "count"}, {x: "sport", fill: "sex"})),
    Plot.ruleY([0])
  ]
})
```

- Observable Plot 0.6.17, grouped (verbatim); `fx` is the category, `x` the series inside each facet, `y2` opts out of the implicit stack. — [Plot: Group transform](https://observablehq.com/plot/transforms/group)

```js
Plot.plot({
  marginBottom: 100,
  fx: {padding: 0, label: null, tickRotate: 90, tickSize: 6},
  x: {axis: null, paddingOuter: 0.2},
  y: {grid: true},
  color: {legend: true},
  marks: [
    Plot.barY(olympians, Plot.groupX({y2: "count"}, {x: "sex", fx: "sport", fill: "sex"})),
    Plot.ruleY([0])
  ]
})
```

- Plot, rule that makes pre-aggregated long rows stack without a transform: "if you only specify a single quantitative value, barY applies an implicit stackY transform". — [Plot: Bar mark](https://observablehq.com/plot/marks/bar)
- Vega-Lite 6, grouped, long rows (verbatim, data shortened here to the first rows; the published spec has nine). — [example bar_grouped](https://vega.github.io/vega-lite/examples/bar_grouped.html)

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      {"category":"A", "group": "x", "value":0.1},
      {"category":"A", "group": "y", "value":0.6},
      {"category":"A", "group": "z", "value":0.9},
      {"category":"B", "group": "x", "value":0.7}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "category"},
    "y": {"field": "value", "type": "quantitative"},
    "xOffset": {"field": "group"},
    "color": {"field": "group"}
  }
}
```

- Vega-Lite 6, stacked with aggregation and normalisation (verbatim); without `"stack": "normalize"` the same spec is a plain stacked bar, because colour implies stacking. — [example stacked_bar_normalize](https://vega.github.io/vega-lite/examples/stacked_bar_normalize.html)

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": { "url": "data/population.json"},
  "transform": [
    {"filter": "datum.year == 2000"},
    {"calculate": "datum.sex == 2 ? 'Female' : 'Male'", "as": "gender"}
  ],
  "mark": "bar",
  "width": {"step": 17},
  "encoding": {
    "y": {
      "aggregate": "sum", "field": "people",
      "title": "population",
      "stack":  "normalize"
    },
    "x": {"field": "age"},
    "color": {
      "field": "gender",
      "scale": {"range": ["#675193", "#ca8861"]}
    }
  }
}
```

- ECharts (dataset since v4), grouped, wide rows (verbatim). — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)

```js
option = {
  legend: {},
  tooltip: {},
  dataset: {
    // Provide a set of data.
    source: [
      ['product', '2015', '2016', '2017'],
      ['Matcha Latte', 43.3, 85.8, 93.7],
      ['Milk Tea', 83.1, 73.4, 55.1],
      ['Cheese Cocoa', 86.4, 65.2, 82.5],
      ['Walnut Brownie', 72.4, 53.9, 39.1]
    ]
  },
  // Declare an x-axis (category axis).
  // The category map the first column in the dataset by default.
  xAxis: { type: 'category' },
  // Declare a y-axis (value axis).
  yAxis: {},
  // Declare several 'bar' series,
  // every series will auto-map to each column by default.
  series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
};
```

- ECharts, stacked (verbatim; the handbook's stacked example uses `series.data`, not `dataset`; `stack` is a series option and applies to dataset-backed series as well). — [ECharts handbook: Stacked Bar Chart](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/stacked-bar/)

```js
option = {
  xAxis: {
    data: ['A', 'B', 'C', 'D', 'E']
  },
  yAxis: {},
  series: [
    {
      data: [10, 22, 28, 43, 49],
      type: 'bar',
      stack: 'x'
    },
    {
      data: [5, 4, 3, 5, 10],
      type: 'bar',
      stack: 'x'
    }
  ]
};
```

- Chart.js 4, grouped, wide rows shared by reference (verbatim; grouped is the default for several bar datasets). — [Chart.js: Data structures, "parsing"](https://www.chartjs.org/docs/latest/general/data-structures.html#parsing)

```js
const data = [{x: 'Jan', net: 100, cogs: 50, gm: 50}, {x: 'Feb', net: 120, cogs: 55, gm: 75}];
const cfg = {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb'],
    datasets: [{
      label: 'Net sales',
      data: data,
      parsing: {
        yAxisKey: 'net'
      }
    }, {
      label: 'Cost of goods sold',
      data: data,
      parsing: {
        yAxisKey: 'cogs'
      }
    }, {
      label: 'Gross margin',
      data: data,
      parsing: {
        yAxisKey: 'gm'
      }
    }]
  },
};
```

- Chart.js 4, stacked: the same `data`, plus (verbatim). — [Chart.js: Bar chart, "Stacked Bar Chart"](https://www.chartjs.org/docs/latest/charts/bar.html#stacked-bar-chart)

```js
const stackedBar = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        }
    }
});
```

- Highcharts 13, stacked, shared columnar table (verbatim excerpt of the official demo; title, y axis, legend and tooltip options omitted). Removing `stacking: 'normal'` gives grouped columns. — [Highcharts demo: Stacked column](https://www.highcharts.com/demo/highcharts/column-stacked), [demo source](https://github.com/highcharts/highcharts/blob/master/samples/highcharts/demo/column-stacked/demo.js)

```js
Highcharts.chart('container', {
    dataTable: {
        columns: {
            Team: ['Arsenal', 'Chelsea', 'Liverpool', 'Manchester United'],
            BPL: [3, 5, 1, 13],
            'FA Cup': [14, 8, 8, 12],
            CL: [0, 2, 6, 3]
        }
    },
    chart: {
        type: 'column'
    },
    xAxis: {
        type: 'category'
    },
    plotOptions: {
        column: {
            dataMapping: {
                name: 'Team'
            },
            stacking: 'normal',
            dataLabels: {
                enabled: true
            }
        }
    },
    series: [{
        dataMapping: {
            y: 'BPL'
        }
    }, {
        dataMapping: {
            y: 'FA Cup'
        }
    }, {
        dataMapping: {
            y: 'CL'
        }
    }]
});
```

- Plotly.js, grouped (verbatim); stacked is the same with `var layout = {barmode: 'stack'};`. — [Plotly.js: Bar charts](https://plotly.com/javascript/bar-charts/)

```js
var trace1 = {
  x: ['giraffes', 'orangutans', 'monkeys'],
  y: [20, 14, 23],
  name: 'SF Zoo',
  type: 'bar'
};

var trace2 = {
  x: ['giraffes', 'orangutans', 'monkeys'],
  y: [12, 18, 29],
  name: 'LA Zoo',
  type: 'bar'
};

var data = [trace1, trace2];

var layout = {barmode: 'group'};

Plotly.newPlot('myDiv', data, layout);
```

- AG Charts 14, grouped, wide rows at the root (verbatim). "By default, bars are grouped"; stacked is the same series with `stacked: true` (`{ type: 'bar', xKey: 'quarter', yKey: 'iphone', stacked: true }`), percent with `normalizedTo: 100`. — [AG Charts: Data Configuration and Update](https://www.ag-grid.com/charts/javascript/data-configuration/), [Bar Series](https://www.ag-grid.com/charts/javascript/bar-series/)

```js
{
    data: [
        { year: '2021', women: 25, men: 20 },
        { year: '2022', women: 28, men: 22 },
        { year: '2023', women: 32, men: 24 },
    ],
    series: [
        {
            type: 'bar',
            xKey: 'year',
            yKey: 'women',
            yName: 'Women',
        },
        {
            type: 'bar',
            xKey: 'year',
            yKey: 'men',
            yName: 'Men',
        },
    ],
}
```

- ApexCharts, grouped, per-series arrays (verbatim excerpt of the official sample; the third series and the styling options are omitted). — [ApexCharts sample basic-column](https://github.com/apexcharts/apexcharts.js/blob/main/samples/vanilla-js/column/basic-column.html)

```js
var options = {
        series: [
          {
            name: 'Net Profit',
            data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
          },
          {
            name: 'Revenue',
            data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
          },
        ],
        chart: {
          type: 'bar',
          height: 350,
        },
        xaxis: {
          categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        },
      }
```

### Inferences
- For pre-aggregated long rows (`{category, series, value}`), Plot's form follows from the cited implicit-stack rule: one `barY` with `x`, `y` and `fill` named as fields; this exact three-field call does not appear verbatim on the pages read.
- Count of things the caller names for a two-series stacked bar from one table: Vega-Lite three fields; Plot three fields; AG Charts `xKey` twice and two `yKey`s plus `stacked` twice; Highcharts one shared `name` mapping, two `y` mappings, one `stacking`; ECharts nothing but the series count and `stack` twice; Chart.js one labels array, two keys, two scale switches; Plotly.js and ApexCharts four or five extracted arrays.
- The grouped case shows the grammars' one awkward spot: Plot expresses grouping as a facet (`fx`) with the series on `x`, and Vega-Lite needed a dedicated offset channel (`xOffset`). In the configuration libraries grouped is simply the default.

### Gaps
- ApexCharts: no official stacked sample was retrieved (the guessed sample path returned 404); stacking is documented here only through the type file (`chart.stacked`, `stackType`). A complete `parsing` example was not retrieved verbatim either.
- The Highcharts and ApexCharts blocks are excerpts; removed options are named above each block.

## Which data preparation steps each library takes over, and where the line runs

### Takeaway
The state of the art agrees on a floor: the caller hands over rows and names fields, and the chart owns category positions, time parsing or at least Date acceptance, gaps for nulls, and stacking or grouping across series. Above the floor the libraries diverge: only the grammars own aggregation and series derivation; sorting of x and reshaping remain the caller's job in most configuration libraries.

### Cited Findings
- Plot states the aim and the opt-out together: "Munging data, not visualizing it, is often most of the work of data analysis. Plot's transforms let you aggregate and derive data *within* your plot specification, reducing the time spent preparing data." and "Transforms are never required — you can always aggregate and derive data yourself outside of Plot". — [Plot: Why Plot?](https://observablehq.com/plot/why-plot), [Transforms](https://observablehq.com/plot/features/transforms)
- Plot leaves type correctness to the caller: "Plot assumes that your data is consistently typed, so inference is based solely on the first non-null, non-undefined value." and "While Plot aspires to give good defaults and helpful warnings, Plot won't prevent you from creating a meaningless chart." — [Plot: Scales](https://observablehq.com/plot/features/scales#type-inference), [Marks](https://observablehq.com/plot/features/marks#marks-imply-data-types)
- ECharts names the step it removes: with `series.data`, "programmers always need to divide the data in separate series (and categories) first"; `dataset` is there to "avoid users from converting for data format to a certain extent." — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- Highcharts names a step it keeps with the caller: "For performance reasons, Highcharts does not sort the data, instead it requires that the implementer pre-sorts the data." Its docs keep a page "Custom preprocessing" for sources the Data module cannot read. — [Highcharts error #15](https://www.highcharts.com/errors/15/), [Working with data](https://www.highcharts.com/docs/working-with-data/data-intro)
- Chart.js frames parsing as a cost the caller may take back: "Provide prepared data in the internal format accepted by the dataset and scales, and set `parsing: false`." — [Chart.js: Performance](https://www.chartjs.org/docs/latest/general/performance.html)
- ApexCharts frames `parsing` as "eliminating the need for manual data transformation." — [release v5.3.0](https://github.com/apexcharts/apexcharts.js/releases/tag/v5.3.0)

### Inferences
- Line by line, against the steps umriss asks of its caller (synthesis of the sections above):

| Step umriss leaves to the caller | Who takes it over |
|---|---|
| Category to index, explicit ticks, name lookup in a tick formatter | All eight. Category values go in as they are; a band or category axis is a library type, inferred (Plot, AG Charts, Plotly.js; Chart.js via `labels`) or declared in one word (Vega-Lite `nominal`, which is the default; ECharts and Highcharts `type: 'category'`). |
| Time as milliseconds only | All eight accept more: Date objects (Plot, ECharts, Plotly.js, AG Charts, ApexCharts), date strings (Vega-Lite, ECharts, Highcharts since 12, Plotly.js, AG Charts, ApexCharts; Plot only under a declared `utc` scale), adapter formats (Chart.js). |
| Rows sorted by x | Vega-Lite sorts. Plot and ECharts offer a declared sort. Highcharts requires sorted input; Chart.js requires it with `parsing: false`. |
| One series per element, long rows filtered or pivoted by the caller | Plot (`fill`/`stroke`/`z`) and Vega-Lite (`color`/`detail`/`xOffset`) derive series from a field. ECharts splits with a filter transform per series. The other five expect wide rows or per-series arrays. |
| Sums per category reduced by the caller | Plot (`groupX({y: "sum"}, ...)`) and Vega-Lite (`"aggregate": "sum"`). ECharts through an external transform. The other five leave it to the caller. |

- The first two rows are below the common floor: no researched library asks for them. The last two rows are above it: asking the caller for wide, pre-aggregated rows is what AG Charts, Highcharts, Chart.js, Plotly.js and ApexCharts do in 2026. The third row is contested.
- Stated motives differ. The grammars argue from analysis speed ("time to first chart", "getting data into the right shape"). The configuration libraries that hold the line argue from performance (Highcharts on sorting, Chart.js on parsing, AG Charts recommending root-level data "for best performance") and, in Plotly.js' case, removed the feature altogether.
- Where a library takes a step over, it does so in the same declaration that names the field (a channel, an `encode`, an `aggregate` beside the field), not in a separate data-preparation API. ECharts' separate `dataset.transform` pipeline is the exception, and it is also the one whose aggregation never became built-in.

### Gaps
- No maintainer statement was found that discusses this line as such for AG Charts or ApexCharts.
- React-first libraries are out of scope here by assignment; whether they sit at the floor or above it is for the parallel research.

## What the maintainers say about why the data model is as it is

### Takeaway
Plot and ECharts explain their data model in their own docs: Plot from tidy data and defaults ("If you specify the semantics — your data and the desired encodings — Plot will figure out the rest"), ECharts from the separation of data and mapping. Vega-Lite's docs explain the type system as semantics over primitive types. For the other libraries the rationale found is about performance or convenience, in short remarks.

### Cited Findings
- Plot, purpose: "**Observable Plot** is for exploratory data visualization. It's for finding insights quickly. Its API, while expressive and configurable, optimizes for conciseness and memorability. We want the time to first chart to be as fast as possible." "Or put more simply: **with Plot, you'll see more charts.**" — [Plot: Why Plot?](https://observablehq.com/plot/why-plot)
- Plot, defaults: "What makes Plot concise? In a word: *defaults*. If you specify the semantics — your data and the desired encodings — Plot will figure out the rest. The beauty of defaults is that you can override them as needed." — [Plot: Why Plot?](https://observablehq.com/plot/why-plot)
- Plot, lineage: it features "scales and layered marks in the *grammar of graphics* style popularized by Leland Wilkinson and Hadley Wickham and inspired by the earlier ideas of Jacques Bertin." "A plot specification assigns columns of data (*weight*, *height*, and *sex*) to visual properties of marks (**x**, **y**, and **stroke**). Plot does the rest!" — [Plot: What is Plot?](https://observablehq.com/plot/what-is-plot)
- Plot, marks over chart types: "Plot doesn't have chart types; instead, you construct charts by layering **marks**." "The big advantage of mark types over chart types is that you can compose multiple marks of different types into a single plot." — [Plot: Marks](https://observablehq.com/plot/features/marks)
- Plot, scales carry meaning: "rather than supplying literal values, it is more semantic to provide abstract values and use scales. In addition to centralizing the encoding definition (if used by multiple marks), it allows Plot to generate a legend." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-have-channels)
- Plot, types carry meaning: "Plot encourages you to think about data types as you visualize because data types often imply semantics." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-imply-data-types)
- Plot, transforms and other features: "Because transforms are integrated into Plot, they work automatically with other Plot features such as faceting." "Plot's transforms are often more convenient, especially in conjunction with Plot's other features such as faceting and automatic grouping by **z**. ... doing this with d3.bin would be a lot more work!" — [Plot: Why Plot?](https://observablehq.com/plot/why-plot), [Transforms](https://observablehq.com/plot/features/transforms)
- Plot against D3: "We've long said that *D3 makes things possible, not necessarily easy.*" "To paraphrase Amanda Cox: 'Use D3 if you think it's perfectly normal to write a hundred lines of code for a bar chart.'" "**Plot's goal is to make the easy things easy, and fast, and then some.**" — [Plot: Why Plot?](https://observablehq.com/plot/why-plot)
- Plot's caution about its own defaults: "Because Plot strives to be concise, there are many default behaviors, some of which can be subtle. If Plot isn't doing what you expect, try disabling the defaults by specifying options explicitly." — [Plot: Marks](https://observablehq.com/plot/features/marks#marks-have-options)
- Tidy data, the shape Plot cites: "Tidy datasets are easy to manipulate, model and visualize, and have a specific structure: each variable is a column, each observation is a row, and each type of observational unit is a table." Wickham, H. (2014). Tidy Data. Journal of Statistical Software, 59(10), 1–23. — [doi:10.18637/jss.v059.i10](https://doi.org/10.18637/jss.v059.i10)
- Vega-Lite, self-description: "**Vega-Lite** is a high-level grammar for interactive graphics. It provides a concise JSON syntax for supporting rapid generation of interactive multi-view visualizations to support analysis." It compiles "into a lower-level, more detailed Vega" specification. — [Vega-Lite: Overview](https://vega.github.io/vega-lite/docs/)
- Vega-Lite paper: Satyanarayan, Moritz, Wongsuphasawat, Heer, "Vega-Lite: A Grammar of Interactive Graphics", IEEE Trans. Visualization & Comp. Graphics (Proc. InfoVis), 2017, doi 10.1109/TVCG.2016.2599030. Abstract: "We present Vega-Lite, a high-level grammar that enables rapid specification of interactive data visualizations. Vega-Lite combines a traditional grammar of graphics, providing visual encoding rules and a composition algebra for layered and multi-view displays, with a novel grammar of interaction." "The Vega-Lite compiler automatically synthesizes requisite data flow and event handling logic, which users can override for further customization." — [UW Interactive Data Lab: paper page](https://idl.uw.edu/papers/vega-lite)
- Vega-Lite, why types are declared: "Data `type` describes the semantics of the data rather than the primitive data types (number, string, etc.). The same primitive data type can have different types of measurement." — [Vega-Lite: Type](https://vega.github.io/vega-lite/docs/type.html)
- ECharts, why `dataset`: the advantages listed are "Follow the ideas of data visualization: (I) Provide the data, (II)Mapping from data to visual to become a chart."; "Divide data from other configurations. The data often change but others not."; "Data can be reused by several series or component, you don't need to create copies of a large amount of data for every series."; "Support more common data format, such as a 2D array, array of classes, etc., to avoid users from converting for data format to a certain extent." — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- ECharts keeps `series.data` for a reason: "Defining `data` under `series` is suitable for customization for some special data structures such as 'tree', 'graph' and large data." — [ECharts handbook: Dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- Highcharts on `dataTable` (v13): it is for "structured data from databases, CSV files, or APIs", "multiple series from the same source with different column mappings", "reactive data updates without manual point management", "Sharing data between Grid and Chart components"; and it keeps the old route: "When direct series.data is fine: Small datasets; One-time chart generation; Simple, isolated charts". — [Highcharts: Using DataTables with Series](https://www.highcharts.com/docs/working-with-data/using-datatables-in-series)
- AG Charts on the shared table: root-level `data` "is recommended for best performance." — [AG Charts: Data Configuration and Update](https://www.ag-grid.com/charts/javascript/data-configuration/)

### Inferences
- The grammars justify their model by what the caller should have to say: the semantics (which column is what), with everything else defaulted and overridable. That is the sentence closest to the maintainer's complaint about umriss: the caller of umriss says the semantics and then also does the positional work.
- ECharts' two-step formula (provide the data, then map data to visual) is the same idea in a configuration library, eight years old (ECharts 4), and Highcharts arrived at it in 2026. The convergence is on "shared table plus field mapping", not on transforms.
- Plot itself warns that inference and implicit transforms have a price in predictability; a library that adopts inference inherits the need for an explicit override for each default (scale `type`, `domain`, `sort`, `y1`/`y2` to stop stacking).

### Gaps
- The body of the Vega-Lite paper was not read; the abstract is about the grammar of interaction and says nothing on the data model, type system or defaults. Statements from the paper on those points could not be verified here.
- No design document or post by Mike Bostock beyond Plot's own documentation was retrieved; the Plot quotes are from the docs, which carry no personal byline.
- No design rationale was found for Chart.js' `labels`/`datasets` model, Plotly.js' per-trace arrays, or ApexCharts' series formats beyond the short remarks quoted in other sections.
