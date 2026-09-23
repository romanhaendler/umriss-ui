# 03 - Colours of states and cells

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bugs 3, 5, 14 palette)

## Scope

- Matrix: no palette colour in legend or tooltip; its legend entry shows the gradient or the limit set's colours, its tooltip chip the cell's colour.
- StateBand and Matrix take no place in the palette - the next Line gets `--uc-series-1`, not a later one.
- Legend hover on a state shared by several StateBands highlights all of them.

## Acceptance

- Unit tests (scene) first for all three; screenshots of affected examples renewed, count stated.

## Delivery

All three findings confirmed by tests written first and seen failing:
`sceneLimitsAndBands.test.ts` - "A state band and a matrix colour themselves"
(gradient chip, assessment chip, first line after a band and a matrix gets
`--uc-series-1`, a nameless one counts only colour-taking series) and "highlights
every band that shares a state"; `sceneFrame.jsdom.test.ts` - the tooltip chip
of a matrix cell is the cell's stop.

Fix in `scene.ts`: `takesPalette()` keeps state and matrix out of the palette
slots and out of a nameless series' position; the matrix' legend entry is a
hard-stop `linear-gradient` of its colours (the chip is a CSS background); its
hit carries the cell's colour, bucketed by the same `bucketOf`/`gradientRange`
the drawing now uses (split out of `matrixBuckets`); a legend entry carries
`seriesIds`, and a later band sharing a state joins it.

Screenshots renewed: 4 (`stateband--under-a-course` and
`limitline--limits-and-state`, light and dark - the temperature line is now the
first palette colour). Viewed. The matrix example has no legend, so no picture
of it changes.
