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

## Comments

**State on 2026-10-10 (from the user).** The Google property is verified and
`sitemap.xml` was submitted on 7 Oct 2026; Search Console lists it as "Couldn't
fetch", 0 pages discovered. Bing has not been set up.

Checked from outside the same day: `https://romanhaendler.github.io/umriss-ui/sitemap.xml`
answers 200 with `content-type: application/xml` to a Googlebot user agent, is
well-formed, and holds 159 addresses, every one under the property. Nothing in
the repository is wrong that could be seen from here; what Google's own fetch
reported cannot be read from outside the console. Still open, with the user:

- Search Console, URL inspection of the sitemap's address, "Test live URL" - it
  says whether Google's fetch succeeds today.
- If it does: remove the sitemap entry and submit it again, then give it a few
  days; the status of a first submission often stays at "Couldn't fetch" until
  the first real read.
- The acceptance's "URL inspection of three pages shows the prerendered text".
- Bing Webmaster Tools (it can import the Google property), or a decision to
  leave it out.

