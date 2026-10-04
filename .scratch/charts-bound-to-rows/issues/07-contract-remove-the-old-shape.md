# 07: Contract: remove the free parts and `accessor`

**What to build:** The old shape is gone: the package no longer exports `Chart`, the axes or the series kinds on their own, `accessor` is no longer accepted, and `<Chart>` takes no `data`. `Legend`, `Tooltip`, `DataTable`, `LimitLine`, `LimitBand`, `ControlChart` and the pure functions stay ordinary imports.

**Blocked by:** 03, 04, 05, 06 (every migration batch)

**Status:** done

- [x] Type tests: a free `Line` and an `accessor` no longer compile
- [x] The capability record's 'Known limits' says the source-text comparison holds for functions only
- [x] Every suite green; screenshots unchanged

## Comments

### Carried in from 02 and 03 (2026-10-04)

- `value` becomes required (during the expand both `value` and `accessor`
  are optional, so a series with neither compiles).
- `ControlChart` still takes `accessor`; it gets `value` (field or function)
  like every series.
- Matrix: `value` is its colour channel today, its row position `accessor`.
  The naming waits for the user (proposal: `value` is the y position on every
  kind, the colour channel becomes `level`).
- Scene-level tests and internal configs keep their internal `accessor`
  field; only the public prop goes.

### Carried in from 04 (2026-10-04)

- The hook's `XAxis`/`YAxis` are typed only at the hook's row, while series
  are `<T = Z>`. An axis whose series all bring their own `data` cannot name
  their fields (Axis/08 falls back to `value={(_, i) => i + 0.5}`), and an
  axis read across series of different row types type-checks against the
  hook's row only (Axis/08's `tiles` y axis reads `fired` from `HourCount`).
  Give the axes `<T = Z>` as well, so `<XAxis<HourCount> value="hour" />`
  names the rows it reads, restore Axis/08 to a field name, and say in the
  axis' doc comment that it reads the rows of every series bound to it.
- `unshown.json` holds `AreaProps.accessor` as "(g) deprecated alias";
  remove it with the prop.

### Delivered (2026-10-04)

- `src/index.ts` no longer exports `Chart`, `XAxis`, `YAxis` or any series kind
  (`Line`, `Area`, `Bar`, `Scatter`, `StateBand`, `Matrix`, `BoxPlot`); their
  props stay public types. `ChartProps` lost `data` and its type parameter;
  the inner chart takes the rows from `useChart` only.
- `accessor` is gone from every series and axis prop; `value` is required on
  Line, Area, Bar, Scatter, StateBand, Matrix and `XAxis`. Internal configs
  keep their `accessor` field (`AxisConfig.accessor` is optional now, an x
  axis' only).
- `ControlChart` takes `value` (field name or function), typed by its own
  `data`; a field compares by its name (one reader per name), a function by
  its source text, as before.
- Axes: `XAxis` is `<T = Z>` in `ChartParts`; Axis/08's top axis reads
  `<XAxis<HourCount> value="hour" />` again. Its doc comment says it reads the
  rows of every series bound to it.
- **Y axis' `value`: removed.** Nothing reads it - materialisation runs only
  the x axis' reader (`scene.ts`, `materialize()`), and extent, tooltip,
  readout and data table read the series' values. It was dead API; 114
  `<YAxis value=…>` in examples, scenarios, tests, README and core's two
  scenarios lost it, nothing else changed. Line/03 needs nothing.
- Matrix (user's decision, option a): `value` is its row, as it is the y
  position on every kind; its colour channel is `level` (internal config
  `MatrixSeriesConfig.level`). Matrix/01, /02, Chart/07, the encoding and
  keyboard tests, the scene-level tests, CONTEXT.md (**Level channel**, which
  says it is not a tree node's **Level**), capability record and the Matrix
  page's about text follow. Left: `TooltipPoint.value` (a custom tooltip's
  read of the matrix colour) keeps its name, its doc says it is the `level`.
- `unshown.json`: the eight "(g) deprecated alias" entries are gone. Capability
  record: "Known limits" says the source-text comparison holds for functions
  only, field names compare by name; the ControlChart row speaks of an inline
  `value` function. ADR-0048 names the y axis without `value` and `level`.
- The outline's import lines say `useChart` where they said `Chart`, `XAxis`,
  `YAxis` or a series kind.
- Type tests (`tests-unit/useChart.test-d.tsx`), red first: a free `Chart`,
  `Line`, `XAxis`/`YAxis` import, `accessor`, a series without `value`, a
  `YAxis value`, `<Chart data>` fail to compile; `ControlChart value` and
  `<XAxis<Deploy>>` are checked against their rows; `level` is checked.

Tests: charts typecheck, 730 unit tests, `pnpm lint` green; schedule
typecheck green; core typecheck green but for the schedule's work in flight
(`05-watch-a-kiln-line.tsx` 673, `initialDomain`). Charts visual suite: 22
pictures renewed, all text - the ten series/chart/axis/benchmark page heads
(import line, Matrix's about) and installation--first-chart (its lead), light
and dark; no chart pixel changed.
