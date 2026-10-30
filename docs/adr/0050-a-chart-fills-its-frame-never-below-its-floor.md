# A chart fills its frame, never below its floor

Status: accepted
Date:   2026-10

A dashboard sets a chart beside a calculation in a grid of two columns, each
in a card. The calculation grows and shrinks as its groups fold, and the chart
should keep to the height of the row. The chart took its host's width but a
fixed height of 300 px, so the developer had to guess a number that was wrong
as soon as anything folded.

The rules:

- **Without `height`, a chart fills its frame and never goes below 300 px.**
  The root is `height: 100%` with `min-height: 300px`. Where the frame has no
  definite height, the percentage resolves to auto and the floor stands. A
  chart alone in a block is therefore 300 px as before, and never collapses to
  its legend. A number stays a fixed height. A different floor goes through
  `style`.
- **The chart follows its frame both ways.** The plot area was already
  observed in both directions; its canvases are absolutely positioned, so the
  chart contributes its floor to its row and never its current height. The row
  shrinks back when its neighbour does.
- **A card hands its height to its body.** The card is a flex column, the
  header keeps its height and the body takes the rest. A card the grid
  stretches thereby gives its body a definite height, which the chart's
  percentage needs. A card that is not stretched is unchanged.

Considered and rejected:

- **`height="100%"`, as the width has it.** In a card, the usual frame, the
  body has no definite height, so the chart collapsed to its legend without any
  message. It needed a development warning to be safe, and still needed the card
  to change.
- **A `"fill"` value beside a fixed default.** The common case would have
  needed a word in every chart, for a behaviour no developer wants to opt out
  of where the frame has room.

The cost: a chart without `height` in a frame taller than 300 px - beside a
tall table, in a fixed-height container - now fills it. That is visible, and
the changelogs say so. Whatever stands directly in a card is now a flex item,
so margins between direct children no longer collapse.

*Amended 2026-10-25:* a table does not fill its frame; it stays within one. Its
outer frame is at most as tall as a parent of definite height, and its scroll
area takes what the toolbar and pager leave. Where the parent has no definite
height, nothing changes. A table is as tall as its rows and does not stretch:
blank surface under the last row says nothing. A prop was rejected for the
reason `"fill"` was: no one wants to opt out where the parent has a height.

*Amended 2026-10-25:* the schedule follows the chart's rule. Without `height` it fills its frame and never goes below
400 px, its height before; in a frame without a definite height, it is 400 px whatever its lanes. A number stays
a fixed height, and a different floor goes through `style`'s `minHeight`.

*Amended 2026-10-30:* the table part of the amendment of 2026-10-25 is reversed by ADR-0080. A table in a parent of definite height fills it, and a page is what its frame holds; the table contributes only its held page height to its parent. A table in a flowing parent, and one with `maxHeight`, is as tall as its rows as before.
