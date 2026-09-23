# 04 - The tooltip formats with the axis

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 6)

## Scope

- A point's value in the built-in tooltip is formatted with its y axis' `tickFormat`, falling back to today's default. (`charts-essentials` 02 puts a per-series `format` in front of it.)
- The header's x value: with several x axes, each point from a different x axis carries its own x value, formatted with its own axis.

## Acceptance

- Interaction or jsdom test first: a percent `tickFormat` shows "42 %" in the tooltip; two x axes show two x values.
