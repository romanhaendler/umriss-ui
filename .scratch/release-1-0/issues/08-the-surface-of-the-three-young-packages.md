# The surface of the three young packages

Type:   research
Status: resolved

## Question

Review the public surface of `@umriss-ui/calculation`, `@umriss-ui/dashboard` and `@umriss-ui/alarms` for what should not be frozen as it stands.

Read `packages/<pkg>/API.md` first (every export, prop, option and return), then the source and the demo examples where a
line raises a question. Look for:

- **Inconsistent names**: the same thing named two ways across components or packages (a prop, a callback,
  a value of a union), and names that disagree with `CONTEXT.md`.
- **Inconsistent shapes**: callbacks that report differently for the same kind of event, controlled and
  uncontrolled pairs that do not follow one pattern, options that are a boolean here and a union there.
- **Loosely typed surface**: `unknown`, `any` or `string` where the caller could be checked.
- **Deprecated aliases and renames still alive**, and anything exported that nothing documents or uses.
- **Defaults** that surprise, and props whose doc sentence and behaviour disagree.

Candidates only, no decision. For each: where (`file:line`), what stands there, whether setting it right
after 1.0 would cost a major, the smallest change, its size (S/M/L). Say what was not read.

Findings: `.scratch/release-1-0/research/08-the-surface-of-the-three-young-packages.md`

For each of the three also: is it fit to freeze at all - how much of it changed in the last ten minors (its
`CHANGELOG.md`), and what in it still reads as provisional?

## Answer

Findings: `.scratch/release-1-0/research/08-the-surface-of-the-three-young-packages.md`. Not read: the demos,
tests, CSS, the rendering of `Calculation.tsx` and `Dashboard.tsx`, the wording keys. Line numbers marked `~`
in the file are approximate.

- **Calculation reads as fit to freeze**: no break in the source across 0.47 to 0.56. Its restrictions on
  metrics are run-time errors, not types.
- **Dashboard reads as fit to freeze**: no signature broke in ten minors. The stored `DashboardView` is the
  callers' persistence format. `catalogue` is both a prop and a function in the hook's return;
  `defaultView` / `initialView` invert React's `default*`.
- **Alarms is the least settled**: the youngest (0.47), one signature break in 0.54, and its surface is
  partly the table's: `AlarmProjection extends TableProjection`, `alarmModel(input, state: TableInput)`, and
  `ModelColumn` / `SortLevel` in its column exports. From the table it imports `tableModel`, `Pagination`,
  `useTable` and the types `ModelColumn`, `SortLevel`, `TableProjection`, `TableInput`, `TableSelection`.
- **One prop, two names**: `FreshnessAges` is passed as `freshness` in alarms, as `ages` in core and the
  calculation. `asOf` has three types across the three.
- **Density**: `"regular" | "compact"` in the calculation (default regular) and in `AlarmList` (default
  compact); the dashboard, `AlarmBanner` and `PriorityMark` take none.
- Not a break: the 0.47 changelog names `lifecycleAt` as an export that `index.ts` does not export; the
  dashboard's `API.md` gives no member lines for `DashboardProps`, `WidgetContent`, `WidgetFormProps`,
  `HeadingOptions`. "Snooze" in code beside "Shelve" on screen is recorded in `CONTEXT.md` on purpose.
