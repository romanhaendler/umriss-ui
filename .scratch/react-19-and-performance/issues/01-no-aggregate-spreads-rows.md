# 01 - No aggregate spreads rows into a call

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/react-19-and-performance/spec.md`, "The table", first fix; user stories 22, 23

## What to build

A table of 200 000 rows with an **Aggregate** opens. Today it throws a
`RangeError` above roughly 125 000 rows, because the rows' values are spread
into the arguments of one call - in the aggregate model for minimum, maximum
and range, and where the footer finds the decimals of a sum or an average.
A loop takes the place of every such spread. Nothing else about the
aggregates changes here: where they are computed is ticket 13.

The whole table package is searched for the pattern, not only the two places
the spec names: any spread of an array whose length follows the row count
into a call.

## Acceptance

- [ ] A virtualised table through `useTable` with 200 000 rows, a footer with
      sum and average and a column whose aggregate is a range renders without
      throwing, and the footer shows the right values.
- [ ] The aggregate model's own case table gains minimum, maximum and range
      over 200 000 values, numbers and dates.
- [ ] No spread of a row-sized array into a call remains in the table's
      source.
- [ ] `pnpm check table` passes.
