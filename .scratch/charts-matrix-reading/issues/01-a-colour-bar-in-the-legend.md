# 01 - A colour bar in the legend

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/chart-picture-and-print/issues/04-limits-breaks-and-legend-in-the-picture.md`
Spec: `.scratch/charts-matrix-reading/spec.md`

## What to build

A data scientist's correlation matrix, nine stops over `range: [-1, 1]`, shows in its legend a bar of the
nine steps with "−1" and "1" at its ends and the inner edges' values where they fit.

- **Which entries.** Only a gradient-coloured matrix. An assessment colouring keeps its entry.
- **The values.** The range is the gradient's `range`, else the data's, the one the cells are coloured over.
  The edges are `min + k · (max − min) / steps`, written in the matrix' `format`, else the built-in number
  format. Both ends always; the inner edges at every k-th, with the smallest k at which no two touch.
- **The bar.** 160 px, or the legend's width where narrower. The steps share it equally and keep their hatch
  under `encoding="marks"`. Built of boxes with a background colour and text nodes, so that the picture
  paints it by the rules it has.
- **The name.** The values are `aria-hidden`. The entry's accessible name gains the range through a new
  wording entry `levelRange(from, to)` in both wordings.
- **Unchanged.** Toggle, highlight, the hidden entry's look.
- **The example.** The Matrix page's gradient example shows the bar. Its screenshots change once, on
  purpose.
- **Docs.** The doc comment of `coloring`, the wording entry's doc line, `API.md`, the capability record's
  Matrix and Legend rows, and the changelog under "Added".

## Acceptance criteria

- [ ] A pure test: the edges of three, seven and nine stops over a given range and over the data's range;
      the thinning keeps both ends and drops inner edges that would touch.
- [ ] A jsdom test: the bar's end values read in the matrix' format; the entry's accessible name ends with
      the range in English and in German; an assessment matrix has no bar.
- [ ] The picture's recording-context test paints the bar's values.
- [ ] The gradient example's screenshots, light and dark, are updated once and reviewed; no other screenshot
      changes.
- [ ] `pnpm check charts` and `pnpm check:site` pass, and charts' `API.md` is regenerated.
- [ ] `pnpm test:visual:quick charts` passes.
