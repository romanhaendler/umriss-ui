# Caller experience and API principles for handing data to chart libraries (state: 2026-10-10)

Method notes for the report writer:

- Reaction and comment counts were read from the GitHub API on 2026-10-10. "+1" is the thumbs-up count on the issue body; "r=" is the total reaction count on a single comment.
- Quotes marked **(verbatim, repo source)** were read from the documentation source file in the library's repository and are exact. Quotes marked **(via summarising fetch)** came through a fetch tool that summarises pages; the wording is very likely right but was not read character by character.
- observablehq.com answered HTTP 429 throughout, so Plot's documentation was read from its repository source (`observablehq/plot/docs/...`), which is what the site is built from. The Observable blog post on reshaping data could not be opened.
- GitHub issue search by reactions returned few data-shaping issues with high counts. The top-reacted issues in every repository are about features, React version support and build breakage (see first section). Data-shaping evidence is therefore mostly medium-reaction threads plus maintainer statements, not "hundreds of upvotes".

## 1. Recurring complaints about data shaping in popular libraries

### Takeaway
The best-documented complaints are (a) time on the x axis needing manual conversion to numbers or `Date` plus a formatter, (b) libraries that dictate a fixed datum shape and force a transform, and (c) series that do not share one row array. Maintainers answered almost all of them the same way: accept a field name **or** an accessor function over the caller's own rows, and let the axis convert.

### Cited Findings

**Recharts**
- Primary evidence. "Time series example" (opened 2017-10-19, closed 2023-06-01, +1=40). The opener could not work out "how my time data should be formatted. Currently it is JavaScript Date objects." The most-reacted comment in the thread (r=192, 2017-10-25) is a workaround, not a maintainer answer: "I created a time series graph a couple of weeks ago without documentation, drove me mad so here's how I did it", converting time to a number with `new Date().getTime()` and building on `ScatterChart`. A follow-up (r=33): "would be nice if they could put this example in the docs!" — [recharts#956](https://github.com/recharts/recharts/issues/956)
- Primary evidence. "BarChart - time scale and type number makes bars to be too wide" (opened 2021-11-09, closed 2024-09-05, +1=4). The reporter had to convert ISO timestamps to unix numbers and combine `type="number"`, `scale="time"` and `domain`; bars then overflowed. One user comment (r=4, 2022-05-09): "My solution was moving to https://www.chartjs.org/ where they support this out of the box." A maintainer (ckifer, 2023-01-12) explained the delay: "recharts didn't have active contributors for a while". A contributor workaround (2023-08-03): `padding='gap'`. — [recharts#2711](https://github.com/recharts/recharts/issues/2711)
- Primary evidence. "Accepting function instead of dataKey" (opened 2016-12-02, closed 2017-01-05, +1=18). Request: "That would allow Recharts to make less assumptions about the passed `data`s format and would enable more use cases like computing values". Maintainer xile611 (2017-01-04): "I'll refactor recharts to allow the `dataKey` be a simple string, a nested string or a map function." A user asked for the `Array.map` signature `(record, index, data)`. — [recharts#383](https://github.com/recharts/recharts/issues/383)
- Primary evidence. "two lines with different data sources" (opened 2018-02-01, closed 2020-03-17, +1=16). The answers are user workarounds: pass `data` to each `<Line>` and use `<XAxis type="number" domain={['auto','auto']}>` (r=19); create one hidden `<XAxis>` per data source to avoid a duplicated axis (r=22, 2022-01-27); set `allowDuplicatedCategory={false}` (r=6, 2022-08-26). — [recharts#1167](https://github.com/recharts/recharts/issues/1167)
- Primary evidence, maintainer action. Recharts 3.7.0 (2026-01-21) added axis `type="auto"`, which "sets the type to "category" for categorical axes, and "number" for numeric axis". The PR author (PavelVanecek, 2025-12-25) kept the old default for `XAxis`/`YAxis`: "I think new defaults here would be a breaking change. Let's do that in 4.0?" and noted "Weirdly enough I couldn't find anyone who complained about this". The inference is from chart layout, not from the data's values. — [recharts PR #6823](https://github.com/recharts/recharts/pull/6823), [release v3.7.0](https://github.com/recharts/recharts/releases/tag/v3.7.0)
- Primary evidence. Category-axis duplicates remain a live source of fixes in 3.x: "fix stacked charts with duplicate categorical data" (3.2.0, 2025-09-08) and a tooltip fix for `allowDuplicatedCategory=false` (3.10.1, 2026-07-25). — [recharts releases](https://github.com/recharts/recharts/releases)

**Nivo**
- Primary evidence. "Option for custom data accessors" (opened 2019-11-05, closed 2022-01-10, +1=12): "nivo currently expects `data` to be in a certain format, for example `{x, y}` for line charts. Sometimes, data is not directly available in that format and one would need to perform expensive transformations that could be avoided when nivo could be told about how it should access the data." Users kept bumping it until 2023-04-17. No maintainer reply was among the comments retrieved. — [nivo#739](https://github.com/plouc/nivo/issues/739)
- Primary evidence. "Is there a way to remove gaps when using a grouped bar chart with missing data?" (opened 2019-07-25, closed 2022-09-27, +1=6): keys missing from a row still reserve a slot. A user in 2023-03: "I was never able to find any sort of solution or workaround". — [nivo#648](https://github.com/plouc/nivo/issues/648)

**MUI X Charts**
- Primary evidence. "[charts] xAxis Type and Min Issues" (2024-12-11, closed next day): rows from a backend with ISO strings and `scaleType: "utc"` gave "The chart doesn't display anything initially." Maintainer alexfauquette: "The 'utc' type expects `Date` object". The user had tried to convert in `valueFormatter`, which only changes display. — [mui-x#15840](https://github.com/mui/mui-x/issues/15840)
- Primary evidence. The same user then asked for "[charts] Axes Value Getters" (opened 2025-06-29, closed 2026-04-09): "I would like to avoid pre-processing my `dataset` and instead pass it directly to the `dataset` prop. However, due to the lack of a `valueGetter` feature, I'm currently forced to add boilerplate code and helper functions", showing a map-then-sort helper. Maintainer alexfauquette (2025-07-03) listed what it touches: "Internal management of data", "`dataKey` property since it would be useless with a function next to it", and that the function should receive `(dataset[givenIndex], givenIndex)`. Whether it shipped was not verified. — [mui-x#18593](https://github.com/mui/mui-x/issues/18593)
- Documentation **(verbatim, repo source)**. The primary shape is parallel arrays: "Bar chart series must contain a `data` property with an array of values." and "The category axis uses `scaleType='band'` and its `data` should have the same length as your series." Row objects are the secondary path: "If your data is stored in an array of objects, you can use the `dataset` helper prop." — [MUI X bars](https://mui.com/x/react-charts/bars/)
- Documentation **(verbatim, repo source)**. The scale-type table marks `'time'`/`'utc'` as accepting `Date` only, not numbers or strings; and "In bar charts, the axis that represents categories ... must use `scaleType: 'band'`." — [MUI X axis](https://mui.com/x/react-charts/axis/)

**Chart.js**
- Documentation **(verbatim, repo source)**. The parallel-array contract: "If the `labels` property of the main `data` property is used, it has to contain the same amount of elements as the dataset with the most values." Object rows are supported through `parsing: { xAxisKey, yAxisKey }`. — [Chart.js data structures](https://www.chartjs.org/docs/latest/general/data-structures.html)
- Documentation **(verbatim, repo source)**. Sorting and internal formats are an opt-in speed path, not a requirement: "If parsing is disabled, data must be sorted and in the formats the associated chart type and scales use internally." and "Chart.js is fastest if you provide data with indices that are unique, sorted, and consistent across datasets and provide the `normalized: true` option to let Chart.js know that you have done so." — [Chart.js data structures](https://www.chartjs.org/docs/latest/general/data-structures.html), [Chart.js performance](https://www.chartjs.org/docs/latest/general/performance.html)
- Documentation **(verbatim, repo source)**. The category scale's internal form is exactly what umriss asks callers to build by hand: "the `category` scale uses integers as an internal format, where each integer represents an index in the labels array; but, if parsing is enabled, it can also parse string labels." — [Chart.js data structures](https://www.chartjs.org/docs/latest/general/data-structures.html)

**ECharts**
- Documentation **(verbatim, repo source)**, maintainer rationale for moving from `series.data` to `dataset` (ECharts 4): per-series data "is not conducive to the data sharing for multiple series ... The other disadvantage is that programmers always need to divide the data in separate series (and categories) first." Stated advantages of `dataset`: data "can be reused by several series", and "Support more common data format, such as a 2D array, array of classes, etc., to avoid users from converting for data format to a certain extent." — [ECharts handbook: dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)

**What the top-reacted issues are about instead**
- Primary evidence. The twelve most-upvoted Recharts issues are zoom/pan (+1=94), tooltips, animation, React version warnings and Next.js errors; none is about data shape. Nivo's top twelve are dependency removal, React 18/19 support, zoom, biaxial charts. MUI X Charts' top twelve are all requests for more chart types (Sankey +1=355, Treemap +1=299, Heat map +1=264). — [recharts issues by reactions](https://github.com/recharts/recharts/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc), [nivo issues by reactions](https://github.com/plouc/nivo/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc), [mui-x charts issues by reactions](https://github.com/mui/mui-x/issues?q=is%3Aissue+label%3A%22scope%3A+charts%22+sort%3Areactions-%2B1-desc)

### Inferences
- Every requirement the umriss maintainer lists has a matching public complaint against a library that imposed it: time as a millisecond number plus a tick formatter (recharts#956, #2711), a mandated datum shape (nivo#739), `Date`-only time axes that silently draw nothing (mui-x#15840), and a pre-sort the caller must do (mui-x#18593 helper code). The category index plus `ticks` plus `tickFormat` lookup is Chart.js's *internal* format, which Chart.js parses for the caller by default.
- The repeated maintainer response is one mechanism, not many: "field name or function of the row" at the point of use (Recharts 2017, Nivo request 2019, MUI X request 2025). That is already umriss's `value` prop; the gap is on the axis side, not the series side.
- Data-shaping friction does not show up as top-voted issues. It shows up as long-lived question threads whose most-reacted content is a workaround (recharts#956: issue +1=40, workaround comment r=192). A redesign argument should cite those threads rather than claim mass demand.

### Gaps
- Victory and visx: searches returned only narrow bug reports (e.g. [victory#1047](https://github.com/FormidableLabs/victory/issues/1047), [visx#1264](https://github.com/airbnb/visx/issues/1264)); none was read in depth, and no well-reacted thread about their data-input API was found.
- D3 "everything by hand": no issue-thread evidence collected; the only source is Plot's own positioning (section 8).
- No high-reaction Recharts issue asking for long-format input was found. GitHub Discussions were not searched (only issues).
- Chart.js "State of Chart.js & V3.0" ([#6598](https://github.com/chartjs/Chart.js/issues/6598), 105 comments) was found but not read; it may contain the v3 rationale for `parsing`.

## 2. Long/tidy versus wide

### Takeaway
Grammar-of-graphics libraries state plainly that they favour long (tidy) rows and explain why: one field can then drive series, colour and facets. React component libraries take wide rows with one prop per series and do not argue the point in their docs. The accepted compromise in the grammar camp is "long by default, with a documented in-chart fold for wide data"; no source was found that argues wide is better in principle.

### Cited Findings
- Recognised source. Wickham, "Tidy Data", Journal of Statistical Software 59(10), 2014 **(via summarising fetch)**: "Tidy datasets are easy to manipulate, model and visualize" and have a structure in which "each variable is a column, each observation is a row, and each type of observational unit is a table". — [JSS v059i10](https://www.jstatsoft.org/article/view/v059i10)
- Documentation **(verbatim, repo source)**. Observable Plot: "Plot favors [tidy data](http://vita.had.co.nz/papers/tidy-data.html) structured as an array of objects, where each object represents an observation (a row), and each object property represents an observed value; all objects in the array should have the same property names (the columns)." — [Plot: marks, "Marks have tidy data"](https://github.com/observablehq/plot/blob/main/docs/features/marks.md)
- Documentation **(verbatim, repo source)**. Plot nonetheless accepts other shapes: "Plot also supports columnar data: you can use an Apache Arrow table as data instead of an array of objects. You can even pass parallel arrays of values". It names the cost of leaving field names: "when accessor functions or parallel arrays are used instead of field names, automatic axis labels (*hour* and *value*) are lost." — [Plot: marks](https://github.com/observablehq/plot/blob/main/docs/features/marks.md)
- Documentation **(verbatim, repo source)**. Altair (Vega-Lite's Python API): "Altair's grammar works best with **long-form** data"; "Wide-form data can be similarly visualized using e.g. layering ..., but it is far less convenient within Altair's grammar." It documents two conversions: pandas `melt` before the chart, or the fold transform inside it. — [Altair: data](https://github.com/vega/altair/blob/main/doc/user_guide/data.rst)
- Commentary from the vendor, seen only as a search summary. Observable's blog post on reshaping data says tidy layout lets Plot handle grouping, aggregation and faceting, and that for multi-series charts this beats layering one mark per series. — [Observable blog: reshaping data](https://observablehq.com/blog/reshaping-data-plot-d3)
- Documentation **(verbatim, repo source)**. The wide convention in the React dashboard camp: shadcn's chart docs show `<Bar dataKey="desktop" />` and `<Bar dataKey="mobile" />` on rows keyed by month, with the note "Your data can be in any shape. You are not limited to the shape of the data below. Use the `dataKey` prop to map your data to the chart." — [shadcn chart docs](https://ui.shadcn.com/docs/components/chart)
- Source code. Tremor's bar chart props are `data: Record<string, any>[]`, `index: string`, `categories: string[]`: wide rows, one field for the axis, a list of fields for the series. — [tremor BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx)
- Maintainer rationale, ECharts: the stated reason to prefer one shared table over per-series arrays is that otherwise "programmers always need to divide the data in separate series (and categories) first." — [ECharts handbook: dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)

### Inferences
- Widely agreed: the input is an array of row objects with consistent keys, addressed by field name. Plot, Vega-Lite/Altair, Recharts, shadcn, Tremor, MUI X `dataset` and ECharts `dataset` all converge on it, and Chart.js and MUI X, which started from parallel arrays, both added it.
- Contested, but mostly by practice rather than argument: whether the series dimension is a *column* (long: `fill: "type"`) or a *set of columns* (wide: one `<Bar>` per key). The grammar camp argues its side in writing; the React camp just ships wide. Wide suits JSX because each series is an element that can carry its own props; that is an inference from the APIs, not a quoted claim.
- For umriss this suggests the cheapest defensible addition is a way to say "split this mark by field X" over long rows, leaving the existing one-element-per-series form for wide rows.

### Gaps
- No written defence of wide-only input from a React chart maintainer was found. The "counter-argument from the React-component camp" is absent as text; it exists only as API design.
- Whether any React component library accepts long rows with a series field was not established here (it belongs to the separate feature comparison).

## 3. Type inference from data

### Takeaway
Inference from values is common and its failure modes are documented by the very libraries that do it: it looks at one value, it cannot tell a year from a quantity, and it does not parse date strings. The opposite position also has a maintainer on record: Vega-Lite requires a declared type because a wrong guess produces a bad chart with no explanation. All inferring libraries keep an explicit override.

### Cited Findings
- Documentation **(verbatim, repo source)**. Plot's rule and its admitted weakness: "A scale's **type** is most often inferred from associated marks' channel values: strings and booleans imply an *ordinal* scale; dates imply a *utc* scale; anything else is *linear*. Plot assumes that your data is consistently typed, so inference is based solely on the first non-null, non-undefined value." — [Plot: scales, "Type inference"](https://github.com/observablehq/plot/blob/main/docs/features/scales.md)
- Documentation **(verbatim, repo source)**. Plot's framing of the trade: "Plot strives to be concise: rather than you laboriously specifying everything, Plot can guess by inspecting the data ... But for Plot's guesses to be accurate, your data must match Plot's expectations." — [Plot: scales](https://github.com/observablehq/plot/blob/main/docs/features/scales.md)
- Documentation **(verbatim, repo source)**. Plot on milliseconds and strings: "To force a UTC scale, say when the data is milliseconds since UNIX epoch rather than Date instances, pass *utc* as the **type** option. Though we recommend coercing strings and numbers to more specific types when you load data, rather than relying on scales to do it." A comment in the same file: "Plot doesn't parse dates; convert your strings to Date instances". Once the type is set, coercion is defined: "time scales coerce channel values to dates; numbers are assumed to be milliseconds since UNIX epoch, while strings are assumed to be in ISO 8601 format". — [Plot: scales](https://github.com/observablehq/plot/blob/main/docs/features/scales.md)
- Primary evidence, year numbers. Bostock opened "Smarter formatting for year number channels?" on 2022-02-19 because a numeric year axis showed thousands separators. Contributor Fil: "this is one of the first questions that came up in a workshop last Friday." A user (2022-03-09): "I think this is most common problem/gotcha for those starting with plot." Closed 2026-04-03. — [plot#768](https://github.com/observablehq/plot/issues/768)
- Documentation **(verbatim, repo source)**, what was done: "If the tick values are all integers between 1,500 and 2,500 (inclusive), Plot assumes the values represent years and formats ticks by default without thousand separators ... You can explicitly suppress thousand separators with `tickFormat: "d"`, or enable them with `tickFormat: ",d"`." (version badge points to PR 2403). — [Plot: scales](https://github.com/observablehq/plot/blob/main/docs/features/scales.md)
- Documentation **(verbatim, repo source)**. Altair warns about its own defaults: "Altair defaults to `quantitative` for any numeric data, `temporal` for date/time data, and `nominal` for string data, but be aware that these defaults are by no means always the correct choice!" On integer years: "This kind of behavior is sometimes surprising to new users, but it emphasizes the importance of thinking carefully about your data types when visualizing data". Its advice for years is to convert and declare temporal: "it is preferred to specify the appropriate data type to Altair." — [Altair: encodings](https://github.com/vega/altair/blob/main/doc/user_guide/encodings/index.rst)
- Documentation **(verbatim, repo source)**. Vega-Lite requires the type: "If a field is specified, the channel definition **must** describe the encoded data's type". — [Vega-Lite: type](https://github.com/vega/vega-lite/blob/main/site/docs/encoding/type.md)
- Primary evidence, the contested point argued by maintainers. A contributor asked to make the type optional (2018-05-17): "in about 80% of my plots things work great without specifying it, and then I end up with shorter specs." Maintainer kanitw refused: "Vega-Lite does not look at the data during its compilation and thus we do not have a way to distinguish categorical from quantitative fields without the "type" provided. If a categorical field is provided without type, a lot of figures will be bad and users might not know why without warning." Maintainer domoritz: "We can make smart decisions (and do in some obvious cases) but I think the warning are still a good thing." The requester's reply: "if things work without the ability to specify the type ..., folks will not specify it because they are lazy." Closed the next day; reaction counts are near zero, so this is an argument between experts, not a vote. — [vega-lite#3757](https://github.com/vega/vega-lite/issues/3757)
- Primary evidence, strings that look like dates. MUI X does not infer or parse: ISO strings on a `utc` axis draw nothing, and the maintainer's answer is that the axis "expects `Date` object". — [mui-x#15840](https://github.com/mui/mui-x/issues/15840)
- Maintainer action. Recharts' `type="auto"` (3.7.0, 2026-01-21) infers from chart layout which axis is categorical, not from values, and was not made the default for `XAxis`/`YAxis` to avoid a breaking change. — [recharts PR #6823](https://github.com/recharts/recharts/pull/6823)

### Inferences
- Widely agreed: `Date` means time and a string means category; an explicit `type` must always be able to override.
- Contested: whether a *number* may ever be read as anything but quantitative (years, ids, millisecond timestamps), and whether inference should exist at all. Plot guesses and patches the common miss with a narrow heuristic (integers 1500 to 2500); Altair guesses and warns; Vega-Lite refuses.
- A typed React API has an option the value-inspecting libraries lack: the row type is known at compile time, so `string`, `Date` and `number` fields can be told apart without looking at any value, and a first-row check is unnecessary. This sidesteps Plot's "first non-null value" weakness for the string and Date cases, but not the number-as-year or number-as-timestamp case, which still needs a declaration.
- Silent failure is the reported harm (MUI: "doesn't display anything"; Vega-Lite maintainers: "users might not know why"). Whatever umriss infers, a wrong or mixed type should fail loudly.

### Gaps
- No well-reacted issue about numeric-looking strings (e.g. `"2020"`, `"007"`) or mixed-type columns was found; the Plot docs only say they assume consistent typing.
- Whether Plot later added ISO-string detection was not checked beyond the current docs text quoted above.

## 4. Implicit versus explicit category order, and missing categories

### Takeaway
Grammar libraries sort category domains alphabetically by default and users report that as a surprise, especially for month names; component libraries keep row order and instead surprise users with duplicated categories and reserved gaps. Neither default is free of complaints, and both camps provide an explicit order.

### Cited Findings
- Documentation **(verbatim, repo source)**. Plot: "For ordinal scales, the default domain is the set of all distinct values associated with the scale in natural ascending order; for a different order, set the domain explicitly or add a **sort** option to an associated mark." — [Plot: scales](https://github.com/observablehq/plot/blob/main/docs/features/scales.md)
- Primary evidence. "Cannot disable auto sorting at y channel" (2023-03-12): rows `{ month: "Jan 21", value: 100 }` with `sort: null` on the mark; "the months are sorted alphabetically. I tried multiple ways to customize the sort function but it doesn't work." Closed the same day; the resolution was not retrieved. — [plot#1327](https://github.com/observablehq/plot/issues/1327)
- Primary evidence. "sort by channel not used to visualize?" (opened 2022-05-10, still open): "Even though my data is already sorted by `rate`, when i do the following it orders the y domain alphabetically". Bostock (2022-05-11): "I ran into this the other day ... It would be nice if there were some syntax to materialize a column in the sort options". The offered workaround binds an unused channel, which contributor Fil says "feels a bit like cheating." — [plot#867](https://github.com/observablehq/plot/issues/867)
- Documentation **(verbatim, repo source)**. Vega-Lite's default for discrete scales is `"ascending"` ("sort by the field's value in ascending order"); `sort: null` means "the field is not sorted"; an explicit array is supported, and "If an encoding includes a custom sort order, Vega-Lite uses the ordinal type by default". — [Vega-Lite: sort](https://github.com/vega/vega-lite/blob/main/site/docs/encoding/sort.md)
- Documentation **(verbatim, repo source)**. Altair: "By default the scale is sorted in ascending alphabetical order, unless an ordered pandas categorical column is passed (without an explicit type specification) in which case Altair will use the column's inherent order". — [Altair: encodings](https://github.com/vega/altair/blob/main/doc/user_guide/encodings/index.rst)
- Documentation **(verbatim, repo source)**. Altair also records what an ordinal year axis hides: quantitative/temporal scales "clearly show the missing year of data that was not immediately apparent when we treated the years as ordinal data". — [Altair: encodings](https://github.com/vega/altair/blob/main/doc/user_guide/encodings/index.rst)
- Primary evidence, row-order camp. Recharts keeps row order, and repeated category values are drawn as separate positions unless `allowDuplicatedCategory={false}` is set (user tip, r=6, 2022-08-26); related fixes shipped in 3.2.0 and 3.10.1. — [recharts#1167](https://github.com/recharts/recharts/issues/1167), [recharts releases](https://github.com/recharts/recharts/releases)
- Primary evidence, missing categories. Nivo grouped bars reserve a slot for a key absent from a row ("even members without a key in the datum will take up space in the bar chart and cause gaps"); no workaround was found by users through 2023. — [nivo#648](https://github.com/plouc/nivo/issues/648)
- Documentation **(verbatim, repo source)**. MUI X distinguishes absent from null: "When the series `data` array is shorter than the axis `data`, values outside the series length are `undefined`, not `null`." and recommends `null` for partial data. — [MUI X lines](https://mui.com/x/react-charts/lines/)
- Primary evidence. A Nivo issue title records the mirror surprise for legends: "Why are tooltips/legends ordered opposite to input data?" (2019-12-06; thread not read). — [nivo#787](https://github.com/plouc/nivo/issues/787)

### Inferences
- Contested: default order. Alphabetical is deterministic regardless of row order but wrong for months, weekdays and ranked lists; first-appearance order respects the caller but depends on row order and exposes duplicates. The complaints found against alphabetical sorting come from people whose rows were already in the order they wanted.
- Widely agreed: an explicit ordered list of categories must be accepted, and it doubles as the way to show categories that have no rows.
- For a React library whose callers pass rows they already ordered, first-appearance order with an explicit `domain`/order override matches the reported expectations better than sorting. This is a judgement from two Plot threads and the Recharts convention, not a measured result.

### Gaps
- No source measured which default surprises fewer users.
- ggplot2's well-known alphabetical factor order complaint was not sourced here.
- No evidence was collected on how libraries treat a category present in the declared order but absent from the data, beyond the Nivo gap complaint.

## 5. TypeScript: field names checked against the row type

### Takeaway
Type-checking field names against the row type arrived in Recharts only in March 2026, and its maintainers state that JSX cannot infer the row type from a parent chart, so they ship a factory function that returns pre-typed components. That is the same shape as umriss's `useChart(rows)`.

### Cited Findings
- Primary evidence, maintainer statement (PavelVanecek, 2026-02-23): "Because TS and React are not 100% integrated, TS doesn't check for context and can't infer properly. That means that to type properly we basically need everyone to set their generics on every component explicitly. This is a hassle and prone to problems, as there are some assumptions: for example the data type of numerical axis and graphical item must match." Proposed fix: helper functions per layout (`createHorizontalChart`, `createVerticalChart`, `createRadialChart`, `createCentricChart`). — [recharts#7046](https://github.com/recharts/recharts/issues/7046)
- Primary evidence. Recharts 3.8.0 (2026-03-06): "We added generics to our `data` and `dataKey` props and now you can have your charts validated by TypeScript." Listed changes include "Add optional explicit generics to graphical items and charts" and "New feature - typed charts helper". — [recharts release v3.8.0](https://github.com/recharts/recharts/releases/tag/v3.8.0)
- Documentation **(via summarising fetch)**. Without the helper the default is unchecked: "By default, Recharts components fall back to `any`." and "if you make a typo in your `dataKey` or provide the wrong data shape, you won't be warned by TypeScript." With explicit generics (`<Area<MyDataType, number>>`): "This enforces that the `dataKey` actually exists on your data, catching errors early." With the helper: "Once you define the helper with your generic types, all returned components strictly enforce your data structure." and a code comment says `dataKey` "is automatically restricted to numbers on MyData without redeclaring!" — [Recharts TypeScript guide](https://recharts.github.io/en-US/guide/typescript/)
- Documentation **(verbatim, repo source)**. Chart.js needs manual type arguments for non-default shapes: "When using TypeScript, if you want to use a data structure that is not the default data structure, you will need to pass it to the type interface when instantiating the data variable." — [Chart.js data structures](https://www.chartjs.org/docs/latest/general/data-structures.html)
- Source code. Tremor types rows as `Record<string, any>[]` with `index: string` and `categories: string[]`, so field names are not checked. — [tremor BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx)
- Primary evidence. Observable Plot is still JavaScript with hand-written declarations: an open issue by contributor Fil, "Move the codebase to TypeScript." (2026-04-13, +1=2), and a same-day report "TypeScript definitions are out of sync with the JavaScript implementation". — [plot#2423](https://github.com/observablehq/plot/issues/2423), [plot#2422](https://github.com/observablehq/plot/issues/2422)

### Inferences
- Widely agreed by 2026: a typo in a field name should be a compile error, and string keys are the short form while accessor functions are the escape hatch.
- Established by Recharts' own analysis: sibling JSX elements cannot share an inferred row type, so either every element repeats the generic or a factory hands back typed components. umriss's `const { Chart, XAxis, YAxis, Bar } = useChart(rows)` already is the factory form. Recharts needed several helpers because the numeric axis swaps with layout; that constraint is worth checking against umriss's design.
- Restricting a value prop to numeric-valued keys of the row (Recharts: "restricted to numbers on MyData") is precedent for type-level routing: a prop that only accepts keys whose value type is `string`, `Date` or `number` can carry the scale type without runtime inspection (see section 3).

### Gaps
- No user reports yet on the ergonomics of Recharts' 3.8 generics (inference failures, error message quality); the feature is seven months old and the search surfaced only maintainer text.
- MUI X `dataset`/`dataKey` typing, visx `XYChart` generics, Nivo generics and Victory's accessor types were not examined.
- The summarising fetch reported helper names `createHorizontalChart` etc. on the guide, while a search summary of the published type declarations named `createCartesianCharts`, `createPolarCharts`, `createRadialChart`. The exact exported names in the current release were not verified.

## 6. Aggregation in the chart versus before it

### Takeaway
This is a real split with stated positions on one side only. Plot and Vega-Lite put grouping, summing and binning in the chart specification and say why; the React dashboard libraries examined draw one mark per row and field and say nothing about aggregation. No source was found in which a React chart maintainer argues against in-chart aggregation.

### Cited Findings
- Maintainer position **(verbatim, repo source)**. Plot: "Munging data, not visualizing it, is often most of the work of data analysis. Plot's transforms let you aggregate and derive data *within* your plot specification, reducing the time spent preparing data." Example: `Plot.barX(penguins, Plot.groupY({x: "count"}, {y: "species"}))`. — [Plot: Why Plot?](https://github.com/observablehq/plot/blob/main/docs/why-plot.md)
- Maintainer position **(verbatim, repo source)**. The stated benefit is composition with other chart features: "Because transforms are integrated into Plot, they work automatically with other Plot features such as faceting." — [Plot: Why Plot?](https://github.com/observablehq/plot/blob/main/docs/why-plot.md)
- Documentation **(verbatim, repo source)**. Plot's audience caveat, which limits how far the argument transfers: "**Observable Plot** is for exploratory data visualization. It's for finding insights quickly." — [Plot: Why Plot?](https://github.com/observablehq/plot/blob/main/docs/why-plot.md)
- Documentation **(verbatim, repo source)**. Even domain sorting aggregates implicitly in Plot: for the sort option, "The secondary values are therefore grouped for each associated primary value, and each group is then aggregated by applying a reducer. The default reducer is *max*". — [Plot: scales, sort mark option](https://github.com/observablehq/plot/blob/main/docs/features/scales.md)
- Documentation. Vega-Lite's own example of a temporal field describes the chart doing the aggregation: "the following bar chart shows the mean precipitation for different months." — [Vega-Lite: type](https://github.com/vega/vega-lite/blob/main/site/docs/encoding/type.md)
- Documentation, React camp. shadcn's chart docs map fields to marks with `dataKey` and contain no aggregation step; Tremor's props are `data`, `index`, `categories` and a `valueFormatter`. MUI X series take arrays or `dataKey`s. — [shadcn chart docs](https://ui.shadcn.com/docs/components/chart), [tremor BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx), [MUI X bars](https://mui.com/x/react-charts/bars/)
- Primary evidence of the user-side cost when the chart will not derive: the MUI X requester's map-and-sort helper, introduced with "I would like to avoid pre-processing my `dataset`". — [mui-x#18593](https://github.com/mui/mui-x/issues/18593)

### Inferences
- Contested, and the right answer depends on audience. Plot's argument is made for exploration, where the question changes every minute. A dashboard component usually receives rows already aggregated by a query, which may be why the React libraries are silent rather than opposed.
- The narrow, defensible middle: the chart should not need the caller to do work that is *about drawing* (ordering by x, stacking, assigning positions to categories, splitting long rows into series), while reductions that change *what number is shown* (sum, mean, count) stay explicit. A sum per category sits on the boundary: stacking several rows of the same category draws the same total without the chart ever "aggregating", which is how Plot's implicit stack behaves.
- Sorting rows by x is drawing work by this test; Chart.js treats pre-sorted input as an optional fast path, not a precondition (section 1).

### Gaps
- No practitioner survey or measurement of how often dashboard data arrives pre-aggregated.
- The stance of Tremor's and MUI X's maintainers on aggregation was inferred from API and docs, not from a statement.
- Vega-Lite's aggregate documentation and the paper's treatment of transforms were not read directly.

## 7. Stable identity and performance of accessor functions in React

### Takeaway
Recharts 3 tells callers directly that an inline accessor function forces a full recompute on every render and that a string key is the stable form. This is the strongest argument found for keeping field-name strings as the primary form and functions as the exception.

### Cited Findings
- Documentation **(via summarising fetch)**. Recharts performance guide: "`dataKey` can be a function, and change in dataKey means that recharts has to recalculate all the points for that component." "Keeping dataKey stable with useCallback can help improve performance." "Simple dataKey functions can be declared as a string." "String references are stable between renders, so this variant is likely to be more performant." — [Recharts performance guide](https://recharts.github.io/en-US/guide/performance/)
- Documentation **(via summarising fetch)**. Same guide, on props generally: memoising objects and functions "is especially important for functions, and especially for `dataKey` prop."; an inline function causes "the Line to recalculate all points every time the chart re-renders"; for object props, "New object as prop creates a new reference on each render." with the note "Recharts is optimized for this since 3.5.0." — [Recharts performance guide](https://recharts.github.io/en-US/guide/performance/)
- Primary evidence. Recharts 3 performance regressions were reported by users, e.g. "Performance degradation for large datasets using bar charts - v3.0" (2025-09-03, closed, 12 comments; thread not read). — [recharts#6267](https://github.com/recharts/recharts/issues/6267)
- Documentation **(via summarising fetch)**. AG Charts React detects changes by options identity/mutation: "mutations of the options trigger an update of the chart configuration."; its example clones the options before each change. The page does not mention memoisation. — [AG Charts React: create/update](https://www.ag-grid.com/charts/react/api-create-update/)
- Maintainer statement. MUI X's maintainer ties an accessor to internal data handling: adding a value getter requires deciding "Internal management of data (what is copy or not, and how do we access to it)". — [mui-x#18593](https://github.com/mui/mui-x/issues/18593)
- Documentation **(verbatim, repo source)**. Plot (not React) distinguishes a per-row function from a once-per-array transform: "Whereas a channel value specified as a function is invoked repeatedly for each element in the mark's data, similar to *array*.map, the transform method is invoked only once being passed the entire array of data." — [Plot: marks](https://github.com/observablehq/plot/blob/main/docs/features/marks.md)

### Inferences
- A hook-based API such as `useChart(rows)` has the same exposure: any accessor written inline in JSX is a new function each render. The Recharts guidance implies two design consequences: make the string form cover as many cases as possible (so most callers never write a function), and do not key expensive recomputation on function identity alone.
- Each helper a caller must write today (index lookup, tick formatter, pivot) is also a memoisation obligation. Moving that work behind a field name removes both the code and the identity problem. This is an inference; no source states it.
- The React Compiler's effect on this guidance was not found in any chart library's documentation.

### Gaps
- visx: no guidance on accessor identity was found (search returned nothing relevant).
- MUI X: no documentation passage on memoising `series`/`dataset` was retrieved; "[charts] Bad performance when using large datasets" ([mui-x#12960](https://github.com/mui/mui-x/issues/12960), 42 comments) was found but not read.
- AG Charts' exact identity rules were not confirmed beyond the one sentence quoted.
- No benchmark numbers were collected for function versus string accessors.

## 8. API design guidance from recognised sources; what callers choose

### Takeaway
The recognised guidance is consistent: state data and encodings, let defaults fill in the rest, and let every default be overridden. Survey data on *why* developers choose chart libraries was not found; the only measured signal is npm downloads, where Recharts leads by a wide margin.

### Cited Findings
- Maintainer position **(verbatim, repo source)**. Plot: "Its API, while expressive and configurable, optimizes for conciseness and memorability. We want the time to first chart to be as fast as possible." — [Plot: Why Plot?](https://github.com/observablehq/plot/blob/main/docs/why-plot.md)
- Maintainer position **(verbatim, repo source)**. Plot on defaults and staged refinement: "What makes Plot concise? In a word: *defaults*. If you specify the semantics — your data and the desired encodings — Plot will figure out the rest. The beauty of defaults is that you can override them as needed. ... you invest minimally in the initial chart, and as you start to see something interesting, you progressively customize to improve the display." — [Plot: Why Plot?](https://github.com/observablehq/plot/blob/main/docs/why-plot.md)
- Maintainer position **(verbatim, repo source)**. Plot against both extremes: more productive than "low-level tools such as D3 and less expressive high-level tools such as chart templates"; "less time wrangling the machinery of programming." — [Plot: Why Plot?](https://github.com/observablehq/plot/blob/main/docs/why-plot.md)
- Recognised source, seen as search summaries of the paper's abstract and listings. Vega-Lite (Satyanarayan, Moritz, Wongsuphasawat, Heer; IEEE InfoVis 2017): the compiler "automatically synthesizes requisite data flow and event handling logic, which users can override for further customization"; a Microsoft Research listing describes users omitting "low-level details such as scale, axes, and legends properties", "letting the Vega-Lite compiler infer sensible defaults." — [Vega-Lite paper page](https://vis.csail.mit.edu/pubs/vega-lite/), [Microsoft Research listing](https://www.microsoft.com/en-us/research/?p=449646)
- Design statement **(verbatim, repo source)**. shadcn on abstraction depth: "We do not wrap Recharts. This means you're not locked into an abstraction. When a new Recharts version is released, you can follow the official upgrade path to upgrade your charts." — [shadcn chart docs](https://ui.shadcn.com/docs/components/chart)
- Maintainer rationale. ECharts on separating data from configuration: "data is the most common part to be changed while other configurations will mostly not change at runtime." — [ECharts handbook: dataset](https://echarts.apache.org/handbook/en/concepts/dataset/)
- Measured data, npm registry API, downloads for 2026-09-09 to 2026-10-08: recharts 263,154,983; d3 98,075,221; chart.js 58,875,356; @visx/shape 26,040,118; echarts 24,923,534; highcharts 11,933,600; apexcharts 9,624,491; @nivo/core 7,599,468; @mui/x-charts 4,971,612; vega-lite 4,757,428; plotly.js 3,351,554; @observablehq/plot 3,138,874; @tremor/react 2,258,622; victory 2,138,585; ag-charts-react 1,333,809. — [npm downloads API (recharts shown; same endpoint per package)](https://api.npmjs.org/downloads/point/last-month/recharts)
- Survey data, negative finding. State of React 2025 (survey run 2025-11-19 to 2026-01-13, 3,760 responses per a secondary summary) has library sections for UI libraries, state management, data loading, back-end, and an "Other Tools" page covering testing, renderers, validation, authentication and mobile. Neither page fetched contains a charting or data-visualisation question. — [State of React 2025: libraries](https://2025.stateofreact.com/en-US/libraries/), [State of React 2025: other tools](https://2025.stateofreact.com/en-US/other-tools/), [respondent figures (secondary)](https://strapi.io/blog/state-of-react-2025-key-takeaways)

### Inferences
- Widely agreed among the cited authors: the minimum a caller should have to state is data plus encodings; scales, axes, ticks and order are defaults; every default has an override. The umriss categorical case (compute index, pass `ticks`, pass `tickFormat`) inverts this by making three overrides mandatory for the most common bar chart.
- npm downloads show reach, not preference. Counts include CI and transitive installs (Recharts is the engine under shadcn and Tremor; d3 packages sit under most others). The absolute figures were read once from the registry API and not cross-checked against a second source; treat the ranking as more reliable than the magnitudes.
- Recharts' lead is at least compatible with "wide rows plus field-name props is what most React developers have learned to expect", but downloads cannot show that the data API is the reason.

### Gaps
- No State of JS 2025 or State of React 2025 data on charting libraries or on reasons for choosing them was found. The State of JS 2025 site was not fetched directly; a general search surfaced only blog roundups.
- "Progressive disclosure" as a named API-design principle: no recognised source was retrieved. Plot's "progressively customize" passage is the nearest primary text.
- The Vega-Lite paper itself was not opened; the phrase "sensible defaults" is attested here only through a listing, not the paper body.
- Recharts 3.0 and MUI X Charts roadmap or RFC discussions about data input were not located. The Recharts 3.0 notes read here are about removing internal state access and "Typescript improvements", not data shape ([release v3.0.0](https://github.com/recharts/recharts/releases/tag/v3.0.0)).
- Engineering blog comparisons (2024 to 2026) surfaced in search were vendor roundups and one paywalled opinion piece ("Time to stop using Recharts in React"); none was read or relied on.

## 9. AI coding assistants in 2025 to 2026 guidance

### Takeaway
No library author was found saying that conventional data shapes matter for generated code. What exists is indirect: two projects publish machine-readable docs, and a Recharts maintainer mentions using AI tools while designing the typed helper.

### Cited Findings
- Primary evidence. Recharts collaborator PavelVanecek, on the design of the typed chart helper (2026-02-28): "Interesting, two different AIs came to the same design (curried function) independently". — [recharts#7046](https://github.com/recharts/recharts/issues/7046)
- Primary evidence, probed 2026-10-10. `llms.txt` is served by MUI X ("This documentation covers all MUI X packages including Data Grid, Date Pickers, Charts, Tree View", with a Charts section) and by shadcn/ui. — [mui.com/x/llms.txt](https://mui.com/x/llms.txt), [ui.shadcn.com/llms.txt](https://ui.shadcn.com/llms.txt)
- Primary evidence, probed 2026-10-10. The same path returned 404 on the Recharts, Chart.js, ECharts, Nivo and Tremor sites. — [recharts.github.io/llms.txt](https://recharts.github.io/llms.txt), [chartjs.org/llms.txt](https://www.chartjs.org/llms.txt), [echarts.apache.org/llms.txt](https://echarts.apache.org/llms.txt), [nivo.rocks/llms.txt](https://nivo.rocks/llms.txt), [tremor.so/llms.txt](https://www.tremor.so/llms.txt)
- Primary evidence. Automated agents appear as contributors in Recharts' release notes (a 3.6.0 change is credited to "@Copilot"). — [recharts release v3.6.0](https://github.com/recharts/recharts/releases/tag/v3.6.0)

### Inferences
- The claim "array of row objects plus field names is what assistants generate best" is plausible given Recharts' download share and its role under shadcn, but it is unsupported by any source found here. It should not be used as evidence in the redesign argument.
- Two assistants converging on a factory that returns typed components is weak, anecdotal support for that shape being the unsurprising one.

### Gaps
- No statement from v0, shadcn, MUI, Recharts or Observable about generated chart code and data shape was found. Two searches returned only third-party roundups and skill listings.
- Observable Plot's `llms.txt` could not be checked (HTTP 429).
- No benchmark of assistant accuracy across chart libraries was found.
