# 01 - The unit tests run against React 18 in CI

Status: done
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
- Delivered (local proof, 2026-10-11). Under 18.3.1 (react and react-dom both 18.3.1): core 1846, charts 906, table 839, schedule 352, calculation 165, demo 349 tests, all green after the fix below; under 19.2.8 the same counts, all green. Before the fix, 3 of core's 1846 failed (`accordion`: "keeps a folded panel out of reach: inert"; `popover`: "stays for its exit, inert..."; `splitter`: "takes a pane folded to nothing out of the tab order"); nothing else failed.
- Cause: React 18 does not know `inert`, drops `inert={true}` as a boolean on an unknown attribute, and writes it only for a string, which 19 reads as false. Fix, in the library: `packages/core/src/lib/inert.ts` (`inertWhen(on)`, the value picked by React's major), used by `Accordion`, `Card`, `Popover` and `Splitter` (two panes); `Card` had no test and the same fault. No test touched.
- **The job as written does not give 18.** With the lockfile kept (or deleted but `node_modules` kept) pnpm leaves `@testing-library/react` on the 19.2.8 `react-dom` it resolved before the override ("unmet peer react-dom@18.3.1: found 19.2.8"); `react` prints 18.3.1 and the step passes, yet 702 of core's tests, 417 of table's, 42 of calculation's and 34 of schedule's fail with "A React Element from an older version of React was rendered". Only deleting `pnpm-lock.yaml` and every `node_modules` and then `pnpm install --no-frozen-lockfile` resolves the peer to 18. `ci.yml`'s job was not changed (not this run's to touch): its override step needs `rm -rf node_modules pnpm-lock.yaml` before `pnpm install --no-frozen-lockfile` (the first frozen install can go), and the version check should print `react-dom` too. `docs/testing.md` states the by-hand recipe with the deletion.
- Without the lockfile the install drifted other packages (typescript-eslint 8.71.1, @testing-library/react 16.3.3); the suite is green on those. `package.json` and `pnpm-lock.yaml` are restored and unchanged. The sentence is in `docs/testing.md` (a row, and the `forwardRef` row points at the job).
