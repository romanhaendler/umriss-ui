# 03 - The job that holds npm's token installs nothing

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-actions-pinned-by-commit.md`
Spec: `.scratch/security-hardening/spec.md` (Implementation Decisions, "The publish workflow")

## What to build

The publish workflow builds, checks and packs in a job without the OIDC token
and hands the tarballs on; a second job in the `npm` environment, the only one
with `id-token: write`, downloads them and publishes them without installing or
running any third-party code. A stranger's development package can then no
longer publish umriss.

## Acceptance criteria

- [ ] Three jobs: `find` (unchanged), `build` (`contents: read`, outside the `npm` environment), `publish` (needs `build`, `npm` environment, `id-token: write` and `contents: write`).
- [ ] `build` installs with the frozen lockfile, runs lint, typecheck, `check:site`, unit tests, build, and for each package to publish `check:dist` and `pnpm pack`; it uploads the tarballs as one artifact.
- [ ] `publish` sets up Node 24, checks out for tagging, downloads the artifact, and publishes each package's tarball in the order `find` gave, picking the tarball by package name and version, not by globbing.
- [ ] `publish` does not set up pnpm, does not run any install, and runs no package script.
- [ ] The dist-tag rule (`next` for a prerelease, else `latest`), the "already published → only tag" handling and the `<dir>-v<version>` tags behave as before.
- [ ] Any new action (upload and download of the artifact) is pinned by SHA as in ticket 02.
- [ ] The workflow's heading comment states the rule: the job with the token runs no third-party code.
- [ ] Verified by a `workflow_dispatch` run on a commit that publishes nothing (`find` reports every version on npm; `build` and `publish` are skipped), and by reading the job graph; the first real release afterwards is watched until both jobs are green.
