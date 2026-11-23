# From 0.56 to 1.0

What a caller changes on the way from `0.56.0` to `1.0.0`, assembled from the packages' changelogs: every entry
under "Changed" of `0.57.0` and `0.58.0` with its migration line. Whoever comes from an older version reads the
changelogs up to `0.56.0` first.

**The way.** Move to `0.58.0`, the last minor before `1.0.0`. There every renamed prop, value, type, field,
export and token still works under its old name and warns once in development, naming the new one. Work
through the warnings until none is left; an application that runs on `0.58.0` without a warning runs on
`1.0.0`, which removes the old names and changes nothing else. The seven packages move together under one
number, so they are raised together.

**What needs a look although nothing warns** stands under its package below: a type that became narrower, an
export that is gone, a default that reads differently. Each line says what to do.

From `1.0.0` on a break costs a major ([ADR-0083](adr/0083-from-1-0-a-break-costs-a-major.md)); what is marked
`@experimental` in a package's `API.md` is exempt.

## `@umriss-ui/core`

### In 0.57.0

- **The package names Node 22 in `engines` and peers `react` and `react-dom` as `^19`** (was `>=19`), so that a later React is not promised before it has run (ADR-0083).
  - Migration: nothing on Node 22 and React 19.

### In 0.58.0

- **`UmrissProvider`'s density is `"regular" | "compact"`; `"comfortable"` still works for this minor and warns.**
  - Migration: Write `density="regular"` for `"comfortable"`; the old word is removed in 1.0.0.
- **`useDensity()` returns `undefined` where no provider set a density (it returned `"comfortable"`).**
  - Migration: Read `undefined` as not set and apply your own default.
- **`showLabel` on `Meter` and `ProgressBar` is `showValue`**, `CommandPalette`'s `onChoose` is `onSelect`, `MenuItem`'s `tone` `"default"` is `"neutral"`, and the types `Key`, `Direction`, `Align` and `Side` are `TreeKey`, `TreeDirection`, `PopoverAlign` and `LimitSide`.
  - Migration: Use the new names; the old ones work for this minor with a warning and are removed in 1.0.0.
- **The space scale `--u-space-1` to `--u-space-8`**, the icon sizes, the buttons' paddings and the widths of modal, drawer and toast are rem, each equal to its former px at a `16px` root.
  - Migration: Nothing moves at a `16px` root; at another root they grow with the text - set the token to a px value to pin one.
- **`--u-control-height-xs` is removed.**
  - Migration: Write the height where you read it (it was `1.125rem`).
- **`--u-shadow-sticky` is `--u-color-shadow-sticky`, and `--u-color-edge-hover` is `--u-edge-color-hover`.**
  - Migration: Use the new names; the old ones work for this minor, a development warning names them, and 1.0.0 removes them.
- **`qualityGood` is removed from `Wording`, `DEFAULT_WORDING` and `GERMAN_WORDING`; nothing displayed it.**
  - Migration: Delete `qualityGood` from a wording object you hand in; it has no replacement.
- **The cross of `clearable` on `Input`**, `Select` and `TreeSearch` clears the field, controlled or not, and reports the empty value through `onValueChange` and `onChange`; `onClear` is deprecated.
  - Migration: Handle the clearing in `onValueChange`; `onClear` is still called for this minor with a warning and is removed in 1.0.0.
- **`value` of `Input` and `Textarea` is `string | null` (no number, no list).**
  - Migration: Pass `String(n)`.
- **`Select` no longer takes the native `multiple`, and its `value` and `defaultValue` are `T | null`.**
  - Migration: Use `MultiSelect` for several values.
- **`hasWarned`, `mergeLanguage`, `scrollForRow`, `RowPlacement`, `WindowInput` and `PressPoint` are no longer exported.**
  - Migration: They were internals; to merge a wording spread `DEFAULT_WORDING`, to build a language use `UmrissProvider` or `LanguageProvider`.

## `@umriss-ui/table`

### In 0.57.0

- **The properties the table sets on itself for pinning and header levels are named `--_table-*`** (were `--u-table-*` and `--u-header-level`); they carried the tokens' prefix and were never tokens.
  - Migration: nothing, unless a stylesheet of your own read them.
- **The package names Node 22 in `engines` and peers `react` and `react-dom` as `^19`** (was `>=19`), so that a later React is not promised before it has run (ADR-0083).
  - Migration: nothing on Node 22 and React 19.

### In 0.58.0

- **`t.filter` is `t.conditions`**, `t.foldAll` and `t.unfoldAll` are `t.foldAllGroups` and `t.unfoldAllGroups`, `GroupBy` (with `GroupByBase` and `GroupByComponent`) is `GroupKey`, `pin` on `RowActions` is `pinned`, and the model's input `filter` is `preFilter`.
  - Migration: Use the new names; the old ones work for this minor with a warning and are removed in 1.0.0.
- **`stickyRowHeader` and `t.asCsv()` are deprecated.**
  - Migration: Put `pin="start"` on the row-header column and call `t.exportAs(csv)`; both old forms work for this minor with a warning and are removed in 1.0.0.
- **`Table<Z, S, Key>` and `ActionProps<Z, S, Key>` are `Table<Z, Key, S>` and `ActionProps<Z, Key, S>`.**
  - Migration: Swap the second and third type argument (`Table<Row, false, number>` becomes `Table<Row, number>`).
- **`CellEdit.value`**, `RowSave.changes` and `RowAdd.values` are typed `string | number | boolean | Date | null` (were `unknown`).
  - Migration: Code that assigned them to another type narrows or casts.
- **The pure model (`tableModel`**, `TableProjection`, `TableInput`, `TreeInput`, `ModelColumn`, `AggregateColumn`, `AggregateKind`, `GroupLevel`, `RowGroup`, `Line`) is experimental; a model column's unset `searchable` follows the column (text is searched); `OwnAggregate` is `AggregateFunction`.
  - Migration: Nothing in a table built with `useTable`; a direct caller of `tableModel` says `searchable: false` on a text column it does not want searched.

## `@umriss-ui/charts`

### In 0.57.0

- **The package names Node 22 in `engines` and peers `react` and `react-dom` as `^19`** (was `>=19`), so that a later React is not promised before it has run (ADR-0083).
  - Migration: nothing on Node 22 and React 19.

### In 0.58.0

- **The type `Side` is `LimitSide`.**
  - Migration: Use `LimitSide`; `Side` works for this minor and is removed in 1.0.0.
- **A series' verdict colour is `verdict` (was `tone`) on `Line`, `Area`, `Bar`, `Scatter`, `BoxPlot` and `ControlChart`.**
  - Migration: Rename `tone` to `verdict`; `tone` works for this minor with a warning and is removed in 1.0.0.
- **`Matrix` takes `row` and `StateBand` takes `state` in place of `value`.**
  - Migration: Rename `value` to `row` on a `Matrix` and to `state` on a `StateBand`; `value` works for this minor with a warning and is removed in 1.0.0.
- **The registry's types are no longer exported**: `AxisConfig`, `SeriesBase`, `SeriesConfig`, `SeriesKind`, the seven series configs, `LimitConfig`, `LimitLineConfig`, `LimitBandConfig`, `LegendConfig`, `TooltipConfig`, `MaterializedSeries`, `BoxChannels`, `Padding`, `Rect`, `ResolvedTheme`, `DataTableGroup` and `ParetoOptions`.
  - Migration: Derive what you need from a component's props (`ChartProps["padding"]`) or declare your own type.
- **`ChartProps` no longer takes a div's `onSelect`, `title` or `color`.**
  - Migration: Drop them, or put them on an element around the chart.
- **The role of a `LimitLine` or `LimitBand` is `"specification"` or `"control"`; `"zone"` is the control chart's own.**
  - Migration: Give a limit with `role="zone"` the role `"control"` or `"specification"`.
- **A `Chart` must be given `aria-label` or `aria-labelledby` by type.**
  - Migration: Name every chart that compiled without a name; at run time nothing changes.

## `@umriss-ui/schedule`

### In 0.57.0

- **The package names Node 22 in `engines` and peers `react` and `react-dom` as `^19`** (was `>=19`), so that a later React is not promised before it has run (ADR-0083).
  - Migration: nothing on Node 22 and React 19.

### In 0.58.0

- **A dependency names its `predecessor` and `successor` (were `from` and to).**
  - Migration: Rename `from` to `predecessor` and to to `successor` on every dependency; the old names are read for this minor with a warning and removed in 1.0.0.
- **`Schedule`'s `label` is `barLabel`, and `ends` on `Schedule` and on a dependency is `endMarks`.**
  - Migration: Rename them; the old names work for this minor with a warning and are removed in 1.0.0.
- **The resolved appearance is `{ provisional, fixed, muted, open }`.**
  - Migration: Read `provisional` for `dashed` and `fixed` for `hatched`; the old two work for this minor and are removed in 1.0.0.

## `@umriss-ui/calculation`

### In 0.57.0

- **The package names Node 22 in `engines` and peers `react` and `react-dom` as `^19`** (was `>=19`), so that a later React is not promised before it has run (ADR-0083).
  - Migration: nothing on Node 22 and React 19.

## `@umriss-ui/dashboard`

### In 0.57.0

- **The package names Node 22 in `engines` and peers `react` and `react-dom` as `^19`** (was `>=19`), so that a later React is not promised before it has run (ADR-0083).
  - Migration: nothing on Node 22 and React 19.

### In 0.58.0

- **`catalogue()` in `useDashboard`'s return is `openCatalogue()`.**
  - Migration: Call `openCatalogue()`; `catalogue()` works for this minor with a warning and is removed in 1.0.0. The prop `catalogue` of `Dashboard` stays.

## `@umriss-ui/alarms`

### In 0.57.0

- **The package names Node 22 in `engines` and peers `react` and `react-dom` as `^19`** (was `>=19`), so that a later React is not promised before it has run (ADR-0083).
  - Migration: nothing on Node 22 and React 19.

### In 0.58.0

- **`freshness` on `AlarmList` and `AlarmBanner` is `ages`.**
  - Migration: Pass `ages`; `freshness` works for this minor with a warning and is removed in 1.0.0.
- **`alarmModel`, `AlarmProjection`, `alarmColumns`, `ALARM_COLUMNS` and `DEFAULT_ORDER` are experimental.**
  - Migration: Nothing now; they may change in a minor.
