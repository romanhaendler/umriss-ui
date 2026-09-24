# A chart is one tab stop that walks its hits

Status: accepted
Date:   2026-09

A chart drew its points on a canvas and offered them to nobody without a
pointer: the plot area was `role="img"` with a label, and a keyboard could not
reach a single value (`.scratch/charts-a11y/spec.md`).

**A chart with a tooltip is one tab stop.** Its plot area takes the focus,
carries `role="application"` with `aria-roledescription` "chart", and the arrow
keys move its **Active point** across the positions the pointer would hit. A
polite live region reads what the tooltip shows - after a keystroke, never
after a pointer move. A chart without a tooltip stays an image with a
summary, as before: it has no hits to walk.

## Why one tab stop and not a stand-in per point

A chart library that proxies every point with an invisible button gives each
point real focus, and a tree in core does the same with every row. It fails
here on the long series this package was built for: twenty thousand buttons
for one line, rebuilt on every zoom. One tab stop costs the same at any length,
and the walk reuses the hit model that is already tested against the raw data.

## Why `role="application"`

The sanctioned alternative, `role="group"` with a role description, leaves a
screen reader in browse mode, where it keeps the arrow keys for itself; NVDA
passes them on only sometimes. The application role hands them to the chart
every time. Its known cost - a reader stops offering its own reading keys
inside - is bounded to the plot area, and everything the chart knows is spoken
or described there: the summary, the key help, the live readout.

## Why pointer and keyboard share one point

Two cursors - one the pointer's, one the keyboard's - would draw two
crosshairs and two tooltips the moment a mouse user tabs in. One Active point,
set by whichever input came last, keeps the one picture the chart already has.
It travels over `syncId` as the pointer's hit does. It is no selection
(ADR-0003's distinction): nothing is chosen, and pressing Escape only clears
it.

## Consequences

- The chart gains keys only where it has something to walk; without a
  `<Tooltip>` nothing changes.
- The walk stays inside the visible domain. Zoom and pan by key exist only
  where the caller controls the domain (`onDomainChange`), as the gestures do.
- A data table is not part of this decision; a summary in the description
  covers what the walk does not.
