# 02: The silent-page check, with charts and calculation filled

Status: done
Blocked by: 01 (Pages can say their keys and their accessibility)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** A browser check in the shell's checks, called by a demo with every page like the own-base check: inside the example stages, anything in the tab order requires a Keyboard section (own table or `keysOf`); anything with `aria-live` or a role of status, alert, log, timer, progressbar or meter requires an Accessibility section. Exceptions stand in the check, each with its reason. Wired into charts and calculation, whose pages are filled: every chart page gets `keysOf: ["chart"]`; tree, chain, given, metrics, what-can-go-wrong and worked-examples get `keysOf: ["calculation"]`; the Calculation page gets its Accessibility section.

- [x] Removing one `keysOf` from a chart page makes the check fail naming the page
- [x] The check passes on every page of charts and calculation; every exception carries a reason
- [x] Axe passes on one charts page with the new sections

## Comments

Delivered.

- `checkSilentPages` (`packages/demo/checks/silentPages.ts`, exported as `@umriss-ui/demo/checks/silentPages`), called by `packages/{charts,calculation}/tests-visual/silent-pages.spec.ts` with every page but the scenarios page, as own-base is; light only. "In the tab order" is what Tab reaches: per example the focus is put before the stage (`focusBeforeStage`) and Tab pressed once. A live region is `aria-live` other than `off`, or a role of status, alert, log, timer, progressbar or meter, inside `.exampleStage`. The sections are read off the page by their anchors `keyboard-<page>` and `accessibility-<page>`. A fault names the page, the example and the element.
- One exception, in the check (`UNANNOUNCED`, keyed by selector): the chart's readout `.uc-sr[aria-live]`, which every chart renders. It speaks only after a key on the plot, so where it can speak the page has a Keyboard section, and every chart page's leads to Chart, whose Accessibility section describes it. Without it every chart page would need an Accessibility section of its own, which the spec does not ask for. Schedule (ticket 03) will likely need the same for its readout.
- Filled: charts - `keysOf: ["chart"]` on installation, axis, area, bar, scatter, boxplot, stateband, matrix, limitline, controlchart, pareto, tooltip and benchmark (installation and benchmark were not in the spec's list; the check found a tabbable plot there). Calculation - `keysOf: ["calculation"]` on installation (also found by the check), tree, chain, given, metrics, what-can-go-wrong, worked-examples; the Calculation page gains three Accessibility paragraphs (the nested list and the sentence each line is read as, the derivation button's name and `aria-expanded`; the sentence in German under `wording/de`; the `aria-label` to pass, forced colours, reduced motion). Its `about` paragraph on the screen reader stays, since removing it would move the page-head baseline.
- Proof: before filling, the check failed on 12 chart and 7 calculation pages, each named. With everything filled and Area's `keysOf` removed again, it failed with "area: filled › div \"Checkout's requests per minute today\" takes Tab, and the page has no Keyboard section"; restored, it passes.
- Axe: `bar` added to the charts `SAMPLE` (a page whose Keyboard section is only the `keysOf` sentence); the calculation's sample is every page.
- Runs: lint, typecheck green; test:unit green (three core tests failed once under load - command palette, toast, tree - and passed on their own; core is untouched). Playwright under the lock: charts and calculation light+dark × silent-pages, accessibility: 63 passed, 23 skipped (dark skips the check); charts-light and calculation-light × silent-pages, features-shell, features-page: 107 passed, 3 skipped.
- Baselines: none moved - the new sections stand below the page head, and no example changed.
- `docs/testing.md` has a row for the check; both CHANGELOGs say what the pages gained.
