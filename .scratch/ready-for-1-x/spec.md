# Ready for `1.x`

Status: ready-for-agent
Release: 0.57.0 (no break)

Takes from the map `.scratch/release-1-0/map.md`:
[What the packages ship](../release-1-0/issues/13-what-the-packages-ship.md) (findings
`../release-1-0/research/13-what-the-packages-ship.md`),
[What 1.0 promises](../release-1-0/issues/01-what-1-0-promises.md) (ADR-0083) and
[The acceptance criteria](../release-1-0/issues/03-the-acceptance-criteria.md) (conditions 5, 10, 11; browser
findings in `../release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md` and
`../release-1-0/research/10-the-documents-agree-with-the-source.md` B13).

## Problem Statement

A `1.0.0` cannot be released as the repository stands: `check:dist`, which runs in CI and in Publish, accepts
only peers written `^0.<minor>.0` and deprecation markers `since 0.<N>`. The manifests promise more than is
meant (every future React, any Node). The browser floors are written in four places and taken on trust; the
source uses features newer than the Firefox the documents name. A caller finds no word on how to report a
vulnerability, and none on right-to-left.

## Solution

`check:dist` holds the rules of ADR-0066 for `0.x` and those of ADR-0083 from `1.0.0`, told apart by the
version it checks. The seven manifests name Node 22 in `engines` and peer React as `^19`. The three browser
floors are derived from the features the source uses, stand in one place, and a test fails when the source
uses a feature the table does not know or a document states another floor. `SECURITY.md` exists; the README
says right-to-left is not supported.

## User Stories

1. As the maintainer, I want `check:dist` to pass on `1.0.0` without a change on the release day, so that
   the release only raises numbers.
2. As the maintainer, I want it to keep failing on a wrong `0.x` peer or marker, so that nothing loosens
   before 1.0.
3. As a caller, I want `engines` to tell me the Node floor, so that an install on an older Node warns.
4. As a caller, I want React peered `^19`, so that a future React 20 is not promised untested.
5. As a caller, I want browser floors that are true, so that I can decide whether umriss fits my users.
6. As a contributor, I want a test to fail when I use a CSS or platform feature that raises a floor, so that
   the floor is raised knowingly, in a minor that says so.
7. As a security researcher, I want `SECURITY.md` to say where a report goes and which versions get a fix.
8. As a caller with a right-to-left application, I want the README to say it is not supported.

## Implementation Decisions

- **`check:dist`, by version.** For a `0.x` version: as today. From `1.0.0`: an umriss peer is
  `workspace:^<major>.<minor>.0`, which pnpm packs as `^<major>.<minor>.0`; a deprecation marker is
  `@deprecated since <major>.<minor>` (and a marker `since 0.<N>` left alive at `1.x` is an error: `1.0.0`
  removes every old name); a `### Changed` section with its `Migration:` lines stands only under a heading
  `x.0.0`, a minor or patch heading that carries one fails. The rules are ADR-0083's; where it and this text
  differ, the ADR wins and the worker reports it.
- **Manifests.** `engines: { "node": ">=22" }` in the seven published manifests; `react` and `react-dom`
  peered `^19` wherever they are peered. `check:dist` holds both for all seven. Not a break: no caller on
  React 19 and Node 22 changes anything.
- **Browser floors.** One table in the repository's tooling: feature, how it is recognised in the source,
  and the first Chrome, Firefox and Safari that ship it, each row with the address of the compatibility data
  it was checked against (MDN's browser-compat-data; checked now, not from memory). The floor of a browser
  is the highest of its column over the features found in the packages' `src`. A unit test scans `src` (CSS
  and TSX) and fails when a recognised-as-new construct has no row (at-rules, CSS functions, selectors and
  DOM attributes outside a baseline list), and when a document states a floor that differs. The floor is
  stated in full once (the root README) and the other places point to it or are held equal by the test. No
  new dependency.
- **`SECURITY.md`** at the root: reports go through GitHub's private vulnerability reporting of the
  repository; a fix goes into the latest minor only (ADR-0083); no bounty, no deadline promised. Linked from
  the root README and `docs/README.md`.
- **Right-to-left.** One sentence in the root README where browsers and accessibility are stated.
- **Node and pnpm in prose** agree with the manifest (`packageManager`, `engines`).

## Testing Decisions

- `check:dist`'s rules are tested through the script's existing test seam (its own unit tests where they
  exist; otherwise the pure functions it is made of get one test file), with a fixture for `0.57.0` and one
  for `1.0.0` and `1.1.0`: each rule passes and fails once.
- The floors' test is the guard itself; a fixture proves it fails for an unknown at-rule.
- `pnpm -r check:dist` on the real packages stays green at `0.56.0`/`0.57.0`.
- A trial outside the tests, reported: the versions set to `1.0.0` in a scratch copy, `check:dist` run, the
  result named (which rules fail and that each is one the `1.0.0` commit itself resolves).

## Out of Scope

- The texts that say `0.x` (`docs/releasing.md`, README, changelog headers): they change with `1.0.0`.
- Running browsers in CI (spec "Browsers and axe in CI").
- The GitHub and npm settings only the maintainer can make.

## Further Notes

Raising a floor is a minor that says so (ADR-0083); if the derived floor is higher than the documents'
present one, the changelog of `0.57.0` says so for every package.
