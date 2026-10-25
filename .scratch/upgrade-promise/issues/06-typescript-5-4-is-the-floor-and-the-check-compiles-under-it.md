# 06 - TypeScript 5.4 is the floor, and the check compiles under it

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-the-adr-the-upgrade-promise.md`
Spec: `.scratch/upgrade-promise/spec.md`

## What to build

Every README names the TypeScript floor, and a declaration that needs a newer TypeScript cannot reach a
release.

- **The floor's compiler.** The root's devDependencies gain `"typescript-floor": "npm:typescript@~5.4.5"`.
  The workspace's own `typescript` stays as it is. The lockfile changes with it.
- **The check.** `check-dist`'s strict consumer compiles today under the package's TypeScript, with two
  resolutions (`bundler` and `node10`). It compiles under the floor's `tsc` as well, with the same files
  and both resolutions, and names the compiler in a failure.
  - The floor run drops `noUncheckedSideEffectImports`, an option that exists only from 5.6. It keeps every
    other option, and `skipLibCheck: false` above all: with `skipLibCheck`, an unknown `NoInfer` in a
    declaration file passes silently.
  - The floor's `tsc` is resolved from the workspace root, not from the package's `node_modules`.
- **The READMEs.** Each of the six Install sections names "TypeScript 5.4 or newer (the declarations use
  `NoInfer`)" beside its line about React 19.

## Acceptance criteria

- [ ] `pnpm -r check:dist` passes, and its output shows the consumer compiled under 5.4 for every package.
- [ ] Pointing the floor alias at `typescript@5.3.3` once, by hand, makes charts', table's and dashboard's
      check fail with TS2304 "Cannot find name 'NoInfer'". This was seen for charts in a throwaway directory
      on 2026-10-25. Revert afterwards.
- [ ] Each of the six READMEs names the floor and why.
- [ ] `pnpm install --frozen-lockfile` passes with the updated lockfile, and `pnpm check:site` passes.
