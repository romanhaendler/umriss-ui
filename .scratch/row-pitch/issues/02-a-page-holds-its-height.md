# 02 — A page holds its height

Status: done
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

## Comments

**Delivered, 2 Oct 2026.** c7c08ec. Filler, a page of placeholders, the empty result's height. "Next" stood 954 → 772 → 178 px before and stands 945 → 945 → 945 now (1280 px; 390 px: 1562 → 1262 → 239, now 1007).

**Amended, 2 Oct 2026.** In the acceptance the user found that a status filter
still shrank the table: the page held only over more than one page, and seven
rows of twenty-four were one page. A page now keeps the most lines it has
shown, up to `pageSize`, whatever restricts it - in "A dispatcher's bar"
"Next" stands at 405 px for every status, flat and grouped (before: 407, 297,
178).
