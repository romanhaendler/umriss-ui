# 02 — Showing metrics

Status: done
Type: task

Blocked by: 01
Spec: "Head row", "Columns", "Units", "Absence badge", "Two lines only where
one does not fit", "Sentence"; user stories 1–5

## Scope

- The head row, the number and unit columns per metric (for any count, not a
  CSS rule per count), and the rules across all metrics' figures.
- Units only on the rows that close a result: Result, interim in view, closing
  row.
- The short absence badge per absent metric, which never widens the grid.
- The measured two-line switch (10 rem for the label), with head, operator,
  badges and notes placed for it.
- The sentence with metrics, and any wording it needs in core, English and
  German.
- Take the look from the prototype's variant A (a throwaway branch, deleted
  after the release), and rewrite it properly. Do not merge it.

## Acceptance

- Rendering tests: head row, units on closing rows only, the badge, the
  sentence whole and absent, and a calculation without `metrics` unchanged.
- Browser check at 900, 360 and 300 px, light and dark: two metrics on one line
  down to 300 px, three on two lines at 360 px, `scrollWidth === clientWidth`
  on every frame. Hover band, falling line, focus ring and the Result's double
  rule looked at in both layouts.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.

## Comments

Delivered as specified, with one sharpening from the browser: the two-line switch also measures the longest label (over all its line boxes, so the answer is the same on one line or two), after a phone went to two lines where "Web team" needed 70 px. Narrow figures stand closer by width, not by the flag - by the flag, it flipped on every measure. A frame that still does not fit scrolls rather than clips (in the changelog under Changed). Checked at 900, 360 and 300 px of frame width and every 10 px between, light and dark, hover, focus, forced colours.
