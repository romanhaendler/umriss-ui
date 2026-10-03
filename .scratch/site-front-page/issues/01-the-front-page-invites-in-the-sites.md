# 01: The front page invites, in the site's dress

Status: ready-for-agent
Blocked by: `facade-defects` 03 (One install command, derived from the manifest), `shell-across-packages` 01 (One list of packages, one theme for the whole site), `shell-across-packages` 04 (One name and a favicon)
Spec: `.scratch/site-front-page/spec.md`

**What to build:** The front page moves out of the string in the pages build into an HTML template of its own, filled by the build, still static with no bundle. In order: H1 "umriss-ui"; the promise "React components for data-dense screens – control rooms, dashboards, planning – built to the industrial standards for alarms and limits, in English and German."; the second line naming the five packages; the buttons "Get started" (core's Installation) and "Explore the scenarios" (core's landing); the install block `npm install @umriss-ui/core` with a copy button ("Copied" for 1.6 s); the collage, framed, as one link to core's landing, with its caption; the row of five claims, each linked to the page that proves it (AlarmList, LimitLine, Benchmark, Language, the site's `llms.txt`); "Every page (<count>)" as a closed disclosure holding today's index; the foot (GitHub, npm, `llms.txt`, MIT licence). Title, description, canonical, og and JSON-LD stay as they are.

The front page gets the demos' top bar in static form (wordmark, five package links from the package list, theme switch; no search), the shared theme key with the before-paint script, the shared favicon, the demos' Geist Sans and Geist Mono (woff2 copied by the build from the installed font packages, `font-display: swap`, no font host), and the colours of the design tokens, light and dark, copied from the token stylesheet at build time in place of the template's private palette.

- [ ] The built-site guard checks: one h1 "umriss-ui"; the promise; both buttons linking sitemap addresses; the install command; each claim linking a sitemap address or `llms.txt`.
- [ ] Fewer than 20 links outside the disclosure; every sitemap address linked inside it (guard).
- [ ] The copy button puts exactly the command on the clipboard.
- [ ] At 1440 × 900 the first screen shows promise, both buttons, install command and the top of the collage; at 390 × 844 promise, buttons and command with no sideways scroll (checked once by the maintainer).
- [ ] No stars, counts, logos or testimonials.
- [ ] A theme chosen in a demo is the front page's theme on the next visit, and the other way round, with no light flash.
- [ ] The guard finds the theme script and the favicon link on the front page.
- [ ] No Courier fallback; text is set in Geist.
- [ ] No colour value on the front page is written by hand; all come from the token stylesheet.
- [ ] Without JavaScript the system preference decides the theme.
