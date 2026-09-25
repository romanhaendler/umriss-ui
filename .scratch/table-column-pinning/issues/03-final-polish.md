# 03 - Final polish round

Status: done
Type: task

Spec: `.scratch/table-column-pinning/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

**Done (2026-09-25).** The user took every card on the review page.

- **pin-shadow-dark**: one token, core's `--u-shadow-sticky`, for both
  shadows - a pinned block's inner edge and a stuck group header. Light as
  before (the text colour at 9 %); dark is black at 50 %, and no longer reads
  as a glow.
- **pin-menu-keys**: decided - the two keys per column stay ("Pin X to start",
  "Pin X to end", the side a column is pinned to reading "Unpin X"). The
  deviation from N2's three entries, noted in 02, is confirmed.
- **pin-header-line**: a group header draws its top line inside its cells
  (the inset hairline) in every table, as pinned tables already did; the
  border stays for the height, transparent, which forced colours draw.

Pictures renewed, each looked at: `pinning-middle`, `pinning-end`,
`pinning-grouped` and `grouping-sticky`, dark, and the example
`column--pinned-both-sides`, dark - the shadows dark instead of light, the
group header's line one pixel lower, on its tone; nothing else. The light
pictures and the other grouped pictures stay within the comparison's
tolerance (the same line one pixel lower) and were not renewed.
