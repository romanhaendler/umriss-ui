# 05 — The mixed tile and the record

Status: done

Spec: `.scratch/mixed-series-kinds/spec.md`
Blocked by: 01, 02, 03, 04

## Scope

The change's whole point, demonstrated and guarded — and the written record
brought back into step with the code.

- **A mixed demo tile.** One `<Chart>` containing all four kinds against shared
  axes, with a legend and a tooltip: bars behind, an area over them, a line over
  that, and a scatter on top. Written in that order in the JSX, because that is
  the rule.
- **Screenshot baselines** for the tile in both themes, alongside the existing
  five tiles.
- **An interaction test** hovering the mixed chart, asserting that the tooltip
  lists an entry for every kind at that position, and that the overlay marker for
  the bar series sits at the top of its bar rather than at its foot.
- **Update the capability record** (`packages/charts/STATUS.md`): the container's
  new name, one section per new kind with the level each behaviour is proven at,
  the pure bar-geometry module, and the mixed tile. Remove the rows that describe
  behaviour that no longer exists under that name.
- **Re-measure the performance figures.** The recorded numbers were taken with
  three line series. Take them again with a mixed set — a filled area and a
  per-bar rectangle are different work from one stroked path — and record what was
  measured alongside the numbers, so the table stops implying a guarantee that was
  never tested for those kinds.
- **Move the resolved items off the open list.** The record's open section names
  the non-goals this work has changed; leave the ones still out of scope and
  remove the ones that are now decided, pointing at ADR-0001 and ADR-0002.

## Acceptance

- The mixed tile renders all four kinds in one plot area, one legend, one
  tooltip, and its baselines exist in both themes.
- The interaction test passes, including the bar marker position.
- The capability record names no component that no longer exists and claims no
  level of proof that is not actually in place.
- The performance table states what was measured.
- The full unit, interaction and screenshot suites pass.

## Notes

The tile is documentation as much as it is a test. Make it a chart someone would
actually draw — a total as bars with a rate as a line over it, say — rather than
four arbitrary series stacked to exercise the code. A demo that shows why you
would mix kinds is worth more than one that shows that you can.

Pick the area's fill opacity here, against this tile, in both themes. It is the
one number in the whole change that can only be judged by looking.

Re-measuring is not optional bookkeeping. The recorded numbers are the package's
central claim, and after this work they describe a configuration that is no
longer the only one. Leaving them unqualified would turn a measurement into a
promise.
