# 02: Several series - grouped and mixed

Spec: `.scratch/box-plot/spec.md`

**What to build:** several `<BoxPlot>` series on one x axis stand side by side
within the step, sized by `boxWidth`; a box series toggles from the legend
(`hidden` takes it out of drawing, hit and extent), carries the encoding by
marks a bar would, takes `color` and `tone`, and mixes with `Line` and
`LimitLine` in one chart.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Grouping by the step; the rule for boxes beside bars on one x axis decided and written in a comment here
- [ ] jsdom: legend toggle, `hidden` out of extent, tooltip with a box and a line at one x, encoding chip in the legend
- [ ] Demo examples "grouped" (before/after with legend toggle), "with specification limits" (`LimitLine`s, a box at `tone="alarm"`), "detailed" (box per shift plus a `Line` of the medians, tooltip, data table); baselines light and dark

## Comments

**2026-10-01 (during 01):** The grouping rule is decided by the simpler rule in
the existing grouping: boxes and bars on one x axis form **one** group - one
step, one width fraction (the first member's), side by side in registration
order (`barGroups` in `bars.ts`, `kind === "bar" || kind === "box"`). Different
`barWidth`/`boxWidth` in one group warn in DEV, as different `barWidth` did.
Built with 01 because the box's placement runs through the same call; still to
prove here: several boxes side by side, and the hover marker - which, as a
bar's, sits at the x value rather than the centre of its grouped mark (B11).
