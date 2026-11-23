# What the packages ship

Ticket: `issues/13-what-the-packages-ship.md`. Read only: nothing was built, packed, installed or run.
Sources: the seven `packages/*/package.json`, `packages/*/vite.config.ts` (core, table read), `scripts/check-dist.ts`,
`scripts/packManifest.mjs`, `.github/workflows/{publish,ci}.yml`, `docs/releasing.md`, ADR-0066, `README.md`,
`packages/*/LICENSE`.

Size: S small, M medium, L large. "Costs a major" = setting it right after 1.0 would be a break.

## Verdict

The tarball contents and the publish path are in good shape for a 1.0. The manifests agree with one another almost
to the byte. What is not fit is the tooling around the version number: three places read the number as `0.<minor>`
and will fail or misjudge at `1.0.0` (findings 1 to 3). Three manifest gaps would cost a major to close later
(findings 5 to 7).

## What a major changes in the publish path

1. **`check:dist` refuses the peer ranges of 1.0.0.** `scripts/check-dist.ts:321` builds the expected range as
   `` `workspace:^0.${own.version.split(".")[1]}.0` ``. For `1.0.0` that is `workspace:^0.0.0`, while the manifests
   would say `workspace:^1.0.0`; every package with an umriss peer (table, schedule, calculation, dashboard, alarms)
   fails, and the publish workflow runs `check:dist` per package (`publish.yml:98`) and CI runs `pnpm -r check:dist`
   (`ci.yml:35`). Smallest change: expected range `workspace:^<major>.<minor>.0`. S.
   The rule itself is a decision, not a typo. ADR-0066 pins the minor because "a minor may change what a dependent
   reads from core". Under plain semver `^1.0.0` would accept core 1.0 under table 1.7, which uses something core 1.7
   added; npm accepts it, it breaks at run time. `^1.<minor>.0` keeps the floor and is the same rule one digit to the
   right. Which to take is the maintainer's. The packed form is unaffected: pnpm rewrites `workspace:^1.3.0` to `^1.3.0`.
   Costs a major to change later: yes (a looser peer range cannot be tightened without refusing installs that worked).

2. **The deprecation check breaks on a `1.x` version.** `check-dist.ts:140` reads `/^0\.(\d+)\./` from the version:
   for `1.0.0` `packageMinor` is `NaN`, every comparison at `:147` is true, and any `@deprecated since 0.<N>` marker in
   `src/` fails with "remove it" (and a marker without `since 0.` fails at `:146`). Together with ADR-0066's window
   ("a rename lives one minor") it encodes pre-1.0 behaviour: under plain semver a removal waits for the next major,
   so the check and its marker form (`since 0.<N>`) have to become `since <major>.<minor>` and "not removed within
   the major". Whether any marker exists now is for the deprecation review; this file only shows the check cannot
   serve 1.x. S for the script; the rule behind it is a decision (ADR superseding 0066's window).

3. **Prose that says `0.x`.** `docs/releasing.md` (lines 25 to 29, 69 to 77: "peers `workspace:^0.<minor>.0`",
   rc example `0.3.0-rc.1`), root `README.md:161` ("`0.x` for now ... a peer is named `^0.x.0`"), each package
   `CHANGELOG.md` header ("The middle digit rises when something is added"), ADR-0066 ("1.0 stays no goal"; already
   named in the map as to be superseded). The README lines of the seven packages did not match `0.x`/`1.0`
   (grep), so the user-facing prose is two files plus the changelog header x7. S.

4. **Dist-tags and the release-candidate path hold, with two traps.**
   - `publish.yml:145`: any version containing a hyphen goes to `next`, any other to `latest`. `1.0.0-rc.1` goes to
     `next`, `1.0.0` to `latest`: correct without a change. The `find` job asks `npm view name@version`
     (`:51`), nothing about the number's shape. The tag `<dir>-v<version>` is shape-agnostic.
   - Trap one: a peer written `^1.0.0` does not match `1.0.0-rc.1` (semver: a range without a pre-release part
     excludes pre-releases). Peers on an rc would have to read `^1.0.0-rc.1`; `check:dist`'s expected form (finding 1)
     has no notion of that. Only matters if a 1.0 candidate is published to `next` and tried as a set.
   - Trap two: after `2.0.0`, a fix `1.x.y` published from the workflow would be given `latest` and take it from
     2.x. ADR-0066 says "fixes go into the latest minor only; no backport branch", and the workflow publishes from
     `main` only, so it is not reachable today. Becomes real the day a 1.x line is kept alive. Not before 1.0.
   Smallest change: none now; note in the releasing guide.

## Per `package.json`: what stands, and what is missing

All seven public manifests are the same shape: `type: module`, `files: [dist, API.md, docs/llms-full.md,
CHANGELOG.md]` (npm adds README, LICENSE and `package.json` itself), `sideEffects: ["**/*.css"]`,
`publishConfig.access: public`, `license: MIT`, `author: "Roman Händler"` (name only, no email or url),
`homepage`/`repository` (with `directory`)/`bugs` to the one repository, `main` and `types` plus `exports` with
`types`/`import`/`default` per JS entry (`default` equal to `import`, enforced at `check-dist.ts:69`), and a
`typesVersions` map so `moduleResolution: node10` finds the subpaths (checked by the strict consumer,
`check-dist.ts:218`). The licence file is byte-identical in all seven (`cmp`), and a root `LICENSE` exists.
`peerDependencies`: `react` and `react-dom` `>=19` everywhere; umriss peers as `workspace:^0.56.0` (table, schedule,
calculation, dashboard, alarms need core; schedule also charts; alarms also table; charts none). No `dependencies`
in any published package.

Differences with no reason: **none found** among the seven beyond the intended (subpaths `./wording/de` in core and
charts, `./touch-scale.css` in core, `./xlsx` in table; peers). The scripts are the same text apart from the entry
names; `calculation` alone passes a third argument (`calculation.client.js`) to `check:dist` because its main entry
is server-safe. Keywords differ in content, as they should; `core` lists 12, `alarms` 7. No two packages disagree on
the same field.

Gaps that would cost a major or are cheap to close now:

5. **No `engines`, and Node's floor is unwritten.** None of the seven declares it. Reality, from the repo: CI runs on
   Node 22 (`ci.yml:26`), publish on Node 24 (`publish.yml:77`, because npm 11 is needed for Trusted Publishing,
   not for installing). The packages are ESM only (`type: module`, `require` falls to the same ESM file via `default`),
   so a caller's `require()` works only where Node can `require` ESM (22.12 and later, 20.19 and later). The README
   names React 19 and TypeScript 5.4 as floors, not Node. A floor written at 1.0 is a promise; raising `engines`
   later is a break by the project's own rule ("raising the floor is a Changed entry"). Smallest: `engines.node`
   in the seven manifests and a line in the READMEs. S; the number is a maintainer decision.

6. **No `exports["./package.json"]`.** With `exports` set, `require("@umriss-ui/core/package.json")` and tools that
   read a dependency's version from it (bundler plugins, Storybook, `npm ls`-style tools) are refused with
   `ERR_PACKAGE_PATH_NOT_EXPORTED`. Adding it later is not a break (it only widens), so this is not a 1.0 blocker;
   listed because it is a common complaint and one line. S.

7. **`react`/`react-dom` `>=19` has no upper bound.** At 1.0 it reads as a promise of every future React. The strict
   semver reading says a React 20 that breaks the library would be umriss's break to answer with a major. A decision
   (leave open, or `^19 || ^20` as each is verified). Costs a major to tighten later, nothing to loosen. M for the
   policy, S for the edit. `README.md` (core line 31) says "React 19 or newer".

8. **Nothing else.** `sideEffects: ["**/*.css"]` is right because the main entry imports its stylesheet as the
   second statement (ADR-0021, checked at `check-dist.ts:111`) and the JS has no other side effect; the stylesheet
   has a `types` condition but no `import`, so the `import`/`default` equality check does not cover it (harmless).
   `files` has no `docs/` beyond the generated `llms-full.md`; `docs/capabilities*.md` and `glyphs.md` stay in the repo.
   `API.md` and `llms-full.md` are generated by the `prepack` script (`props`), see the build section below.

## The publish path (read, judged fit)

- `publish.yml`: three jobs. `find` (no token, no environment) asks npm which of the seven names@version is
  missing, in dependency order `core charts table alarms schedule calculation dashboard`. `build` (no token): frozen
  install, lint, `check:site`, typecheck, unit, build, then per package `check:dist` and `pnpm pack`; tarballs are an
  artifact. `publish` (environment `npm`, `id-token: write`, `contents: write`): installs nothing, runs `npm publish
  ./<tarball> --tag latest|next`, then tags `<dir>-v<version>`. Third-party actions are pinned by commit hash.
  Concurrency group serialises runs.
- Trusted Publishing: per package, owner/repo/workflow `publish.yml`/environment `npm`; npm attaches provenance
  itself (no `publishConfig.provenance`, no `--provenance` flag needed under OIDC). `workflow_dispatch` with `check`
  proves the trust without publishing. Two-factor required and token-bypass refused per package (`releasing.md:60`).
  A 1.0 does not change any of this. The present state of the trust lives on npm, not in the repo.
- Manifests are packed without `scripts` (`packManifest.mjs`, checked at `check-dist.ts:97`). `prepublishOnly` is
  never run by `npm publish ./tarball`; the equivalent work is the workflow steps (`publish.yml:87` says so).
- Gap in the gate, not a defect: `ci.yml` runs on Node 22, the publish build on Node 24; `check:dist` therefore runs
  on a different Node than the supported floor on every push to `main`. Fine while there is no `engines` (finding 5);
  once there is, one lane on the floor is worth adding. S.
- `check:dist` holds a great deal (directive, layers, Lightning CSS, no `import.meta`, strict TS under 5.4 and
  current with `bundler` and `node10`, Vitest and Jest consumer tests from the README's blocks, Flight rendering,
  residue budget, XLSX writer budget, changelog heading and `Migration:` lines). Of these, only the three
  version-shaped rules (findings 1 and 2, and the `## <version> – ` heading match at `:333`, which is
  shape-agnostic) care about the number.
- One-number rule (`check-dist.ts:318`): all public packages equal; needs no change at 1.0 and is what the map
  already settled ("seven packages become 1.0.0 in step").

## Licence and notices of anything bundled

Nothing third-party is bundled in the shipped JavaScript or CSS: the vite configs (core, table read; the rest follow
the same pattern in their `rollupOptions.external`) mark `react`, `react-dom`, `react/jsx-runtime` and, for the
dependents, `@umriss-ui/*` as external, and no published manifest has `dependencies`. The Geist fonts
(`@fontsource/geist-*`, devDependencies of core) are imported only by the demos (`packages/*/demo/main.tsx`,
`outline.ts`); `grep` for `fontsource`/`@font-face` in `packages/*/src` and `scripts/styles` found none, so no font
file or OFL notice travels. Icons are the project's own (`scripts/glyphs.ts`, `docs/glyphs.md`). The XLSX writer is
the project's own and imports nothing (`check-dist.ts:156`). Licence: MIT, 2026, one holder, in every tarball.
Result: no third-party notice file is needed today. Could not be judged without a build: that the minified
`dist/*.js` really contains no copied third-party snippet (a source-level review would have to confirm the writer's and
the date code's origins).

## What could not be judged without a build or an account

- The real tarball: the file list `pnpm pack` makes (including that `docs/llms-full.md` and `API.md` exist for
  `calculation`, `dashboard` and `alarms`, which have no `docs/` folder checked in; it is gitignored
  (`.gitignore:19`) and made by `prepack`/`props`; `check-dist.ts:96` fails if `API.md` is missing, and `:83` would
  throw on a missing `llms-full.md`, so a gap would already stop a release, but this was not run).
- That `check:dist` passes today (it was not run) and what it says on a 1.0 version beyond findings 1 and 2.
- Whether the declaration rollups (`dist/index.d.ts`, `dist/de.d.ts`, `dist/xlsx.d.ts`) are complete: the strict
  consumer is the judge.
- The state on npm: Trusted Publisher entries, dist-tags (does anything sit on `next`?), provenance badges, deprecated
  versions, the 2FA setting. Only `docs/releasing.md` was read.
- Install behaviour under npm, pnpm and Yarn with the `^1.x` peers; ERESOLVE under a React 19 patch range;
  whether `require()` of the ESM entries works on the Node versions a caller has.
- The size figures (the residue and XLSX budgets) at 1.0.

## Order of work, if all are taken

Findings 1 and 2 (script fixes, with the decision on the peer and deprecation rules) before the first 1.0 candidate;
5 and 7 are decisions to take before the freeze, since both are promises; 3 at the release commit; 6 is optional;
4 is a note.
