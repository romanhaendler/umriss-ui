# 01 - The workspace on Vitest 5

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/test-runners/spec.md`

## What to build

The prefactor: the workspace's own unit tests run on Vitest 5, the major the README is going to promise and
the consumer check is going to run. Vitest 5 accepts Vite from 6.4, so the workspace's Vite stays on 6; if
the lockfile resolves an older 6.x, it moves to 6.4 or later. Nothing a consumer sees changes.

If the move breaks the workspace's tests beyond small fixes (an API removed, a reporter changed), stop and
record what broke under `## Comments`. The spec then needs that ticket's answer before the check is built.
Vitest 4 is not a fallback promise.

## Acceptance criteria

- [ ] The root's `vitest` is on 5; the lockfile resolves Vite 6.4 or later.
- [ ] `pnpm check` passes for every package.
- [ ] `pnpm typecheck` passes.
- [ ] No package's behaviour or published output changes (the build output of `pnpm build` is the same as
      before, apart from what Vite's patch level may change in whitespace).
