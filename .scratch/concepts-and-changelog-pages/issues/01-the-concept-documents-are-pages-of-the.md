# 01: The concept documents are pages of the site

Status: done
Blocked by: `site-front-page` 01 (The front page invites, in the site's dress)
Spec: `.scratch/concepts-and-changelog-pages/spec.md`

**What to build:** One list in the pages build names the documents to render: design language at `/design-language/`, the standards at `/standards/`, ADR-0032 at `/what-umriss-ui-is-not/`. The build reads each markdown file and renders it with the renderer the prerendering already uses, in the front page's static layout (header, theme, favicon, Geist, token colours) with a reading column. H1 is the first heading, the description the first paragraph cut before 160 characters; the pages are in the sitemap. Relative links become site addresses (rendered documents) or GitHub addresses on `main` (everything else); a link to a missing file fails the build. Every "Known limits" link to ADR-0032 now points to the site page; the front page's foot gains the three documents. ADR-0046 is written, and the first paragraph of "What is deliberately not here" in `docs/README.md` is rewritten.

- [x] Unit tests of the link rewriter: a rendered document, another repository file, an anchor, a missing file.
- [x] Three document pages are built, in the sitemap, and pass the guard's title, description, canonical and h1 checks.
- [x] The guard fails on an internal link of a document page that resolves nowhere, and on any page linking ADR-0032 on GitHub.
- [x] The page suite: a component page's "Known limits" link points to the site page.
- [x] ADR-0046 is written; `docs/README.md` is amended; no rendered output is checked in.

## Comments

**Delivered.** `packages/demo/src/tooling/documents.ts` holds the one list (`DOCUMENTS`: source, path, title, name), the link rewriter `documentHref` and `renderDocument`. `renderDocument` uses marked with the prerendering's escaping (markup in the text is shown, never passed through). It gives each heading a GitHub-style id, so a kept anchor lands, with `-1` on a repeated heading. It links ADR numbers block by block and leaves code blocks alone. The description is the first paragraph after an ADR's `Status:` lines, as plain text, cut at a word before 160 characters with "…". `scripts/build-pages.mjs` renders the three documents and adds them to the sitemap and to the front page's "Every page" index (a "Documents" group, because the front guard wants every sitemap address in it). It also adds them to the foot through a `{{documents}}` slot. It writes each page from `scripts/front-page.html`, with the document in place of `<main class="document">` and the layout's `./` addresses climbing to the root. The front page's copy script returns early when there is no copy key. The reading column (46 rem: prose, code, tables, quotes) is styled in the same template, from tokens only. `ADR_0032` in `outline.ts` is now `https://romanhaendler.github.io/umriss-ui/what-umriss-ui-is-not/`. `adrLinksOf` maps 0032 to it, so the closing "Known limits" line, every "(ADR-0032)" in a limit, props.json, adrs.json and llms-full lead to the site page.

**Tests.** `tests-unit/documents.test.ts` (10): the rewriter's four cases (a rendered document, another repository file, anchors kept, a missing file throws with both names), heading ids, ADR links after a code fence, escaping, the description cut, the ADR status skip, and `ADR_0032` equal to the list's page. `tests-unit/site.test.ts` adds `documentFaults` (4): a document without a page, a link into the site that is no sitemap address, any page linking ADR-0032 on GitHub. `tests-unit/references.test.ts` now expects 0032 to resolve to the site. Page suite (`checks/page.ts`): "the known limits link what umriss-ui is not on the site", with a new required probe `limits` (core `button`, table `manual-mode`, schedule `overlap`, because `appearances` has no limits). `pnpm build:pages`: every new check passes. The build still fails, but only on main's known `core/theming` ADR-0012/0013 leak. The built pages were looked at in Chromium at 1440 and 390, light and dark: Geist type, the theme key shown, no sideways scroll, one h1, no failed requests.

**Baselines.** None moved. Document pages have none, and the component baselines end before "Known limits".

**Deviations.**
- An ADR's first paragraph is its `Status:`/`Date:` lines, so the description skips that paragraph.
- ADR numbers inside the documents become links, the same rule the demo pages follow, and `siteLeaks` runs over the document pages too.
- The layout is not a second template. The document pages are cut from `front-page.html`, so `site-front-page` 02's changes reach them unasked. A comment in the template must not write the literal main tag, because the cut matches on it.
- No markdown twins for document pages. The spec puts them out of scope.

**For ticket 02.** Add the changelogs to `DOCUMENTS`. `renderDocument`'s heading ids are GitHub slugs, so version headings need their own `v0-24-0` rule. `documentFaults` already checks each listed document. The "Documents" group in the front index and the foot are generated from the list. With five changelogs the foot reaches 23 links. The front guard counts distinct addresses outside the index against its limit of 20, and today there are 18. Ticket 02 has to keep the changelogs out of the foot or raise that limit.
