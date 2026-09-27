# 02 - A static page per address

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/search-visibility/spec.md` (D6, D8)

## Scope

- From the data `llms.ts` already collects (outline, props tables, example
  sources through `displaySource`, scenarios), write per page
  `site/<package>/<page>/index.html`: the built demo's `index.html` with
  `<title>`, `<meta name="description">`, `<link rel="canonical">`, `og:title`,
  `og:description`, `og:url`, and inside `#root` semantic HTML — `<h1>`, the
  lead, each example as `<h2 id="<example>">` with its source in `<pre><code>`,
  the props tables as `<table>`, and links to every other page of the package.
- Title formula `<Page> – React <noun> · @umriss-ui/<package>`, the noun from
  one map; description = the summary line. The demo's front page likewise,
  with the scenarios' texts.
- `main.tsx` of the demos: `createRoot` replaces the static content (no
  hydration). Check that the static content causes no visible flash before
  the app paints; if it does, hide it with a style the app removes — never
  `display:none` for the crawler (it must stay in the DOM as text).

## Acceptance

- The guard from the spec's Testing: every page has a file with non-empty
  title, description, canonical and `<h1>`.
- Output of three pages read by hand; one page checked with JavaScript off.
- No screenshot baseline moves.

## Comments

Delivered. `renderLlms` now also returns `pages`: each page's part of the full
text, cut where it is written, turned into HTML by `marked` (a dependency of
the private `@umriss-ui/demo`, used only at build time) - headings lifted so
the page is `h1`, `#/page` links made absolute, raw markup escaped - with a
list of every page of the package at the end. `generateLlms` writes it as
`demo/.generated/pages.json`; `build-pages.mjs` puts it into the built
`index.html` per path. Guarded in `tests-unit/llms.test.ts`. The static text
stands in `#root` with a small legible style; `createRoot` replaces it. Seen
in a browser with and without JavaScript.

After review: example headings (h3 - the page's sections are h2) and the
scenarios on the front page carry their id, so `/card/#head-and-body` points
at them. The flash: with JavaScript the prerendered text is
`visibility:hidden` (a class set by an inline script in the head), so it stays
in the document but never shows unstyled; without JavaScript it shows. Title
nouns now as D8 names them (chart, table, schedule, calculation, component).
The demo's front page is titled `<package> – <description>`, as it has no
page name for the formula.
