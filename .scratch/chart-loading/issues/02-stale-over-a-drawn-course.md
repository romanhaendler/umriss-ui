# 02: `loading` over a drawn course

Status: done
Type: task
Blocked by: None (can start immediately)

Spec: `.scratch/chart-loading/spec.md`

**What to build:** the `Chart` that `useChart` hands out takes `loading`, under
the table's name and meaning (ADR-0042). Over a course already drawn, the course
stays visible. It dims after `--u-delay-stale` and takes no pointer until the
answer arrives, then it comes back at once. The plot is marked busy while the
chart loads. Over nothing to show, the empty message is held back while the
chart loads, and the plot area stays bare until 03 puts the silhouette there.

- [x] `loading?: boolean` on `ChartProps`, default `false`, documented as the table's is; the documentation of `empty` says it is not shown while loading.
- [x] While loading, the plot element carries `aria-busy="true"`; otherwise the attribute is absent.
- [x] Loading with something shown: the plot carries a stale data attribute (the table's `data-stale` is the model), dims to 0.5 after the stale delay, and takes no pointer. Pan, wheel zoom and double-click reset do nothing.
- [x] When the stale state begins, any open tooltip, crosshair and shared `syncId` position end.
- [x] Arrow keys still walk a stale chart; the legend, the data-table disclosure and "Show all" stay usable and undimmed.
- [x] Loading with nothing to show (no rows, only gaps, every series hidden): no `.uc-empty`, neither the default nor a custom `empty`. Leaving `loading` with still nothing to show shows "No data" again.
- [x] New `--uc-*` tokens fall back onto `--u-delay-stale` (200ms); `styleGuard.test.ts` stays green.
- [x] jsdom tests at the `useChart` seam, as `emptyState.jsdom.test.tsx` does it, cover each criterion above. The tooltip and key cases follow `tooltipFormat`, `readout` and `keyboard` tests.
- [x] The charts demo gets a loading example with a toggle that reloads over drawn rows.

## Comments

Delivered (2026-10-05).

- The layout snapshot carries `loading` as laid out. The stale state and the
  hold-back of the empty message are read from it. When the rows and the end
  of `loading` arrive together, the empty message waits for the frame that lays
  the rows out, so "No data" never flashes in between. `aria-busy` follows the
  prop at once.
- The series layer dims, and so does a limit's label with its line. The axes
  stay as they are, as the table's header does. The transition is
  `--uc-transition-state` (a change in place) after the new `--uc-delay-stale`.
  Under reduced motion only the fade goes and the delay stays.
- `setLoading(true)` ends the pointer's hover, ends a drag under way (a
  captured pointer passes `pointer-events: none`), and shares no position
  while the chart is loading, including a key's point. Incoming positions draw
  no crosshair either.
- Keys still walk the chart and still zoom it. A zoom key changes the view, not
  the data, as the legend does; the spec's "keys are not blocked" covers it.
- The two sync cases and the drag case are tested at the scene, beside the
  existing sync tests, because a canvas crosshair can't be read in jsdom.
  Everything else is tested at the `useChart` seam (`loading.jsdom.test.tsx`).
- The demo outline no longer claims there is no loading state.
- The changelog entry is written at release (`docs/releasing.md`, step 1), not
  here.
