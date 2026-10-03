# 04: One name and a favicon

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** "umriss-ui" wherever a visitor reads the project's name: every title, each demo's default `index.html` title ("umriss-ui – Core" …), the site's `llms.txt` heading and the README's heading. npm names stay `@umriss-ui/<package>`; internal documents keep "umriss". One SVG favicon (a "u" in an outlined rounded square, ink colour, inverted for dark tabs by a rule inside the SVG) is linked from every demo's `index.html` and so from every prerendered page.

- [ ] No visible title or heading on the site says "Umriss UI", "Umriss Charts" or a similar variant. (Titles and headings, yes. The header wordmark is left to ticket 02; see the comments.)
- [x] The built-site guard fails when a page does not link the favicon, and passes on the built site.
- [x] The favicon reads in light and dark tabs.
- [x] The site's `llms.txt` and the README are headed "umriss-ui".

## Comments

**Delivered.** One favicon, `packages/demo/src/favicon.svg`: a "u" in an outlined rounded square, stroked in the text token's ink (`#171717`), with a `prefers-color-scheme: dark` rule inside the SVG that switches it to the dark ink (`#ededed`). Each demo's `index.html` links it by a relative path; vite bundles it into the demo's `assets/`, so every prerendered page links it as well. `scripts/build-pages.mjs` copies it to `site/favicon.svg` for the front page and the 404 page. The default titles are now "umriss-ui – Core", "… – Charts", "… – Table", "… – Schedule" and "… – Calculation". The site's `llms.txt` and the root README are headed "umriss-ui". Core's npm README was headed "Umriss UI"; it is now headed `@umriss-ui/core`, like its four siblings.

**Tests.** The built-site guard in `build-pages.mjs` now also fails on any page whose `<link rel="icon">` is missing or points at no file in `site/`. With the favicon link taken out of calculation's `index.html`, `pnpm build:pages` failed with "no favicon" on all of calculation's pages. With the link back, the build passes (139 addresses). The favicon was rendered in emulated light and dark at 16 and 64 px and is legible in both. `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` pass. Under the lock, `features-shell`, `features-page` and `screenshots` ran in all ten projects: 1491 passed and 1 failed. The failure is `example-language--own-components` (ui-light), the same screenshot ticket 01 already reported as failing before its change.

**Baselines.** None moved.

**Deviations, and what is left for 02.** The header wordmarks "Umriss UI", "Umriss Charts" and the rest are still the `brand` prop in the five `demo/App.tsx`, and the demo smoke tests (`demo-smoke*.test.tsx`) assert them. Ticket 02 removes `brand` and writes "umriss-ui", so they were left alone here. Once 02 lands, the first box above holds. The comment at the head of `core/src/styles/tokens.css` still says "Umriss UI": it is source, not something a visitor reads.
