# Accessibility and browsers: claimed and checked

Ticket 12. Facts only, read from the checked-out sources on 2026-11-23; nothing was built or run. "Check" means a
test or a gate that exists in the repo; "runs in CI" means `.github/workflows/ci.yml` or `publish.yml`.

## 1. Where the checks run (the frame for everything below)

| Layer | Runs where | Browser |
|---|---|---|
| lint, `check:site`, typecheck, unit tests (vitest, jsdom), build, `check:dist`, Semgrep | CI on every push to `main` and every PR (`.github/workflows/ci.yml:23-46`) | none (jsdom) |
| Playwright suite: pictures, axe, keyboard, forced colours, touch, large text, own-base, trusted types | **not in CI.** `.github/workflows/visual.yml` is `workflow_dispatch` only, macOS, installs Chromium only (`visual.yml:28`), and its header says "NOT RUN YET: this job has never run on GitHub" (`visual.yml:1-4`); `ci.yml:1-4` says the suite stays local. `publish.yml` runs no Playwright. | Chromium |
| Playwright projects | `playwright.config.ts:51-77`: per package one `light` and one `dark` project, both `devices["Desktop Chrome"]`; plus one extra `table-webkit` (Desktop Safari, light) that matches only `head-geometry` and `group-rule` specs of the table | Chromium; WebKit for two table specs |
| Firefox | **No project, no mention in any config, workflow or test.** `grep` over `playwright.config.ts`, `scripts/`, `packages/*/tests-visual`, `packages/demo` finds no Firefox launch. `docs/agents/shakedown/README.md` ("Lessons") says Firefox does not launch in the job sandbox; `.scratch/shakedown-2026-10-31/spec.md:134` lists Firefox as not covered. CI does not run it, because CI runs no browser at all. | none |
| WebKit elsewhere | one test launches WebKit by hand and skips if not installed (`packages/core/tests-visual/features-touch-targets.spec.ts:107-112`); the calculation density suite is said to do the same (same comment). The shakedown reran its hosts in WebKit once (`.scratch/shakedown-2026-10-31/issues/41-the-sweep-over-what-no-host-covered.md`, three WebKit defects fixed). | WebKit, by hand |

Consequences read off the frame:

- Every claim marked "Playwright" below is checked only when the maintainer runs it locally on darwin. Baselines are
  `-darwin` (`docs/testing.md`, "The screenshot baselines are platform-specific"); `visual.yml` would fail on missing
  Linux baselines, and, since it installs only Chromium, the `table-webkit` project could not start there either
  (not verified: the workflow never ran).
- Many interaction and floor checks skip themselves outside "light, Chromium" (`packages/demo/checks/floor.ts:211`,
  `touchScale.ts:95`, `trustedTypes.ts:27`, and five core specs: `features-color-picker`, `touch-scale-order`,
  `features-foreign-places`, `playwright-checkable`, `features-touch-targets`, `features-touch-scale`).
- `docs/testing.md:76-78`: "Interaction tests ... run in the light project only."

## 2. Browsers: what is claimed, what checks it

**Claimed**

- Floor: "Chrome 123, Firefox 120, Safari 17.5 or newer" because tokens use `light-dark()`:
  `README.md:116-117`, `packages/core/README.md:278-281`, `packages/charts/README.md:151`,
  `packages/core/demo/outline.ts:56`, CHANGELOG `packages/core/CHANGELOG.md:1922`. Other packages' READMEs do not
  repeat it.
- Older browser: tokens discarded, interface unstyled; the application checks with `CSS.supports(...)`
  (`packages/core/README.md:279-281`).
- A build that lowers `light-dark()` (Vite 8 and Next 16 defaults) keeps a JavaScript-set dark mode light; remedy is
  `cssTarget: ["chrome123","firefox120","safari17.5"]` or a `browserslist` (`packages/core/README.md:262-271`).
- Syntax: ES2022; "an application that serves older browsers transpiles it itself" (each package README, e.g.
  `packages/core/README.md:33`; `packages/core/vite.config.ts:43` `target: "es2022"`).
- Print: charts follow the printed page, "Proved in Chromium (`page.pdf()`)" (`packages/charts/README.md:175-178`).
- Layout facts claimed "in every browser" (table row pitch, `packages/table/README.md:218`); the WebKit-only head
  geometry is the table's one cross-engine check.
- ADR-0063 states its own scope: browser tests in Chromium, "also run in WebKit and passed; Firefox was not run"
  (`docs/adr/0063-...md:123-125`).
- Tested toolchain (not browsers): Vitest 5 and Jest 30 on jsdom (`packages/core/README.md:~284`).

**Checked by**

- Chromium: the whole Playwright suite (local).
- WebKit: `table-webkit` project (two geometry specs), one hand-launched touch test, the shakedown sweep (one-off).
- `scripts/check-dist.ts:14,172-177` models the `light-dark()` collapse by running lightningcss with Vite's default
  targets (chrome 107, firefox 104, safari 16) and checks that the built CSS keeps the lowered tokens working; this is
  in CI (`pnpm -r check:dist`). It checks the lowered output, not the 123/120/17.5 floor.

**Claimed, checked by nothing**

- That Firefox 120 works at all, and that Safari 17.5 and Chrome 123 are the true floors. No test pins the numbers:
  grep for `123`, `120`, `17.5` in tests, scripts and configs finds only README and demo-outline text. No `browserslist`, `engines` or `cssTarget` in any workspace package; no old-browser run.
- Any Firefox behaviour. `docs/design-language.md:259` records a Firefox quirk (no size containment on a field root)
  that was worked around, with no Firefox test.
- WebKit and Firefox for everything outside the two table specs and the one touch test. The core, charts, schedule,
  calculation, dashboard and alarms suites run in Chromium only.
- Safari-specific behaviours known from the changelog (focus on button press, dialog focus return) are covered only
  where a defect was found and a Chromium-side test written; the engine itself is not in the loop.
- Canvas drawing (charts, schedule) outside Chromium: pictures are Chromium rasterisation.
- Linux/Windows rendering: baselines exist for darwin only.

## 3. Accessibility: what is claimed, what checks it

### 3.1 The stated standard

- "Keyboard operation and `aria` attributes are part of the definition of done" (`packages/core/README.md:553`;
  also stated in `docs/testing.md` of the axe header comment).
- Scope kept: **WCAG 2.1 AA** by axe, tags `wcag2a wcag2aa wcag21a wcag21aa`; axe best-practice rules are
  deliberately not included (`CONTRIBUTING.md:53-58`, `packages/demo/checks/accessibility.ts:11-15`,
  `docs/testing.md:80`).
- No document claims a conformance level for the product as a whole, no VPAT or conformance statement exists, and no
  README makes a "WCAG 2.1 AA" promise to an adopter; the AA scope is a test setting. (grep over READMEs, docs,
  ADRs.) ADR-0079 and ADR-0070 name WCAG 2.5.8 (24 px, AA) as met and 2.5.5 (44 px, AAA) as opt-in
  (`docs/adr/0079-...md:14-15`, `packages/core/README.md:158-165`). ADR-0078 cites WCAG 2.1.4 for the alarm list's
  single-key shortcuts (`docs/adr/0078-...md:68,82`).

### 3.2 Axe

- **What runs:** one axe run per sampled page and theme, scoped to the page block, per package
  (`packages/*/tests-visual/accessibility.spec.ts`). Samples: core 24 pages (`packages/core/tests-visual/pages.ts:57-80`,
  of the core outline's much longer page list; the count of pages left out was not measured), table 19
  (`packages/table/tests-visual/pages.ts:38-58`), charts 7, schedule 5, calculation, dashboard and alarms **every
  page** (`SAMPLE = PAGES`). Extra: every core configurator, a page with all code blocks open, an empty
  DatePicker, a toast inside a modal, and forced-colours runs of each demo's sample
  (`packages/demo/checks/forcedColors.ts`).
- **Suppressions:** `EXCEPTIONS` holds two colour pairs (muted text `#8b8b8b` on `#ffffff` up to 3.5:1, and
  `#77777e` on `#161618` up to 4.2:1, with written reasons); `OPEN` is empty; a test caps the list at 6 and demands a
  reason longer than 40 characters (`packages/core/tests-visual/accessibility.spec.ts` last two tests).
  `CONTRIBUTING.md:56-57` says "The suppression list in the file is empty"; the file holds two exceptions, so that
  sentence is out of date.
- Under forced colours the `color-contrast` rule is switched off, with a reason (`accessibility.ts:17-22`).
- Not checked by axe: canvases (charts, schedule), anything on pages outside the sample (core, table, charts,
  schedule), states that open only on interaction beyond the few listed, German wording, and axe best-practice.

### 3.3 Contrast

- **Claimed:** token pairs meet 4.5:1 text, 3:1 large type and non-text (WCAG 1.4.3, 1.4.11)
  (`packages/core/tests-unit/contrast.test.ts:1-12`). `docs/design-language.md:25` "Colour that appears always
  carries" a word or glyph.
- **Checked by:** `contrast.test.ts` (unit, CI) over tokens read from `tokens.css`; the Alert and Tag stylesheets and
  the charts' fallback colours are imported too; `themeFallbackConformance.test.ts` holds charts' substitute colours
  against the light token; axe in both themes.
- **Known exception, named in the source:** muted text token measures 3.41:1 light (`packages/core/tests-unit/
  contrast.test.ts`, held "against 3:1"); axe exceptions above mirror it; dark 4.07:1. It carries labels, units and
  hints, "never body text". `.scratch/shakedown-2026-10-31/earlier-runs-open.md` lists "TextTone doc promises
  threshold" as open.
- Translucent command-palette material cannot be measured; tested against its opaque substitute (`docs/testing.md:~196`,
  ADR-0012).
- **Checked by nothing:** contrast on canvases (chart series colours, schedule bars); `prefers-contrast: more` has one
  test (`features-tokens.spec.ts:95-102`, the muted hint only).

### 3.4 Keyboard

- **Claimed:** every interactive component has keys; each demo page that has anything in the tab order carries a
  Keyboard section (`silentPages` check, `packages/demo/checks/silentPages.ts:1-14`); chart is one tab stop that walks
  its hits (ADR-0030, `packages/charts/README.md:100-107`); schedule keys (`packages/schedule/README.md:141`);
  tree follows APG (`packages/core/docs/capabilities-tree.md:192-210`); Splitter follows the APG window splitter
  (`packages/core/README.md:517`); the grid edits on Enter/F2/Escape (ADR-0034); alarm-list keys act only with focus
  (ADR-0078).
- **Checked by:** unit tests of keys per package (`datePickerKeyboard`, `numberInputKeyboard`, `alarmListKeys`,
  `rangeKeys`, `zoomKeys`, `keys.test.ts`, `sortKeysOnce`, `columnMenuFocus`, ...); Playwright keyboard specs
  (`features-keyboard.spec.ts` in the schedule, `features-interaction.spec.ts` in charts, `features-tree`,
  `text-filter-keyboard`, `virtual-grid-focus`, `windowed`); the **own-base** check tabs through every example and
  demands a visible focus ring on every element that takes focus (`packages/demo/checks/ownBase.ts:15-18`); the
  **silent-pages** check demands a Keyboard section where something is tabbable and an Accessibility section where a
  live region exists; guards (`focusGuard.test.ts` in six packages) and the stylesheet guard demand a ring and the
  forced-colours outline on every ring rule (`docs/design-language.md:36-44`).
- **Checked by nothing / only by one-off:** that a keyboard-only user can complete every task, no focus trap and no
  focus loss (`.scratch/shakedown/accessibility.md` P11, 0.40.4, run by agents with Playwright probes, files marked
  `Status: needs-triage`; several findings fixed since, others still listed open in
  `.scratch/shakedown-2026-10-31/earlier-runs-open.md`, e.g. MultiSelect option each its own Tab stop, DatePicker Tab
  out leaves the panel open, dashboard Edit/Done drop focus). No test asserts a tab-order budget or "no trap" across
  the whole demo. Tab and Enter alone (switch user) cannot operate arrow-only widgets (Tabs, Radio, Slider, chart,
  schedule); recorded in P11 3, not claimed anywhere as supported, not decided.
- `role="application"` on the chart plot is a stated trade-off (`docs/adr/0030-...md:25-31`).

### 3.5 Screen readers

- **Claimed:** names and roles per component (README rows, the four root shapes and `aria-label` of ADR-0068);
  live regions for toasts, listbox announcements, chart readouts, schedule changes; charts summary and data table
  "for a screen reader" (`packages/charts/README.md:100-103`, `packages/schedule/README.md:148-153`); a flat
  accessibility tree for the tree view (ADR-0004); German wording speaks German (`docs/agents/shakedown/personas.md`
  P10 asks, the claim stands in ADR-0018/0019).
- **Checked by:** jsdom unit tests of roles, names and announcements (`menuRoles`, `toastAnnouncer`, `announce`,
  `listboxAnnouncements`, `columnGroupAnnounced`, `panelNamesAndFocus`); axe (name, role, ARIA validity rules at
  WCAG tags); passthrough guard on `aria-*`; silent-pages (Accessibility section where a live region stands).
- **No real screen reader was ever run.** ADR-0063 says a toast re-read "is listened to once with VoiceOver, by a
  person" (`docs/adr/0063-...md:125-126`) with no record of the result. The accessibility shakedown says
  "Not covered: real screen readers, browse mode, iOS, Firefox" and lists ten items "only a manual NVDA/JAWS/VoiceOver
  pass can settle" (`.scratch/shakedown/accessibility.md`, P10); `.scratch/shakedown-2026-10-31/spec.md:134-140` repeats
  it. The shakedown persona P10 worked from the accessibility tree and live-region text, not from audio.
- Open items from that run, found in the earlier-runs-open list, are findings the current docs do not claim away:
  picked date not in the trigger's accessible name, table sort/export silent, DateTimePicker hour field a textbox,
  Combobox/palette announcing twice, calculation disclosure buttons carrying no figure.
- **No documented screen-reader support statement exists** (which readers and browsers).

### 3.6 Reduced motion

- **Claimed:** motion follows `prefers-reduced-motion` (`packages/core/README.md:383-386`), with the nine duration
  tokens falling to `0ms`; an indeterminate progress bar goes slower, never still; a panel appears at once; alarm mark
  stands still and is ringed (`docs/design-language.md:100-110`, `docs/standards.md:77`).
- **Checked by:** `stylesheets.test.ts` guards durations outside reduced-motion blocks and the "drops the path, never
  the state" rule (`:230`); Playwright with `emulateMedia({ reducedMotion: "reduce" })` for the toast, the modal
  deck, the drawer, the control-room scenario and the alarm priority mark; the table's pinning and grouping specs run
  with it on. `playwright.config.ts` itself sets none and takes pictures with `animations: "disabled"`.
- **Checked by nothing:** that every component's motion (checkbox draw, tab underline, skeleton shimmer, collapse)
  actually stops, as a rendered behaviour; the guard reads CSS text. Canvas animations (chart draw-in, schedule) have
  no reduced-motion test found.

### 3.7 Forced colours, large text, zoom, print

- **Forced colours:** claimed in `docs/design-language.md:58-75`. Checked: every demo's first example per page plus the
  axe sample under `forcedColors: "active"` (`packages/demo/checks/forcedColors.ts`, one spec per package), specific
  specs in core, charts, table, calculation; the guard demands an outline beside every edge and ring. The verdict
  tone told by colour alone (the meter's) is "not kept", said in the design language; "the finer settling is the
  polish round's (forced-colors 04)" is an open note in the same paragraph.
- **Large text (root 200 %):** `packages/demo/checks/largeText.ts`, every page of every demo; plus
  `control-heights-root-size`, `row-pitch-root-size`. Charts: text sizes in `rem` and grow (`packages/charts/README.md:
  ~148`) but the legend and limit labels do not (shakedown P12 5, status unknown).
- **Zoom/reflow (WCAG 1.4.10), text spacing (1.4.12):** only the shakedown run (P12, 0.40.4, one-off). No standing
  test, no documentation claim.
- **Colour-vision:** the design language says "never colour alone". Shakedown P12 1-2: chart series and Alert tone are
  told by colour alone in the normal theme; verdicts in table and Stat carry word or glyph. The register
  `verdictColour.test.ts` (core) admits what the canvas cannot be read for ("What the canvas draws this check cannot
  read"). Charts offer `encoding="marks"` as an opt-in route (`packages/charts/README.md:~95`).
- **Print:** charts only, Chromium `page.pdf()` (`packages/charts/tests-visual/print.spec.ts`). Table print shows toolbar
  and pager (open, `earlier-runs-open.md`).

### 3.8 Touch

- **Claimed:** under a coarse primary pointer, hit areas at least 24 x 24 px (WCAG 2.5.8), fields 16 px,
  `touch-scale.css` opt-in grows to 44 px (`packages/core/README.md:158-165`; ADR-0070, ADR-0079; table, alarms
  READMEs repeat the opt-in).
- **Checked by:** `target-floor` suite on every page of every demo, nine hit points per target
  (`packages/demo/checks/floor.ts:1-18`), touch-scale suite on every page (`touchScale.ts`), core
  `features-touch-targets`, `touch-scale-order`, `touchScaleStylesheet.test.ts`; schedule/charts have unit tests of
  touch grab. Emulation only: `hasTouch` at 375 px in Chromium.
- **Checked by nothing:** real devices; iOS Safari touch behaviour (one WebKit launch for a typed-digit defect);
  the "behaviours follow the gesture" statement (long press, pinch, swipe) has Chromium emulation specs at best;
  pinch on the schedule and charts has no real-device record (`.scratch/shakedown-2026-10-31/README.md:202` lists
  touch and real devices as not covered).

### 3.9 Other stated properties adjacent to the question

- Trusted Types: every demo page loads under `require-trusted-types-for 'script'` (Chromium only,
  `packages/demo/checks/trustedTypes.ts`).
- Safe-area insets (`packages/core/README.md:152-157`): one Playwright spec `features-safe-area.spec.ts`; Chromium
  emulation.
- RTL and bidirectional text: no claim and no check found (grep for `dir=`, `rtl`, `bidi` not run exhaustively; the
  READMEs make no statement).
- Language: wording is English or German by subpath; `lang` attribute handling is the application's (README
  statements: "the browser's language is not read", `packages/charts/README.md:111`).

## 4. Summary of the gap list (for "The acceptance criteria")

1. Browser floor numbers are stated in four places and verified in none; Firefox is never run anywhere.
2. The Playwright suite, which holds every accessibility, keyboard, forced-colours, touch and large-text check, is not
   in CI and its only workflow has never run; on Linux it has no baselines.
3. axe covers a sample of core, table, charts and schedule pages, all pages of the three young packages; canvases are
   outside it. The suppression list holds two pairs, while CONTRIBUTING says it is empty.
4. No real screen reader run is recorded; ten questions are listed as "only a manual pass can settle".
5. Reduced motion is held by CSS-text guards and about eight behavioural specs; zoom/reflow and text-spacing have no
   standing check; colour-alone distinctions in chart series and Alert tone are known gaps (0.40.4 run).
6. No document states a conformance level, supported screen readers, or supported assistive-technology and browser
   pairs to an adopter; the WCAG 2.1 AA scope is an axe setting.
7. Checks that no claim names: the `own-base` focus-ring probe, the 24 px floor, Trusted Types, the stylesheet
   guards for forced-colour outlines and reduced-motion durations, `check:dist` residue. They hold promises the READMEs
   make only in passing (ADR-0021, ADR-0070, design-language).

## Sources read

`README.md`, `CONTRIBUTING.md`, `CONTEXT.md` (grep), `docs/testing.md`, `docs/design-language.md`, `docs/standards.md`,
`docs/releasing.md`, `docs/agents/shakedown/*`, ADR-0004, -0005, -0012, -0030, -0034, -0043, -0063, -0068, -0070, -0078,
-0079, every package README, `packages/core/docs/capabilities-tree.md`, `playwright.config.ts`, `.github/workflows/*`,
`package.json`, `scripts/check-dist.ts`, `packages/demo/checks/*`, `packages/*/tests-visual/{accessibility,forced-colors,
pages}.ts`, `packages/core/tests-unit/contrast.test.ts`, `.scratch/shakedown/accessibility.md`,
`.scratch/shakedown-2026-10-31/{README,spec,earlier-runs-open}.md`.

Not read in full: the individual `features-*.spec.ts` bodies (names and greps only), `CHANGELOG.md` beyond the grep
hits, and the unit tests besides the headers cited.
