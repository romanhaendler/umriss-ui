# 05 — Sorting per level, search and filters with path rows

Status: done
Type: task

Blocked by: 02, 03
Spec: `.scratch/table-tree-rows/spec.md` ("The tree pipeline in the model")

## What to build

Sorting orders siblings among siblings on every level by the same sort levels;
a child never leaves its parent, absent values stand last within their level.
The pre-filter removes a row with its subtree. The search and the column filters
decide a match through core's new match predicate: a match shows with the rows
above it, and a row shown only for a descendant is a **Path row** - in the muted
text tone as in `TreeView`, with visually hidden wording (`pathRow`) in its row
header. While a search or filter is set, branches on the way are open without
writing `branches`; clearing them leaves the tree as it was. The **Filtered set**
of a tree is every matching row on every level, path rows not: "43 of 1,204",
`rowCount` and `filtered` (in reading order) read it.

## Acceptance criteria

- [ ] Sorting by a column reorders every level on its own; the hierarchy holds.
- [ ] A search for a deep row shows it with its path; the path rows are muted and say so.
- [ ] A column filter follows the same rule as the search.
- [ ] Clearing the search restores the open branches exactly.
- [ ] Counts and `filtered` hold matches across levels, never path rows.
- [ ] Model tests without a DOM for all of the above.
