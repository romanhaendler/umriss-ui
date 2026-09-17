# 04 — Multi-level sorting

Status: done

Spec: `.scratch/table-surface/spec.md`

## Scope

Sort becomes an ordered list of levels rather than a single value, so that
"by department, then by budget descending" is expressible.

- Activating a column without a modifier replaces the whole list with that one
  column.
- Activating with a modifier appends a level, or cycles that level's direction
  if the column is already in the list, or removes it at the end of the cycle.
- The header cell shows a small rank indicator **only** when more than one level
  is active.
- A single-level list is the existing behaviour exactly, so existing call sites
  see no change.

The accessibility attribute for sort direction is set on every sorted column.
This is correct and is not a regression of the earlier rule: that rule fixed two
columns disagreeing about which one was sorted, not genuine multi-level sort.

## Acceptance

- Unit tests: a second level decides only ties in the first; stability holds
  within the last level; activating without a modifier replaces the list;
  activating with one appends; cycling a column out at the end of its cycle
  leaves the other levels untouched.
- Interaction test: modifier-clicking a second header produces a two-level sort
  with visible rank indicators.
- Existing single-sort tests pass unchanged.

## Notes

The "existing tests pass unchanged" criterion is the real acceptance gate. The
one-element list must be behaviourally identical to today's single sort, or this
stops being additive.
