# 03 — A grouped page counts its repeated headers

Status: done
Type: feature

## What

`pageLines` makes every page `pageSize` lines long, the headers a page repeats
because it begins inside a group counted among them. Pages are cut one after
the other; at least one line of its own per page.

## Acceptance

- Unit (grouping.test.ts): every page but the last is `pageSize` lines with
  its repeated headers, no line is lost or doubled across the pages, the page
  count follows.

## Comments

**Delivered, 2 Oct 2026.** 215e1dc. pageLines cuts pages one after the other; an invariant test over page sizes 1-7. Grouped through the column menu, "Next" stood 407 → 404 → 440 → 440 → 150 px over the pages and stands at 405 on each.
