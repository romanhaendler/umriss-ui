# The documents set right

Status: ready-for-agent
Release: 0.57.0 (no break)

Takes from the map `.scratch/release-1-0/map.md`:
[The documents agree with the source](../release-1-0/issues/10-the-documents-agree-with-the-source.md)
(findings `../release-1-0/research/10-the-documents-agree-with-the-source.md`, sections B, C, D),
[What `.scratch` still holds](../release-1-0/issues/14-what-scratch-still-holds.md) (findings
`../release-1-0/research/14-what-scratch-still-holds.md`) and
[What of the tokens and the wording changes before 1.0](../release-1-0/issues/20-what-of-the-tokens-and-the-wording-changes-before-1-0.md)
(T8 and W1; findings `../release-1-0/research/09-tokens-and-wording.md`).

## Problem Statement

No document claims what the source lacks, but the prose has drifted: six or five packages where there are
seven, 27 configurator pages where there are 31, pnpm 9, an alias that was removed, a CSV "still German", a
skill that sends an agent to `canvas.toDataURL()` where `toPng` exists. 58 comments cite tickets under
`.scratch/`, against the repository's own rule. `.scratch/` holds eleven finished folders, and documents
under `docs/` point into them.

## Solution

Each drifted statement is set right in the document; comments say what the code does and why; `.scratch/`
holds open work only, and nothing under `docs/` or in a package points into a folder that is gone.

## User Stories

1. As a reader, I want every count of packages to be seven, so that I do not look for a package I miss.
2. As an agent using the skill, I want it to name `toPng` and the seven packages, so that I write code that
   exists.
3. As a reader of `CONTEXT.md`, I want no entry about a removed alias or a German CSV.
4. As a contributor, I want `README.md`, `CONTRIBUTING.md`, `docs/testing.md` and `docs/releasing.md` to
   describe what the scripts do.
5. As a caller, I want every package README to name `API.md` as the place to look up the surface.
6. As a reader of the source, I want comments without ticket names and history.
7. As the maintainer, I want `.scratch/` to hold open work only, so that condition 14 of the acceptance is
   met but for the open specs and the two tickets only I can close.
8. As a reader of ADR-0045, I want its counts right and the sentence on values and measures (ADR-0083).

## Implementation Decisions

- **Documents, not source.** Findings B1-B6, B9-B12 and the document parts of section C of research 10 are
  each set right where the finding says "change: document". A count that can be dropped is dropped rather
  than corrected ("all packages" instead of a number); the configurator count in the two READMEs goes the
  same way.
- **Left to other specs:** B7-B8 (done with the generator's spec), B13 and the Node line of B5 ("Ready for
  `1.x`"), the WebKit and CI sentences of section C ("Browsers and axe in CI"), B11's doc comments on
  `TableView` ("Fixes without a break", the table).
- **The skill.** `toPng` instead of `canvas.toDataURL()`, seven packages with the alarms in the install
  block; the floor and "all `0.x`" are not restated there. Its repo test stays green.
- **ADR-0045** gets its present counts and the sentence that a token's value may change in a minor and a
  measure only in a major (ADR-0083), as a dated amendment, with its status line and index row following
  the guard. **ADR-0019**'s sentence that a caller hands in a part of the wording describes the candidate's
  shape; it is written with core's spec for `0.58.0`, not here, unless it is already true of the source.
- **Comments.** Every comment under `packages/*/src`, `demo`, `tests-*` and `scripts` that cites a
  `.scratch` path, a ticket by slug or number, or tells history is rewritten to what the code does now and
  why, or deleted where it says nothing else. A unit test fails for `.scratch/` in a comment of those trees.
- **`.scratch/` cleared.** The pointers from `docs/` and the packages are set right first. The three
  reference matrices and the page study research 14 names move to `docs/research/`. Then the folders
  research 14 marks "delete" go. What stays: `release-1-0` (the map), the folders of the open specs of
  these two releases, `chart-navigator` and the unbuilt rest of `open-points-roadmap` (after 1.0; where they
  finally live is the acceptance's question), and `local-docs` and `security-hardening` with their one open
  ticket each. The two undecided design notes of `straighten-0-49` and the lists "kept by judgement" and
  "wishes not taken" are reported to the coordinator before their folder is deleted.

## Testing Decisions

- `pnpm check:site` (links in READMEs) and the existing repo tests of the demo package (`skill.repo.test.ts`,
  the ADR status guard) are the seam for documents.
- One new unit test: no comment in the named trees cites `.scratch/`.
- No behaviour changes; no existing test expectation changes.

## Out of Scope

- The texts that say `0.x` (they change with `1.0.0`).
- Guards that count packages in prose.
- `docs/journal.md` (frozen) and `docs/archive`.
