# React-first declarative chart libraries: the data-input API (state of 10 October 2026)

Versions these notes refer to (npm `latest` on 2026-10-10, read with `npm view`):
recharts 3.10.1 (3.11.0-canary.5 on `main`), @mui/x-charts 9.15.0, @nivo/bar 0.99.0 (published 2025-05-23, nothing since),
victory 37.3.6, @visx/xychart 4.0.0 (2026-06-11), @tremor/react 3.18.7 (published 2025-01-13, nothing since),
@mantine/charts 9.7.1, @chakra-ui/charts 3.37.0, shadcn/ui `chart` (copy-paste, no version; now on Recharts v3),
@tanstack/charts 1.1.0 (2026-10-09).

Method note: code blocks marked "verbatim" were read from the docs' source files in the libraries' GitHub repositories
(the rendered doc pages are built from those files). Where a block is not verbatim it says so.

## 1. What data shape does each library take, and where does the data go? (with the minimal stacked bar chart per library)

### Takeaway
The dominant shape is the "wide" array of row objects at chart level, with one string key for the category and one key per series (Recharts, MUI X `dataset`, Nivo bar, Tremor, shadcn, Mantine, Chakra). Victory and visx XYChart instead take one array per series at series level; MUI X additionally still accepts parallel arrays. No surveyed library asks for an index per row, hand-built `ticks`, or a `tickFormat` lookup for a categorical x axis.

### Cited Findings

Overview (each row is backed by the code and sources below):

| Library (version) | Shape | Where | Category named by | Series named by |
|---|---|---|---|---|
| Recharts 3.10 | wide rows | chart `data` (series-level `data` also exists on `Line`) | `<XAxis dataKey="label" />` | one `<Bar dataKey>` per series |
| MUI X Charts 9.15 | wide rows (`dataset`) or parallel arrays (`xAxis[].data` + `series[].data`) | chart | `xAxis={[{ dataKey }]}` | `series={[{ dataKey }]}` (config array, not JSX) |
| Nivo bar 0.99 | wide rows | chart `data` | `indexBy` | `keys: string[]` |
| Victory 37.3 | one `{x, y}` array per series | each `VictoryBar` | `x` accessor (default field `x`) | one `VictoryBar` per series inside `VictoryStack` |
| visx XYChart 4.0 | one array per series (may be the same array) | each `BarSeries` | `xAccessor` function | one `BarSeries` per series inside `BarStack`; `dataKey` is the series id, not a field |
| Tremor (Raw, copy-paste) | wide rows | chart `data` | `index="date"` | `categories={[...]}` |
| shadcn/ui chart | wide rows (plain Recharts) | chart `data` | `<XAxis dataKey>` | one `<Bar dataKey>` per series + `chartConfig` for labels/colours |
| Mantine Charts 9.7 | wide rows | chart `data` | `dataKey="month"` | `series={[{ name }]}` |
| Chakra UI Charts 3.37 | wide rows into a hook | `useChart({ data, series })`, then Recharts | `chart.key("month")` | `series: [{ name }]`, mapped to `<Bar>` |

**Recharts 3.10 / 3.11-canary** — verbatim, official "StackedBarChart" example (uses the 3.8+ typed helper; rows have the fields `label`, `x`, `y`):

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, createHorizontalChart } from 'recharts';
import { generateMockData, MockDataType, RechartsDevtools } from '@recharts/devtools';

const data: ReadonlyArray<MockDataType> = generateMockData(6, 823);

const Typed = createHorizontalChart<MockDataType, string, number>()({
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
});

const StackedBarChart = () => {
  return (
    <Typed.BarChart
      style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 20,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid />
      <Typed.XAxis dataKey="label" niceTicks="snap125" />
      <Typed.YAxis width="auto" niceTicks="snap125" />
      <Typed.Tooltip />
      <Legend />
      <Typed.Bar dataKey="x" stackId="a" background />
      <Typed.Bar dataKey="y" stackId="a" background />
      <RechartsDevtools />
    </Typed.BarChart>
  );
};
```
— [recharts repo, www/src/docs/exampleComponents/BarChart/StackedBarChart.tsx](https://github.com/recharts/recharts/blob/main/www/src/docs/exampleComponents/BarChart/StackedBarChart.tsx), rendered at [recharts.github.io StackedBarChart](https://recharts.github.io/en-US/examples/StackedBarChart/)

- Recharts' own description of the model: "The data that you provide via the `data` prop is an array of objects. Each object can have multiple properties, each representing a different data dimension. Use the `dataKey` prop to specify which property (or dimension) to use for this component. Typically, you will want to have one dataKey on the X axis, and different dataKey on the Y axis, where they extract different values from the same data objects." — [recharts src/util/types.ts](https://github.com/recharts/recharts/blob/main/src/util/types.ts)
- `Line` also has its own `data` prop (typed `any` in the internal props), so data can sit at series level too. — [recharts src/cartesian/Line.tsx](https://github.com/recharts/recharts/blob/main/src/cartesian/Line.tsx)

**MUI X Charts 9.15** — verbatim, "Using a dataset" demo (`BarsDataset.tsx`); dataset rows look like `{ london: 59, paris: 57, newYork: 86, seoul: 21, month: 'Jan' }`:

```tsx
<BarChart
  dataset={dataset}
  xAxis={[{ dataKey: 'month' }]}
  series={[
    { dataKey: 'london', label: 'London', valueFormatter },
    { dataKey: 'paris', label: 'Paris', valueFormatter },
    { dataKey: 'newYork', label: 'New York', valueFormatter },
    { dataKey: 'seoul', label: 'Seoul', valueFormatter },
  ]}
  {...chartSetting}
/>
```
— [mui-x docs/data/charts/bars/BarsDataset.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/bars/BarsDataset.tsx), [dataset/weather.ts](https://github.com/mui/mui-x/blob/master/docs/data/charts/dataset/weather.ts), rendered at [mui.com/x/react-charts/bars](https://mui.com/x/react-charts/bars/)

Verbatim, stacked demo (`StackBars.tsx`; `addLabels` is a local helper that adds a `label` to each series):

```tsx
<BarChart
  dataset={balanceSheet}
  series={addLabels([
    { dataKey: 'currAss', stack: 'assets' },
    { dataKey: 'nCurrAss', stack: 'assets' },
    { dataKey: 'curLia', stack: 'liability' },
    { dataKey: 'nCurLia', stack: 'liability' },
    { dataKey: 'capStock', stack: 'equity' },
    { dataKey: 'retEarn', stack: 'equity' },
    { dataKey: 'treas', stack: 'equity' },
  ])}
  xAxis={[{ dataKey: 'year' }]}
  {...config}
/>
```
— [mui-x docs/data/charts/bars/StackBars.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/bars/StackBars.tsx)

Verbatim, the parallel-array form that is still the first example on the page (`BasicBars.tsx`):

```tsx
<BarChart
  xAxis={[{ data: ['group A', 'group B', 'group C'] }]}
  series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
  height={300}
/>
```
— [mui-x docs/data/charts/bars/BasicBars.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/bars/BasicBars.tsx)

- MUI on the two forms: "Charts accept data through the `dataset` prop, which takes an array of objects. You can reference individual properties by using `dataKey` on axes and series that require single field, `datasetKeys` on series types that require multiple fields (such as scatter, OHLC, and range bar). This is a convenient alternative to providing `data` directly on each series or axis. It simplifies configuration when multiple series share the same underlying data source, but has no performance impact." — [mui.com/x/react-charts/dataset](https://mui.com/x/react-charts/dataset/) ([source](https://github.com/mui/mui-x/blob/master/docs/data/charts/dataset/dataset.md))

**Nivo bar 0.99** — prop documentation, verbatim: `data` "Chart data." type `object[]`; `indexBy` "Key to use to index the data, this key must exist in each data item. You can also provide a function which will receive the data item and must return the desired index." type `string | (datum: RawDatum): string | number`; `keys` "Keys to use to determine each series, these keys should point to a numeric value." type `string[]`; `groupMode` `'grouped' | 'stacked'`. — [nivo website/src/data/components/bar/props.ts](https://github.com/plouc/nivo/blob/master/website/src/data/components/bar/props.ts), rendered at [nivo.rocks/bar](https://nivo.rocks/bar/)
- Defaults: `indexBy: 'id'`, `keys: ['value']`, `groupMode: 'stacked'`, `indexScale: { type: 'band', round: false }`, `valueScale: { type: 'linear', nice: true, round: false }`. — [nivo packages/bar/src/defaults.ts](https://github.com/plouc/nivo/blob/master/packages/bar/src/defaults.ts)
- NOT verbatim — a sketch assembled from the documented props above, because the nivo site generates its sample code and no literal snippet could be read from source: `<ResponsiveBar data={rows} indexBy="month" keys={['desktop', 'mobile']} groupMode="stacked" />` (stacked is the default, so `groupMode` can be omitted).
- Nivo is not uniform across chart types: the line chart demands a library-specific per-series shape, "Chart data, which must conform to this structure: `Array<{ id: string | number, data: Array<{ x: number | string | Date, y: number | string | Date }> }>`". — [nivo website/src/data/components/line/props.ts](https://github.com/plouc/nivo/blob/master/website/src/data/components/line/props.ts)

**Victory 37.3** — verbatim, "Stacked Bar Charts":

```jsx
<VictoryChart
  domainPadding={{ x: 40 }}
  theme={VictoryTheme.clean}
>
  <VictoryStack>
    <VictoryBar
      data={[
        { x: "Sales", y: 2 },
        { x: "Marketing", y: 3 },
        { x: "Finance", y: 5 },
      ]}
    />
    <VictoryBar
      data={[
        { x: "Sales", y: 1 },
        { x: "Marketing", y: 4 },
        { x: "Finance", y: 5 },
      ]}
    />
    <VictoryBar
      data={[
        { x: "Sales", y: 3 },
        { x: "Marketing", y: 2 },
        { x: "Finance", y: 6 },
      ]}
    />
  </VictoryStack>
</VictoryChart>
```
— [victory website/docs/charts/bar.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/charts/bar.mdx), rendered at [commerce.nearform.com/open-source/victory/docs/charts/bar](https://commerce.nearform.com/open-source/victory/docs/charts/bar)

- "Most Victory components expect data in the form of an array of data objects with values specified for `x` and `y`. Victory components expose data accessor props that may be used when data is not readily available in this format." — [victory docs/guides/data-accessors.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/guides/data-accessors.mdx)

**visx XYChart 4.0** — verbatim, README basic usage (a line chart; the bar variant swaps in `BarSeries` inside `BarStack`):

```tsx
const data1 = [
  { x: '2020-01-01', y: 50 },
  { x: '2020-01-02', y: 10 },
  { x: '2020-01-03', y: 20 },
];

const data2 = [
  { x: '2020-01-01', y: 30 },
  { x: '2020-01-02', y: 40 },
  { x: '2020-01-03', y: 80 },
];

const accessors = {
  xAccessor: (d) => d.x,
  yAccessor: (d) => d.y,
};

const render = () => (
  <XYChart height={300} xScale={{ type: 'band' }} yScale={{ type: 'linear' }}>
    <AnimatedAxis orientation="bottom" />
    <AnimatedGrid columns={false} numTicks={4} />
    <AnimatedLineSeries dataKey="Line 1" data={data1} {...accessors} />
    <AnimatedLineSeries dataKey="Line 2" data={data2} {...accessors} />
```
— [visx packages/visx-xychart/README.md](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/README.md)

Verbatim, stacked bars in the official XYChart demo (one wide `data` array passed three times, one accessor pair per series):

```tsx
<BarStack offset={stackOffset}>
  <BarSeries
    dataKey="New York"
    data={data}
    xAccessor={accessors.x['New York']}
    yAccessor={accessors.y['New York']}
  />
  <BarSeries
    dataKey="San Francisco"
    data={data}
    xAccessor={accessors.x['San Francisco']}
    yAccessor={accessors.y['San Francisco']}
  />
```
— [visx packages/visx-demo/src/sandboxes/visx-xychart/Example.tsx](https://github.com/airbnb/visx/blob/master/packages/visx-demo/src/sandboxes/visx-xychart/Example.tsx)

- In visx `dataKey` is not a field name: "Required data key for the Series, should be unique across all series." The values come only from `xAccessor: (d: Datum) => ScaleInput<XScale>` and `yAccessor: (d: Datum) => ScaleInput<YScale>`. — [visx packages/visx-xychart/src/types/series.ts](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/src/types/series.ts)

**Tremor** (Tremor Raw copy-paste component, as on tremor.so today; the props of the npm package @tremor/react 3.18 were not compared) — first docs example, whitespace re-flowed, array shortened as on the page extraction:

```tsx
const chartdata = [
  { date: "Jan 23", SolarPanels: 2890, Inverters: 2338 },
  { date: "Feb 23", /* ... */ },
]

export const BarChartHero = () => (
  <BarChart
    className="h-80"
    data={chartdata}
    index="date"
    categories={["SolarPanels", "Inverters"]}
    /* ... */
  />
)
```
— [tremor.so/docs/visualizations/bar-chart](https://www.tremor.so/docs/visualizations/bar-chart) (read through a page extraction that collapses whitespace and truncated the trailing props; the stacked variant on the same page passes `type="stacked"` with the same `data`)
- Props in the component source: `data: Record<string, any>[]`, `index: string`, `categories: string[]`, `type?: "default" | "stacked" | "percent"`, `valueFormatter?: (value: number) => string`, `layout?: "vertical" | "horizontal"`. — [tremorlabs/tremor src/components/BarChart/BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx)

**shadcn/ui chart** — verbatim, "Your First Chart":

```tsx
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

<ChartContainer config={chartConfig} className="h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```
— [shadcn-ui/ui apps/v4/content/docs/components/radix/chart.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/radix/chart.mdx), rendered at [ui.shadcn.com/docs/components/chart](https://ui.shadcn.com/docs/components/chart). (The page's example is grouped; stacking is plain Recharts, i.e. a shared `stackId` on both `<Bar>`s.)
- "Note: Your data can be in any shape. You are not limited to the shape of the data below. Use the `dataKey` prop to map your data to the chart." and "We do not wrap Recharts. This means you're not locked into an abstraction." — same source.

**Mantine Charts 9.7** — verbatim, stacked demo and its data file:

```tsx
export const data = [
  { month: 'January', Smartphones: 1200, Laptops: 900, Tablets: 200 },
  { month: 'February', Smartphones: 1900, Laptops: 1200, Tablets: 400 },
  { month: 'March', Smartphones: 400, Laptops: 1000, Tablets: 200 },
  { month: 'April', Smartphones: 1000, Laptops: 200, Tablets: 800 },
  { month: 'May', Smartphones: 800, Laptops: 1400, Tablets: 1200 },
  { month: 'June', Smartphones: 750, Laptops: 600, Tablets: 1000 },
];

<BarChart
  h={300}
  data={data}
  dataKey="month"
  type="stacked"
  series={[
    { name: 'Smartphones', color: 'violet.6' },
    { name: 'Laptops', color: 'blue.6' },
    { name: 'Tablets', color: 'teal.6' },
  ]}
/>
```
— [mantine demos BarChart.demo.stacked.tsx](https://github.com/mantinedev/mantine/blob/master/packages/@docs/demos/src/demos/charts/BarChart/BarChart.demo.stacked.tsx), [_data.ts](https://github.com/mantinedev/mantine/blob/master/packages/@docs/demos/src/demos/charts/BarChart/_data.ts), rendered at [mantine.dev/charts/bar-chart](https://mantine.dev/charts/bar-chart/)

**Chakra UI Charts 3.37** (a notable newer entrant: a `useChart` hook over Recharts) — verbatim, `bar-chart-stacked.tsx`:

```tsx
const chart = useChart({
  data: [
    { windows: 186, mac: 80, linux: 120, month: "January" },
    { windows: 165, mac: 95, linux: 110, month: "February" },
    // ...
  ],
  series: [
    { name: "windows", color: "teal.solid", stackId: "a" },
    { name: "mac", color: "purple.solid", stackId: "a" },
    { name: "linux", color: "blue.solid", stackId: "a" },
  ],
})

return (
  <Chart.Root maxH="sm" chart={chart}>
    <BarChart data={chart.data} responsive>
      <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
      <XAxis
        axisLine={false}
        tickLine={false}
        dataKey={chart.key("month")}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <Tooltip cursor={false} animationDuration={100} content={<Chart.Tooltip />} />
      <Legend content={<Chart.Legend />} />
      {chart.series.map((item) => (
        <Bar
          isAnimationActive={false}
          key={item.name}
          dataKey={chart.key(item.name)}
          fill={chart.color(item.color)}
          stackId={item.stackId}
        />
      ))}
    </BarChart>
  </Chart.Root>
)
```
— [chakra-ui apps/compositions/src/examples/charts/bar-chart-stacked.tsx](https://github.com/chakra-ui/chakra-ui/blob/main/apps/compositions/src/examples/charts/bar-chart-stacked.tsx) (data rows shortened here with `// ...`; `Tooltip` props joined onto one line)

### Inferences
- Measured against these examples, umriss asks for three things nobody else asks for on a categorical axis: an index computed per row, a `ticks` array, and a `tickFormat` lookup back into the items. In all nine libraries the caller names the category field (or accessor) once and the library derives both positions and tick labels from the values.
- The hook form `useChart(rows)` is not unusual by itself: Chakra UI Charts ships `useChart({ data, series })`. The difference is that Chakra's hook carries typed keys and series metadata and leaves scales to Recharts' category axis.
- "One component per series over wide rows" is the Recharts/shadcn/Chakra norm, so umriss's `<Bar value="actual" />` matches the mainstream; the outlier is only the x side.

### Gaps
- No verbatim official Nivo bar snippet could be read: nivo.rocks renders its code sample client-side from a generator, and the package README has no code. The Nivo line above is a sketch from documented props.
- The Tremor example was read through a page extraction that collapsed whitespace and cut the trailing props; the docs site's source repository was not located.

## 2. How is a value named (`dataKey` string, accessor function, both), and is the key type-checked?

### Takeaway
String key or accessor function, usually both. Type-checking of the key against the row type is the exception, not the rule: Recharts added it only in 3.8 (March 2026) behind explicit generics or a `createHorizontalChart<Row, string, number>()` helper, Chakra's `useChart` infers `keyof T`, visx and Victory get it through typed accessor functions; MUI X, Nivo, Tremor and Mantine take plain `string`.

### Cited Findings
- Recharts `dataKey` accepts three forms: "`string`: the name of the field in the data object; `number`: the index of the field in the data; `function`: a function that receives the data object and returns the value of this Axis." — [recharts src/util/types.ts](https://github.com/recharts/recharts/blob/main/src/util/types.ts)
- Recharts, default state: "Most components come with strong typing, with one notable exception: data, and dataKeys." and "By default, Recharts components fall back to `any`. This means that if you make a typo in your `dataKey` or provide the wrong data shape, you won't be warned by TypeScript." — [Recharts TypeScript guide](https://recharts.github.io/en-US/guide/typescript/) ([source](https://github.com/recharts/recharts/blob/main/www/src/components/GuideView/TypeScript/index.tsx))
- Recharts 3.8 added two opt-in routes. Per-component generics: `<XAxis<MyData, string> dataKey="name" />`, `<Area<MyData, number> type="monotone" dataKey="uv" />` ("This enforces that the `dataKey` actually exists on your data ... your IDE should also autocomplete your dataKeys"). And four helpers, `createHorizontalChart`, `createVerticalChart`, `createRadialChart`, `createCentricChart`: "Once you define the helper with your generic types, all returned components strictly enforce your data structure." Both are marked "available since Recharts version 3.8". — [Recharts TypeScript guide](https://recharts.github.io/en-US/guide/typescript/); release note "We added generics to our `data` and `dataKey` props and now you can have your charts validated by TypeScript." — [recharts v3.8.0 release, 2026-03-06](https://github.com/recharts/recharts/releases/tag/v3.8.0)
- The Recharts helper is value-type aware, not only key aware: in `createHorizontalChart<MyData, string, number>()` "XAxis is strongly-typed to expect a string dataKey from MyData (e.g. "name")" and "Area is strongly-typed to expect a number dataKey from MyData". The type is `TypedDataKey<DataPointType, DataValueType>`, which keeps only keys whose value type extends the wanted type, or a function `(obj: DataPointType) => DataValueType`; it falls back to any string for `any`/`unknown`/index-signature rows. — [recharts GuideView/TypeScript/Step3.tsx](https://github.com/recharts/recharts/blob/main/www/src/components/GuideView/TypeScript/Step3.tsx), [recharts src/util/typedDataKey.ts](https://github.com/recharts/recharts/blob/main/src/util/typedDataKey.ts)
- Recharts states the cost of the per-component route itself: "While explicit typing using Generics (e.g. `<Area<MyDataType, number>>`) works per-component, it becomes tedious and error-prone across an entire chart." — [recharts src/util/createCartesianCharts.tsx](https://github.com/recharts/recharts/blob/main/src/util/createCartesianCharts.tsx)
- MUI X: series `dataKey?: string` ("The key used to retrieve data from the dataset.") or `valueGetter?: (item: DatasetElementType<unknown>) => BarValueType | null`; the dataset type is `DatasetElementType<T> = { [key: string]: T }`, `DatasetType<T = unknown> = DatasetElementType<T>[]`. The key is therefore not checked against the row type, and the getter receives `unknown` fields; MUI's own demo casts: `valueGetter: (item) => new Date(item.date as string)`. — [mui-x models/seriesType/bar.ts](https://github.com/mui/mui-x/blob/master/packages/x-charts/src/models/seriesType/bar.ts), [models/seriesType/config.ts](https://github.com/mui/mui-x/blob/master/packages/x-charts/src/models/seriesType/config.ts), [docs AxisValueGetter.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/dataset/AxisValueGetter.tsx)
- Nivo bar: `BarDatum = Record<string, string | number>`, `indexBy: PropertyAccessor<D, string>` (string or function), `keys: readonly string[]` (strings only, not tied to `D`). — [nivo packages/bar/src/types.ts](https://github.com/plouc/nivo/blob/master/packages/bar/src/types.ts)
- Victory `x`/`y` accessors take four forms: a property name string (`x="employee"`), an integer index for array rows (`x={0}`), a path string or array for nested data (`x="employee.firstName"`, `y={["salary", "base"]}`), or a function (`y={(d) => (d.actual / d.expected) * 100}`). — [victory docs/guides/data-accessors.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/guides/data-accessors.mdx)
- visx XYChart: functions only, generic over `Datum extends object`: `xAccessor: (d: Datum) => ScaleInput<XScale>`, `yAccessor: (d: Datum) => ScaleInput<YScale>`. — [visx src/types/series.ts](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/src/types/series.ts)
- Tremor: `data: Record<string, any>[]`, `index: string`, `categories: string[]`; strings only, no generic. — [tremor BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx)
- Mantine: `ChartData = Record<string, any>[]`, `dataKey: string` ("Key of the `data` object for x-axis values"), `ChartSeries { name: string; color?; label?; yAxisId? }`; strings only, no generic. — [mantine packages/@mantine/charts/src/types.ts](https://github.com/mantinedev/mantine/blob/master/packages/@mantine/charts/src/types.ts)
- Chakra: `useChart<T = any>(props: UseChartProps<T>)` with `data: T[]`, `series?: SeriesItem<T>[]` where `name?: keyof T`, `sort?: { by: keyof T; direction }`; `chart.key(...)` is documented as "an identity function but provides a typesafe way to access the series data". `T` is inferred from the `data` argument. — [chakra-ui packages/charts/src/use-chart.ts](https://github.com/chakra-ui/chakra-ui/blob/main/packages/charts/src/use-chart.ts), [use-chart docs](https://github.com/chakra-ui/chakra-ui/blob/main/apps/www/content/docs/charts/use-chart.mdx)

### Inferences
- A hook that takes the rows, as in umriss's `useChart(rows)`, is the cheapest place to get checked keys: the row type is inferred once and every returned component is bound to it. That is what Chakra does with `keyof T`, and what Recharts had to retrofit with a curried helper (`createHorizontalChart<Row, string, number>()({...})`) because its components are free-standing imports.
- Recharts 3.8 goes one step further than "key exists": it filters keys by value type (string keys for the category axis, number keys for series). None of the other libraries surveyed does this.

### Gaps
- Whether Victory 37's TypeScript types check a string accessor against the datum type was not verified (only the docs prose was read).
- Whether MUI X plans typed `dataset` keys was not researched.

## 3. How is a categorical x axis declared, is the axis type inferred, and who produces the tick labels?

### Takeaway
A categorical axis is the default or one word away everywhere, and the tick labels are always the category values themselves. Recharts' `XAxis` is `type="category"` by default (the caller must opt in to a numeric axis, the reverse of umriss); MUI X `BarChart` fills in `scaleType: 'band'`; Nivo bar only has a band index scale; Victory takes string x values as categories; only visx makes the caller state the scale (`xScale={{ type: 'band' }}`). Inference is by chart type or layout, not by sniffing the value type.

### Cited Findings
- Recharts `XAxis.type`: "`category`: Treats data as distinct values. Each value is in the same distance from its neighbors, regardless of their actual numeric difference. `number`: Treats data as continuous range. Values that are numerically closer are placed closer together on the axis. `auto`: the type is inferred based on the chart layout. @defaultValue category". — [recharts src/cartesian/XAxis.tsx](https://github.com/recharts/recharts/blob/main/src/cartesian/XAxis.tsx)
- Recharts 3.7 added `type="auto"`: "`X/YAxis` add new axis type: "auto" ... sets the type to "category" for categorical axes, and "number" for numeric axis." — [recharts v3.7.0 release](https://github.com/recharts/recharts/releases/tag/v3.7.0). The inference is from layout, not from data: type `AxisDomainTypeInput = 'number' | 'category' | 'auto'`, "Internally we will evaluate it to either 'category' or 'number' based on the layout". — [recharts src/util/types.ts](https://github.com/recharts/recharts/blob/main/src/util/types.ts)
- Recharts: if the axis has no `dataKey`, "it will reuse the dataKey of graphical items." — [recharts src/util/types.ts](https://github.com/recharts/recharts/blob/main/src/util/types.ts)
- MUI X: "The axis type is specified by its property `scaleType`." `'band'` and `'point'` accept Number, Date and String values; `'linear' 'log' 'symlog' 'sqrt'` accept Number only; `'time' 'utc'` accept `Date` only. "In bar charts, the axis that represents categories (x-axis for vertical bars or y-axis for horizontal bars) must use `scaleType: 'band'`." — [mui.com/x/react-charts/axis](https://mui.com/x/react-charts/axis/) ([source](https://github.com/mui/mui-x/blob/master/docs/data/charts/axis/axis.md))
- MUI X `BarChart` supplies that itself: the official dataset demo writes only `xAxis={[{ dataKey: 'month' }]}`, and `useBarChartProps` maps every category axis to `{ scaleType: 'band' as const, ...axis }` and builds a default band axis when none is given. — [mui-x BarChart/useBarChartProps.ts](https://github.com/mui/mui-x/blob/master/packages/x-charts/src/BarChart/useBarChartProps.ts)
- MUI X `LineChart`: "When you omit the `xAxis` prop entirely, `LineChart` supplies a default x-axis with `scaleType='point'`. Its `data` is `[0, 1, 2, …]`". — [mui.com/x/react-charts/lines](https://mui.com/x/react-charts/lines/) ([source](https://github.com/mui/mui-x/blob/master/docs/data/charts/lines/lines.md)). The generic cartesian fallback axis is `scaleType: 'linear'`. — [mui-x defaultizeAxis.ts](https://github.com/mui/mui-x/blob/master/packages/x-charts/src/internals/plugins/featurePlugins/useChartCartesianAxis/defaultizeAxis.ts)
- Nivo bar: `indexScale` "supports band type only" (default `{ type: 'band', round: false }`); `valueScale` supports linear and symlog. — [nivo bar props.ts](https://github.com/plouc/nivo/blob/master/website/src/data/components/bar/props.ts)
- Victory: string x values are categories without declaration (see the stacked example, `{ x: "Sales", y: 2 }`). The optional `categories` prop only orders them: "Specifies how categorical data for a chart should be ordered ... If this prop is not set, categorical data will be plotted in the order it was given in the data array." — [victory docs/api/victory-datatable-props.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/api/victory-datatable-props.mdx)
- visx XYChart: scale types are stated by the caller in every official example, `xScale={{ type: 'band' }} yScale={{ type: 'linear' }}`; the demo uses `{ type: 'band', paddingInner: 0.3 }` for the date axis of its bar charts. — [visx xychart README](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/README.md), [ExampleControls.tsx](https://github.com/airbnb/visx/blob/master/packages/visx-demo/src/sandboxes/visx-xychart/ExampleControls.tsx)
- Tremor / Mantine / shadcn / Chakra: the category axis is Recharts' default; Tremor passes `dataKey: index` to `XAxis`, Mantine documents `dataKey` as "Key of the `data` object for x-axis values", shadcn and Chakra write `<XAxis dataKey=... />` with no `type`. — [tremor BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx), [mantine types.ts](https://github.com/mantinedev/mantine/blob/master/packages/@mantine/charts/src/types.ts), [shadcn chart.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/radix/chart.mdx), [chakra bar-chart-stacked.tsx](https://github.com/chakra-ui/chakra-ui/blob/main/apps/compositions/src/examples/charts/bar-chart-stacked.tsx)
- Tick labels: in every example above the category value is the label. A formatter is optional and receives the category value, e.g. shadcn and Chakra `tickFormatter={(value) => value.slice(0, 3)}`. — same shadcn and Chakra sources.

### Inferences
- None of the React-first libraries read here infers the scale from the JavaScript type of the values (string → band, Date → time, number → linear). What the caller experiences as inference is a default tied to the chart or axis kind: a bar chart's category axis is band, a Recharts x axis is category unless told otherwise. Type-driven inference is a grammar-of-graphics trait (researched separately).
- For umriss the cheapest step toward the norm is a category axis kind whose domain and tick labels come from the distinct values of the x field, so `findIndex`, `ticks` and `tickFormat` disappear from caller code.
- Recharts' "category by default" has its own trap, visible in its doc text: numeric x values are spaced equally unless `type="number"` is set. A library whose default is numeric (umriss) and one whose default is categorical (Recharts) each surprise the other half of callers; MUI X avoids both by tying the default to the chart type.

### Gaps
- Whether visx XYChart can run without `xScale`/`yScale` was not verified in the type definitions; all official examples pass them.
- Whether Victory needs `scale={{ x: "time" }}` or infers a time scale from `Date` values was not verified (the `scale` prop text was not found in the file read).
- MUI X `LineChart` with `xAxis={[{ dataKey }]}` and no `scaleType`: the effective default was not traced (the docs only state `'point'` for an omitted `xAxis`).

## 4. How are dates handled (Date objects, ISO strings, numbers), and must data be sorted?

### Takeaway
Time is the weakest and least uniform area. MUI X wants real `Date` objects on a `'time'`/`'utc'` axis (numbers and strings are not accepted) and added `valueGetter` in 2026 to convert ISO strings; Victory and Nivo line accept `Date`, Nivo also parses strings by a declared format; visx's examples put ISO strings on a band scale. Sorting is rarely stated as a requirement; Victory and Chakra offer an opt-in sort (`sortKey`, `sort: { by, direction }`).

### Cited Findings
- MUI X scale table: `'time' 'utc'` — "Maps JavaScript `Date()` objects to the available space." Number: not accepted, Date: accepted, String: not accepted. `'band'` and `'point'` accept Number, Date and String. — [mui.com/x/react-charts/axis](https://mui.com/x/react-charts/axis/)
- MUI X `valueGetter` on an axis: "A common use case is converting date strings to `Date` objects for time-based axes." Official demo: `xAxis={[{ scaleType: 'time', valueGetter: (item) => new Date(item.date as string), valueFormatter: (value: Date) => value.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }]}` over rows like `{ date: '2025-01-15T10:30:00Z', value: 42 }`. — [mui.com/x/react-charts/dataset](https://mui.com/x/react-charts/dataset/), [AxisValueGetter.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/dataset/AxisValueGetter.tsx)
- MUI X band axis of dates: "If your band axis represents dates that are sorted and evenly spaced (as is typical), you can set `ordinalTimeTicks` to pick certain date frequencies." — [mui.com/x/react-charts/bars](https://mui.com/x/react-charts/bars/)
- Victory: the axis guide uses `Date` objects as x (`{ x: new Date(2021, 5, 1), y: 8 }`) and says "`VictoryChart` automatically applies "smart" formatting to an axis for dates. When using a custom `VictoryAxis` or `VictoryPolarAxis`, you will need to format the tick values and labels manually". — [victory docs/guides/axis.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/guides/axis.mdx)
- Victory sorting is opt-in: "Sorting can be applied to the final data via the sortKey prop. This prop corresponds to the lodash sortBy function. This prop can be provided as a string, function, or array of either."; `sortOrder` sets ascending or descending. — [victory docs/guides/data-accessors.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/guides/data-accessors.mdx), [victory-datatable-props.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/api/victory-datatable-props.mdx)
- Nivo line data: `x: number | string | Date`. Its time scale spec is `{ type: 'time', format?: 'native' | string, precision?, min?: 'auto' | Date | string, max?: 'auto' | Date | string, useUTC?: boolean, nice?: boolean }`, i.e. strings are parsed by a declared `format`, `'native'` means `Date` objects. Nivo bar has no time scale (index scale is band only). — [nivo line props.ts](https://github.com/plouc/nivo/blob/master/website/src/data/components/line/props.ts), [nivo packages/scales/src/types.ts](https://github.com/plouc/nivo/blob/master/packages/scales/src/types.ts), [nivo bar props.ts](https://github.com/plouc/nivo/blob/master/website/src/data/components/bar/props.ts)
- visx XYChart README: ISO date strings as x (`{ x: '2020-01-01', y: 50 }`) on `xScale={{ type: 'band' }}`. — [visx xychart README](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/README.md)
- Chakra `useChart`: "Automatically sorts the chart data based on a specified key and direction." `sort: { by: "date", direction: "asc" }` over ISO-string dates; `chart.formatDate({ year: "numeric", month: "short" })` formats a date string by locale (implementation: `new Date(value).toLocaleDateString(env.locale, options)`). — [chakra use-chart docs](https://github.com/chakra-ui/chakra-ui/blob/main/apps/www/content/docs/charts/use-chart.mdx), [use-chart.ts](https://github.com/chakra-ui/chakra-ui/blob/main/packages/charts/src/use-chart.ts)
- Tremor, Mantine and shadcn examples treat dates as category strings (`date: "Jan 23"`, `month: 'January'`). — [tremor.so bar-chart docs](https://www.tremor.so/docs/visualizations/bar-chart), [mantine _data.ts](https://github.com/mantinedev/mantine/blob/master/packages/@docs/demos/src/demos/charts/BarChart/_data.ts), [shadcn chart.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/radix/chart.mdx)

### Inferences
- "Dates as preformatted category strings on a band axis" is what most dashboard-style examples actually do (Tremor, Mantine, shadcn, Chakra, visx README). It sidesteps time scales, at the price of equal spacing regardless of gaps.
- umriss's "milliseconds as a number" is stricter than MUI X in one direction and looser in another: MUI X rejects numbers on a time axis and demands `Date`. Accepting `Date | number` and offering an accessor for ISO strings (MUI's `valueGetter`, umriss's existing function-of-row form) would cover what the others accept.
- Opt-in sorting at the data entry point (Chakra `sort`, Victory `sortKey`) is the existing answer to "rows must be sorted by x"; no library read here states that it sorts automatically.

### Gaps
- Recharts time handling was not verified from docs in this session. From prior knowledge (unverified here): a continuous time axis is `type="number"` with numeric timestamps and optionally `scale="time"`, and Recharts does not sort data. Only one example on the Recharts site uses `scale="time"` ([TargetPriceChart.tsx](https://github.com/recharts/recharts/blob/main/www/src/docs/exampleComponents/ComposedChart/TargetPriceChart.tsx)); it was not read.
- Whether MUI X, Nivo or Recharts require pre-sorted rows on a continuous axis is not stated in the pages read.

## 5. How are multiple series declared: one component per series (wide), or derived from a field of long rows?

### Takeaway
Every library here declares series explicitly, one entry per series, as JSX children (Recharts, shadcn, Chakra, Victory, visx) or as a config array (MUI X `series`, Nivo `keys`, Tremor `categories`, Mantine `series`). None of the APIs read derives series from a field of long/tidy rows; the per-series-array libraries (Victory, visx, Nivo line) are the closest, because a long table splits into them with a group-by instead of a pivot.

### Cited Findings
- Recharts: one `<Bar dataKey>` per series, stacking by shared `stackId`. — [StackedBarChart.tsx](https://github.com/recharts/recharts/blob/main/www/src/docs/exampleComponents/BarChart/StackedBarChart.tsx)
- MUI X: `series` is an array of objects, each with `dataKey` (or `data`), `label`, `stack`. — [BarsDataset.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/bars/BarsDataset.tsx), [StackBars.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/bars/StackBars.tsx)
- Nivo bar: `keys` "Keys to use to determine each series, these keys should point to a numeric value." — [nivo bar props.ts](https://github.com/plouc/nivo/blob/master/website/src/data/components/bar/props.ts)
- Tremor: `categories: string[]`. Mantine: `series: [{ name }]`. — [tremor BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx), [mantine BarChart.demo.stacked.tsx](https://github.com/mantinedev/mantine/blob/master/packages/@docs/demos/src/demos/charts/BarChart/BarChart.demo.stacked.tsx)
- Chakra: series are data (`series: [{ name, color, stackId }]`) and the JSX maps over them: `{chart.series.map((item) => (<Bar key={item.name} dataKey={chart.key(item.name)} ... />))}`. — [chakra bar-chart-stacked.tsx](https://github.com/chakra-ui/chakra-ui/blob/main/apps/compositions/src/examples/charts/bar-chart-stacked.tsx)
- Victory: one `VictoryBar` per series, each with its own `data`, wrapped in `VictoryStack` or `VictoryGroup`; official examples also generate them from an array of arrays, `{dataset.map((data, i) => <VictoryBar data={data} key={i} />)}`. — [victory docs/charts/bar.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/charts/bar.mdx)
- visx: one `BarSeries` per series with its own `data` and accessors, wrapped in `BarStack` ("Stack multiple child `<BarSeries />` values together") or `BarGroup` ("Group multiple child `<BarSeries />` values together"). — [visx xychart README](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/README.md)
- Nivo line: series are the outer array, `Array<{ id, data: Array<{ x, y }> }>`. — [nivo line props.ts](https://github.com/plouc/nivo/blob/master/website/src/data/components/line/props.ts)

### Inferences
- "Group/split by a field" is absent from the React-first component libraries read; it is what grammar-of-graphics libraries provide (colour/series channel). TanStack Charts 1.0 (October 2026), which has a React adapter, is such a grammar: "Marks consume the original rows, channels describe their visual encodings" ([TanStack/charts README](https://github.com/TanStack/charts)); it belongs to the separate grammar-of-graphics note.
- With long rows, a caller of Recharts, MUI X, Nivo bar, Tremor, Mantine or Chakra pivots to wide; a caller of Victory, visx or Nivo line groups by the series field. umriss today is in the first camp (filter or pivot per `<Bar>`); a `series="field"` split on a mark would put it ahead of all nine.

### Gaps
- The absence of a group-by-field option is based on the series/prop types and examples read (MUI bar series type, Nivo bar props, Tremor and Mantine props, Recharts examples), not on an exhaustive search of every prop of every chart type.
- Whether Recharts' series-level `data` prop is supported on `Bar` (it exists on `Line`) and how it interacts with a category axis was not verified.

## 6. How are nulls / missing values represented, and how are stacked / grouped / percent bars declared?

### Takeaway
`null` means "no mark / gap", never zero, wherever it is documented (MUI X, visx, Recharts lines), with an opt-in `connectNulls` for lines. Stacking is a string id shared by series (Recharts `stackId`, MUI `stack`, Mantine/Chakra `stackId`), a wrapper component (Victory `VictoryStack`, visx `BarStack`), or a chart-level mode (Nivo `groupMode`, Tremor and Mantine `type`). Percent is a mode in Tremor and Mantine, a `stackOffset` in Recharts, and a hand-written data transform in Victory.

### Cited Findings
- MUI X bar series data is `ReadonlyArray<BarValueType | null>`; "The `minBarSize` property is ignored if the series value is `null` or `0`." — [mui-x bar.ts](https://github.com/mui/mui-x/blob/master/packages/x-charts/src/models/seriesType/bar.ts)
- MUI X lines: "A line series can have fewer data points than the axis. Use `null` values when you have partial data or series that start at different points." "When the series `data` array is shorter than the axis `data`, values outside the series length are `undefined`, not `null`." "Set the `connectNulls` property on a line series to continue the curve across points whose value is `null`." — [mui.com/x/react-charts/lines](https://mui.com/x/react-charts/lines/)
- MUI X stacking: "Bar series accept a string property called `stack`. Series with the same `stack` value are stacked on top of each other." "By default, they are stacked in the order you defined them, with positive values stacked above 0 and negative values stacked below 0." Bar `stackOffset` default is `'diverging'`. Grouped is the default when no `stack` is set (see `BarsDataset`). — [mui.com/x/react-charts/bars](https://mui.com/x/react-charts/bars/), [bar.ts](https://github.com/mui/mui-x/blob/master/packages/x-charts/src/models/seriesType/bar.ts)
- Recharts: `stackId` on each `<Bar>`; chart-level `stackOffset` with `none` (default), `expand` ("make it so that the values always add up to 1"), `wiggle`, `silhouette`, `sign`, `positive`. Lines: "Line coordinates can have gaps in them. We have `connectNulls` prop that allows to connect those gaps anyway." — [recharts src/util/types.ts](https://github.com/recharts/recharts/blob/main/src/util/types.ts), [recharts src/cartesian/Line.tsx](https://github.com/recharts/recharts/blob/main/src/cartesian/Line.tsx)
- Recharts 3.0 area: "When `connectNulls` is true, `null` datapoints are treated as 0." (stacked areas; as summarised from the migration guide). — [Recharts 3.0 migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide)
- Nivo bar: `groupMode: 'grouped' | 'stacked'`, default `'stacked'`; computed bar value type is `number | null`. — [nivo bar defaults.ts](https://github.com/plouc/nivo/blob/master/packages/bar/src/defaults.ts), [nivo bar types.ts](https://github.com/plouc/nivo/blob/master/packages/bar/src/types.ts)
- Victory: `VictoryStack` / `VictoryGroup` wrappers. Percent: "While Victory does not support 100% stacked bar charts natively, you can achieve this by transforming your data." followed by a `transformData(dataset)` helper built from `map` and `reduce`. — [victory docs/charts/bar.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/charts/bar.mdx)
- visx: "All `Series` have animated and non-animated variants ..., support missing (`null`) data, and can be rendered vertically or horizontally." `BarStack` takes an `offset` prop; `BarGroup` groups. — [visx xychart README](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/README.md), [Example.tsx](https://github.com/airbnb/visx/blob/master/packages/visx-demo/src/sandboxes/visx-xychart/Example.tsx)
- Tremor: `type?: "default" | "stacked" | "percent"`, implemented as `stackId={stacked ? "stack" : undefined}` and `stackOffset={type === "percent" ? "expand" : undefined}`. — [tremor BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx)
- Mantine: `type` is `'default' | 'stacked' | 'percent' | 'waterfall'`; "Set `type="percent"` to render a percent bar chart. In this type of bar chart, the y-axis scale is always normalized to 100%"; mixed stacks via `stackId` on a series; percent is implemented as `stackOffset={type === 'percent' ? 'expand' : undefined}`. — [mantine bar-chart.mdx](https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/charts/bar-chart.mdx), [mantine BarChart.tsx](https://github.com/mantinedev/mantine/blob/master/packages/@mantine/charts/src/BarChart/BarChart.tsx)

### Inferences
- Two styles coexist for stacking: a per-series stack id (flexible: several stacks side by side, as in MUI's `assets`/`liability`/`equity` demo) and a chart-level mode (`type="stacked"`; one word, one stack). Mantine offers both: `type` plus optional `stackId`.
- A one-word percent mode (`type="percent"`) exists only in the wrappers over Recharts (Tremor, Mantine); it is a thin alias for `stackOffset="expand"`.

### Gaps
- How MUI X declares a 100 % stack (presumably `stackOffset: 'expand'` on the stacking page) was not read.
- How Recharts, Nivo, Tremor and Mantine bars render a `null` or missing field (gap vs. zero-height bar) is not stated in the pages read.
- Victory's handling of `null` y values was not researched.

## 7. How is the shown value formatted (tooltip, axis), and is there a "label" field separate from the "value" field?

### Takeaway
Formatting is a function prop, either one for the whole chart (Tremor, Mantine `valueFormatter`; Nivo `valueFormat`) or split per axis and per series (MUI X `valueFormatter` on both, Recharts `tickFormatter` plus `name`/`unit`). A category's display label separate from its key is not a first-class data field anywhere; the pattern is a formatter on the category value. Series labels, by contrast, are first-class: MUI `label`, Mantine `label`, shadcn `chartConfig[key].label`, Recharts `name`.

### Cited Findings
- MUI X axis: "Axis data can be displayed in ticks, tooltips, and other locations. You can use the `valueFormatter` property to change how the data is displayed. The formatter's second argument provides rendering context ... `valueFormatter` is used to shorten months and introduce a new line for ticks. It uses the `context.location` to determine where the value is rendered." — [mui.com/x/react-charts/axis](https://mui.com/x/react-charts/axis/)
- MUI X series: `label?: string | ((location: 'tooltip' | 'legend') => string)` and a per-series `valueFormatter` (`{ dataKey: 'london', label: 'London', valueFormatter }`); for missing values, "use `valueFormatter` to return a string when the value is `null` or `undefined`". — [mui-x bar.ts](https://github.com/mui/mui-x/blob/master/packages/x-charts/src/models/seriesType/bar.ts), [BarsDataset.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/bars/BarsDataset.tsx), [lines docs](https://mui.com/x/react-charts/lines/)
- Recharts axis props: `name` "The name of data. This option will be used in tooltip. If no value was set to this option, the value of dataKey will be used alternatively."; `unit` "The unit of data. This option will be used in tooltip."; plus `tickFormatter`. — [recharts src/util/types.ts](https://github.com/recharts/recharts/blob/main/src/util/types.ts)
- Nivo bar `valueFormat`: "The formatted value can then be used for labels & tooltips. Under the hood, nivo uses d3-format ... you can also pass a function which will receive the raw value and should return the formatted one." Type `string | ((value: number) => string)`. — [nivo bar props.ts](https://github.com/plouc/nivo/blob/master/website/src/data/components/bar/props.ts)
- Victory axis: "Use the `tickFormat` prop to customize axis labels. This prop can be given as an array of strings, or as a function that returns a string." `tickValues` sets the ticks. — [victory docs/guides/axis.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/guides/axis.mdx)
- visx: tooltip content is fully caller-rendered via `renderTooltip={({ tooltipData, colorScale }) => ...}`, calling the same accessors on `tooltipData.nearestDatum.datum`. — [visx xychart README](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/README.md)
- Tremor: `valueFormatter?: (value: number) => string`, default `value.toString()`. — [tremor BarChart.tsx](https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx)
- Mantine: one formatter for "values in the tooltip and axis ticks", "a function that takes a number value as an argument and returns a formatted value"; series display name: "By default, the series `name` is used as a label. To change it, set the `label` property in the `series` object". — [mantine bar-chart.mdx](https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/charts/bar-chart.mdx)
- shadcn: labels and colours live in a config keyed by the data key, "intentionally decoupled from chart data"; `ChartTooltipContent` takes `labelKey` ("The config or data key to use for the label.") and `nameKey` ("The config or data key to use for the name."). — [shadcn chart.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/radix/chart.mdx)
- Chakra: `chart.formatNumber({ style: "currency", currency: "USD" })` and `chart.formatDate(...)` return locale-aware formatters built on `Intl`. — [chakra use-chart docs](https://github.com/chakra-ui/chakra-ui/blob/main/apps/www/content/docs/charts/use-chart.mdx)

### Inferences
- The split that keeps recurring is: the row holds the key, a separate place holds the human label (MUI `label`, Mantine `label`, shadcn `chartConfig`). For categories the same split is done with a formatter over the category value, never with an index lookup as umriss's `tickFormat={(v) => items[v]?.name ?? ""}` requires.
- MUI X's `valueFormatter(value, context)` with `context.location` (tick vs. tooltip) is the most complete answer to "short label on the axis, long one in the tooltip" among these libraries.

### Gaps
- The Mantine docs prose names the prop `valueFormat` while the demo is keyed `valueFormatter`; the exact prop name was not confirmed in the type definitions (it is not declared in `BarChart.tsx`, so it sits in a base props type not read to the end).
- Recharts' `Tooltip` `formatter` / `labelFormatter` props were not read in this session.

## 8. Which helper code do official examples need before data reaches the chart?

### Takeaway
For the standard case (categorical x, two or three stacked series from wide rows) the official examples need no reshaping code at all in any of the nine libraries. Helpers appear only at the edges: MUI's `addLabels` and `valueGetter` for ISO dates, Victory's `map`/`reduce` transform for 100 % stacks, visx's accessor table, Chakra's `chart.series.map` to emit bars.

### Cited Findings
- Zero reshaping: Recharts (`data={data}`, three `dataKey`s), MUI X (`dataset` + `dataKey`s), Mantine (`data`, `dataKey`, `series`), Tremor (`data`, `index`, `categories`), shadcn (`chartData` + `chartConfig`). — sources as in section 1.
- MUI X stacked demo imports a local `addLabels` helper to attach labels to seven series, and a shared `valueFormatter`. — [StackBars.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/bars/StackBars.tsx)
- MUI X needs `new Date(...)` per row for ISO strings on a time axis, done inline via `valueGetter`. — [AxisValueGetter.tsx](https://github.com/mui/mui-x/blob/master/docs/data/charts/dataset/AxisValueGetter.tsx)
- Victory 100 % stack: a `transformData(dataset)` function that computes totals per category with `map` and `reduce` and rescales every `y`. — [victory docs/charts/bar.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/charts/bar.mdx)
- Victory with wide rows: the example data is already split per series (`{ x, y }` arrays); wide rows are handled without reshaping by pointing each `VictoryBar` at the same array with different `y` accessors (`x="experiment"`, `y={(d) => ...}`). — [victory data-accessors.mdx](https://github.com/FormidableLabs/victory/blob/main/website/docs/guides/data-accessors.mdx)
- visx: the demo defines accessor functions per series (`const getDate = (d: CityTemperature) => d.date; const getSfTemperature = (d: CityTemperature) => Number(d['San Francisco']);`) and keeps them in an `accessors.x[...]`/`accessors.y[...]` table. — [ExampleControls.tsx](https://github.com/airbnb/visx/blob/master/packages/visx-demo/src/sandboxes/visx-xychart/ExampleControls.tsx)
- Chakra: no reshaping, but the bars are emitted by `chart.series.map(...)`. — [chakra bar-chart-stacked.tsx](https://github.com/chakra-ui/chakra-ui/blob/main/apps/compositions/src/examples/charts/bar-chart-stacked.tsx)

### Inferences
- Caller-side line count for "categorical x, N stacked series", excluding the data literal: Tremor and Mantine about 5 props on one element; MUI X one element with an N-entry array; Recharts/shadcn 2 + N elements; Nivo one element with 3 props; Victory and visx N elements each carrying data and accessors. umriss's current form adds, on top of the Recharts-like element count, one `findIndex` per row, one `ticks` array and one `tickFormat` closure.

### Gaps
- No official example for long/tidy input was found in any of the nine libraries, so the pivot cost there is undocumented rather than measured.

## 9. Recent API changes (2024–2026) toward simpler data input

### Takeaway
The movement since 2024 is toward typed keys and fewer wrappers, not toward a new data shape: Recharts 3.8 (March 2026) typed `data`/`dataKey` and added chart helpers, 3.7 added `type="auto"` axes, 3.3 folded `ResponsiveContainer` into a `responsive` prop; MUI X added `valueGetter` on axes and series (merged April 2026) on top of `dataset` + `dataKey`; shadcn, Mantine and Chakra moved to Recharts v3. Nivo and @tremor/react have had no release since 2025.

### Cited Findings
- Recharts 3.0: state management rewrite; `accessibilityLayer` on by default ("In 2.x this prop is false by default, in 3.0 it's true by default"); `YAxis width="auto"`; custom components inside the chart tree; the migration guide lists no change to the `data`/`dataKey` shape. — [recharts v3.0.0 release](https://github.com/recharts/recharts/releases/tag/v3.0.0), [3.0 migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide)
- Recharts 3.3: "`ResponsiveContainer` is now built-in to all charts ... add the `responsive` prop to any chart"; example `<BarChart data={data} responsive height={300} width="100%">`. Docs moved to recharts.github.io because "the current contributors and admins do not own recharts.org". — [recharts v3.3.0 release](https://github.com/recharts/recharts/releases/tag/v3.3.0)
- Recharts 3.7: new axis `type="auto"`; `Cell` deprecated in favour of the `shape` prop. — [recharts v3.7.0 release](https://github.com/recharts/recharts/releases/tag/v3.7.0)
- Recharts 3.8 (2026-03-06): generics on `data` and `dataKey`, `createHorizontalChart` and siblings (`@since 3.8`), `niceTicks` prop on axes. — [recharts v3.8.0 release](https://github.com/recharts/recharts/releases/tag/v3.8.0), [createCartesianCharts.tsx](https://github.com/recharts/recharts/blob/main/src/util/createCartesianCharts.tsx)
- Recharts 3.10 (2026-07-20): `XAxis height="auto"`, `Legend` `position`/`offset`. — [recharts v3.10.0 release](https://github.com/recharts/recharts/releases/tag/v3.10.0)
- MUI X: PR "[charts] Add `valueGetter` to axes and series", merged 2026-04-09. — [mui/mui-x#21963](https://github.com/mui/mui-x/pull/21963). The dataset page now documents `dataKey`, `datasetKeys` (multi-field series such as scatter, OHLC, range bar) and `valueGetter`. — [mui.com/x/react-charts/dataset](https://mui.com/x/react-charts/dataset/)
- MUI X v7→v8 and v8→v9 migration guides: the headings concern renames, legend, tooltip, axis `position`, hooks and identifiers; no heading concerns `dataset`/`dataKey`. — [migration-charts-v7.md](https://github.com/mui/mui-x/blob/master/docs/data/migration/migration-charts-v7/migration-charts-v7.md), [migration-charts-v8.md](https://github.com/mui/mui-x/blob/master/docs/data/migration/migration-charts-v8/migration-charts-v8.md)
- shadcn: "Updated: The `chart` component now uses Recharts v3." with a short upgrade list (e.g. "Remove `layout` from `<Bar>` when the parent `<BarChart>` already defines it"). The repo carries the same chart doc for its `radix`, `base` and `aria` component flavours. — [shadcn chart.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/radix/chart.mdx), [shadcn-ui/ui repo](https://github.com/shadcn-ui/ui)
- Mantine Charts 9.7.1 peer-depends on `recharts >=3.2.1`; Chakra UI Charts 3.37.0 on `recharts >=3`; @tremor/react 3.18.7 depends on `recharts ^2.13.3` and was last published 2025-01-13. — [@mantine/charts on npm](https://www.npmjs.com/package/@mantine/charts), [@chakra-ui/charts on npm](https://www.npmjs.com/package/@chakra-ui/charts), [@tremor/react on npm](https://www.npmjs.com/package/@tremor/react)
- Tremor's current docs describe a copy-paste component plus `npm i recharts` (Tremor Raw), not the npm package; the Raw repo was last pushed 2025-10-10. — [tremor.so bar-chart docs](https://www.tremor.so/docs/visualizations/bar-chart), [tremorlabs/tremor](https://github.com/tremorlabs/tremor)
- visx 4.0.0 (2026-06-11): React 18/19 required, d3-shape 3, lodash and prop-types removed; the release notes list no XYChart data-API change. A new `@visx/theme` package is mentioned in the XYChart README. — [visx v4.0.0 release](https://github.com/airbnb/visx/releases/tag/v4.0.0), [visx xychart README](https://github.com/airbnb/visx/blob/master/packages/visx-xychart/README.md)
- @nivo/bar 0.99.0 was published 2025-05-23 and is still `latest`. — [@nivo/bar on npm](https://www.npmjs.com/package/@nivo/bar)
- Newcomer outside this note's scope: TanStack Charts reached 1.0.0 on 2026-10-03 (1.1.0 on 2026-10-09), described as "A TypeScript visualization grammar for responsive, accessible, server-rendered application charts", with adapters for React and others; its quick-look is `barY(revenue, { x: 'month', y: 'value' })` with `scales: { x: { scale: () => scaleBand().padding(0.2) }, y: { scale: scaleLinear, ... } }`. — [TanStack/charts README](https://github.com/TanStack/charts) (the README notes it follows unreleased `main`)

### Inferences
- Five of the nine entries (shadcn, Mantine, Chakra, Tremor, and Recharts itself) are one data model: Recharts' wide rows plus `dataKey`. What the wrappers add is exactly what callers find tedious in raw Recharts: a single prop for the category field, a series list with labels and colours, and one-word stack modes.
- The direction of travel in 2026 is type safety for keys (Recharts 3.8, Chakra's `keyof T`). A hook-based API that infers the row type, as umriss has, gets this for free; it is the x-axis model, not the declaration style, that sets umriss apart from the state of the art.

### Gaps
- No "React Aria-style" headless chart library with its own data model was found; a web search for 2026 newcomers returned only the established libraries and low-quality comparison pages. shadcn's `aria` flavour reuses the same Recharts-based chart doc.
- The exact @mui/x-charts version that first shipped `valueGetter` (9.0.x or 9.1) and the date of 9.0.0 were not pinned down; only the PR merge date is cited.
- Unovis (@unovis/react 1.7.1), reaviz (16.2.2) and the old TanStack `react-charts` (beta branch, last pushed March 2025) exist but were not examined.
