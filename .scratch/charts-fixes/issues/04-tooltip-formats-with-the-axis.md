# 04 - The tooltip formats with the axis

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 6)

## Scope

- A point's value in the built-in tooltip is formatted with its y axis' `tickFormat`, falling back to today's default. (`charts-essentials` 02 puts a per-series `format` in front of it.)
- The header's x value: with several x axes, each point from a different x axis carries its own x value, formatted with its own axis.

## Acceptance

- Interaction or jsdom test first: a percent `tickFormat` shows "42 %" in the tooltip; two x axes show two x values.

## Delivery

Finding confirmed: `tests-unit/tooltipFormat.jsdom.test.tsx` (the scene bound in
jsdom, `TooltipHtml` rendered) failed first - "1.0Load42" instead of "42 %",
and no "B105" for a point on a second x axis.

The scene now writes the built-in tooltip's rows once per hit
(`HoverSnapshot.rows`, not per pointer move): a state's name, a cell's value in
the default format, every other value in its y axis' `tickFormat` with the
default as fallback; a point whose x axis is not the header's carries its own x
label (`.uc-tooltip-x`, beside the name). `TooltipHtml` renders the rows, and
its own `valueText` is gone. `TooltipPoint` gained `xValue`, the point's own x.
`findXAxis` became `findAxisConfig(orientation, id)`, used for both. The x label
of the header is computed on a change of hit only, no longer on every move.

A per-series `format` in front of it is `charts-essentials` 02. Interaction,
accessibility, own-base and shell suites green; no screenshot shows a tooltip,
none renewed.
