# Jest and Vitest with no configuration

Type:       grilling
Status:     resolved
Blocked by: 01

## Question

Does umriss promise that a consumer's Jest and Vitest load every package without configuration - and if so,
by which change to what the packages ship?

- How the CSS reaches the page: keep the side-effect import in `dist/*.js`, or have the caller import the
  stylesheet once (a breaking change for every app; costly to reverse, so an ADR). The research found that
  no shipping shape with a CSS import from JS loads unconfigured in either runner, so "out of the box" and
  ADR-0021 ("the styles load themselves") cannot both stand.
- An `exports` `default` condition, a CJS build, or neither.
- A testing aid: a documented or exported setup (sized `ResizeObserver`, `getContext` stub, `matchMedia`) and
  the Jest recipe (`cross-package.md` 10, wish "A testing aid"); a test-mode switch that turns motion off
  (`qa.md` 3, wish `data-motion="off"`).
- How the promise is held: a consumer test in CI for both runners?

Input: the research of "What a package ships so that Jest and Vitest load it unconfigured";
`.scratch/shakedown/core.md` A3, `cross-package.md` 8-12, `qa.md`.

## Answer

Decided 2026-10-25. The maintainer answered the promise, the testing aid, the motion switch and the check.
They asked the agent to settle the remaining two points (`default` and no CJS build); those are marked
*(agent)*.

- **The promise is "a setup file plus documented lines", not "unconfigured".** Unconfigured is unreachable:
  jsdom needs polyfills and charts need a reported size, whatever the package ships. ADR-0021 stands. The JS
  keeps importing its CSS, and apps stay one import.
  - Vitest 5: `server.deps.inline: [/@umriss-ui/]`.
  - Jest 30 (babel-jest, jsdom): a CSS `moduleNameMapper` stub and
    `transformIgnorePatterns: ["/node_modules/(?!(@umriss-ui)/)"]`. Under `next/jest`, the packages go in
    `transpilePackages`.
  - ADR-0021 is amended: its premise "Vitest handles CSS imports" was wrong (amendment 2026-10-25).
    This is not a new ADR.
- **`exports` gets a `default` condition after `import`, pointing at the same ESM file** *(agent)*. Without
  it, Jest needs a `moduleNameMapper` for every entry. With it, the two lines above are enough. Commit
  message, no ADR.
- **No CJS build** *(agent)*. It would only spare Jest the `transformIgnorePatterns`. The CSS mapper would
  stay, and the dual-package hazard would come in (two copies of core's contexts).
- **The testing aid is a documented recipe, not an exported module.**
  - Core's README gets a Testing section: the runner lines above, and a setup file with the five jsdom
    polyfills (ResizeObserver, showModal, scrollIntoView, matchMedia, IntersectionObserver).
  - Charts' README gets its part: a ResizeObserver that reports a size, and a `getContext` stub.
  - The other four READMEs point at both.
  - Out of this decision: the announcer state that survives RTL `cleanup()` (`core.md` B10) is a defect
    for a fix.
- **No `data-motion="off"`.** The README's testing section names Playwright's `reducedMotion: 'reduce'`
  (0 of 520 runs flaked) and the tokens that turn motion off, including `--u-transition`, the 120 ms that QA
  missed. ADR-0045 applies.
- **Held by a consumer check in `check:dist`, which CI already runs.** The check:
  1. packs the packages;
  2. sets up a Vitest 5 project and a Jest 30 project (babel-jest, jsdom), with exactly the README's lines
     and setup files, extracted from the README;
  3. renders one component per package, including a chart's legend toggle.

  Jest, babel-jest and jest-environment-jsdom become root devDependencies. happy-dom and Jest 29 are
  neither promised nor tested.
- **Touches:** every package's `package.json` (`default`), the READMEs of core and charts plus pointers in
  the other four, `scripts/check-dist.ts`, the root `package.json`, and ADR-0021 (amended here).
- **Becomes the spec** `.scratch/test-runners/`, through `/to-spec`.
