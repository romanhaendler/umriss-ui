# 05 - Tooltip & Legend

Status: done
Type: task

Spec: `.scratch/charts-demo-examples/spec.md`

## Scope

- `01-x-or-nearest`: the same data twice, `mode="x"` and `mode="nearest"`, side by side.
- `02-own-content`: a `render` prop that writes plant language ("Furnace 1 - 812 °C, 4 °C above set point").
- `03-legend-placement`: `placement="top"` and `"bottom"`, and the default.
- A screenshot does not photograph a hover (the reason in `WITHOUT_AN_EXAMPLE`): the examples must be worth looking at without one; the hover itself stays with the interaction suite.
- Remove `tooltip` from `WITHOUT_AN_EXAMPLE`.

## Acceptance

- Smoke test green; pictures renewed, count stated.

## Delivery

- `demo/examples/Tooltip/01-x-or-nearest.tsx` - two furnaces, the same chart
  twice side by side, `mode="x"` and `mode="nearest"`, each under a caption
  that says what the hover would do.
- `demo/examples/Tooltip/02-own-content.tsx` - a `render` prop that writes
  "Furnace 1 - 812 °C, 4 °C above set point", the set point read from the
  datum rather than drawn as a series.
- `demo/examples/Tooltip/03-legend-placement.tsx` - the default and
  `placement="bottom"`, side by side. `"top"` IS the default
  (`src/Legend.tsx`), so a third chart with it would have been a copy of the
  first; the caption and the comment say so instead.
- `demo/data.ts`: `furnaces()`. `demo/demo.css`: `.pair` and `.pair-caption`
  for two charts beside each other under a caption - the caption carries what a
  picture without a hover cannot.
- The page sentence in `demo/outline.ts` promised "the legend on any of the
  four sides"; `placement` has two. It now says "above or below the plot" -
  hence the renewed page head.
- `tooltip` left `WITHOUT_AN_EXAMPLE` - the list is empty now, its removal is
  06. `docs/capabilities.md` points the Legend placement row at the new
  picture.
- Screenshots: 6 new pictures (3 examples × light/dark) and 2 renewed (the
  page head `tooltip`, light/dark).
- Nothing snagged against the API. The hover itself stays with the
  interaction suite.
