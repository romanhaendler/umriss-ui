# 02 - The sortedness check

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 2)

## Scope

- The DEV check runs once per data change for **every** series whose hit test is a binary search (Line, Area, Bar, Scatter, StateBand), and never for Matrix (row-major, linear hit).
- The warning names the series.

## Acceptance

- Unit test first: two series, the second unsorted → one warning naming it; a row-major matrix → none.
