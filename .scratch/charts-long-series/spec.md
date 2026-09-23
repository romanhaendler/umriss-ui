# Long courses on a plant screen

Status: ready-for-agent
Date:   2026-09-23
Origin: `.scratch/charts-review/spec.md`, decisions Q12, Q19-Q21, Q24.
Blocked by: `.scratch/charts-essentials/` (the time axis).

## Problem Statement

A week of one-second readings is 600,000 points per series. The chart draws
them all at every change, cannot be zoomed into, lets the y axes stay scaled
to the whole week when the reader looks at one hour, and three stacked charts
of one line do not share a crosshair.

## Solution

| Issue | API |
|---|---|
| 01 Zoom and pan | Controlled: `XAxis onDomainChange?: (domain: [number, number]) => void`. Wheel, drag and pinch propose a domain; double click proposes the whole data range. Without a handler, no zoom. The schedule's interaction model is the pattern, not the code. |
| 02 Visible domain | `YAxis domain="visible"`: the extent of the points inside the current x domain. |
| 03 Downsampling | Automatic for Line and Area above 2 points per pixel column: first, min, max, last per column. Bar and Scatter never. The tooltip's binary search runs on the raw data. Benchmark figures re-measured. |
| 04 Cursor sync | `Chart syncId?: string`. Only the x position in domain units is shared; each chart draws its crosshair there; the tooltip only under the pointer. Zoom is not synced - the caller passes one controlled domain to all. |
| 05 `alignTicks` | `YAxis alignTicks?: boolean` on a further y axis: takes the first y axis' tick count, widens its own domain until its ticks fall on that grid; steps stay 1-2-5. |
| 06 Capabilities and release | Rows for 01-05; the list under "Later"/"Out" updated; minor release. |

## Testing

Unit tests first for 02, 03, 05 (pure: extent, downsample, align); interaction
tests for 01 and 04; one example each on `Axis` (01, 02, 05), `Benchmark` (03)
and `Chart` (04).
