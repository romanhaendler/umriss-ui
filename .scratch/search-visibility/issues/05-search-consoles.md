# 05 - Search Console and Bing

Status: ready-for-human
Type: task
Blocked by: 03

Spec: `.scratch/search-visibility/spec.md` (D11)

## Scope

- The user creates a URL-prefix property for
  `https://romanhaendler.github.io/umriss-ui/` in Google Search Console, and
  the same site in Bing Webmaster Tools (Bing can import from Google).
- The HTML verification file(s) go into the repo; `build-pages.mjs` copies
  them into `site/`.
- After deploy: verify, submit `sitemap.xml`, request indexing of the front
  page and of the five demo front pages.

## Acceptance

- Both properties verified; sitemap read without errors.
- URL inspection of three pages shows the prerendered text.
