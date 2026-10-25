# 04 - Paging without a bar, and a part without a table, say so

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dev-warnings/spec.md`

## What to build

A report developer writes `useTable(rows, { pageSize: 10 })` and forgets the `Pagination`. The table shows
every row, as it does today. In development it now logs once that every row is shown and that `pageSize`
holds as soon as a pagination bar stands. A `Pagination` placed outside the table without `of` renders
nothing, as today. In development it now says that it stands in no table and needs `of`.

- **A part without a table.** In the connection every row-less part goes through (`Toolbar`, `Search`,
  `ColumnMenu`, `Export`, `Pagination`): when there is neither a surrounding table nor `of`, warn once per
  part kind, naming the part.
- **A page size without a bar.** The table warns once when the caller passed `pageSize` and no pagination
  bar has registered once the first frame has passed. It stays silent when the table is `virtual`, in
  server mode or has tree rows, and when the caller gave no `pageSize`. A bar placed after the table that
  registers late does not warn.

## Acceptance criteria

- [ ] `pageSize` with no `Pagination` warns once in DEV, after the first frame.
- [ ] `pageSize` with a `Pagination` inside the table, or outside before or after it with `of`, does not warn.
- [ ] No `pageSize`, `virtual`, server mode and tree rows each stay silent.
- [ ] A `Pagination` and a `Search` outside any table without `of` each warn once, naming the part.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog notes both warnings under "Added".
