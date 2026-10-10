# Zoom keys on a chart without a tooltip

Status: done
Date:   2026-10-05
Origin: the acceptance of `.scratch/component-view/` (open decision 4); the user chose "later, its own ticket".

## Problem Statement

A chart with a zoomable x axis but no `<Tooltip>` is no tab stop: its plot is
`role="img"` (ADR-0030, "the chart gains keys only where it has something to
walk"). Its zoom keys (+, −, Shift+←/→, 0) are therefore out of a keyboard's
reach; only the 'Show all' button is. A pointer user can zoom such a chart, a
keyboard user cannot.

## Proposal (to be grilled)

A chart with a zoomable x axis is one tab stop even without a tooltip: the
plot takes the focus, the zoom keys work, there is no Active point to walk.
This amends ADR-0030 and needs its own answers: which role the plot carries
then (`application` without a walk?), what the live region reads after a
zoom key, and what the summary's key help says.

## Out of Scope

The walk itself without a tooltip.

## Comments

**Decided 2026-10-10, delivered** (ADR-0030, amended). A chart with a zoomable
x axis is one tab stop without a tooltip: `role="application"` with the same
role description. No walk - arrows without Shift do nothing and are not taken.
The summary names the zoom keys only. After a zoom or pan key the live region
reads the span in view with the existing `visibleRange` wording ("From 10 to
90."), in the axis' own format; after a pointer gesture it reads nothing. No
new wording key. A chart with a tooltip, and one with neither, are unchanged.
