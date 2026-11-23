# Accessibility and browsers: claimed and checked

Type:   research
Status: resolved

## Question

What does umriss claim today about accessibility and browsers, and what checks each claim?

- Every statement in READMEs, docs and ADRs about keyboard use, screen readers, contrast, reduced motion,
  touch, and supported browsers.
- What the test suites check of it: axe or similar, keyboard tests, which Playwright projects run where
  (`docs/testing.md`, the Playwright configs, `.github/workflows/`). Firefox is said not to start in agent
  sandboxes: does CI run it?
- Claims nothing checks, and checks no claim names.

Facts only; the decision is "The acceptance criteria".

Findings: `.scratch/release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md`

## Answer

Findings: `.scratch/release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md`. Read only; no
test was run, and the bodies of the `features-*.spec.ts` files were checked by name and grep.

- **CI runs no browser.** Every accessibility, keyboard, forced-colours, touch and large-text check lives in
  the Playwright suite; `ci.yml` runs lint, `check:site`, typecheck, the jsdom unit tests, the build and
  `check:dist`. `visual.yml` is manual, Chromium only, and by its own header has never run.
- **Firefox runs nowhere**, though four documents claim "Chrome 123, Firefox 120, Safari 17.5 or newer". The
  projects are Chromium light and dark per package and one WebKit project with two table specs. No test pins
  the three floors.
- **Axe checks a sample to WCAG 2.1 AA** (24 core pages, 19 table, 7 charts, 5 schedule, all of the three
  young packages; canvases excepted). No document promises a conformance level to a caller. Two colour pairs
  are tolerated; `CONTRIBUTING.md` calls that list empty.
- **No run with a real screen reader is recorded.**
- **Keyboard is checked per component**, not as "no trap, no lost focus" across a demo; the shakedown records
  still list open keyboard items.
- **Reduced motion, forced colours, large text and touch** are held mechanically, in Chromium only.
- **No standing check**: reflow and text spacing, colour alone in chart series and `Alert`, real touch
  devices, print outside the charts. No claim at all for right-to-left, and no list of supported screen
  reader and browser pairs.
