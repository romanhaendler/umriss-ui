# 04 - Final polish round

Status: done
Type: task

Spec: `.scratch/charts-alternatives/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

### Done (2026-09-25)

The user took every card on the review page; implemented as decided:

- **tooltip-chips-forced**: under forced colours each tooltip row draws the
  legend's mark (`MarkChip`, now exported from `Legend.tsx`) - dash and
  marker, a bar's hatch, a state's hatch by name, a matrix step's hatch - in
  the system colours, instead of a background chip the contrast mode removes.
  Without forced colours the colour chip stays, `encoding="marks"` included.
- **area-chip**: an area's legend chip is its faint fill with the fill's hatch
  in its own colour and the dashed outline along the top.
- **state-thinning**: `tableRows` thins a band (`changesOnly`) to its first
  reading and each change of state - a gap a state of its own - instead of
  first/lowest/highest/last per stretch.
- **state-hatch-index**: `stateHatches` in `marks.ts` gives each state name
  the hatch of the place it first takes across the chart's bands; the legend
  and every band draw from it. A single band is hatched as before.

Tests: `marks.test.ts` (hatch by name), `table.test.ts` (a band thinned to
its changes), `encoding.jsdom.test.tsx` (area chip, a state hatched alike in
two bands, the tooltip's marks under forced colours and its colour chips
otherwise). Moved baselines: `marks-on-every-kind` light/dark and its forced
pair - only the Corridor chip, from a dotted line to a hatched swatch under a
dotted top; each looked at (they passed inside the tolerance, the chip being
small, and were renewed because their pixels changed). Full charts suite 197
passed, twice over.
