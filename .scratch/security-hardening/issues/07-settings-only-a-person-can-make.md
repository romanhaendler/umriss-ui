# 07 - The settings only a person can make

Status: ready-for-human
Type: task
Size: S

Blocked by: `03-the-token-job-installs-nothing.md`, `04-semgrep-in-ci.md`
Spec: `.scratch/security-hardening/spec.md` (Implementation Decisions, "Settings only a person can make")

## What to build

The web-interface settings that close the release path from the outside: a
person approves every publish, npm accepts only Trusted Publishing, and `main`
takes no change whose CI or Semgrep check is red.

## Acceptance criteria

- [ ] GitHub, environment `npm`: the maintainer is a required reviewer; deployment branches are limited to `main`.
- [ ] npm, each of the seven `@umriss-ui/*` packages: publishing access is "Require two-factor authentication and disallow tokens".
- [ ] GitHub, branch `main`: protected, with the CI check and the Semgrep check required.
- [ ] GitHub, Actions settings: "Require actions to be pinned to a full-length commit SHA" is on, if the account offers it.
- [ ] The next release goes out with the reviewer's approval and is green in both publish jobs.

## Left from tickets 01-06

These could not be done without pushing `main` or waiting for a date:

- [ ] After the push: the CI run on GitHub is green, the `semgrep` job included (first run on a runner; a "safe.directory" warning there is harmless).
- [ ] Actions → Publish → Run workflow on a commit that publishes nothing: `find` reports every version on npm, `build` and `publish` are skipped. The next real release is watched until both jobs are green.
- [x] After 2026-10-28 17:28 UTC: remove `baseline-browser-mapping@2.11.33` from `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` and check that `pnpm install --frozen-lockfile` passes.
- [ ] The first grouped Dependabot pull request for the action pins looks as intended.
