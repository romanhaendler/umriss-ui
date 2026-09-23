# 12 - Small ones

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 14)

## Scope

- `Chart.height` JSDoc states the default 300.
- `matrixBuckets` computed once per materialisation, not per series redraw.
- The hover path: remove the per-move allocations in `scene.ts` hit/tooltip assembly, or correct the R-5.4 comment - whichever the benchmark shows is honest.
- `sigma` 0 (a constant reference window): no outliers, and a DEV warning that the limits are degenerate.

## Acceptance

- Unit test for `sigma` 0; benchmark figures in `capabilities.md` re-measured if the hover path changed.

## Delivery

- `Chart.height`: the JSDoc states the default 300 and that the chart does not
  take its host's height.
- `matrixBuckets`: kept on the series entry (`buckets`), computed on the first
  draw after a materialisation and dropped with it, and on any change of the
  series' configuration (the colouring). The tooltip chip reads the same
  buckets - before, it scanned every cell for the gradient's range on each
  pointer move over a matrix.
- The hover path: measured, and the comment corrected rather than the code.
  `pointerMove` 20,000 times over three lines in jsdom: about 3 µs per move at
  1,000, 100,000 and 1,000,000 points alike (3.0 / 2.4 / 3.7 µs), heap growth
  within noise. The hit test does allocate a handful of small objects per move,
  independent of the point count - a five-thousandth of a frame. The R-5.4
  comment in `Chart.tsx` now says so, and `capabilities.md` carries the
  measurement beside the FPS table. The FPS figures were not re-measured: the
  hover path of the benchmark's `"x"` mode over lines is unchanged.
- `sigma` 0: finding confirmed, `controlLimits.test.ts` failed first (outliers
  and two-of-three found beyond limits on the centre line). `ruleOutlier` and
  `ruleTwoOfThree` find nothing without a spread; `violations` warns once in
  DEV. Rule 4 was the same degeneracy and is covered with rule 1.

Screenshots: `matrix` and `control-chart` checked (light and dark) - the two
light examples failed on sub-pixel drift of text and line edges, cell colours
unchanged; not renewed.
