# 18 - The table's sort and search, decided on the benchmark page

Status: done
Type: task
Size: M (two candidates, each tried and measured)

Blocked by: 16
Spec: `.scratch/react-19-and-performance/spec.md`, "The table", "decided on the benchmark page"; user stories 30, 31

## What to build

Two changes to the table's model, neither of which was measured. Each is
tried on its own against the benchmark page and kept only if the page shows
it.

1. **Sort keys computed once per sort.** The value a row is sorted by is read
   once per row and sort, not once per comparison. The order stays exactly
   what it is, ties and absent values included.
2. **A deferred value for the search.** The field shows every keystroke at
   once; the filtering follows when the browser has time. What matches is
   unchanged.

## Acceptance

- [ ] For each of the two: the figure before, the figure after, and "kept" or
      "dropped" in the capability record.
- [ ] A dropped candidate leaves no code behind.
- [ ] The existing tests of sorting and of the search pass unchanged.
- [ ] `pnpm check table` passes.
