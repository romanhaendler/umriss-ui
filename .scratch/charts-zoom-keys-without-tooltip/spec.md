# Zoom keys on a chart without a tooltip

Status: needs-triage
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
