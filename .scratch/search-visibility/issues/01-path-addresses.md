# 01 - Path addresses in the shell

Status: done
Type: task

Spec: `.scratch/search-visibility/spec.md` (D4, D5, D7), ADR-0036

## Scope

- `addresses()` in `packages/demo/src/outline.ts`: `addressOf` returns
  `/<page>/` and `/<page>/#<example>`; `fromAddress` reads pathname and hash.
  Scenarios stay `/#<scenario>` on the front page.
- `Shell.tsx`: `history.pushState` + `popstate` instead of `hashchange`; the
  jump counter keeps working for two examples on one page.
- At start, an old hash address (`#/card/x`) is replaced by its path
  (`history.replaceState`), so old links and bookmarks still land.
- `build-pages.mjs`: absolute base `/umriss-ui/<package>/`. The dev and
  preview servers fall back to `index.html` for deep paths (check that Vite's
  default SPA fallback covers it).
- The comments that justify the hash (`Shell.tsx`, `build-pages.mjs`) and
  "No documentation website" in `docs/README.md` are rewritten, pointing at
  ADR-0036.

## Acceptance

- `packages/demo/checks/navigation.ts`, `shell.ts` and every package's visual
  suite pass; no baseline moves. `shell.ts:114` (`/#/…` deep link) is kept as
  the test of the forwarding.
- Unit test of `addressOf`/`fromAddress` round trip, old hash included.

## Comments

Delivered. `addressOf` gives `/card/`, `/card/#example`, `/#scenario`;
`placeOfLocation(path, hash)` in `outline.ts` reads a location back into the
place, an old `#/card/x` first. The base is joined in one spot,
`packages/demo/src/href.ts` (`import.meta.env.BASE_URL`), apart from the
outline because the outline runs in Node. `Shell.tsx` moves by
`pushState`/`popstate`, keeps `hashchange` for the `#/page` links written in
the outlines' texts, forwards an old hash with `replaceState`, and takes over
every same-demo link click. `Prose`, `Page` and `Scenarios` write path hrefs.
The sidebar entries stay buttons - turning them into links would move every
baseline; the crawler gets the links from the prerendered page and the
sitemap instead.

After review: the address format has one owner again - `addressOfPlace` in
`outline.ts` (with `placeOf` and its inverse `placeOfLocation`); `addressOf`,
the texts' `#/page/example` (`href.ts` `hrefOfText`), the neighbour links and
the llms/site URLs all go through it. `fromAddress` is `fromPlace`, since it
takes a place. The click takeover only takes links that name a page of this
demo, so `llms.txt` and a neighbour demo load as documents. An unknown path
gets the site's `404.html` on GitHub Pages; the check that it lands on the
scenarios page holds for the dev and preview servers only.
