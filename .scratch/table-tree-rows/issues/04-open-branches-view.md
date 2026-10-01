# 04 — Open branches in the view and the menu

Status: done
Type: task

Blocked by: 03
Spec: `.scratch/table-tree-rows/spec.md` ("Open branches and the view")

## What to build

An application starts the tree at a depth and keeps where the user left it:
`defaultBranches` takes keys or a depth (`1` = the roots open) and is the
default `view` leaves out; `TableView.branches` holds the open keys, and a key
that no longer occurs falls out, as `folded` does. The snapshot gains
`unfoldAllBranches()` (what core's `allBranches` returns) and
`foldAllBranches()`; the row header's column menu offers them with the existing
"Unfold all" / "Fold all" wording. Alt-click on a fold, and Alt with the arrows,
opens or closes the branch together with its siblings, as on a group header.

## Acceptance criteria

- [ ] `defaultBranches: 2` opens roots and their children on the first render.
- [ ] `view` leaves `branches` out while it equals the default.
- [ ] An `initialView` with stale keys drops them.
- [ ] The column menu entries open and close every loaded branch with content.
- [ ] Alt-click and Alt+arrows act on the siblings.
