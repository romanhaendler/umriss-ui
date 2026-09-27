# 02 - A static page per address

Status: ready-for-agent
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
