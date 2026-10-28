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
