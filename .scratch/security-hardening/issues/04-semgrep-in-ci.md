# 04 - Semgrep checks the sources and the workflows in CI

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-actions-pinned-by-commit.md`, `03-the-token-job-installs-nothing.md`
Spec: `.scratch/security-hardening/spec.md` (Implementation Decisions, "Semgrep")

## What to build

Every push to `main` and every pull request runs Semgrep over the seven
published packages' sources and the workflow files, and fails on any finding.
The first run is green: each finding is either fixed or accepted at its line
with a reason.

## Acceptance criteria

- [ ] A `semgrep` job runs on push to `main` and on pull requests, with `permissions: contents: read` and no secrets.
- [ ] Semgrep runs at a pinned version in its official container image pinned by digest, without logging in to or uploading to the Semgrep app.
- [ ] Rule sets `p/javascript`, `p/typescript`, `p/react`, `p/xss`, `p/secrets`, `p/github-actions`; if they cannot be pinned through the registry, they are vendored into the repo as YAML and read from there.
- [ ] Targets are the `src` of core, charts, table, schedule, calculation, dashboard and alarms, and the workflows; tests, demos, the demo shell and scripts are excluded.
- [ ] Any finding fails the job. Every accepted finding carries `nosemgrep: <rule-id>` with a reason at its line; nothing is excluded wholesale.
- [ ] The job is green on `main`.
- [ ] The way to run it locally is named in CONTRIBUTING.md; it goes into CLAUDE.md's "Checking a change" only if it is one command.
