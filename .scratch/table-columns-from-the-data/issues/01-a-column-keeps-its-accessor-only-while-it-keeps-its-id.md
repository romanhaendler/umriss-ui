# 01 - A column keeps its accessor only while it keeps its id

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/table-columns-from-the-data/spec.md`

## What to build

The prefactor. Columns mapped from the data with the index as React `key` show the right numbers, and the
table warns about a duplicate id only when one exists.

- The registry holds an accessor that is equal by source text (value, sort value, group value) only while
  the column's id is unchanged. A column whose id changed takes its new accessors, and its cells, sort and
  aggregates follow them.
- The duplicate-id check runs once after the render's columns have registered, beside the order check
  after the commit, instead of after each registration. A real duplicate still warns once.

The failing case, for the test: two computed columns mapped from `[2024, 2025]` with `key` by index,
`id` by year and `value={r => r.byYear[y]}`, rerendered with `[2025, 2026]`. Today the headers read 2025 and
2026, while the cells and footers show 2024's and 2025's values, and the DEV warning "Two columns carry the
id" is logged.

## Acceptance criteria

- [ ] A unit test beside the inline-accessor tests renders the failing case above and asserts the new years'
      cells and footer sums, and that no duplicate-id warning was logged.
- [ ] A unit test still sees the warning for two columns that really share an id.
- [ ] The existing inline-accessor tests pass unchanged: a new function of the same text, with the same
      id, still calls nothing again.
- [ ] `pnpm check table` passes.
