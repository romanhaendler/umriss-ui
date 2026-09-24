# 07 — The final round on the look: to the last spark

Status: ready-for-human
Type: task

Blocked by: 04, 05, 06
Spec: `.scratch/table-grouping/spec.md` ("How it looks") · `prototype/`

The last pass before the feature is called done, in the real table, not the
prototype. It ends with the user looking at the rendered matrix and saying yes.

## Scope

Look at, correct and then freeze as baselines the whole matrix — never the
resting state alone:

- Light and dark; `regular` and `compact`.
- One, two and three levels; a group of one; a folded span, a folded header, all
  folded; a group with an absent value; long values that wrap or truncate in the
  span; an aggregate wider than its column.
- Hover on every line kind on every level (the band, the span, a row inside a
  span, a folded span); focus on every one; the selection's tri-state.
- Sticky: stacked bands while scrolling, the span value sliding, the hand-over;
  sticky row header scrolled sideways beside a span.
- Paging and a virtual window beginning inside a group.
- Phone width: the span and the band at 360 px.
- Motion stills: mid-fold, mid-regroup.
- Optical details: baselines of span value and first row, the fold glyph's
  centre, the share bar against the numbers' descenders, the Σ in the footer
  against the aggregates above it, the band's tone in dark.

## Acceptance

- Every cell of the matrix has a baseline in `tests-visual`.
- The user has seen the rendered matrix and approved it; what they changed is
  recorded here under `## Comments`.
