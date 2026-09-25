# 04 - Final polish round

Status: done
Type: task

Spec: `.scratch/charts-stacking/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

### Done (2026-09-25)

The user took the card **stack-edges**: between stacked segments a 1px line
in the ground's colour (`Canvas` under forced colours), in both encodings.
Bars draw it along each foot that stands on another bar (none on the
baseline); an area strokes the ground a pixel wider than its outline on each
side before the outline, so its fill is parted from the member above and the
upper pixel disappears under that member's fill. Carried by `edges` on the
area and bar draw items, set for stacked series only.

Tests: `draw.test.ts` (a stacked bar's foot in the ground's colour, 1px, not
on the baseline, nothing unstacked; a stacked area's ground stroke under its
outline). Moved baselines, each looked at: `area--stacked`, `bar--stacked`
and `bar--percent`, light and dark - only the lines between segments. The
dark area and dark percent pictures passed inside the tolerance but were
renewed with the rest, since their pixels changed.
