# 01: `check:dist` holds the rules of `1.x`

**What to build:** `check:dist` passes on a package at `1.0.0` or `1.3.0` that follows ADR-0083 (peer form,
deprecation marker, where a `### Changed` may stand) and still fails on every wrong `0.x` form it fails on
today. See the spec's "`check:dist`, by version"; findings
`.scratch/release-1-0/research/13-what-the-packages-ship.md` (the `check:dist` section), and
`docs/adr/0083-from-1-0-a-break-costs-a-major.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M (Sonnet)

- [ ] Fixtures for `0.57.0`, `1.0.0` and `1.1.0`: each rule passes once and fails once
- [ ] `pnpm -r check:dist` is green on the packages as they stand
- [ ] The trial at `1.0.0` in a scratch copy is reported (nothing of it is left in the worktree)
