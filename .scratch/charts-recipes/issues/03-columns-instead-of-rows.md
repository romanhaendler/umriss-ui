# 03 - Columns instead of rows

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/charts-small-additions/issues/04-bin-takes-a-typed-column.md`
Spec: `.scratch/charts-recipes/spec.md`

## What to build

An example on the Chart page, "Columns instead of rows": a course of 100,000 readings drawn from two
`Float64Array` columns without one object per row, and a histogram of the same column beside it
(`data-science.md` 5).

- **The rows** are an index array, `Array.from({ length }, (_, i) => i)`, memoised on the columns.
- **The reading.** The x axis and the line read `(_, i) => column[i]`. The tooltip's `datum` is the index.
- **The memo** is what the lead explains: a new column gives new rows, and new rows are read again, while a
  function compared by its source text would keep the old values.
- **The histogram** is `bin(column)` drawn as `Bar`s.
- **The lead** names Arrow's `getChild(name).toArray()` as the way to such a column, and why columns are no
  input of `useChart` (ADR-0048: hits, `onSelect`, the tooltip and the data table are per row).
- **The record.** A new "Out" entry, "Column input", with that reason and the example.

## Acceptance criteria

- [ ] A jsdom test of the example's chart: the tooltip at an index reads that index's value; replacing a
      column redraws, and the data table shows the new value; no development warning is logged.
- [ ] The example's screenshots, light and dark, are new baselines and reviewed.
- [ ] The example renders in the demo smoke test; `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes.
