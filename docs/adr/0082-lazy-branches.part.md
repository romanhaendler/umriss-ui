## Lazy branches (tree rows): the same rule, one level down

Part of ADR-0082, written beside the server groups' part; the coordinator joins
them. It amends ADR-0072's rule - the table reports, the application answers and
the table fetches nothing itself - for a tree whose children are too many to send
at once.

**A branch that is not loaded is a `null`.** `childRows(row)` returns `undefined`
for a leaf, an array for a branch and `null` for a branch whose children are not
loaded. The `null` row gets a fold like any branch; core's flattening already
knows the case as `unloaded` (a branch that is not empty), so the table passes it
through and adds no state of its own for the rows.

**Opening asks, the application answers.** Opening such a branch - by the fold,
ArrowRight, `toggleBranch`, `defaultBranches` or a view - calls
`onBranchOpen(key, row)` once; a branch that closes or gets its rows is forgotten,
and the next opening asks again. The application loads and answers by passing new
rows in, so that `childRows` no longer answers `null`. The table keeps no cache.

- **A promise is a loading line.** `onBranchOpen` may return one: while it is pending
  a line stands under the branch (announced as a status, the row `aria-busy`); a
  rejection shows its message there as an alert with "Try again", which calls
  `onBranchOpen` again. An answer to an earlier asking is ignored. Without a
  promise the table shows no line - there is nothing it could say.
- **Unloaded means without rows.** Search, sort, selection, the footer and the
  export see an unloaded branch with no children, and the docs say so; "open all"
  leaves it shut, since one click would otherwise ask for every branch at once.

Not chosen: a `loadChildren` that returns the children, which would make the table
the owner of a cache and of the question of when it is stale.
