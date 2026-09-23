# 03 - Downsampling

Status: done
Type: task

Spec: `.scratch/charts-long-series/spec.md` - row 03 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- New pure module `src/downsample.ts`: `downsample(course, from, to, m, b,
  width)`. It cuts the window of the x domain plus one point beyond each edge
  (`lowerBound`); at two points per pixel column or fewer it returns views onto
  that window, no copy; above it keeps first, min, max and last per column and
  the first gap in a column, in x order, and gathers them (a baseline channel at
  the same points). The scene's `drawItems` runs it for Line and Area only; Bar,
  Scatter, StateBand and Matrix draw their points as before. The hit test still
  reads `entry.materialized` - the raw data.
- Tests first: `downsample.test.ts` (5: the window below the threshold, four
  per column with the spikes kept, a gap kept and x ascending, the baseline
  channel, the window of a zoomed course), red before the module existed; a
  jsdom scene test that the tooltip names a reading the drawing dropped.
- Benchmark re-measured with a script over the demo build's benchmark page
  (Chromium headless, median of five loads per row), before and after on the
  same machine and day. Series draw, lines: 0.3 → 0.1 ms (1k), 7.6 → 2.6 ms
  (100k), 47.0 → 8.2 ms (1M); mixed: 0.3 → 0.3, 14.5 → 8.9, 100.4 → 57.3 ms
  (the bar is never thinned). Materialisation unchanged (8-9 ms at 100k, 51-52
  ms at 1M); hover 60 FPS throughout. `docs/capabilities.md` carries both
  columns.
- Example `Benchmark/02-a-week-of-seconds.tsx`: 2 × 604,800 kiln readings,
  zoomable, `domain="visible"`, showing the series draw (whole week 8-23 ms, a
  zoomed 45 minutes 0.6 ms). It measures, so it joins the benchmark in
  `NOT_PHOTOGRAPHED` (`tests-visual/pages.ts`) with the same rule. The first
  benchmark's comment no longer says "no downsampling".
- Screenshots: none new, none renewed. `axis--zoom-and-pan` (10,080 points in
  ~880 px, so downsampled) matches its picture from before the change. Two full
  runs of the suite failed 13 and 22 unrelated examples, a different set each
  time (bar, scatter, state band among them - kinds the change does not touch);
  the diffs are antialiasing and tick text, the known drift.
