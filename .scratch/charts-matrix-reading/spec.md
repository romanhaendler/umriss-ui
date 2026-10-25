# Reading a matrix: a colour bar and cell labels

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket 22 "The charts' single wishes" (its Answer accepts
the Proposed answer, which left the label's colour to the agent); findings
`.scratch/shakedown/data-science.md` (statistical views: the correlation matrix, "stepped, no colour bar,
no cell labels"); ADR-0011.

## Problem Statement

A `Matrix` coloured across a gradient cannot be read back as a number from the picture. Its legend entry
shows the gradient's steps side by side, with no value at any of them. The cells carry no text. A
correlation matrix with nine stops over `range: [-1, 1]` draws correctly, but a reader cannot tell 0.4 from
0.6 without hovering each cell. A reader who cannot compare two blues never can.

ADR-0011 already gave the answer for the second case: where a ramp cannot carry the number, the cell's value
is reachable as text. The tooltip, the readout and the data table reach it one cell at a time. Nothing puts
it in the picture.

## Solution

- **A colour bar.** The legend entry of a gradient-coloured matrix shows its steps as a bar and writes the
  value at each step's edge under it: the range's two ends always, the inner edges where they fit. The values
  are written in the matrix' `format`.
- **Cell labels.** With `labels`, each cell writes its level where the text fits, and no cell where it does
  not. *(agent)* The text stands in the chart's text colour on a halo of the chart's ground colour. It is
  then legible on any stop, in both themes and under forced colours, without a colour parser (ADR-0011).
- **The stops stay the steps.** A smooth diverging scale stays out (`MatrixColoring`, ADR-0011): whoever
  wants a finer gradation names more stops.

## User Stories

1. As a data scientist, I want the legend of a correlation matrix to name -1 and 1 at the bar's ends, so
   that the colours have a scale.
2. As a data scientist, I want the edge between two steps to carry its value where there is room, so that I
   can tell which step a colour stands for.
3. As a data scientist, I want the colour bar's values in the matrix' `format`, so that they read as the
   tooltip writes a cell.
4. As an operations lead, I want the colour bar to cover the data's range when I name none, so that it states
   the range the colours were spread over.
5. As a reader under `encoding="marks"`, I want the colour bar's steps to keep their hatches, so that the bar
   matches the cells.
6. As a screen reader user, I want the legend entry of a matrix to say its range, so that I hear what the
   colours span without hearing every edge.
7. As a reader who hid the matrix, I want its colour bar drawn back as any hidden entry is, so that hiding
   reads the same everywhere.
8. As a report author, I want the colour bar in the chart's picture, so that a printed matrix keeps its scale.
9. As a data scientist, I want each cell of a small matrix to write its value, so that the correlation of
   two variables reads without a hover.
10. As an operations lead with a matrix of 24 hours by eight services, I want cells too small for their text
    to stay without one, so that the grid is not covered in clipped numbers.
11. As a reader in the dark theme, I want a cell's label to stay legible on the lightest and the darkest
    stop, so that the theme does not decide which labels I can read.
12. As a reader under forced colours, I want the labels in the system colours, as the axes are, so that they
    stay legible in the contrast mode.
13. As a reader, I want a hole to carry no label, so that a missing level does not look like a reading.
14. As a reader hovering the legend, I want a dimmed matrix' labels dimmed with its cells, so that the
    highlight reads as it does on other kinds.
15. As a developer, I want cell labels off by default, so that existing matrices and dense heat maps stay as
    they are.
16. As a developer, I want the labels in the matrix' `format`, so that one function writes a level wherever
    it appears.

## Implementation Decisions

- **The colour bar.**
  - Only a gradient-coloured matrix gets one. *(agent)* An assessment-coloured matrix keeps its entry: its
    three colours are verdicts, not numbers, and the tooltip names them.
  - The range is the gradient's `range`, else the data's: the same range `bucketOf` spreads the colours
    over, so the bar names the steps the cells are drawn in. A step's edges are
    `min + k · (max − min) / steps`, for `k` from 0 to the number of stops.
  - *(agent)* **Size:** the bar is 160 px wide, or the legend's width where that is narrower (a side
    legend, `.scratch/charts-small-additions/`). The steps share it equally and keep their hatch.
  - *(agent)* **Which edges:** both ends always. The inner edges are labelled at every k-th edge, with the
    smallest k at which no two labels touch, as ticks are thinned.
  - The values are written in the matrix' `format`, else the built-in number format: the tooltip's text for
    a level.
  - *(agent)* **Built of boxes and text,** each step a box with its background colour (under `encoding="marks"`
    the existing mark chip of the step), each value a text node. Those are the parts
    `.scratch/chart-picture-and-print/` ticket 04 paints, so the bar is in the picture without a rule of its
    own.
  - *(agent)* **Accessible name:** the values are hidden from assistive technology. The entry's name gains
    the range through a new wording entry, `levelRange(from, to)`: "from −1 to 1", "von −1 bis 1" in
    `GERMAN_CHARTS_WORDING`. `wording` is a `Partial`, so the new key breaks no caller.
  - The entry still toggles, highlights and is drawn back when hidden, as every entry.
- **Cell labels.**
  - `labels?: boolean` on `Matrix`, default `false` *(agent)*: a dense heat map would be all clipped text,
    and every existing matrix' picture stays.
  - The text is the level in the matrix' `format`, else the built-in number format.
  - *(agent)* **Fit:** a label is drawn where its measured width plus 4 px and its line height plus 2 px fit
    in the cell's drawn rectangle; elsewhere none, never truncated. Where the cells are lower than one line,
    nothing is measured.
  - *(agent)* **Colour: a halo.** The text is drawn in the resolved theme's text colour (`colorText`), over a
    stroke about 3 px wide of its ground colour (`colorBg`), in the tick size and the chart's font. The
    alternative was a text colour per stop. It would be one more list for the caller to pair with the
    stops, and the caller would do the contrast. It would also need a second answer for an assessment
    colouring. The halo needs no API, follows a theme switch and forced colours with the axes, and parses no
    colour.
  - A hole carries no label; a hidden matrix draws none; the legend's highlight dims them with their cells.
  - They are drawn on the series layer after the cells, so the picture's redraw of that layer has them.
  - The keyboard walk, the tooltip, the readout and the data table are unchanged: they already reach every
    cell's value.
- **Docs.** The doc comments of `labels` and of `coloring` (the colour bar), the wording's doc line,
  `API.md`, the capability record's Matrix and Legend rows, and the changelog under "Added". No ADR: both are
  readings of what ADR-0011 already decided.

## Testing Decisions

- A good test asserts what a reader sees and hears: the colour bar's texts and the entry's accessible name,
  the labels a recording context draws, their absence where they do not fit. It does not assert on pixel
  positions beyond what a layout check measures in the browser.
- **The edges:** a pure test of the edge values and the thinning, beside the colouring's existing tests
  (prior art: the matrix colouring in `sceneColors`, tested in `sceneLimitsAndBands.test.ts`).
- **The legend:** a jsdom test (prior art: `legendToggle.jsdom.test.tsx`) reads the colour bar's ends, the
  entry's name with its range in English and German, and that an assessment matrix has no bar.
- **The labels:** a draw test with a recording context (prior art: `draw.test.ts`) gives the texts drawn
  for a small grid, none for a hole, none for a cell too small, and the halo stroked before the fill.
- **The picture:** where `.scratch/chart-picture-and-print/` ticket 04 has landed, its recording-context
  test paints the colour bar's values.
- **Visual:** the gradient example's screenshots change once, for the colour bar, and are reviewed. A new
  correlation example with labels gets its screenshots in both themes and under forced colours (prior art:
  `forced-colors.spec.ts`).
- **Gates:** the props gate (`labels` shown), the demo smoke test, `check:site`.

## Out of Scope

- A smooth or diverging interpolated scale (ADR-0011).
- A colour bar for an assessment colouring.
- A vertical colour bar.
- Labels in a colour per stop, or a label colour prop.
- A label `format` separate from the matrix' `format`.
- Labels on any other kind.

## Further Notes

- Ticket 01 waits for `.scratch/chart-picture-and-print/` ticket 04: both work on the legend's parts that
  the picture paints, and the bar is to be built from the parts that ticket can paint.
- `.scratch/charts-recipes/` ticket 06 (density as a matrix) waits for ticket 01 here: counts drawn as colours
  are only read back with a colour bar.
- `.scratch/root-contract/` ticket 05 renames `ariaLabel`; new examples use the name `Chart` takes when they
  land.
