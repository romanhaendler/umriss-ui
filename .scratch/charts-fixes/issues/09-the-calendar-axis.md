# 09 - The calendar axis

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 11)

## Scope

- x limits on a calendar axis are mapped into operating time, for placement and for the extent.
- Explicit `ticks` on a calendar axis are given in wall-clock time and mapped.
- Day and 6/12 h ticks fall on **local** boundaries: the offset logic the schedule keeps as `localOffset` moves into `operatingTime.ts`, is exported, and the schedule imports it from there (its own copy deleted). `charts-essentials` 01 builds the time axis on it.

## Acceptance

- Unit tests (operating time, scene) first, one of them under `TZ=Europe/Berlin`: the day tick sits at local midnight.
- Schedule tests stay green.
