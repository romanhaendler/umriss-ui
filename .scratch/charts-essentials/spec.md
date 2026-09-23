# What a plant screen expects of a chart

Status: ready-for-agent
Date:   2026-09-23
Origin: `.scratch/charts-review/spec.md`, decisions Q11, Q13, Q15-Q18, Q22.
Blocked by: `.scratch/charts-fixes/` (09 provides the local offset, 04 the
axis format fallback).

## Problem Statement

Timestamps on an axis without an operating calendar are formatted as plain
numbers. The tooltip cannot say "°C" without a full `render` prop. A set point
or a digital signal can only be drawn as a ramp. A series cannot be hidden. A
chart without data draws an empty frame on [0,1] and says nothing. `tone` and
`dash` exist for some kinds and not for others.

## Solution

| Issue | API |
|---|---|
| 01 Time axis | `XAxis time?: boolean`; `calendar` implies it. Ticks on local boundaries (minute … month); labels `Intl.DateTimeFormat("en-GB", { hourCycle: "h23" })` by level - `15:00`, `17 Mar`, `Mar 2026`; the first tick after a level change carries the date (`17 Mar 00:00`). The calendar axis takes the same labels; `dd.MM. HH:mm` goes. German via `tickFormat`. |
| 02 Value format | `format?: (value: number) => string` on every series; fallback the y axis' `tickFormat`, then the default. No `unit`. `ControlChart` passes `format` to its line. |
| 03 Step line | `Line step?: boolean` - sample-and-hold; a gap breaks the step; the tooltip stays at the sample. |
| 04 Hidden series | `hidden?: boolean` on every series, controlled; `Legend onToggle?: (name: string) => void` - without it the legend is not clickable. A hidden series does not count for its axis' extent; a fixed `domain` keeps the axis still. A hidden entry stays in the legend, drawn back. |
| 05 Empty state | `Chart empty?: ReactNode`, default `"No data"`, centred in the plot area when no visible series has a valid point; axes and frame stay. |
| 06 `tone` and `dash` | `tone` on Area, Bar, ControlChart; `dash` on Area's outline. Every size prop's JSDoc names its unit (Q13). |
| 07 Capabilities and release | "Deliberately open" replaced by "Later" and "Out", each with its reason (Q12); capability rows for 01-06; minor release. |

## Testing

Each issue: unit tests first (ticks, materialisation, scene, jsdom as fits),
one screenshot example on the page it belongs to - `Axis` for 01, `Tooltip &
Legend` for 02 and 04, `Line` for 03, `Chart` for 05.
