# What the packages claim about their platform, and what backs it

Gathered on 2026-10-11 from the repository at 5d31cd85 for the grilling of the open points. `pnpm build` ran successfully; the facts below are read from the repo and the build output.

## 1. React

- Peer ranges: every package has `react >=18` and `react-dom >=18`. Table, schedule and calculation also peer on `@umriss-ui/core` as `workspace:^`. Schedule also peers on `@umriss-ui/charts`.
- READMEs say "React 18 or 19" (core, charts, table, schedule, calculation).
- Installed and tested: devDependencies are `react ^19.0.0` and `react-dom ^19.0.0`. The lockfile resolves `react@19.2.8` and `react-dom@19.2.8`. React 18 is not installed anywhere.
- `forwardRef` appears 75 times in 47 files in core and 3 times in 2 files in schedule. Charts, table and calculation have none.
- `docs/testing.md:72` says React 19 passes a ref through `...rest` by accident and React 18 does not, which is why `forwardRef` is kept. `packages/core/tests-unit/passthrough.test.tsx` guards it.
- No `defaultProps`, `.propTypes`, `findDOMNode`, `ReactDOM.render`, `contextTypes` or string refs in `packages/{core,charts,table,schedule,calculation}/src` (grep).
- CI is `.github/workflows/ci.yml`: a single job on ubuntu-24.04, Node 22, running lint, typecheck, `test:unit` and build. There is no `matrix` in `.github`. No React-18 run exists.

## 2. Server rendering and Server Components

- `"use client"` appears nowhere in `src/`, in the vite configs, or in the built `dist/`. Each `dist/<pkg>.js` begins with `import "./<pkg>.css";` and then minified code.
- SSR tests: `packages/charts/tests-unit/ssr.test.tsx` uses `renderToString` and checks the container, the layers, `role="img"` and `aria-busy`. `packages/core/tests-unit/fieldWidth.test.tsx:100-110` renders Input and DatePicker on a server. Its comment mentions Next.js and Remix: fields show their width in the markup, and hydration finds the same style.
- Canvas: `packages/charts/src/Chart.tsx:12` says "Canvas access happens exclusively inside effects (SSR-safe, R-7.4)". `packages/charts/src/dev.ts` does DEV detection that is robust for "Node/SSR and tests". The `ssr.test.tsx` header says the same.
- No SSR tests found for table, schedule or calculation.
- Docs: no promise about RSC or Next.js in the README, the package READMEs, or `docs/*.md` or the ADRs outside the fieldWidth test comment. A broader grep of `docs/` also matched ADR-0037 (demos prerendered), but that is about the demo site, not the library.

## 3. Bundle

One file per package, no per-module output. Raw / gzip, bytes:

| Package | JS | CSS |
|---|---|---|
| core | 239435 / 65689 | 157584 / 22904 |
| charts | 207935 / 59230 | 15269 / 3307 |
| table | 186862 / 53585 | 47862 / 7786 |
| schedule | 115949 / 32943 | 9957 / 2334 |
| calculation | 26552 / 8836 | 16350 / 3271 |

- Core and charts also ship `dist/wording/de.js`: core 13784 / 4841, charts 1853 / 979.
- Core also has a shared chunk, `formats-DrB9TuzO.js`, 2382 / 934.
- The JS imports its CSS (`import "./x.css"`).
- `sideEffects` is `["**/*.css"]` in all five.
- `exports` per package: `.` has types plus `import` pointing at `dist/<pkg>.js`; `./styles.css` is exported by all five; `./wording/de` by core and charts only. There is no `require` condition, so the packages are ESM only. `main` is set and `module` is not.
- Runtime `dependencies`: none in any package. Everything else is a peer.

## 4. Types

- `tsconfig.base.json` sets `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`, `skipLibCheck`, and target ES2022.
- `.d.ts` files are produced by `vite-plugin-dts` with `rollupTypes: true` (core's `vite.config.ts` line 14), giving one `dist/index.d.ts` per package. Core and charts also emit `de.d.ts`. The config was checked for core only.
- `any` in the built declarations: core 0, charts 0, schedule 0, calculation 0, table 1 line of 2 hits. Both are `ColumnFilter<Present<W>, any>`, at `table/dist/index.d.ts` lines 541 and 667.
- `prepublishOnly` runs typecheck, build and `check:dist`.

## 5. Stability statements

- Root `README.md` "Maturity", lines 118-126: "Every package is `0.x`, and while the first digit is `0` no version number promises compatibility. All five are released under `latest`." It adds that what changes for a caller stands in each package's `CHANGELOG.md`, and that behaviour changes "stand there under a heading of its own".
- The package CHANGELOG headers (core, charts, table, schedule, calculation) say, with small wording differences: "As long as the first digit is `0`, no number promises compatibility". The charts header adds: "**whatever changes existing behaviour stands under a heading 'Changed' of its own**, no matter which digit rose". Table says its numbers follow core's and charts' rule.
- Versions: core 0.32.0, charts 0.15.0, table 0.15.0, schedule 0.7.0, calculation 0.7.2. There is no root CHANGELOG.
- `docs/adr/0035-*.md`: "Public names that only make sense inside a plant are renamed, in one hard cut before 1.0 with a migration table in each changelog — no deprecated aliases."
- `docs/adr/0032-*.md`: the "What umriss is not" list (status: accepted, superseded in one point by ADR-0052). No sentence on 1.0 or versions (grepped for 1.0, breaking and version). It says: "what is only 'not yet' stands in each package's record and in the open specs under `.scratch/`".

## 6. Deprecated API

- `@deprecated` in `src/`: table 2, core 0, charts 0, schedule 0, calculation 0.
- Both are in `packages/table/src/types.ts`: line 78, "Is called `aggregate` now – the same values…"; line 592, "Is called `preFilter` now; the old name goes with the next minor version."

## 7. Testing aids for callers

- No package `exports` include test utilities; the manifests list only `.`, `./styles.css` and `./wording/de`.
- The READMEs and `docs/*.md` grepped have no guide to testing an application that uses the library (jsdom, canvas). `docs/testing.md` covers the repo's own tests.
- The only caller-facing hint found is `packages/charts/tests-unit/setup.ts`, the repo's own jsdom polyfills. It says jsdom has no canvas 2D context and "the scene copes with null".

## 8. Browsers and accessibility

- Browsers: `README.md:59`, `packages/core/README.md:78` and `packages/charts/README.md:96` state Chrome 123, Firefox 120, Safari 17.5 or newer. Core's README ties this to `light-dark()`; an older browser discards the tokens and shows the interface unthemed.
- Table's README repeats the list only partly; the schedule and calculation READMEs were not checked for it.
- Automated accessibility check (`docs/testing.md:104`): axe at WCAG 2.1 AA over a sample of pages, run in Playwright from `packages/{core,charts,table,schedule,calculation}/tests-visual/accessibility.spec.ts`. Three colour pairs are tolerated, each justified, listed once in `packages/demo/checks/accessibility.ts`. There is also a run with every code block open.
- `docs/testing.md:89` has a "no silent page" check that a page with keyboard-reachable stages carries a Keyboard section.
- The Playwright suites run locally on darwin only. CI runs lint, types, unit and build, so neither the axe suite nor any browser test runs in CI (ci.yml header).
- Light and dark run through Playwright projects (`docs/testing.md:182`). Which browsers those projects use was not established.

## Not established

- Which browser engines the Playwright projects cover.
- Whether any README or doc states WCAG conformance beyond the axe row.
- Whether `check:dist` verifies anything about the manifests or types.
- Behaviour under React 18, because it is not installed and not tested.
- Whether table, schedule and calculation are server-render safe, because no test covers them.
