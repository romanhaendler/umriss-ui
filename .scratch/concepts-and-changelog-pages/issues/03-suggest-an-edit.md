# 03: Suggest an edit

Status: done
Blocked by: 01 (The concept documents are pages of the site)
Spec: `.scratch/concepts-and-changelog-pages/spec.md`

**What to build:** Every demo page and every document page ends with one link, "Suggest an edit on GitHub", opening GitHub's new-issue form prefilled with the title "Docs: <page title>" and a body holding the page's address and an empty line. A plain link with query parameters, no backend. The shell renders it under each demo page; the document layout renders it on document pages.

- [x] The page suite: on a component page the link carries the page's title and address in its query.
- [x] Every document page carries the link (guard).
- [x] The link's text names GitHub.
- [x] No component page's screenshot baseline changes.

## Comments

**Delivered.** `packages/demo/src/tooling/edit.ts` holds the one formula. It imports nothing, so the browser and Node both use it. It exports `EDIT_LINK` ("Suggest an edit on GitHub") and `editHref(title, url)`. `editHref` builds a link to GitHub's `issues/new` form with `title=Docs: <page title>`, and `body=` the address followed by an empty line, through `URLSearchParams`. The shell renders it as `<p class="pageEdit">` under every page in `<main>`, the scenarios page too, so it stands after the previous/next pair. Its title is the one `pageTitle` gives `document.title`, now computed once in the shell for both. Its address is the page's own address, without an example's anchor. It is styled like the other links in page text (`page.css`). `scripts/build-pages.mjs` puts the same link after each document's text, inside `<main class="document">`, and one `.document .edit` rule in `front-page.html` styles it. The prerendered demo text does not carry the link, because the spec has the shell render it.

**Tests.**
- `tests-unit/site.test.ts`: `documentFaults` fails on a document page without the link, and on one whose link names another page's title and address. These tests were written first and failed before the change. The fixture page now carries the link. The check is a block of its own in `documentFaults`, so the existing per-document block is untouched for ticket 02.
- Page suite (`checks/page.ts`), "the page ends with a suggested edit on GitHub that names it": the last link in `main` is this link, its query carries `Docs: <document.title>` and the page's address, and both follow a move to another page without a reload.
- Results: `features-page` and `features-shell` in ui-light and table-light, 121 passed and 1 skipped. `pnpm build:pages` is green, with the guard passing over all three documents. lint, typecheck and test:unit are green. The built standards page was looked at in light and dark.

**Baselines.** None moved. Page heads, examples and scenario stages end above the link. The palette-window pictures (the whole viewport on `/`) still pass in ui-light.

**Deviations.** None.
