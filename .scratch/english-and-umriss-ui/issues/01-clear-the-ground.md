# 01 — Clear the ground

Status: done
Type: task

Blocked by: —

Spec: `.scratch/english-and-umriss-ui/spec.md` (Further Notes)

## Scope

Two prerequisites that become expensive the moment a rename starts.

- **The locked worktree.** `.claude/worktrees/demo-datepicker-sm-wert` sits on branch `worktree-demo-datepicker-sm-wert` with one commit that is not on `main`: "Die kompakten Picker der Demo behalten ihren Wert". Merge it into `main` or drop it — with the user, not on the agent's judgement — then remove the worktree and unlock it. Once ticket 03 has moved `packages/ui` to `packages/core` and the demos have been renamed, that commit touches paths that no longer exist and cannot be merged without being rewritten by hand.
- **`.gitignore`.** `.claude/worktrees/` is not ignored and shows as untracked in every `git status`. Add it. Every parallel ticket of this effort runs in a worktree, so without this the working tree is noisy for the whole effort.

Nothing else. This ticket touches no source file.

## Acceptance

- `git log main..worktree-demo-datepicker-sm-wert` is empty, or the branch is gone.
- `git worktree list` shows only the main checkout.
- `git status --short` on a clean tree is empty.

## Comments

Delivered with the worktree merged (the user chose merge over drop): the commit
was cherry-picked rather than merged, because this history is strictly linear -
`git log --merges main` is empty - and nothing cites the old commit. The branch is
gone, so the acceptance's second clause holds.
