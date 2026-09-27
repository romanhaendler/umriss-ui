# 03 - The front page as hub, sitemap, structured data

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/search-visibility/spec.md` (D9)

## Scope

- `site/index.html` (written by `build-pages.mjs`): title "umriss – React
  component library, canvas charts, data table and Gantt schedule for
  data-dense dashboards", meta description, canonical, `og:` tags; under each
  package card a list linking every page of that package.
- JSON-LD `SoftwareSourceCode` per package (name, description, version,
  `codeRepository`, `programmingLanguage` TypeScript, `license`) on the front
  page and on each demo's front page.
- `site/sitemap.xml`: the front page and every page address, `lastmod` from
  the build date.
- `site/llms.txt` and each `<package>/llms.txt` link to the paths.

## Acceptance

- Sitemap validated against the guard from 02 (same set of URLs).
- JSON-LD passes Google's Rich Results Test (or schema.org validator) once.

## Comments

Delivered in `scripts/build-pages.mjs`: hub title and description, every page
linked under its package, JSON-LD `SoftwareSourceCode` (`@graph` on the hub,
one per demo front page), `sitemap.xml` from the same list the pages are
written from (133 addresses), `llms.txt` with absolute links and without the
plant sentence ADR-0035 had outlived. Not run through Google's Rich Results
Test - that needs the site online; do it with ticket 05.

After review: the guard over the built site stands in `build-pages.mjs` and
fails the build - every sitemap address a file with title, description,
self-canonical and h1, and no page file the sitemap misses. `404.html`
(noindex) for addresses that are no page. `HOME` is read from the manifests.
