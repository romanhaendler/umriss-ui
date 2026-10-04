# Spec: Concepts and changelogs on the site

Status: done

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/docs-structure/spec.md` (the documents' places and names), ADR-0037 (pages as paths, prerendered), ADR-0032 (what umriss is not), `docs/README.md` "What is deliberately not here".
Blocked by: `shell-across-packages` (the document pages wear its header, theme key and favicon)
ADR: ADR-0046 "The site renders the workspace's own documents". It amends the first paragraph of `docs/README.md` "What is deliberately not here".
Tickets: `issues/01`–`03`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

The site documents components and nothing around them. What a developer needs to understand the library as a whole lives only on GitHub, in markdown files a visitor of the site never finds:

- the design language: the tokens, the type, colour as information;
- the industrial standards umriss follows, and where it does not (ISA-18.2, ISA-101);
- what umriss deliberately does not build;
- what changed in each version.

Every component page ends its "Known limits" with a link to ADR-0032, which drops the reader out of the site onto a GitHub blob. The changelogs are the only record of what a release changed for a caller, yet the site does not show that a release happened. The front page cannot say "new in 0.24.0", because there is no page to point at.

In Diátaxis terms the site has reference and how-to (pages and examples) and almost no explanation. The explanation exists, written and maintained, in four documents. `docs/README.md` deliberately rules out "a documentation website beside the demos" and "a prose copy of the demos". It also says that a site hosting the workspace's prose is "a product decision with a spec of its own". This is that spec.

## Solution

The pages build renders a fixed set of the workspace's own markdown documents as pages of the same site. It renders them, it does not copy them: the markdown in the repository stays the only source and is read at build time. The pages are:

- **Design language**: `docs/design-language.md`, at `/design-language/`.
- **Standards**: `docs/standards.md`, at `/standards/`.
- **What umriss-ui is not**: ADR-0032, at `/what-umriss-ui-is-not/`.
- **Changelog** of each package: `packages/<package>/CHANGELOG.md`, at `/<package>/changelog/`.

They wear the site's header (wordmark, packages, theme) and are prerendered, in the sitemap and checked by the guard like every page. The front page gains a "What's new" strip with each package's latest version, linked to its changelog entry, and links to the three concept documents in its foot. Every demo page and every document page ends with a "Suggest an edit" link that opens a prefilled GitHub issue.

## User Stories

1. As a developer evaluating umriss-ui, I want to read the design language on the site, so that I understand why the components look and behave as they do without leaving for GitHub.
2. As a developer in an industrial setting, I want the standards page on the site, so that I can check which parts of ISA-18.2 and ISA-101 umriss follows before I commit to it.
3. As a developer evaluating umriss-ui, I want "What umriss-ui is not" on the site, so that I know early what I will have to build or bring myself.
4. As a developer reading a component's known limits, I want the link to "What umriss-ui is not" to stay on the site, so that I do not lose my place in the documentation.
5. As a developer upgrading, I want each package's changelog on the site, so that I read what changed for me before I bump the version.
6. As a developer upgrading, I want each version a heading with its own anchor, so that I can link a colleague to exactly the release that matters.
7. As a developer upgrading across breaking changes, I want the "Changed" sections easy to spot, so that I read what breaks first.
8. As a developer evaluating umriss-ui, I want the front page to show the latest version of each package with its title and month, so that I see the project is alive.
9. As a developer, I want each "What's new" entry to lead to that version's entry in the changelog, so that one click shows me the change.
10. As a developer using a package, I want a "Changelog" link in the package's navigation, so that I find its history from any of its pages.
11. As a developer reading a document page, I want the same header as on the demos, so that I can go on to any package from there.
12. As a developer reading the design language, I want its links to other rendered documents to stay on the site, so that reading flows from one document to the next.
13. As a developer reading a document page, I want links to files that are not rendered (ADRs, source) to lead to GitHub, so that no link is dead.
14. As a reader of a document page, I want my stored theme applied, so that the site does not flash between demo and document.
15. As a screen-reader user, I want document pages structured by their own headings with one h1, so that I can navigate them like any page.
16. As a search engine, I want the document pages in the sitemap with a title, a description and a canonical address, so that "umriss-ui changelog" or "ISA-101 React" finds them.
17. As a coding agent, I want the document pages listed in the site's `llms.txt`, so that I can read the design rules and the changes as well as the components.
18. As a developer who finds a mistake on a page, I want a "Suggest an edit" link that opens a GitHub issue naming the page, so that reporting it costs me one click and no copying.
19. As a developer without a GitHub account, I want the link to say where it leads, so that I am not surprised by a login page.
20. As the maintainer, I want the documents rendered from their markdown at build time, so that there is still one source and nothing to keep in step.
21. As the maintainer, I want the build to fail when a changelog's newest version differs from its manifest's version, so that a release without its changelog entry never ships.
22. As the maintainer, I want the build to fail when a rendered document's internal link resolves nowhere, so that renaming a document cannot silently break the site.
23. As the maintainer, I want the set of rendered documents named in one list in the build, so that adding a document is a one-line decision and not an accident.
24. As the maintainer, I want an issue opened from "Suggest an edit" to carry the page's address and title, so that I know what the reporter was looking at.

## Implementation Decisions

**What is rendered, and only that.** One list in the pages build names the documents and their addresses:

| Document | Address | Title |
|---|---|---|
| `docs/design-language.md` | `/design-language/` | Design language – umriss-ui |
| `docs/standards.md` | `/standards/` | Industrial standards – umriss-ui |
| ADR-0032 | `/what-umriss-ui-is-not/` | What umriss-ui is not – umriss-ui |
| `packages/<package>/CHANGELOG.md` (five) | `/<package>/changelog/` | Changelog – @umriss-ui/<package> |

Other ADRs, the journal, CONTEXT.md, CONTRIBUTING.md, testing and releasing are for contributors and stay on GitHub only. ADR-0032 is the one ADR written for callers, which is why it is in the list.

**Rendered, not copied.** The build reads each markdown file and renders it to HTML with the markdown renderer the shell tooling already uses for the prerendered pages, with the same escaping. No rendered output is checked in. The page's h1 is the document's first heading. Its meta description is the first paragraph, stripped of markup and cut at the last word boundary before 160 characters.

**Addresses.** The three concept documents stand at the site root, beside the package directories. A changelog stands inside its package's directory. That address is not a page of the demo's outline: the demo's click handler already leaves addresses it does not know to the browser, so a link from a demo page to its changelog is a full load of a static page. That is intended, because document pages are static.

**Links inside documents.** A relative link to another rendered document becomes that document's site address. A relative link to anything else in the repository becomes the GitHub address of that file on `main`. Anchors are kept. A link that resolves to neither (a file that does not exist) fails the build.

**Changelog anchors and "What's new".** Each version heading (`## 0.24.0 – The select's own list (Oct. 2026)`) gets the anchor `v0-24-0`. The build reads the first version heading of each changelog: version, title after the dash, and the month in parentheses. If the version is not the manifest's version, or the heading does not have that shape, the build fails. The front page shows the result as a "What's new" strip under the package tiles, one line per package: "<Display name> <version> – <title> (<month>)", linked to the anchor. The "Changed", "Added" and "Fixed" subheadings render as they are. "Changed" is styled with the warning token's edge on its left, with the word "Changed" itself kept, so no colour stands alone.

**The document layout.** Document pages use the static layout of the front page (`site-front-page`): the same header (wordmark, five package links, theme switch), the shared theme key with its before-paint script, the favicon, the Geist faces and the token colours. Below the header: a reading column of about 46 rem with the rendered markdown, and a foot. Long changelogs get no table of contents of their own; the version headings are the structure, and the page is searchable with the browser's find. They stay static: no JavaScript beyond the theme and copy scripts.

**Where they are linked.**
- Every component page's "Known limits" link to ADR-0032 points to `/what-umriss-ui-is-not/` instead of GitHub (one constant in the shell).
- The foot of each demo's sidebar, where `shell-across-packages` puts GitHub, npm and `llms.txt`, gains "Changelog".
- The front page's foot gains "Design language", "Standards" and "What umriss-ui is not".
- The site's `llms.txt` gains a "Documents" section with the three concept pages and five changelogs, linked to their rendered pages.

**Suggest an edit.** Every demo page and every document page ends with one link, "Suggest an edit on GitHub". It opens GitHub's new-issue form for the repository with the title "Docs: <page title>" and a body holding the page's address and one empty line for the reader's text. It is a plain link with prefilled query parameters; there is no backend, form or widget. On demo pages it is rendered by the shell under the page; on document pages by the layout. Its text names GitHub, so that nobody is surprised by a login.

**ADR-0046.** It records that the site renders a fixed list of the workspace's own documents from their source at build time, and why that is not the "website beside the demos" `docs/README.md` rules out: no second text exists, so nothing can drift. The first paragraph of "What is deliberately not here" in `docs/README.md` is rewritten to say so and to name the list's place. "No prose copy of the demos" stands unchanged.

## Testing Decisions

A good test reads the built site: which pages exist, what their head says, where their links go. It never inspects the renderer.

- **Seam: the built-site guard** (prior art: its sitemap, title, description, canonical and h1 checks, which cover the new pages automatically once they are in the sitemap). It gains:
  - every document in the list has a page;
  - every internal link on a document page resolves to a sitemap address or to the GitHub repository;
  - each changelog's first version equals its manifest's version;
  - the front page's "What's new" strip links an existing anchor on each changelog page;
  - no page links ADR-0032 on GitHub.
- **Seam: the tooling unit tests** for the two small pure functions this needs: the version-heading reader (the shape above; a heading without month; a heading that is not a version) and the link rewriter (a rendered document, another repository file, an anchor, a missing file).
- **Seam: the page suite** (`checkPage`): on a component page the "Suggest an edit" link carries the page's title and address in its query, and the "Known limits" link points to the site page.
- **Screenshot baselines:** none for document pages. The component pages' baselines end before "Known limits", so none change.

## Out of Scope

- Rendering all ADRs, the journal, CONTEXT.md or the contributor documents.
- A migration guide, an FAQ, tutorials. They would be new text, and this spec renders existing text only.
- Editing documents on the site, comments, a "Was this helpful?" widget (it needs a third-party service on a static site; the issue link is the cheap form of it).
- A table of contents on document pages (`page-orientation` covers demo pages).
- Markdown twins of document pages (`pages-as-markdown` may add them; their source is already markdown).
- Search over document text (`one-search` indexes titles and headings only).

## Further Notes

- Siblings: `shell-across-packages` (blocks this one), `site-front-page` (gets the "What's new" strip and foot links from here), `pages-as-markdown`, `one-search` (may index the document pages' headings).
- Research: Diátaxis puts explanation beside reference, and component libraries usually lack it (discoverability_interactivity). Frequency signals such as "New" and changelogs on the front page appear in landing_pages (shadcn, AG Grid). The issue-link alternative to a feedback widget is in discoverability_interactivity. asis_site_ux section 3 records that theming, standards, changelog and ADR-0032 are GitHub-only.
- Acceptance:
  - [ ] Three concept pages and five changelog pages on the site, prerendered, in the sitemap, passing the guard.
  - [ ] No page of the site links ADR-0032 or a changelog on GitHub.
  - [ ] The front page shows each package's latest version, linked to its entry.
  - [ ] The build fails when a changelog's newest version differs from its manifest's, or a document link resolves nowhere.
  - [ ] "Suggest an edit on GitHub" on every demo and document page, prefilled with title and address.
  - [ ] ADR-0046 written; `docs/README.md` amended.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
