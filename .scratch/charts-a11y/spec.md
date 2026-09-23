# The charts for keyboard and screen reader

Status: needs-triage
Date:   2026-09-23
Origin: `.scratch/charts-review/spec.md`, decision Q11 (f) and Q26.
Blocked by: `.scratch/charts-long-series/` - the hit model after zoom decides
the focus model.

To be grilled when it is due. What is known going in:

- Today the chart has no `tabIndex` and no key handling at all; the plot area
  is `role="img"` with an `aria-label`, the canvas `aria-hidden`, the tooltip
  `role="presentation"` with no live region (R-7.6).
- Open questions: a focus model over points (per series? per x position, as
  tooltip mode `"x"`?), a data table as an alternative for screen readers
  (always in the DOM, or on demand?), a live region for the hovered or focused
  point, and how a zoomed domain bounds the keyboard's walk.
- ADR-0004 (a flat accessibility tree) and ADR-0003 (an active node is not a
  selection) from core are the vocabulary to start from.
