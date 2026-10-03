# 02: The header connects the five packages

Status: done
Blocked by: 01 (One list of packages, one theme for the whole site)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** The same header on every page of every demo: the wordmark "umriss-ui" linking to the site root; a `nav` named "Packages" with five links (Core, Charts, Table, Schedule, Calculation), the current one with `aria-current="page"` and its version; the search; the theme switch; icon links "Source on GitHub", "`@umriss-ui/<package>` on npm" and "`llms.txt` for coding agents". The shell takes the package id instead of a `brand` and reads everything else from the package list. At 900 px and less the header takes two lines (wordmark, search, theme; then the package links, scrolling within themselves), and GitHub, npm and `llms.txt` move to the foot of the sidebar. The page never scrolls sideways.

- [x] The shell suite, in every demo: the wordmark links the site root; five package links, the current one with `aria-current`.
- [x] From every page of every demo, every other package and the front page are one click away.
- [x] At 390 px all five package links are reachable and the page has no horizontal overflow.
- [x] The axe run of the shell suite passes with the new header.
- [x] The `brand` prop is gone; each App hands the shell only its demo and landing sentence.
- [x] The screenshot baselines that show the header are renewed together.

## Comments

**Delivered.** The shell's header is the same bar on every page of every demo: the wordmark "umriss-ui" (a plain link to the site root, `BASE` minus its last segment: `/umriss-ui/` on the site, `/` in dev and in the test build), a `nav` named "Packages" with the five packages read from `@umriss-ui/demo/packages` (the current one is a link to this demo's root, with `aria-current="page"` and its version; the others go to `<root><id>/`, which is a full load), then the search, the theme switch and three glyph links: "Source on GitHub", "`@umriss-ui/<package>` on npm" and "llms.txt for coding agents" (`<BASE>llms.txt`). At 900 px and less the header takes two lines: wordmark, search and theme on the first, the packages on the second, which scroll sideways within themselves if they must. The three links then stand at the foot of the sidebar, with their names. `--shell-head` carries the taller header into page.css's `scroll-margin-top`, so a jump still lands clear of it. `brand` and `version` have left `ShellProps`. The shell finds its package by `demo.packageName`, and `Demo` gained `version` from the manifest that `buildDemo` already takes. Each App hands over only `demo` and `sentence`. The landing head is ticket 05's, as it stands on main.

**Tests.** The shell suite (`checkShell`, which now takes a `packageId` probe) gained three tests. 1. The wordmark links the root, the five package links appear in order, the current one has `aria-current` and its version, the others link `/<id>/`, and GitHub, npm and llms.txt carry the right `href`. 2. The header stands on a deep-linked page too. 3. At 390 px the packages sit on a second line, each one can be scrolled fully into view, the page has no horizontal overflow, and GitHub, npm and llms.txt are hidden in the header and visible at the foot of the sidebar. The existing axe run covers the new header. Before the rebase, the shell suite passed in all five light projects (130 passed). After the rebase, `features-shell` and `features-page` passed in ui-light and table-light (66 passed, 2 skipped). The demo smoke tests now look for "umriss-ui". `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` pass.

**Baselines moved.** Only core's whole-viewport pictures, which show the header, moved, each in light and dark: `palette-window` and `palette-resting` (the header behind the palette), `toast-phone` (the two-line header pushes the page behind the toast down), and `forced-combobox-cursor` and `forced-range`. Those last two had still shown the header from before ticket 01. Their renewal also takes in what main has changed since under the header: the sidebar's position and the "Keyboard" heading. The `page-scenarios` heads were renewed here at first, then dropped in the rebase in favour of ticket 05's, which owns that head.

**Tests after the last rebase** (onto 6cf4c876): `pnpm lint`, `pnpm typecheck` and `pnpm --filter @umriss-ui/demo test:unit` (192) pass. Under the lock, `features-shell` and `features-page` passed in ui-light and table-light (93 passed, 1 skipped), and the core screenshots above passed after their renewal. On the intermediate base 8a00cb3d, "a moved address lands on the page" failed in table-light. That base's `buildDemo` dropped `MOVED`, and main has since fixed it. It passes now.

**Deviations.** The prerendered pages (`build-pages.mjs`) still carry no header, so a reader without JavaScript does not get the package links (user story 28). That is the build's job, which ticket 04 owned, and this ticket's boxes do not ask for it. The GitHub link is a code glyph (two angle brackets), not the GitHub mark: the shell's glyph rules (stroke only, 1.4, no fill) leave no room for a filled brand logo.
