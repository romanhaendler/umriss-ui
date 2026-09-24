# The charts, corrected

Status: done
Date:   2026-09-23
Origin: `.scratch/charts-review/spec.md`, "Findings - Bugs" 2-14; decisions Q9,
Q10, Q14, Q23, Q25, Q26.

## Problem Statement

A code reading of `@umriss-ui/charts` 0.3.2 found the bugs listed in the
review spec. None is exotic: a percent axis whose tooltip writes raw numbers,
one `x/0` that flattens an axis, isolated readings that vanish, a control chart
that renders forever when its caller keeps the violations in state.

## Solution

One issue per bug or tight group of bugs. **Each starts with a failing test**
that reproduces the finding as stated in the review spec; only then the fix.
Where the test shows the finding to be wrong, the issue is closed with that
test and a note, not with a fix.

`Span` is removed rather than fixed (Q9) - that also retires bugs 1 and 4.

The package ends in a minor release that also carries `charts-demo-examples`.

## Issues

01 Span leaves charts · 02 Sortedness check · 03 Colours of states and cells ·
04 Tooltip formats with the axis · 05 Infinity is a gap · 06 Isolated points ·
07 ControlChart render loop · 08 Limits on the x axis · 09 The calendar axis ·
10 Hit testing · 11 Change detection · 12 Small ones · 13 Release

## Comments

### Status corrected (2026-09-24)

Delivered in commits `charts-fixes 01`-`12`; released as `@umriss-ui/charts` 0.4.0 (`13c6fdf`). The Status line had not been moved when the work landed.
