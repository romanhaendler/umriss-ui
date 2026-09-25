# 02 - Drawing, hit and tooltip

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/charts-stacking/spec.md`

## Scope

K4; bars and areas.

## Acceptance

- jsdom tooltip tests; screenshots.

## Comments

**2026-09-25 (agent).** Done. Bars read the foot channel (`BarDrawItem.y0`);
areas already did. The hit marks a stacked point at its top and names it by its
own value (`TooltipPoint.yValue`); under `"nearest"` the segment covering the
pointer wins over a nearer top. The built-in tooltip adds one total row per
stack after its last member in the hit (`HoverSnapshot.totals`, wording
`stackTotal`); the readout reads the totals after every series. The summary's
ranges and the data table use the own values; the table has no total column
(listed under "Later" in capabilities.md).

Downsampling runs after stacking: each member keeps its own extremes per pixel
column, so inside one column an edge and the foot above it may part by a
stroke - documented at `stackAll()` and in capabilities.md.

Tests: `tests-unit/stacking.jsdom.test.tsx` (tooltip rows and total, a gap left
out and counted as zero, the German total, readout and summary, data table,
extent, hidden member, nearest), `draw.test.ts` (a stacked bar from its foot).
Screenshots: `bar--stacked` and `area--stacked`, light and dark, looked at;
every existing baseline unchanged.
