# 01: One list of packages, one theme for the whole site

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** Prefactor and first visible result. The shell gains one dependency-free module listing the five packages in their fixed order with directory id, display name, npm name, role and start page (today's page ids until `sidebar-tree` lands). The five copies of the theme hook leave the demos' Apps; the shell owns the only one. The theme is stored under `umriss-ui:theme` (`light` or `dark`), follows the system live while nothing is stored, survives storage that throws, and is applied before the first paint by a short inline script in each demo's `index.html` (and so in every prerendered page). The switch becomes a plain shell button with a sun/moon glyph, named "Switch to dark theme" / "Switch to light theme".

- [x] The shell suite, in every demo: pressing the switch sets `color-scheme` and stores the key; a reload keeps it, with the root dark before the app script runs.
- [x] With storage cleared, the emulated system scheme decides; with storage throwing, the switch still toggles.
- [x] On the built site the chosen theme survives a move from one package's demo to another.
- [x] No demo App contains a theme hook of its own.
- [x] The package list loads in Node without a bundler.
- [x] The switch's glyph passes the glyph check.

## Comments

**Delivered.** `packages/demo/src/packages.ts` (export `@umriss-ui/demo/packages`) lists the five packages with id, name, npm name, role and start page; the start pages carry today's ids (charts `getting-started`, table `table`, schedule `schedule`) until `sidebar-tree` moves them. It imports nothing, and `scripts/build-pages.mjs` now reads its package ids from it (`build:pages` runs Node with `--experimental-strip-types`). The theme moved from the five Apps into the shell (`packages/demo/src/ThemeSwitch.tsx`): `umriss-ui:theme` holds `light` or `dark`, nothing stored follows the system live, a throwing storage costs only the memory. The switch is a plain shell button with a moon or sun glyph, named "Switch to dark theme" / "Switch to light theme". Each demo's `index.html` carries the inline script that sets `color-scheme` before the first paint; the prerendered pages inherit it. The shell's `actions` prop is gone (its only use was the theme button); `brand` stays for ticket 02.

**Tests.** The shell suite gained three tests: the switch stores its choice and a reload is dark before the app's module runs (read at `readystatechange` → `interactive`); with nothing stored the emulated system decides, live; with storage throwing the switch still switches, without a page error. Calculation had no shell suite; it now has one (`packages/calculation/tests-visual/features-shell.spec.ts`), so all five demos run it. `packages/demo/tests-unit/packages.test.ts` loads the list in plain Node; `packages/demo/tests-unit/glyphs.test.ts` holds the shell's glyphs to the glyph rules. Charts' theme interaction test finds the switch by its new name. Across packages on the built site (`pnpm build:pages`, served under `/umriss-ui/`, checked by hand with a Playwright script): dark chosen on core is dark at the first paint of a table page, and light chosen there is light at the first paint of charts.

**Baselines.** None moved: no screenshot shows the header's actions. One screenshot fails on its own, `example-language--own-components` (ui-light, the ghost button "Today"/"Heute" drawn lighter than its baseline); it fails the same way with this ticket's App, `index.html` and shell put back to `main`, so it predates this change and was left alone.

**Deviations.** The spec's role for Core has nine words, not "at most eight"; the spec's wording was kept and no word count is checked. The shell's glyph check does not read `Example.tsx` yet: its code-block chevron is drawn at 1.5, and moving it to 1.4 would renew every example screenshot, which no ticket allows. The front page has no theme script yet (`site-front-page`).
