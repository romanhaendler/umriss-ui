# 13 - An aggregate is computed once for a set of rows

Status: ready-for-agent
Type: task
Size: M

Blocked by: 01, 10
Spec: `.scratch/react-19-and-performance/spec.md`, "The table", second fix; user stories 24, 25

## What to build

Scrolling a table with a footer, and showing group headers with share bars,
costs the same at a thousand rows and at two hundred thousand.

- The footer's **Aggregate** and the decimals it is shown with belong to the
  projection: computed when the rows it covers change, read in every render
  after. For **Tree rows** it keeps covering the top level.
- A **Group header** reads the aggregates its group already holds, and does
  not compute them again from the group's rows.
- The whole-table sum a share bar divides by is computed once per projection,
  not once per visible header.

What a caller sees is unchanged: the same values, the same decimals, the same
bars.

## Acceptance

- [ ] A column `value` that counts its calls: a re-render with nothing changed
      does not raise the count, with a footer aggregate and with grouped rows
      and share bars.
- [ ] The existing tests of footer values, group aggregates, decimals of sums
      and averages and share bars pass unchanged.
- [ ] The benchmark page's scroll step and re-render figures at 50 000 and
      200 000 rows, before and after, are in the table's capability record.
- [ ] No screenshot moves.
- [ ] `pnpm check table` passes.
