# What the packages ship

Type:   research
Status: open

## Question

Is what npm receives fit for a 1.0?

- Each `package.json`: `exports`, `types`, `sideEffects`, `files`, `peerDependencies`, `engines`, `license`,
  `repository`, keywords and description; differences between the seven that have no reason.
- The publish path: `docs/releasing.md`, the Publish workflow, provenance and trusted publishing, `check:dist`.
- What a major changes in that path: peers written `^0.x.0` (ADR-0066), dist-tags, any script that assumes `0.`.
- Licence and notices of anything bundled.

Read only; do not build or pack. Say what could not be judged without a build.

Findings: `.scratch/release-1-0/research/13-what-the-packages-ship.md`
