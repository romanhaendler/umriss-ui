# 05 - Empty state

Status: done
Type: task

Spec: `.scratch/charts-essentials/spec.md` - row 05 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `Chart empty?: ReactNode`, default `"No data"`. `LayoutSnapshot.empty` -
  no visible series has a point whose y is no gap (and, for a matrix, whose
  value is one) - computed in `pushLayoutSnapshot`, stopping at the first
  point found; `false` in the snapshot before the first frame and on the
  server, so nothing flashes. `AxesHtml` places `.uc-empty` over the plot
  rectangle, text centred, in the legend's size and the axis text colour.
- Found on the way: an empty chart on a `time` axis labelled one millisecond
  of 1970 ([0, 1], the axis without data). A time axis over less than a
  minute now keeps a data domain and draws no ticks (`readable` in
  `layout.ts`); a test in `timeAxis.test.ts`.
- Tests first: new `emptyState.jsdom.test.tsx` (5; the plot is given a size
  through `getBoundingClientRect`, jsdom lays nothing out).
- Example `Chart/03-empty.tsx` (the default beside the caller's words; its own
  row type, so it shows no data file); 2 new screenshots. Renewed:
  `controlchart--control-chart`, light and dark - it failed in every run
  after the Chart page grew above it, and passes in repeat after the renewal;
  drift only in the diff.
