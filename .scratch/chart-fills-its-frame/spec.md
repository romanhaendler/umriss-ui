# A chart fills its frame, never below its floor

Status: done
Date:   2026-10-07
Origin: grilling session on `@umriss-ui/charts` and core's `Card`. The decision
is in ADR-0050.

## Problem Statement

A developer lays out a dashboard as a `Grid` of two columns: on the left a
`Card` holding a `Calculation` that grows and shrinks as its groups fold open
and closed, on the right a `Card` holding a **Chart**. They want the chart as
tall as the row, so that the two cards end on one line. Today:

- `height` takes pixels only (default 300). The chart never takes its host's
  height, although it takes its host's width.
- They have to guess a pixel height. It is wrong as soon as the calculation
  folds open or closed, or the wording changes the number of lines.
- `height="100%"` would not help either: a `CardBody` has no height of its own,
  so a percentage finds nothing to refer to and the chart collapses to its
  legend.
- The comment on `style` says a height set there is one the scene does not know
  about. That is no longer true, since the plot area is observed in both
  directions, but it keeps developers away from the one workaround there is.

## Solution

- **Without `height`, a chart fills its frame and never goes below its floor
  of 300 px.** Standing alone in a block, it is 300 px tall, exactly as today.
  In a stretched grid cell, a stretched flex item or a frame of definite height,
  it takes that height. A number keeps meaning a fixed height.
- **The chart follows its frame both ways.** When the calculation beside it
  folds open, the row grows and the chart grows with it. When it folds closed,
  the chart shrinks back to the larger of the row and its floor. It never
  stays at its largest height.
- **A `Card` passes its height on to its body.** A card that the grid stretches
  hands the extra height to its body, so that "Grid → Card → Chart" fills
  without anything written.
- **A different floor** is set through `style={{ minHeight }}`, which already
  goes to the root.

The lead case, for the test and the demo:

```tsx
<Grid columns={2}>
  <Card>
    <CardHeader title="OEE so far" />
    <CardBody>
      <Calculation aria-label="OEE of the shift so far">…</Calculation>
    </CardBody>
  </Card>
  <Card>
    <CardHeader title="Tile length" />
    <CardBody>
      <tileLength.Chart ariaLabel="Tile length after firing, individuals chart">…</tileLength.Chart>
    </CardBody>
  </Card>
</Grid>
```

## User Stories

1. As a developer, I want a chart without `height` to fill the cell of a grid
   row, so that the chart and its neighbour end on one line without me working
   out a pixel height.
2. As a developer, I want a chart inside a `Card` inside a `Grid` to fill the
   card's body, so that the pattern I build dashboards with works without any
   extra prop.
3. As a developer, I want a chart beside a `Calculation` to grow when a group of
   the calculation folds open, so that the row stays even while the reader
   explores.
4. As a developer, I want the chart to shrink back when the group folds closed,
   so that the row does not keep the height of its tallest moment.
5. As a developer, I want a chart standing alone in a block to be 300 px tall,
   as today, so that nothing I already built changes.
6. As a developer, I want a chart never to collapse to its legend, so that a
   container without a height does not leave an empty chart without any
   message.
7. As a developer, I want `height={240}` to keep meaning a fixed 240 px, so
   that a chart I sized on purpose stays as it is.
8. As a developer, I want to set a lower or higher floor with
   `style={{ minHeight: 200 }}`, so that a short neighbour does not lift the
   row to 300 px when I do not want that.
9. As a developer, I want the height of a chart to include its legend, as it
   does today with pixels, so that the chart fits its frame and the plot area
   takes what the legend leaves.
10. As a developer, I want a chart in a flex column of definite height, between
    a header and a footer, to shrink to fit rather than overflow, so that a
    full-height page layout works.
11. As a developer, I want a chart in a frame of definite height (a `div` with
    `height: 400px`) to take that height, so that I can size a chart through
    its container.
12. As a developer, I want the plot area to be redrawn crisply at its new size
    within a frame, so that a growing row never shows a stretched or blurred
    image.
13. As a developer, I want a card that is not stretched to look exactly as
    before, so that the card change does not disturb any other page.
14. As a developer, I want a stretched card without a chart to look exactly as
    before, so that the extra height in its body is not visible.
15. As a developer, I want a collapsible card that holds a chart to fold away
    as before, so that the fill does not break folding.
16. As a developer, I want a collapsible card that holds a chart and is open to
    fill its frame like any other card, so that collapsible and plain cards
    behave alike.
17. As a developer reading the `height` prop's description, I want to be told
    that leaving it out fills the frame with a floor of 300 px, so that I know
    what the default does without trying it.
18. As a developer reading the `style` prop's description, I want it to say
    truthfully that a height or minimum height set there is followed, so that I
    am not warned away from a working option.
19. As a reader of the demo, I want to see the kiln line's OEE calculation
    beside the tile length chart, so that I see a calculation and a chart share
    a row.
20. As a reader of the demo, I want the chart beside the calculation to follow
    as I fold the OEE's groups open and closed, so that the behaviour is shown
    and not only described.
21. As a maintainer, I want the change to show up in the changelogs of charts
    and core as a visible change, so that a developer whose chart now fills a
    taller frame knows why.
22. As a maintainer, I want the screenshot suites to show no change for
    charts standing alone, so that the floor is proven to equal the old
    default.
23. As a schedule user, I want the schedule's own height to be unaffected, so
    that the plan keeps the height I gave it.

## Implementation Decisions

- **Chart, `height`**: the type stays `number`, the default changes from 300
  to "fill". Left out, the root gets a height of 100% and a minimum height of
  300 px. A percentage that finds no definite height resolves to auto, and the
  minimum height takes over. That is what makes the floor and the fill one rule.
  With a number, the root gets that fixed height as today and no minimum.
- **Chart, the root's other styles**: `style` goes after these, as today, so
  `minHeight` and `height` set there win. No new prop for the floor.
- **Chart, resize**: no change. The plot area is already observed in both
  directions, and the scene coalesces the reports onto one frame and applies
  the last one (R-2.10). The canvases stay absolutely positioned, so the chart's
  contribution to its row is its floor and never its current height. This is
  what lets the row shrink back.
- **Chart, descriptions**: the `height` description states the fill and the
  floor; `@default` names it. The `style` description no longer says a height
  set there is unknown to the scene.
- **Card (core)**: the card becomes a flex column. The header keeps its height.
  The body, and in a collapsible card the fold's wrapper, take the rest
  (`flex: 1 1 auto`). The fold's inner element becomes a flex column too, so
  that the body fills it. A flex item's height after flexing is definite, so
  the chart's percentage finds its reference in the body's content box, inside
  its padding.
- **Card, effect elsewhere**: a card that is not stretched is unchanged,
  because the body grows only when the card is taller than its content. A
  stretched card without a chart moves its extra space from beneath the body
  into the body; both have one surface, so nothing is seen. Whatever stands
  directly in a card becomes a flex item: its width stays (flex items stretch
  across as blocks do), but margins between direct children no longer
  collapse. Before the change, look for anything in the workspace's sources
  and demos that puts something other than `CardHeader` and `CardBody` directly
  into a `Card`; list what was found in the delivery report. Two bodies in one
  card share the extra space; accepted as an edge case.
- **Card, folding**: unchanged. Folded, the inner element clips at 0, a chart's
  floor included.
- **Kiln line scenario**: the OEE region and the tile length region stand side
  by side in a grid of two columns; the tile length chart loses its `height`.
  The other regions keep theirs. The callouts of the scenario page are checked
  and moved if the layout moves them.
- **Release**: a minor version of `@umriss-ui/charts` (a changed default) and
  of `@umriss-ui/core` (the card's layout), each with a changelog entry that
  names the change as visible: a chart without `height` in a frame taller than
  300 px now fills it.
- **No new exports, no new tokens, no wording.**

## Testing Decisions

- **A good test reads what the reader sees**: the measured boxes of the plot
  area and of the cards in a real browser. It never asserts on inline styles,
  class names or the scene's fields. jsdom computes no layout, so no unit test
  can prove the fill; none is written for it.
- **One new seam: a feature test of the kiln line scenario** in core's visual
  suite, next to the scenario tests already there. Prior art: the existing
  tests of the control room scenarios, and the box measurements in core's basic
  feature tests. It covers:
  1. the two cards of the row end on one line, and the chart's plot area fills
     the body of its card down to the body's padding;
  2. folding a group of the OEE calculation open makes the row taller, and the
     plot area grows by the same amount within a frame or two;
  3. folding it closed again makes the plot area shrink back to its first
     height.
  Wait for the size through the measured box, not through a fixed timeout.
- **Existing seams as regression net**: the screenshot and forced-colours
  suites of charts and core run unchanged. A chart standing alone without
  `height` stays at 300 px, so its baseline does not move; a card that is not
  stretched does not move. Every baseline that changes is a place where a chart
  now fills, or where the scenario was rearranged. Each is looked at and
  listed in the delivery report as accepted on purpose.
- **The demo smoke tests and the props tables** cover the changed default as
  they do today.

## Out of Scope

- A `height="100%"` or `"fill"` value, or any string for `height`. Leaving it
  out is the fill.
- A `minHeight` prop on the chart. `style` covers it.
- A development warning for a collapsed chart. The floor makes the collapse
  impossible.
- The schedule's `height`, the table's height, and any other component following
  its frame.
- Changes to `Grid` or `Stack`. They stretch their items already.
- Smoothing redraws during an animated height (for example a collapsible card
  folding in the same row). The chart redraws once per frame for the 240 ms of
  the animation; measure it only if a series of a million points makes it
  visible.

## Further Notes

- The decision, with the alternatives `height="100%"` and a separate `"fill"`
  value, is recorded in ADR-0050.
- The width already works this way: `"100%"` by default, followed through the
  same observer. This change gives the height the same freedom, with a floor
  because a block has no height to give.
