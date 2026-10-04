# Charts are bound to their rows by the hook

Status: accepted
Date:   2026-10

The table is declared through `useTable(rows, …)`, which binds the row type and
hands back `Table` and `Column`; a column names its value as a field or a
function (ADR-0017). The charts were declared through a free `<Chart data>` and
free series, each reading its rows through an `accessor` function: 406 of
them in the workspace, 346 of which only read a field (`d => d.p95`). The
accessor's parameter had to be annotated by hand at every use, and because
functions passed as props are compared by their source text, an accessor that
read a changed captured variable did not update the chart
(`packages/charts/docs/capabilities.md`, "Known limits").

**A chart is declared through `useChart(rows, options)`, which binds the row
type and hands back `Chart`, the axes and every series kind. A series and an
axis name their value as `value`, a field name or a function, as a column
does.** The view (ADR-0047) lives on what the hook returns, beside the parts.

- **No free series and no free axes.** A free generic `Line` inside `Chart`
  types its value as `unknown`, the reason ADR-0017 gave for the table; the
  free route would be the unchecked and therefore the most used one.
- **A series with its own `data` is typed by that `data`.** Fourteen series in
  the workspace bring rows of their own; TypeScript infers the row type from
  the `data` prop of a generic component, so `value="p95"` is checked there
  too, and no second hook is needed per data source.
- **Named channels stay named** (ADR-0011): `baseline` and the box channels
  take a field name or a function, under their own names.
- **Parts that never read a row are ordinary imports**: `Legend`, `Tooltip`,
  `DataTable`, `LimitLine`, `LimitBand`. `ControlChart` brings its own data
  and stays a component of its own, typed by its `data`.
- **`data` moves from `<Chart>` into the hook**, as rows are `useTable`'s first
  argument; `<Chart>` keeps what is about the drawing: `ariaLabel`, `height`,
  `wording`, `encoding`, `syncId`, `empty`.

## Considered Options

- **Keep `accessor` and add a hook for the view only.** The smaller change; it
  leaves the declaration unlike the table's, which was the point.
- **A hook per data source.** Types every series, at the cost of a hook call
  for each of the fourteen series that bring their own rows.
- **A field-name-only `value`.** Shorter types; the sixty computed values
  (`d => d.charge ?? 0`, `d => d.cumulative * 100`) would need a mapped copy of
  the rows first.

## Consequences

- Every example, test and the core demo's scenarios change; the schedule does
  not, as it imports only the charts' pure arithmetic (ADR-0022).
- A `value` given as a field name is compared by its name and updates
  correctly; a function keeps the source-text comparison and its limit.
- The schedule follows with `useSchedule` in the same work, so that all three
  packages are declared the same way. Its subtasks, tasks and lanes are the
  library's own types, so it binds no row type; what it gains is the view and
  its setters on what the hook returns, beside `Schedule` and its parts.
- The work stands in `.scratch/charts-bound-to-rows/`, released together with
  `.scratch/component-view/`.
