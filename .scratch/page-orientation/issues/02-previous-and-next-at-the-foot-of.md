# 02: Previous and next at the foot of every page

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/page-orientation/spec.md`

**What to build:** Every component page ends, after Known limits, with a previous/next pair in the outline's flat order across rubric boundaries. Each link shows "Previous" or "Next" with the rubric name and the page name.
- The first page's previous link leads to the scenarios page.
- The last page has no next link.
- The scenarios page has a next link to the first page.

They are ordinary links to page addresses, so the shell moves without a reload. The prerendered text does not gain them.

- [ ] On the last page of a rubric, "Next" names and opens the first page of the next rubric.
- [ ] The first page's "Previous" opens the scenarios page; the last page shows no "Next".
- [ ] The scenarios page shows only "Next", to the first page.
- [ ] Following a link moves in the app without a reload, and the address is the page's path.
- [ ] Shell suite green in all five demos.

## Comments

**Delivered.** `PageTurn` in `packages/demo/src/Page.tsx` is a `<nav aria-label="Previous and next page">` with up to two cards, `rel="prev"` and `rel="next"`. Each card has a small line, "Previous · <rubric>" or "Next · <rubric>", and the page name below it. The order is `ALL_PAGES`, the outline's flat order across rubrics. On the first page the previous link is "Previous" plus "Scenarios", to `/`. The last page has no next link. The scenarios page calls `<PageTurn demo={demo} />` without a page id, so it shows only next, to the first page, in the right half. The pair stands at the end of the article, after Known limits and before `{contents.column}`. Both links are plain addresses, so the Shell's link handling moves without a reload. The prerendered text comes from `scripts/build-pages.mjs`, not from React, so it does not gain the pair. Styles are under "Previous and next" in `page.css`: two cards on a grid, using the tokens only.

**Tests.** `checks/shell.ts` has two new cases. They read the chain off the sidebar, so no demo needs a new probe:
- On the last page of the first rubric, "Next" names the second rubric and its first page. Clicking it opens that page at its path without a reload.
- On the scenarios page there is only "Next", to the first page. That page's "Previous" names Scenarios and leads back to `/`. The last page has no "Next".

The axe test on the scenarios page covers the new nav. Results: `features-shell` and `features-page` in all five light projects, 215 passed and 5 skipped (the existing per-demo skips). lint, typecheck and test:unit are green.

**Pictures.** None moved. `screenshots.spec` in ui-light and table-light: 444 passed and 3 failed. All three failures happen without this change too:
- `language--own-components` was already failing, as ticket 01 reported.
- `palette-resting` and `drawer-beside-a-service-list` (ui-light) also fail with `PageTurn` taken out. Their sidebar now scrolls the active entry into view (9b080122, shell-across-packages 03), and the baselines are from before that change.

**Deviations.** None.
