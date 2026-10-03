# 01: The front page invites, in the site's dress

Status: done
Blocked by: `facade-defects` 03 (One install command, derived from the manifest), `shell-across-packages` 01 (One list of packages, one theme for the whole site), `shell-across-packages` 04 (One name and a favicon)
Spec: `.scratch/site-front-page/spec.md`

**What to build:** The front page moves out of the string in the pages build into an HTML template of its own, filled by the build, still static with no bundle. In order: H1 "umriss-ui"; the promise "React components for data-dense screens – control rooms, dashboards, planning – built to the industrial standards for alarms and limits, in English and German."; the second line naming the five packages; the buttons "Get started" (core's Installation) and "Explore the scenarios" (core's landing); the install block `npm install @umriss-ui/core` with a copy button ("Copied" for 1.6 s); the collage, framed, as one link to core's landing, with its caption; the row of five claims, each linked to the page that proves it (AlarmList, LimitLine, Benchmark, Language, the site's `llms.txt`); "Every page (<count>)" as a closed disclosure holding today's index; the foot (GitHub, npm, `llms.txt`, MIT licence). Title, description, canonical, og and JSON-LD stay as they are.

The front page gets the demos' top bar in static form (wordmark, five package links from the package list, theme switch; no search), the shared theme key with the before-paint script, the shared favicon, the demos' Geist Sans and Geist Mono (woff2 copied by the build from the installed font packages, `font-display: swap`, no font host), and the colours of the design tokens, light and dark, copied from the token stylesheet at build time in place of the template's private palette.

- [x] The built-site guard checks: one h1 "umriss-ui"; the promise; both buttons linking sitemap addresses; the install command; each claim linking a sitemap address or `llms.txt`.
- [x] Fewer than 20 links outside the disclosure; every sitemap address linked inside it (guard).
- [x] The copy button puts exactly the command on the clipboard.
- [x] At 1440 × 900 the first screen shows promise, both buttons, install command and the top of the collage; at 390 × 844 promise, buttons and command with no sideways scroll (checked once by the maintainer).
- [x] No stars, counts, logos or testimonials.
- [x] A theme chosen in a demo is the front page's theme on the next visit, and the other way round, with no light flash.
- [x] The guard finds the theme script and the favicon link on the front page.
- [x] No Courier fallback; text is set in Geist.
- [x] No colour value on the front page is written by hand; all come from the token stylesheet.
- [x] Without JavaScript the system preference decides the theme.

## Comments

**Delivered.** The front page is `scripts/front-page.html`, a template of its own; `scripts/build-pages.mjs` fills its slots (head tags, JSON-LD, package links, install command, the collage's alt text, the page count and the index) and fails on a slot it does not know. In order: the static top bar (wordmark, the five package links from `@umriss-ui/demo/packages`, theme switch; no search); h1 "umriss-ui"; the promise; the second line; "Get started" (core's Installation) and "Explore the scenarios" (core's landing); the install block from `installCommand` with a copy key ("Copied" or "Failed" for 1.6 s); the collage, framed, as one link to core's landing, with its caption; "What sets it apart" with the five claims (AlarmList, LimitLine, Benchmark, Language, `llms.txt`); "Every page (138)" as a closed `details` around today's index; the foot (GitHub, the npm scope, `llms.txt`, MIT licence → LICENSE on GitHub). Title, description, canonical, og and JSON-LD are unchanged. The before-paint script is taken from core's `demo/index.html` at build time, so it is the demos' own. The switch and the copy key are one small inline script at the end, both `hidden` until it runs. The colours: `packages/core/src/styles/tokens.css` is copied inline (comments stripped), and the page's own style uses only `var(--u-…)`. The type: the build copies the Geist Sans 400/500/600 and Geist Mono 400 woff2 from the installed `@fontsource` packages into `site/fonts/`, declared with `font-display: swap`.

**Tests.** `frontFaults` in `packages/demo/src/tooling/site.ts`, run by `build-pages.mjs` beside `siteFaults` and `twinFaults`: one h1 "umriss-ui", the promise, the install command, the theme script; both buttons and each claim lead to a sitemap address (a claim may also lead to `llms.txt`); fewer than 20 addresses linked outside the `details`; every sitemap address but the front page linked inside it. Six unit tests in `tests-unit/site.test.ts`. The favicon is already checked for every sitemap address, the front page included. `pnpm build:pages` passes (139 addresses). Browser check (a Playwright script under the lock, built site on a local `node:http` server, screenshots looked at): at 1440 × 900 the promise, both buttons, the command and the top of the collage are in the first screen; at 390 × 844 promise, buttons and command, no sideways scroll; the text is set in Geist (all four faces loaded); the copy key puts exactly `npm install @umriss-ui/core` on the clipboard and returns to "Copy"; the switch stores dark, and a demo page is then dark before its app runs; a stored light wins over a dark system before the first paint; without JavaScript the system's dark decides and the switch and copy key are hidden; no page errors or failed requests.

**Baselines.** None exist for the front page, and none moved.

**Deviations.**
- "Fewer than 20 links" is counted as distinct addresses, not anchors. There are 18 anchors outside the index today (15 addresses), and ticket 02's five tiles add anchors to the five landing pages already linked from the header. Counting anchors would fail the guard as soon as the tiles land.
- The promise sentence names "control rooms", a plant word under ADR-0035's check, which scans `packages/*/src`. So `frontFaults` takes the promise from its caller: the constant stands in `build-pages.mjs`, beside the template.
- The claims' and buttons' targets are written into the template as relative paths, and the guard fails the build if one leaves the sitemap.
- The collage has no dark variant (as the spec says), so in the dark theme it is a light picture in its frame.

**For ticket 02.** The shared before-paint script sets `style.colorScheme` on the root, not an attribute. To follow the stored theme, the tiles' CSS needs a selector on that, for example `:root[style*="dark"]`, or the script has to change in all six places together.
