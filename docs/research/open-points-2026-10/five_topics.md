# Five topics nobody had looked at

Gathered on 2026-10-11 from the repository at 5d31cd85, for the grilling of the open points. Facts only; paths are relative to the repository root.

## 1. Streaming / live

**Does today**
- Charts: there is no live API. `useChart(rows)` (`packages/charts/src/useChart.tsx`) reads whatever `rows` it is handed on each render, and the chart redraws from them.
- The only "live mode" is the benchmark demo (`packages/charts/demo/examples/Benchmark/01-benchmark.tsx`). It appends 10 points/s in a moving window of 400 points and measures draw cost.
- The benchmark demo is not photographed. `packages/charts/docs/capabilities.md` (~l.443) says the left axis band keeps its width through hysteresis (R-3.4/R-5.3), and l.146 lists the live mode under "Manual" tests.
- Downsampling is automatic above 2 points per pixel column.
- Core: `useFreshness(asOf, ages)` (`packages/core/src/lib/useFreshness.ts`) ticks `setInterval` at `cadence(ages)`, derived from the stale and lost thresholds. It has no default ages. It does not fetch, poll or reconnect. `Stat` and `AlarmList` (`freshness` prop) use it; `Stat` demo `07-freshness.tsx`.
- Table: `AlarmList` takes `freshness?: FreshnessAges`. `rowKey` is the basis of selection and expansion. Selection (`packages/table/src/useTable.tsx` ~l.507-520) is held by key, and selected rows are kept only if still seen. `packages/table/src/parts.tsx` ~l.394: a row gone from `rows` takes its Row draft with it.
- Table: `preFilter` may change in the call and the page is clamped.
- Schedule: `now` is `true` (reads the clock at mount, then re-reads once a minute, `packages/schedule/src/Schedule.tsx` ~l.236) or a number you pass. Demo `Now-line/02-follow-the-clock.tsx`.

**Leaves to the application**
- Fetching, polling, append and trim of the window, and the update rate.

**Documents say**
- ADR-0010: the reference time is a parameter, the hook owns the ticking, and the interval derives from the thresholds. "`@umriss-ui/charts` gets no freshness": a chart shows the data it was given.
- ADR-0052: charts read the rows as they come.
- ADR-0032: WebGL is out of scope.
- No document I found gives update-rate guidance, beyond the freshness cadence and the benchmark figures.

## 2. Time zones

**Does today**
- Instants are shown in the browser's local zone everywhere. There is no `timeZone` option; the only `timeZone` hit in the sources is `timeZoneName: "shortOffset"`, used for the `offset` format.
- Core formats (`packages/core/src/lib/language/formats.ts`): `formatsFor(locale)` builds `Intl.DateTimeFormat` without a `timeZone`, so the format follows the local zone. Hours are 24-hour (`hour12: false`). `offset(d)` gives e.g. "GMT+2".
- DatePicker (`packages/core/src/components/DatePicker/time.ts`) uses `getHours()` etc. and `offsetLabel`, so it is local too. `DateTimePicker` has a DST choice ("earlier"/"later") for the ambiguous 02:30 on the autumn change (`dstChoiceFor`, `resolveLocalTime`).
- Charts time axis (`packages/charts/src/time.ts`): ticks on local boundaries via `getFullYear`, `getHours` etc.; labels via `Intl.DateTimeFormat("en-GB")` with no zone. `localOffset(instant)` in `packages/charts/src/workingTime.ts` ~l.290 uses `getTimezoneOffset`, so working time is in local time.
- Input parsing (`packages/charts/src/materialize.ts` ~l.238, `packages/charts/src/Axis.tsx` ~l.73): an ISO string with a time and no offset is read as local time, and a date alone as UTC.
- Schedule (`packages/schedule/src/snap.ts`): the raster lies on local time, and "the offset of the time zone is the one at the instant itself".
- DST tests:
  - `packages/charts/tests-unit/timeAxis.test.ts`: spring and autumn (25 Oct 2026).
  - `packages/charts/tests-unit/workingTime.test.ts` l.346.
  - `packages/core/tests-unit/time.test.ts`, `range.test.ts`, `grid.test.ts`.
  - `packages/schedule/tests-unit/timeAxis.test.ts`.
- Every package's `vitest.config.ts` sets `process.env.TZ = "Europe/Berlin"`. `docs/testing.md` ~l.173 says the clock-change tests check concrete transitions (29.03.2026 forward, 25.10.2026 back).

**Leaves to the application**
- Showing another zone, such as UTC or a plant's zone; converting instants; storing UTC.
- I did not read how the table's date columns and filters format dates (`DateFormat` in `packages/table/src/values.ts`). They presumably use the core formats.

**Documents say**
- The only time-zone statements I found are `docs/testing.md` ~l.173 and `docs/journal.md` ~l.2451, both about the tests. No ADR or `CONTEXT.md` entry on time zones turned up in a grep for "time zone".

## 3. Form validation

**Does today**
- `FormField` (`packages/core/src/components/FormField/FormField.tsx`):
  - `error` shows the message in place of `hint` and sets `invalid` through context. Fields get `aria-invalid` and `aria-describedby`.
  - `required` shows the `*` mark and `aria-required`. Pickers and MultiSelect triggers get the mark only.
  - The doc comment says "It validates nothing - validation belongs to the caller."
- `Input` is `forwardRef<HTMLInputElement>`, so a ref and native props such as `name` are available. I did not check the other fields.
- Table cell `validate?: (value, row) => string | null` (`packages/table/src/types.ts` ~l.165) keeps the editor open with the message under the field "as in a `FormField`". It runs on every open cell on Save (ADR-0036 l.60; ADR-0034 l.58). A row-wide check is left out.

**Leaves to the application**
- All validation logic and form state.
- I found no react-hook-form, formik or zod example or doc. The only matches were in `pnpm-lock.yaml` and `docs/archive/handoff-2026-08.md`; I did not read the archive entry.

**Documents say**
- Only the `FormField` comment above ("validation belongs to the caller").

## 4. Linking chart and table

**Does today**
- Charts:
  - `onSelect(hit: TooltipHit<Z>)` in `useChart` options (ADR-0056): reports a click or Enter on the Active point, holds no selection, and needs a `Tooltip`. The hit does not travel over `syncId`.
  - `syncId` on `Chart` shares only the pointer's x.
  - `initialView` / `onViewChange` give a whole `ChartView` (spans per axis id, hidden series) and are the way to link charts. A view handed in later is gone to, and an equal one changes nothing. `setDomain` and `domains` stand on the hook.
- Table (`packages/table/src/types.ts`):
  - `preFilter` (invisible to the user, not part of the view).
  - `rowFilters` with `t.setFilter`.
  - `initialView` / `onViewChange`: the whole table view, taken and reported.
  - `selection` can be controlled (`TableSelection`; `useTableSelection` is exported).
  - `rowKey` is the basis of selection.
- Examples:
  - `packages/charts/demo/examples/Zoom-and-pan/04-cursor-sync.tsx`.
  - `packages/charts/demo/examples/Chart/03-keyboard-and-screen-reader.tsx` shares one `useState` view between two charts.
  - `packages/core/demo/scenarios/01-resolve-an-incident.tsx` combines `LimitLine`/`Tooltip`/`useChart` with `AlarmList` + `alarmModel` + `useTableSelection`.
  - `packages/core/demo/scenarios/05-watch-a-kiln-line.tsx` (the control room) combines `ControlChart`, `DataTable`, `AlarmList` with a shared `selection` (l.543, 629-637) and `useSchedule` (l.657 `onSelectedTaskChange`).
  - `packages/table/demo/scenarios/01-work-through-the-alerts.tsx` also passes a `selection`.

**Leaves to the application**
- The wiring: the glue state, and mapping a hit to a filter or selection. Nothing in the library does it. I did not trace in detail what the scenarios link to what.

**Documents say**
- Charts demo `packages/charts/demo/outline.ts` l.104: charts stay in step by handing each other the view; `syncId` shares only the pointer.
- ADR-0003: an active node is not a selection.
- ADR-0023: components report, the application decides.
- ADR-0047: a component holds its own view.
- The `onSelect` spec (`.scratch/charts-on-select/spec.md`) and the range-selection spec (`.scratch/chart-range-selection-and-navigator/spec.md`) exist; I did not read them. Range selection and a navigator are "Not built" (ADR-0056).

## 5. Arrangeable dashboard

**Does today**
- `packages/core/src/components/Layout/Layout.tsx` has `Stack` (direction, space step 1-8, align, justify, wrap) and `Grid` (columns count or width list, responsive min-width, gap). Both are static CSS.
- `Splitter` (`packages/core/src/components/Splitter/Splitter.tsx`): two panes; `value`/`defaultValue`/`onChange` give the first pane's share in per cent, plus `min`/`max`/`step` and a keyboard-operable separator.
- `Dock` (`packages/core/src/components/Dock/`): a tool strip on one surface. It snaps among four resting places and never sits at a coordinate (ADR-0013; `place.ts`).
- `Card` is a container.
- Nothing is draggable or resizable as a tile, and nothing persists a layout. In `packages/*/src` and `packages/*/demo` (excluding generated files) the only layout-persistence-like facility is the app-kept view. The views of table and chart are handed back to the application, and the docs say storage is the application's decision.

**Leaves to the application**
- Tile arrangement, drag and resize, saving a layout, and the Splitter's persisted value.

**Documents say**
- `CONTEXT.md` ~l.1494 and ~l.1597: "There is no layout grid in this workspace and there should be none" (said of the month grid in the date picker; it also names `Stack` and `Grid`, l.71). "Tile" is retired or on avoid lists (l.617, 1078, 1624).
- ADR-0032 ("What umriss is not") lists no layout editor, and ADR-0035 says the library is for data-dense applications. ADR-0032's rule is that a caller who brings a question "reopens it". I did not find a layout-editor entry in either.

## Not established
- Whether the table's date columns and filters pass a zone or locale through `DateFormat`.
- What the table does with sort, scroll position and virtualisation when `rows` changes each second. I read no test or doc on it; `packages/table/src/motion.ts` is FLIP motion for grouping and folds only. Whether a draft survives a re-render with the same key is implied by `parts.tsx` l.394 but not tested by me.
- Whether any other field forwards `name` or a ref (only `Input` was checked), and whether the native `validity` is wired anywhere.
- The contents of the `.scratch` specs: `chart-loading`, `charts-long-series`, `charts-on-select`, `chart-range-selection-and-navigator`, `component-view`, `chart-rows-as-they-come`.
- Whether a doc elsewhere states update-rate guidance. I searched only `capabilities.md`, `standards.md`, `CONTEXT.md` and the READMEs.
