# 01 - Rows that are not an array read as none, and DEV names them

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dev-warnings/spec.md`

## What to build

A data scientist hands `useTable` and `useChart` a pandas frame written with `orient="columns"`. The table
shows its empty state instead of throwing `e.filter is not a function`, and the chart shows "No data".
In development, each logs one warning that names the object's first keys and says that umriss reads one
object per row. A chart whose rows are `undefined` while they load draws empty, with no throw and no
warning.

- **Where rows enter.** `useTable`'s rows, `useChart`'s rows, a series' own `data` and a `ControlChart`'s
  `data`. Each place treats a value that is not an array as an empty array.
- **The warning.** It fires for anything but `undefined` and `null`, once per place. For a typed array it
  names the typed array (`Float64Array`); for any other object, its first three keys. It says that
  `Array.from` makes rows of an Arrow table or a typed array. The prefix is the package's.
- The types stay as they are: rows are an array.
- **The documents.** The table's and the charts' pages on rows say in one sentence that rows are one object
  per row, and what happens otherwise.

## Acceptance criteria

- [ ] A table over a column object renders its empty state, and DEV warns once, naming the keys.
- [ ] A chart over a `Float64Array` shows "No data", and DEV warns once, naming `Float64Array` and
      `Array.from`.
- [ ] A chart, a series and a `ControlChart` with `undefined` or `null` data render without a throw and
      without a warning.
- [ ] A table and a chart over a proper array of rows warn nothing (existing tests stay silent).
- [ ] The tests go through the public hooks and spy on `console.warn`.
- [ ] `pnpm check table`, `pnpm check charts` and `pnpm check:site` pass.
- [ ] The changelogs of table and charts note it under "Fixed".
