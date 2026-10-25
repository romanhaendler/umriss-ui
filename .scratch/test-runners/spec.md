# Vitest and Jest load umriss with the lines its README gives

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Jest and Vitest with no configuration" (its
Answer holds every decision below); facts in `docs/research/after-shakedown/jest-and-vitest.md` on the
local branch `research/jest-and-vitest`; findings `.scratch/shakedown/core.md` A3 and B10,
`cross-package.md` 8 and 10, `qa.md` 3; ADR-0021 (amended 2026-10-25).

## Problem Statement

An application's first component test fails on the first import of any umriss package, and nothing explains
why.

- **Vitest** reports `Unknown file extension ".css"`. Vitest hands a dependency to Node, and Node rejects the
  stylesheet import that each package's JS makes (ADR-0021).
- **Jest** reports "Cannot find module". Each package's `exports` offers only an `import` condition, which
  Jest's CommonJS resolver never matches.
- **jsdom** lacks five browser APIs that core's components use, so a test that gets past the import still
  fails.
- **Charts** render nothing in jsdom: no size is reported, and there is no canvas context. "Show data" opens
  no table and a legend click changes nothing.

All of it can be fixed in about 25 lines, but those lines are written nowhere. ADR-0021 even claimed that
Vitest handles CSS imports, which it does not.

## Solution

umriss promises: **a setup file plus a few documented lines per runner**. Loading with no configuration at
all is impossible: jsdom needs a setup file whatever a package ships. ADR-0021 stands, the JS keeps
importing its CSS, and an application still needs a single import.

- **Exports.** Every entry gets a `default` condition. Jest then resolves every package and subpath without
  a mapper per entry.
- **Core's README.** A Testing section with:
  - the line for Vitest;
  - the two settings for Jest, and the note for `next/jest`;
  - a setup file with the five jsdom polyfills;
  - how an end-to-end suite turns motion off.
- **Charts' README.** The part a chart needs: a ResizeObserver that reports a size, and a canvas context
  stub.
- **The other four READMEs** point at those two sections.
- **The check.** Each package's `check:dist` runs a test of that package in a Vitest project and in a Jest
  project. Both projects are set up with exactly the lines and setup files the READMEs give, so a README that
  drifts fails the check.

## User Stories

1. As an application developer on Vitest, I want to add one documented line to my Vitest config, so that my
   first test of a screen with umriss components runs.
2. As an application developer on Vitest, I want the README to tell me why that line is needed, so that I
   don't remove it as noise later.
3. As an application developer on Jest 30 with babel-jest, I want two documented settings, so that Jest
   resolves, compiles and loads every umriss package.
4. As an application developer on Jest, I want every subpath (`wording/de`, `styles.css`) to resolve with the
   same two settings, so that I don't write one mapper per entry.
5. As a Next.js developer on `next/jest`, I want the README to say that umriss belongs in
   `transpilePackages`, so that the preset's own CSS stub and compiler do the rest.
6. As an application developer, I want a copy-paste setup file with the jsdom polyfills core needs, so that a
   Modal, a Combobox or a Toast renders in a test the way it does in a browser.
7. As an application developer testing a chart, I want a documented ResizeObserver that reports a size, so
   that the chart lays out in jsdom.
8. As an application developer testing a chart, I want a documented canvas context stub, so that jsdom stops
   logging "getContext() not implemented" on every mount.
9. As an application developer testing a chart, I want "Show data" and legend toggling to work with that
   setup, so that I can test what my users do with a chart.
10. As an application developer using only `@umriss-ui/charts`, I want the chart setup in charts' own README,
    so that I don't install or read core to test a chart.
11. As an application developer using table, schedule, calculation or dashboard, I want their README to point
    at the setup sections they need, so that I find them from the package I use.
12. As an application developer, I want the README to state which runners and versions are tested (Vitest 5
    and Jest 30 on jsdom), so that I know what is promised and what is not.
13. As an application developer on happy-dom or Jest 29, I want the README to say that those may work but
    are not tested, so that I don't mistake them for a promise.
14. As a QA engineer writing Playwright screenshots, I want the README to name `reducedMotion: 'reduce'`, so
    that an open menu stops flaking on its 120 ms transitions.
15. As a QA engineer using a tool without a reduced-motion switch, I want the README to list the tokens that
    turn motion off, `--u-transition` included, so that I can set them myself.
16. As an application developer, I want my app's build to stay unchanged, so that test support costs my app
    nothing.
17. As the maintainer, I want `check:dist` to fail when a package no longer loads in Vitest or Jest with the
    documented lines, so that the promise cannot break unnoticed before a release.
18. As the maintainer, I want the check to take its config and setup files from the README itself, so that
    the README and the tested setup cannot drift apart.
19. As the maintainer, I want the check to fail when an entry under `import` has no `default` pointing at the
    same file, so that a new subpath cannot silently break Jest.
20. As the maintainer, I want a chart's test in the check to toggle a legend entry, so that the chart setup is
    proved, not just the import.
21. As the maintainer, I want ADR-0021 to state that its Vitest premise was wrong, so that no future reader
    turns down a better shape for that reason.
22. As a wrapper-library author, I want the same lines to work when my package re-exports umriss, so that my
    own consumers get the same recipe.

## Implementation Decisions

- **`exports`.** Every package's `package.json`, on every JS entry (`.` and `./wording/de`), gets a
  `default` condition after `import`, pointing at the same ESM file. There is no CJS build, no `require`
  condition and no CSS-free entry: a CJS build would spare Jest only `transformIgnorePatterns`, keep the
  CSS mapper, and bring two copies of core's contexts. `styles.css` stays as it is.
- **The documented lines.**
  - Vitest: `server.deps.inline: [/@umriss-ui/]`. The README says why: Vitest otherwise hands the package
    to Node, and Node cannot import its stylesheet.
  - Jest: a `moduleNameMapper` that maps `\.css$` to an empty stub, and
    `transformIgnorePatterns: ["/node_modules/(?!(@umriss-ui)/)"]`, so that babel-jest compiles the ESM.
    Babel's config must apply to `node_modules`, so a root `babel.config.*`, not `.babelrc`; the README says
    so.
  - Next: the packages go in `transpilePackages`, and `next/jest` covers the CSS itself.
- **The setup files.**
  - Core's README holds one fenced file with the five polyfills: ResizeObserver as a no-op, `showModal` and
    `close` on `HTMLDialogElement`, `scrollIntoView`, `matchMedia` and `IntersectionObserver`.
  - Charts' README holds one fenced file with a ResizeObserver that reports a fixed size (600 × 280 proved
    enough) and a `getContext` stub, without any internal class name of the library.
  - Each fenced block names its target file in its info string, and the check extracts the blocks by that
    name.
- **Motion.** There is no new switch and no `data-motion` attribute. The library's motion already follows
  `prefers-reduced-motion` through its tokens. The README names Playwright's `reducedMotion: 'reduce'` and
  the tokens that the reduced-motion block sets.
- **The check.** `check-dist`'s scratch consumer, which today compiles a strict TypeScript consumer, also:
  1. writes a Vitest project and a Jest project from the README blocks: core's blocks always, and charts'
     blocks for charts and schedule;
  2. links the package as an installed dependency, the way the type check does;
  3. runs one consumer test file of the package in each runner.

  Each package holds that file; it renders one representative component and asserts on what a user sees.
  Charts' file toggles a legend entry and opens "Show data". `check-dist` also asserts that every `import`
  entry has an equal `default`.
- **Dependencies.** The root moves `vitest` to 5, the promised major, and adds `jest`, `babel-jest`,
  `jest-environment-jsdom` and the Babel preset the Jest project needs.
- **ADR.** ADR-0021 keeps its decision and carries the amendment of 2026-10-25. There is no new ADR; the
  `default` condition is a commit message.

## Testing Decisions

- A good test here is a consumer's test: it imports the published entry the way an application does,
  renders, and asserts on roles, names and text. It never asserts on internal class names or module state.
- The seam is the existing scratch consumer in `check-dist`, which every package's `check:dist` runs after
  its build, in CI and in `prepublishOnly`. No new seam is added.
- Modules tested: every package's built entries under Vitest 5 and Jest 30 (babel-jest), both on jsdom.
- Prior art: the strict consumer compile in `check-dist` (scratch directory, symlinked package, `tsc` run
  under two resolutions), and the repo's own jsdom setup in the demo's tests-support, which stubs
  ResizeObserver as a no-op.
- The README is under test through the extraction: changing a documented line without the check passing is
  impossible.

## Out of Scope

- A CJS build, a CSS-free entry, or a caller-imported stylesheet. ADR-0021 stands.
- An exported testing module (`@umriss-ui/core/testing` or similar). The aid is a documented recipe.
- A `data-motion="off"` attribute or a test-mode provider prop.
- Promising or testing happy-dom, Jest 29, or Jest's experimental ESM mode.
- The announcer state that survives RTL `cleanup()` (`core.md` B10): a defect for its own fix.
- `act(...)` warnings after a chart mounts or a legend click (`cross-package.md` 10).
- `data-testid` pass-through (`qa.md` 2): the root contract has its own ticket on the map.

## Further Notes

- The research table to rely on: with `default` plus the CSS mapper plus `transformIgnorePatterns`, core and
  charts pass in Jest 29 and 30 on Node 22. With `server.deps.inline`, they pass in Vitest 5 on jsdom and
  happy-dom.
- If moving the root to Vitest 5 breaks the workspace's own unit tests beyond small fixes, that is a ticket of
  its own ahead of the check, not a reason to promise Vitest 4.
