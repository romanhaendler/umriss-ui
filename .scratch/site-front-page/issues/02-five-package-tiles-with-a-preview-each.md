# 02: Five package tiles with a preview each

Status: ready-for-agent
Blocked by: 01 (The front page invites, in the site's dress)
Spec: `.scratch/site-front-page/spec.md`

**What to build:** Five tiles in the package list's order (three columns from 1100 px, two from 700 px, one below), each one link to its package's landing, holding: a preview of the first scenario in the current theme, the display name as heading, npm name and version in the monospace face, the role, and what it needs, read from the manifest's `@umriss-ui` peers ("stands alone", "needs core", "needs core and charts"); core carries "Start here". Each tile has a light and a dark lazy image; CSS shows the one matching the stored theme (or the system without it), so only one is downloaded. A hand-run `pnpm previews` serves the built site, photographs each landing's first scenario stage at 1200 × 750 in both themes with the installed Playwright, and writes ten checked-in PNGs that the build copies into the site.

- [ ] Unit tests of the dependency line: no peers, core, core and charts.
- [ ] The guard: five tiles, each linking a landing page in the sitemap, both preview files present and each under 300 kB; the build fails if one is missing.
- [ ] `pnpm previews` renews all ten images; they are checked in.
- [ ] The tile previews follow a theme switched on the page.
- [ ] Each preview's alternative text is "<Display name>: <first scenario's title>".
