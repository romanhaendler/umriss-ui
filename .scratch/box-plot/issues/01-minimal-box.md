# 01: A minimal box, end to end

Spec: `.scratch/box-plot/spec.md`

**What to build:** a caller writes `<BoxPlot>` with the five numbers (median,
lower and upper quartile, lower and upper whisker) and sees one box per x on the
numeric x axis, named by `tickFormat` or on a time axis; reads it in the
tooltip, the readout and the data table top to bottom as drawn (B9); walks box
to box with the arrows, the marker on the median (B11); in English and German.
A missing median is a gap. The look starts from B12; colours from the theme and
forced colours.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

- [x] Kind `"box"` in the closed union, `<BoxPlot>`, `BoxPlotProps` and the config type exported at the end of the index
- [x] Named channels for the four further numbers, null for every other kind (`materialize.test`, ADR-0011)
- [x] Extent spans the whisker ends; a gap draws nothing and is no hit
- [x] jsdom: tooltip and readout order, data table columns, keyboard walk, `format`/`tickFormat`, German wording, extent through tick labels
- [x] Demo examples "minimal" (three machines) and "over time" (response time per hour), screenshot baselines light and dark
- [x] `capabilities.md` (box plot out of "Later"; violin and jitter to "Out" with reason), charts `CHANGELOG`, `CONTEXT.md` **Series kind** list current
- [ ] Shown rendered to the user before 02-04 start

## Comments

**2026-10-01, agent:** Built. The four further numbers live in one named
channel group, `MaterializedSeries.box` (null for every other kind), rather
than four flat fields - ticket 03 and 04 add theirs inside it. Boxes join the
bar group (see 02's comment). `boxWidth` defaults to 0.8 like `barWidth`; the
look of B12 is as specified, for 05 to settle. Left: showing it rendered to the
user.
