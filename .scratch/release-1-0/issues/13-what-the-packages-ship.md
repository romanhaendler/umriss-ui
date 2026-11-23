# What the packages ship

Type:   research
Status: resolved

## Question

Is what npm receives fit for a 1.0?

- Each `package.json`: `exports`, `types`, `sideEffects`, `files`, `peerDependencies`, `engines`, `license`,
  `repository`, keywords and description; differences between the seven that have no reason.
- The publish path: `docs/releasing.md`, the Publish workflow, provenance and trusted publishing, `check:dist`.
- What a major changes in that path: peers written `^0.x.0` (ADR-0066), dist-tags, any script that assumes `0.`.
- Licence and notices of anything bundled.

Read only; do not build or pack. Say what could not be judged without a build.

Findings: `.scratch/release-1-0/research/13-what-the-packages-ship.md`

## Answer

Findings: `.scratch/release-1-0/research/13-what-the-packages-ship.md`. Read only; nothing was built or packed.

- **`check:dist` cannot pass at `1.0.0` as written.** It expects peers `workspace:^0.<minor>.0`
  (`scripts/check-dist.ts:321`) and parses `@deprecated since 0.<N>` with `/^0\.(\d+)\./` (`:140-148`). It
  runs in CI and in Publish, so it blocks the release. Both fixes are S; the rules they encode are decided in
  "What 1.0 promises".
- **Prose that says `0.x`**: `docs/releasing.md`, the root `README.md`, each CHANGELOG's header, ADR-0066.
- **Dist-tags need no change.** A release candidate would need peers written `^1.0.0-rc.n`.
- **No `engines` in any manifest**; CI runs Node 22, Publish builds on Node 24, the packages are ESM-only.
  A Node floor written at 1.0 is a promise.
- **React is peered `>=19` with no upper bound**: at 1.0 that promises every future React.
- The seven manifests agree with each other, nothing third-party is bundled, the publish path is sound.
- **Not judged without a build or an account:** the tarballs' file lists, that `check:dist` passes today, the
  size budgets, the state on npm (Trusted Publisher entries, dist-tags).

The Node floor and React's upper bound join the floors in "What 1.0 promises".
