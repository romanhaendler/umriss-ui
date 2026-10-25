# 02 - Peers cover the minor, and the versions move in step

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-the-adr-the-upgrade-promise.md`
Spec: `.scratch/upgrade-promise/spec.md`

## What to build

An application can install a package beside any patch of the same minor of its umriss peers, and a release
cannot leave a version or a range behind.

- **Manifests.** Every umriss peer of table, schedule, calculation and dashboard is written
  `workspace:^0.<minor>.0` of the current version, today `workspace:^0.41.0`. The devDependencies stay
  `workspace:*`. pnpm packs the range as `^0.41.0`, and it records no peer in the lockfile, so the lockfile
  does not change (both tried with pnpm 9.14.4).
- **The check.** `check-dist` gains two assertions, in a block of their own:
  1. the six public manifests of the workspace (every `packages/*/package.json` that is not `private`)
     carry one version; otherwise it names each package with its version;
  2. every `@umriss-ui/*` entry in the package's own `peerDependencies` reads exactly
     `workspace:^0.<minor>.0` of that version; otherwise it names the peer, its range and the expected
     one.
- **`docs/releasing.md`**, step 1:
  - the peer ranges are `workspace:^0.<minor>.0`, and pnpm packs them as `^0.<minor>.0`;
  - a patch release leaves them, and a minor release moves them in the release commit;
  - `check:dist` holds both rules.

  Remove the sentence about `workspace:^` and `^<version>`.

## Acceptance criteria

- [ ] `pnpm -r check:dist` passes.
- [ ] Packing table shows `"@umriss-ui/core": "^0.41.0"` in the tarball's manifest. The same holds for
      every umriss peer of schedule, calculation and dashboard.
- [ ] In a scratch directory, `npm install` of the packed table tarball beside `@umriss-ui/core@0.41.0` from
      the registry exits without `ERESOLVE`.
- [ ] Set one package's version to 0.41.2 and the check fails naming it. Write a peer as `workspace:^` and the
      check fails naming that peer and `workspace:^0.41.0`. Both were tried by hand and reverted.
- [ ] `pnpm install --frozen-lockfile` passes unchanged.
- [ ] The commit subject names the peer change, so that the release's changelog lists it under "Changed"
      (migration: nothing to change).
