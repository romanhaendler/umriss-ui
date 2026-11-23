# Browsers and axe in CI

Status: ready-for-agent
Release: 0.57.0 (no break)

Takes from the map `.scratch/release-1-0/map.md`:
[The acceptance criteria](../release-1-0/issues/03-the-acceptance-criteria.md) (conditions 3, 4, 6), with the
facts of [Accessibility and browsers: claimed and checked](../release-1-0/issues/12-accessibility-and-browsers-claimed-and-checked.md)
(findings `../release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md`) and
`../release-1-0/research/10-the-documents-agree-with-the-source.md` section C.

## Problem Statement

umriss names Chrome, Firefox and Safari as supported, and CI starts no browser at all. Firefox runs nowhere;
WebKit runs two table specs, locally, and no document says how to install it. Axe checks a sample of the
demo pages, and no document tells a caller what is aimed at and how it is checked.

## Solution

The `@quick` layout checks of all seven demos run in Chromium, Firefox and WebKit, in CI on every push. Axe
runs on every demo page, in the local visual suite as today. The documents state the aim and the check:
built to WCAG 2.1 AA, checked with axe on every demo page, no conformance declared.

## User Stories

1. As a caller, I want the three named browsers each run on every push, so that "supported" is checked.
2. As the maintainer, I want CI red when a layout check fails in Firefox, so that I learn it before a user.
3. As a contributor, I want the documents to say which browsers to install and which command runs which
   engine, so that a fresh clone runs what CI runs.
4. As a caller, I want axe to have seen every demo page, so that the sample hides nothing.
5. As a caller, I want one honest sentence on accessibility: the aim, the check, and that no conformance is
   declared.
6. As the maintainer, I want the full visual suite to stay local with its baselines, so that CI does not
   depend on darwin's screenshots.

## Implementation Decisions

- **Projects.** The Playwright configuration gains, beside the Chromium projects, a Firefox and a WebKit
  project per demo that run only the tests tagged `@quick`, light only. `pnpm test:visual:quick <package>`
  keeps meaning Chromium; an environment switch (as `DEMOS` limits packages) chooses the engines. The
  existing `table-webkit` project stays as it is.
- **`@quick` compares no screenshot**, so it can run on Linux. A `@quick` test that does compare one loses
  the tag or the comparison; the worker reports which.
- **CI.** A job in `ci.yml` beside the present one: install, build the demos, install the three engines with
  their system dependencies, run the `@quick` checks in all three. `visual.yml`'s header and
  `docs/testing.md`, `docs/releasing.md` and `CONTRIBUTING.md` say what runs where, and how WebKit and
  Firefox are installed.
- **A check that fails in one engine** for a real difference is a defect to fix in the library where it is
  small; where it is not, the test is marked for that engine with the reason, and the report lists every
  such mark. None is silenced without a line.
- **Axe on every page.** The axe specs take their pages from the demos' generated list of pages instead of
  a written sample; canvases stay excepted as today. The list of tolerated colour pairs is not touched here
  (the muted text is the candidate's). A page that fails is fixed if the fix is small and breaks nobody;
  otherwise it is reported before anything is silenced.
- **The statement.** One paragraph in the root README (aim, check, no conformance, the pair named as
  checked comes with the acceptance), and `CONTRIBUTING.md`'s sentence on the tolerated list made true.

## Testing Decisions

- The seam is the Playwright suite itself. The coordinator runs it: `@quick` in Chromium and WebKit on the
  machine, and all three engines in the Playwright Linux container before `main` is pushed, since Firefox
  does not start in a job's sandbox.
- A unit test holds that every demo's page list is what the axe specs iterate (no written sample left).
- No baseline is updated by this spec.

## Out of Scope

- The full visual suite in CI; dark mode in Firefox and WebKit.
- The muted text and the tolerated colour pairs (spec 6).
- A screen reader run (the acceptance).

## Further Notes

The worker of this spec is the only one allowed to start Playwright, and only `@quick` and the axe specs,
one demo at a time (`DEMOS=<pkg>`), on ports no other suite holds.
