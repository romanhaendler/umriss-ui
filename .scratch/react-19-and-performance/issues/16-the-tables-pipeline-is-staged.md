# 16 - The table's pipeline is staged

Status: done
Type: task
Size: M

Blocked by: 13, 15
Spec: `.scratch/react-19-and-performance/spec.md`, "The table", fifth fix; user story 30

## What to build

Turning a page, folding a group, hiding a column or moving one does not sort
the table again.

The projection is computed in stages, each depending only on what it reads:

1. filtering and sorting - rows, the columns' values, **Search**, filters,
   sort;
2. grouping and its aggregates - the result of 1 and the **Grouping**
   (folding a group included);
3. paging and the order and visibility of columns - the result of 2.

A change runs its own stage and those after it. **Server mode** and **Tree
rows** keep the results they have today.

## Acceptance

- [ ] A `sortValue` that counts its calls is not called again when a page is
      turned, a group folded, a column hidden or a column moved.
- [ ] It is called again when the sort, a filter, the search or the rows
      change.
- [ ] The model's existing tests pass unchanged, server mode and tree rows
      among them.
- [ ] The benchmark page's figures for a page turned, a group folded and a
      column hidden at 50 000 and 200 000 rows, before and after, are in the
      capability record.
- [ ] `pnpm check table` passes.
