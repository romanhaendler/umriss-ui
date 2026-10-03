# 01: The concept documents are pages of the site

Status: ready-for-agent
Blocked by: `site-front-page` 01 (The front page invites, in the site's dress)
Spec: `.scratch/concepts-and-changelog-pages/spec.md`

**What to build:** One list in the pages build names the documents to render: design language at `/design-language/`, the standards at `/standards/`, ADR-0032 at `/what-umriss-ui-is-not/`. The build reads each markdown file and renders it with the renderer the prerendering already uses, in the front page's static layout (header, theme, favicon, Geist, token colours) with a reading column. H1 is the first heading, the description the first paragraph cut before 160 characters; the pages are in the sitemap. Relative links become site addresses (rendered documents) or GitHub addresses on `main` (everything else); a link to a missing file fails the build. Every "Known limits" link to ADR-0032 now points to the site page; the front page's foot gains the three documents. ADR-0046 is written, and the first paragraph of "What is deliberately not here" in `docs/README.md` is rewritten.

- [ ] Unit tests of the link rewriter: a rendered document, another repository file, an anchor, a missing file.
- [ ] Three document pages are built, in the sitemap, and pass the guard's title, description, canonical and h1 checks.
- [ ] The guard fails on an internal link of a document page that resolves nowhere, and on any page linking ADR-0032 on GitHub.
- [ ] The page suite: a component page's "Known limits" link points to the site page.
- [ ] ADR-0046 is written; `docs/README.md` is amended; no rendered output is checked in.
