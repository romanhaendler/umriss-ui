# 03 — A grouped page counts its repeated headers

Status: ready-for-agent
Type: feature

## What

`pageLines` makes every page `pageSize` lines long, the headers a page repeats
because it begins inside a group counted among them. Pages are cut one after
the other; at least one line of its own per page.

## Acceptance

- Unit (grouping.test.ts): every page but the last is `pageSize` lines with
  its repeated headers, no line is lost or doubled across the pages, the page
  count follows.
