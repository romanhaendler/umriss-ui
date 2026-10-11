# 01 - The unit tests run against React 18 in CI

Status: ready-for-agent
Type: task
Size: M (S if nothing fails; split the fixes into tickets of their own if more than five tests fail)

Blocked by: none
Spec: `.scratch/platform-claims-proved/spec.md` - P1, P2, P3

## What to build

A second job in `.github/workflows/ci.yml`, `unit-react18`, beside `check`, same
runner, Node and actions. Steps: checkout, pnpm, node, `pnpm install
--frozen-lockfile`; then a step that sets `pnpm.overrides` `react` and
`react-dom` to `18.3.1` in the runner's root `package.json` (`node -e` or `pnpm
pkg set`) and runs `pnpm install --no-frozen-lockfile`; then a step that prints
the version `react` resolves to from `packages/core` and fails unless it starts
with `18.`; then `pnpm test:unit`. Nothing about lint, types or build.

Nothing is committed but the workflow: no second lockfile, no override in the
repository's `package.json`, no change to `devDependencies`. Say in the file's
header comment why `check` is not a matrix: the override rewrites the lockfile
in the runner, and a job that does so must not be the one that checks the
lockfile is frozen.

Then make it green. The tests that fail under 18 are the finding.

## Acceptance

- [ ] The job runs on a pull request and fails if the installed React is not 18.
- [ ] `pnpm test:unit` passes under 18.3.1 and still passes under 19 in `check`.
- [ ] Every fix is in the library, or in a test's own scaffolding that says the
      same thing in an API both versions have. No assertion is weakened, skipped
      or made conditional on the version.
- [ ] If a behaviour cannot be had under 18, the ticket stops there with the test,
      the cause and the options (fix, or `peerDependencies` and the READMEs to
      `>=19`) under `## Comments`. It does not choose.
- [ ] `docs/testing.md` has a sentence on the job and on how to run the suite
      under 18 by hand (the same two commands), since a developer installs 19.

## Comments

- The CI job `unit-react18` is written (`.github/workflows/ci.yml`): override of `react` and `react-dom` to 18.3.1 in the runner's `package.json`, `pnpm install --no-frozen-lockfile`, a step that fails unless `react` resolves to 18.x, then `pnpm test:unit`. The header comment says why it is not a matrix. The YAML parses; it has not run.
- Still to do: the local proof under React 18.3.1 (install by hand, run the suite, fix what fails per P3) and the sentence in `docs/testing.md`. The ticket stays `ready-for-agent`.
