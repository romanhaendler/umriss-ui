# 07 — Row actions

Status: done

Spec: `.scratch/table-surface/spec.md`

## Scope

A trailing cell holding actions for the row, so acting on a row does not mean
selecting it and then travelling to a toolbar.

- Follows the library's quiet gesture: dim at rest, full opacity when the row is
  hovered **or contains focus**.
- Overflow goes into the existing menu.

Tying visibility to focus as well as hover is what keeps the actions reachable
from the keyboard rather than merely present in the accessibility tree. This is
the requirement most likely to be dropped by accident and it is the point of the
ticket.

## Acceptance

- Interaction test: tabbing into a row reveals its actions and they can be
  activated without a mouse.
- Interaction test: the overflow menu opens through the popover seam and returns
  focus correctly.
- Demo tile: a table with two direct actions and an overflow menu per row.
- Screenshot baselines in both themes, at rest and with a row hovered.

## Notes

A hover-only reveal is a common and quiet failure: it looks finished, passes
every screenshot, and is invisible to anyone not using a mouse. The focus-within
half is not a nicety here.

Actions belong to the row, not to the selection. Bulk actions on a selection are
a different thing and are not part of this ticket.
