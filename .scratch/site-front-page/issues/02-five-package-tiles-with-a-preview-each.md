# 02: Five package tiles with a preview each

Status: done
Blocked by: 01 (The front page invites, in the site's dress)
Spec: `.scratch/site-front-page/spec.md`

**What to build:** Five tiles in the package list's order (three columns from 1100 px, two from 700 px, one below), each one link to its package's landing, holding: a preview of the first scenario in the current theme, the display name as heading, npm name and version in the monospace face, the role, and what it needs, read from the manifest's `@umriss-ui` peers ("stands alone", "needs core", "needs core and charts"); core carries "Start here". Each tile has a light and a dark lazy image; CSS shows the one matching the stored theme (or the system without it), so only one is downloaded. A hand-run `pnpm previews` serves the built site, photographs each landing's first scenario stage at 1200 × 750 in both themes with the installed Playwright, and writes ten checked-in PNGs that the build copies into the site.

- [x] Unit tests of the dependency line: no peers, core, core and charts.
- [x] The guard: five tiles, each linking a landing page in the sitemap, both preview files present and each under 300 kB; the build fails if one is missing.
- [x] `pnpm previews` renews all ten images; they are checked in.
- [x] The tile previews follow a theme switched on the page.
- [x] Each preview's alternative text is "<Display name>: <first scenario's title>".

## Comments

**Delivered.** The front page has a "Packages" section between the collage and "What sets it apart": five tiles in the package list's order (one column, two from 700 px, three from 1100 px), each one `<a class="tile">` to its landing page holding the preview (light and dark `img`, both `loading="lazy"`, 1200 × 750), the display name as h3, npm name and version in Geist Mono, the role from `@umriss-ui/demo/packages` and the dependency line. Core carries a "Start here" badge on its picture. The dependency line is `dependencyLine` in `packages/demo/src/tooling/install.ts`, from the same ordered `@umriss-ui` peers as `installCommand`. The alternative text is "<Display name>: <first scenario's title>", the title read from the landing page's prerendered text (the first h3 under "Scenarios"); the build stops if a landing names no scenario. Which image shows is CSS only, on the style the before-paint script sets: `:root[style*="dark"]` / `:root:not([style*="light"])` inside `prefers-color-scheme: dark`. The script was not changed (smaller than editing it in six places). `pnpm previews` (`scripts/previews.mjs`) serves `site/` under `/umriss-ui/` from a `node:http` server on a free port (not 4173–4177), opens each landing page at 1280 × 800 with the theme stored as the switch stores it, and photographs the first `.scenarioStage` from its top left corner into `scripts/previews/<id>-<theme>.png`. The build copies that directory into `site/previews/` before the guard runs. The ten images are checked in, 83–117 kB each.

**Tests.** `dependencyLine`: three unit tests in `tests-unit/install.test.ts` (no peers, core, core and charts in either manifest order). `frontFaults` now also takes the landing addresses and a map of every PNG in the site to its size. It checks one tile per package in list order, each linking its landing page and that page in the sitemap; exactly two previews per tile, each a file of the site under 300 kB; and alternative text "<name>: …". Three new unit tests in `tests-unit/site.test.ts`. `pnpm build:pages` fails its guard only on the known core/theming faults (unlinked ADR-0012/0013, from main), and on nothing of this ticket. A browser check (a scratch Playwright script under the lock, built site) found the following. At 1440 the grid has three columns, at 800 two, at 390 one, with no sideways scroll. A light system loads only the five light images, a dark system only the dark ones. A stored light on a dark system shows light. The theme switch shows and then loads the dark ones. Without JavaScript the system's dark decides. `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` are green.

**Baselines.** None exist for the front page; none moved.

**Deviations.**
- At 1280 × 800 a demo's stage is 988 px wide, not 1200, and a clip is limited to the viewport. So the stage is photographed at a device scale: the smallest of 1, 1.25, 1.5, 1.5625, 1.875 and 2 at which 1200 × 750 fits into it. Core, charts and schedule are taken at 1.25, calculation at 1.5 and table at 1.875 (its stage is only 426 px high). The stage's right edge is cut. Only these scales give exactly 1200 × 750: at a fractional clip Chromium came out at 1199 × 749.
- Without JavaScript the browser loads both images of a tile: Chromium does not lazy-load when scripting is off, as the HTML standard says. With JavaScript, only the shown one is fetched.
- The first build after a fresh clone without `scripts/previews/` fails its guard by design. Since the images are checked in, this happens only if someone deletes them.
