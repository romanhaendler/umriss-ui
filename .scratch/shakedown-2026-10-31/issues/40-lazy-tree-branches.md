# 40: Tree rows - branches whose children load on opening

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 9. Sources: P2/P22 wishes; `table-feature-matrix.md` "Lazy tree children"; the
README's "no branches loaded on demand yet".

**What to build:** a tree too big to send at once: a branch shows its fold before its children are known,
and opening it lets the application load them.

- [ ] `childRows(row)` may return `null`: a branch whose children are not loaded (`undefined` stays a leaf, an array the children). Such a row gets a fold like any branch.
- [ ] Opening it calls `onBranchOpen(key, row)`; the application loads and then answers through `childRows`. It may return a promise: while it is pending a loading line stands under the branch; a rejection shows its message there with "Try again", which calls `onBranchOpen` again. The table fetches nothing itself (ADR-0072's rule), written as an amendment in the ADR of ticket 38.
- [ ] Branches open in a view or `defaultBranches` call `onBranchOpen` on the first render; search, sort, selection and export treat unloaded branches as having no rows, and the docs say so.
- [ ] Keyboard (ArrowRight opens and loads), announcement of loading and failure, `aria-busy` on the branch row.
- [ ] Unit tests and an example (a file tree whose folders load after 500 ms, one failing); `pnpm check table`, `pnpm check:site`; looked at as a user.

## Comments
