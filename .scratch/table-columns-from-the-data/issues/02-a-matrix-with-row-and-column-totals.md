# 02 - A matrix with row and column totals

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-a-column-keeps-its-accessor-only-while-it-keeps-its-id.md`
Spec: `.scratch/table-columns-from-the-data/spec.md`

## What to build

The recipe, end to end. A developer who reads "no pivot" finds a running example of a matrix whose columns
come from the data, with all three totals, and the table holds it in its tests.

- **The example** on the Aggregate page, "A matrix with row and column totals":
  - facts by plant and year, pivoted in the example into one row per plant with its cells keyed by year and
    its total as a field;
  - one computed `Column` per year from the data, `key` by the year, `aggregate="sum"`;
  - a row-total field column with `aggregate="sum"`, whose footer is the grand total.

  Its lead says that an accessor closes only over what is constant for its column, and that whatever changes
  with the data goes into the row. That is why the total is a field.
- **First-table's limit line** on pivot points at the example instead of only at ADR-0032.
- **ADR-0032** gets an amendment dated 2026-10-25 under its pivot item. The *Instead* means one computed
  `Column` per key, mapped from the data, with the totals from `aggregate`; the example shows it.
- **The `footer` overload** of the computed `Column` is deleted. `aggregate` is the only name.

## Acceptance criteria

- [ ] An aggregate unit test renders the recipe from facts. It asserts the year headers in order, the footer
      sum per year and the grand total. After a rerender with a year added at each end and one removed, it
      asserts headers and footers again.
- [ ] The same test, with a grouping by region over the pivoted rows, asserts a group header's subtotals.
- [ ] A type test accepts the recipe's year column (value `number | undefined`, `aggregate="sum"`, a number
      format, `filter="range"`) and rejects `footer` on a computed column.
- [ ] The demo smoke test renders the new example; its screenshots are recorded in the visual suite.
- [ ] The generated `llms-full.md` carries the example, and First-table's pivot limit names it.
- [ ] ADR-0032 carries the amendment; its decision is unchanged.
- [ ] `pnpm check table` and `pnpm check:site` pass (`API.md` regenerated if the types' output changed).
