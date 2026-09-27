# The demos are addressed by path and prerendered, so that a search engine can read them

Status: accepted
Date:   2026-09

Until now a demo addressed its pages by the hash (`/core/#/card`), so that the
site ran under any path without router support from the host, and
`docs/README.md` said there would be no documentation website. A search engine
ignores everything after the `#` and sees an empty `<div id="root">`: the five
demos were five indexable URLs, none with any text. umriss is to be found by
search on its own merits — no backlinks, no mentions elsewhere — and that only
works if every page is an address with its content in the HTML.

**Every demo page is a path (`/umriss-ui/core/card/`), with a static
`index.html` that carries the page's text, its examples' source and its props
tables, written from the same data as `llms.txt`. The app replaces it when it
starts.** Examples and scenarios stay anchors inside their page. An old hash
address is forwarded to its path.

## Considered options

- **Hash addresses with better metadata only.** Rejected: still five URLs.
- **`renderToString` of the real pages.** Rejected: canvas, `window` and
  generated data make every page a server-rendering risk; the llms generator
  already holds the text, from the same source, and cannot drift from the demo.
- **Snapshots by a headless browser at build time.** Rejected: browsers in the
  Pages workflow for a result the generator gives without them.
- **An own domain.** Deferred by the user; the site stays at
  `romanhaendler.github.io/umriss-ui/`. Moving it later costs ranking.

## Consequences

- The demos are built with an absolute base (`/umriss-ui/<package>/`); the site
  no longer runs under an arbitrary path.
- The static HTML is what a crawler reads first; it is a medium of the demo,
  like `llms.txt`, and is never written by hand.
- `docs/README.md`'s "No documentation website" no longer holds: the demos,
  prerendered, are that website.
