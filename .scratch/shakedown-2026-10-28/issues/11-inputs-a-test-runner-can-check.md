# 11: Checkbox, Switch and radios can be checked by a test runner

**What to build:** A QA engineer's Playwright `.check()` / `.uncheck()` works without `force` on Checkbox, Switch, RadioGroup radios, the table's selection boxes and MultiSelect options. Today the real input is 1 × 1 px (radios 16 × 16) and invisible, and the drawn box intercepts the pointer, so the call times out. The real input covers the drawn box, invisible and full size, as SegmentedControl and FileInput already do; the drawn parts take no pointer events. The table and MultiSelect inherit it through core's Checkbox. Spec: `../spec.md` ("Playwright-checkable inputs"); repros: `../personas/p16-migration.md` 2, `../personas/p6-sven.md` 5, last run's `qa.md` 1 and `core-screens.md` 1.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A browser test calls `.check()` and `.uncheck()` without `force` on each of: Checkbox, Switch, a RadioGroup radio, a table row box, "select all", a MultiSelect option - all pass
- [ ] Hover, focus ring, forced colours and the touch hit area look and measure as before (visual suite)
- [ ] Clicking the label still toggles once
- [ ] Commit body: `Changelog core Fixed:` line
