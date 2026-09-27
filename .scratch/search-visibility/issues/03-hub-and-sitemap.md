# 03 - The front page as hub, sitemap, structured data

Status: ready-for-agent
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
