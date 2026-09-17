# 05 — Column visibility and order

Status: done

Spec: `.scratch/table-surface/spec.md`

## Scope

Let a user hide columns they do not need and reorder the ones they keep. In a
table with fourteen columns of which they care about five, that is the difference
between a usable view and a horizontal scroll.

- Visibility and order become **model state**. The model returns the visible
  column descriptors as an ordered list.
- The column descriptor gains a flag for whether a column may be hidden, so an
  identifier column can be pinned as always present.
- The column count that the empty state and the footer already derive comes from
  that list, so hiding a column keeps them correct with no further work.
- A column menu built on the existing menu and popover seam presents the choices.
  It does **not** own the state.

## Acceptance

- Unit tests for visible-column derivation with hiding and reordering applied
  **together**, and the derived column count checked against the result.
- Companion test: hiding a column does not change the page; reordering columns
  leaves the sort intact.
- Interaction test: the column menu opens, toggles a column, and reorders one.
- Demo tile covering a hidden column, a reordered pair, and a column pinned as
  always present.

## Notes

Hiding and reordering interact, and that interaction is where the bug will be —
hence the explicit "together" in the acceptance criteria. A test that exercises
each in isolation proves less than it appears to.

The column descriptor still says nothing about how a cell renders. Columns are
data for the pipeline and compositional for rendering; that separation is what
keeps this ticket cheap and it holds here.
