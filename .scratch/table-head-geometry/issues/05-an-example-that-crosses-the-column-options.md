# 05 - An example that crosses the column options

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-a-right-aligned-head-without-a-hanging-arrow.md`, `03-a-group-label-in-the-centre.md`, `04-the-group-rule-one-device-pixel-at-every-zoom.md`
Spec: `.scratch/table-head-geometry/spec.md` (Testing Decisions, "One example that crosses the column options")

## What to build

A developer reading the table's demo sees one example where every column
option meets every other in a head, and a maintainer has every combination
under the head-geometry check and the screenshot suite - not only the ones
the other examples happen to show.

An ordinary example on the table's demo, with its lead and its code, whose
columns cross: left and right alignment; a column filter (none, list,
range); a width (automatic, flex, sized); a pin (none, start, end); place
(first, middle, last); a `ColumnGroup`; a time column with the zone's name.
It is shown in both densities. The head-geometry check walks it like every
other example (sorted, ranked, narrowed), the group-rule check measures it,
and the screenshot suite photographs it.

## Acceptance criteria

- [ ] The example passes the shell's page rules and the demo gates (`pnpm check:site`).
- [ ] Each option above is present in at least one column, and right alignment meets each of filter, sized, pinned, last place and rank in one column at least.
- [ ] The head-geometry check and the group-rule check pass on it, in Chromium and WebKit.
- [ ] Its screenshot baselines (light and dark) are looked at before they are added.
- [ ] When the last ticket is done, the folder `.scratch/table-head-geometry/` goes, with its probe.
