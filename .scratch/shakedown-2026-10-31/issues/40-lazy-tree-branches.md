# 40: Tree rows - branches whose children load on opening

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 9. Sources: P2/P22 wishes; `table-feature-matrix.md` "Lazy tree children"; the
README's "no branches loaded on demand yet".

**What to build:** a tree too big to send at once: a branch shows its fold before its children are known,
and opening it lets the application load them.

- [x] `childRows(row)` may return `null`: a branch whose children are not loaded (`undefined` stays a leaf, an array the children). Such a row gets a fold like any branch.
- [x] Opening it calls `onBranchOpen(key, row)`; the application loads and then answers through `childRows`. It may return a promise: while it is pending a loading line stands under the branch; a rejection shows its message there with "Try again", which calls `onBranchOpen` again. The table fetches nothing itself (ADR-0072's rule), written as an amendment in the ADR of ticket 38.
- [x] Branches open in a view or `defaultBranches` call `onBranchOpen` on the first render; search, sort, selection and export treat unloaded branches as having no rows, and the docs say so.
- [x] Keyboard (ArrowRight opens and loads), announcement of loading and failure, `aria-busy` on the branch row.
- [x] Unit tests and an example (a file tree whose folders load after 500 ms, one failing); `pnpm check table`, `pnpm check:site`; looked at as a user.

## Comments

**Delivered (2026-10-31, run coordinator).** `childRows` may return `null`; opening (fold, ArrowRight,
`toggleBranch`, `defaultBranches`, a view) calls `onBranchOpen(key, row)` once; a promise shows a
loading line (status, `aria-busy`), a rejection an alert with "Try again"; a late answer is ignored;
search, sort, selection, export see an unloaded branch as empty (documented). Example "Folders that load
on opening" - looked at, loading and failure lines read clearly. Decided: "open all" leaves unloaded
branches shut; no line without a promise; the application answers by passing new rows.
