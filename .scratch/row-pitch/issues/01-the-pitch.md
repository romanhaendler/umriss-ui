# 01 — The pitch

Status: ready-for-agent
Type: feature

## What

- Every line of the table is one row pitch: `.th`, the body's `.td` (rows,
  group headers, placeholders) and the footer's - a height on the cell, no
  vertical padding, a whole-pixel line height. The pitch is
  `max(line + 2 × padding, control-height-sm + 2 × 4px) + 1px` for the line
  under the row, so a compact row grows under a finger with its controls.
- The body's controls take `ControlSizeProvider size="sm"`.
- A cell's value stands in one box (`.value`): no wrap, an ellipsis, clipped
  with room for a focus ring. Without a column width the box is capped at
  `min(20rem, 60vw)`; with one it has inline-size containment and fills.
- "Fit to content" measures the value's whole width, not the cut one.
- One tip per table with the whole value of a cut cell: under the pointer
  after 300 ms, at once on the Active cell, gone on Escape, scroll and leave;
  below the cell, above it where the window ends.

## Acceptance

- Unit: a body control is `sm`; a value box per data cell; the tip shows only
  for a cut value (scrollWidth mocked) and goes on Escape.
- Browser: in Chromium, Firefox and WebKit every row of a table is the same
  whole-pixel height, with and without checkboxes, folds and badges.
