# Shakedown: one app from all six packages (0.40.4)

Status: needs-triage

A junior's fleet-dispatch demo in one evening: a dashboard start page with Stats and trend charts, a table of
2,000 vehicles (sort, filter, group, select, export), a day schedule with drag to reassign, a cost-per-tour
calculation, core forms and overlays, one shared React context, live updates every second. Vite 8 with
`cssTarget`, TS 7, Chromium, 2026-10-24. Production build 212 kB JS / 35 kB CSS gzipped for all six.

## Findings

1. **[Trap] A table column whose `value` reads an outer variable shows stale data, silently:**
   `value={(v) => v.id === selected ? "★" : ""}` never lights up; `rowProps` with the same closure does
   update. Documented (`llms-full.md:1713`); idea: a `deps` prop or a dev warning.
2. **[Trap] `virtual` with `maxHeight="100%"` in a widget turns virtualisation off silently:** 2,004 `tr`,
   a 72,216 px table clipped by the widget. A `height:100%` wrapper with a 3-line frame class and no
   `maxHeight` works (14 `tr`). Idea: warn, or support `%`. See `table.md` 2.
3. **[Break] Numeric backend ids need `String()` in about ten places:** `rowKey`, `Lane id`, `Subtask.task`
   and `.lane`, `Combobox<T extends string>`, `TableSelection<string>` - "Type 'number' is not assignable
   to type 'string'". Idea: accept `string | number`.
4. **[Misfit] One `UmrissProvider` does not make the app one language:** table, schedule, calculation and
   dashboard follow it; charts stay English (axis "17 Mar", tooltip "45.211") until every `<Chart>` gets
   `wording={GERMAN_CHARTS_WORDING}`. Idea: charts read the provider's language when core is present.
5. **[Misfit] Money looks different in every package:** no currency format in the table (the unit goes in
   the header), "1.386" in a chart tooltip, "51.6 €" beside "56.28 €" in a calculation because inner
   `Product`s do not inherit the `Sum`'s `decimals={2}`.
6. **[Misfit] A calculation total is "—" when one given is `null`;** backends have null costs, so a fleet
   total is always "—" until the caller invents a value.
7. **[Misfit] A selection keeps the id of a deleted row:** `selection.count` 1, no such row (see `table.md` 4).
8. **[Trap, with `as any`] An ISO string or epoch ms in a column with `format`** shows raw
   ("2025-08-07T07:36:19.687Z", "1,773,735,654,728"); without `as any` the type error is misleading
   ("'string' is not assignable to type 'undefined'").
9. **[Look] At 1920 px the dashboard's Edit button sits at x 1847–1880** while the board is capped at 1560 px
   and ends at x 1600 (see `dashboard.md` 7).
10. **[Look] A schedule with `height={360}` in a six-row widget is cut by 36 px** (axis and lane 7 hidden):
    `height` is a number only and the widget's render prop gets no pixel size.
11. **[Look] The chart's "Show all" button collides with the tooltip** when zoomed.
12. **[Misfit] `WidgetType` requires `defaultOptions` even when a widget has none.**

## Wishes (all unlisted)

- **Row click / an active row on the table.** Workaround: `rowProps` with `data-vid` and a delegated click,
  4 lines. Elsewhere: AG Grid `onRowClicked`, MUI DataGrid `onRowClick`.
- **A lane highlight or class from outside.** `Lane` has only `id` and `label`; workaround: a bold label.
  Elsewhere: Bryntum resource row cls, FullCalendar `resourceLabelClassNames`.
- **Fill-parent sizing, and the widget's pixel size in its render prop.** Table: 3 lines of CSS; schedule:
  hard-coded px (still wrong); chart: `height:100%`. Elsewhere: react-grid-layout, AG Grid `domLayout`.
- **Shared selection, linked filtering and drill-down across packages:** table row → chart → schedule →
  cost, chart range → table. Workaround: a context of about 60 lines plus 6 to read a chart zoom as a range
  (works). Elsewhere: Highcharts Dashboards sync, AG Charts with AG Grid, MUI X `highlightedItem`.
- **A brush (drag-select range) on a chart**, not only zoom. Elsewhere: ECharts `brush`, Highcharts
  `selection`.
- **A total that skips missing values** (`missing="skip"`, or "n of m"). Workaround: `?? 0`, which lies.
  Elsewhere: Excel SUM, AG Grid `sum`.
- **One language for all packages** (charts from the provider); **a `currency` format** in table,
  calculation and charts; **an async or virtualised Combobox** (2,000 options in the DOM, 151 ms to open).

## Held up

Copied examples of table, chart and schedule ran on the first paste · drag to reassign with a live cost
update · live updates keep the search focus and text, table scroll, chart zoom, and a 3.5 s schedule drag ·
with one context re-rendering everything: the table 14 ms per render whether 200 or 2,000 rows, the
dashboard about 63 ms React time per second (at 4× CPU a 300 ms long task per second, a click paints in
256 ms); `useTable` itself memoised · row → schedule label and chart title, chart zoom → table (453 → 85
rows), lane drag → cost; Combobox, DateTimePicker and NumberInput in a Modal · overlays escape the widget's
clipping · zero console output · no page horizontal scroll at 375–1920 px · edit mode keeps the table's
search text.
