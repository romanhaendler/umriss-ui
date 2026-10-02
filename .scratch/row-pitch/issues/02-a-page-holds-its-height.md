# 02 — A page holds its height

Status: ready-for-agent
Type: feature
Blocked by: 01

## What

With a pagination bar and more than one page:
- a short last page ends in one unlined filler row of the missing rows'
  pitches (`aria-hidden`, outside the grid's lines);
- `loading` without rows shows `pageSize` placeholders (four without a bar,
  as before);
- a result that is empty after rows were shown keeps the height of
  `min(rows, pageSize)` pitches, the message at its top.

## Acceptance

- Unit: filler present with the right count on a short last page, absent on
  one page; placeholders = pageSize; the empty body's height.
- Browser: "Next" stands on the same pixel on page 1, the last page and an
  empty result, at 1280 and 390 px.
