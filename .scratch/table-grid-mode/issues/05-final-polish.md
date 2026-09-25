# 05 - Final polish round

Status: done
Type: task

Spec: `.scratch/table-grid-mode/spec.md`

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

- **grid-editor-size**: the editor lies over its cell at the cell's size (the
  value stays beneath it, unseen, to hold the size); the message of a draft
  that does not validate is a core `Popover` beneath it. The field is still
  described by the `FormField`'s message, kept out of sight; the popover is
  its picture. Nothing in the table shifts - the browser test measures it.
- **grid-scroll**: the scroll area's `scroll-padding` is the sticky head's
  height and the pinned blocks' widths, measured where the table measures
  them. Two corrections the browser demanded: a pinned cell lies inside that
  padding and scrolled the table back to its start when focused, so its
  scroll target is shifted out of it by `scroll-margin` (`pinned.ts`); and a
  head cell reached by the keys is focused without scrolling - it sticks, and
  the body jumped up beneath it.
- **grid-space**: Space in a grid with selection selects or deselects the
  Active cell's row, from any of its cells; without selection it does nothing
  (and no longer starts a text edit).
- **grid-readonly**: in a grid with an editable column every cell of the body
  and the foot that does not edit carries `aria-readonly="true"`, written
  where the tab stops are. The head is left out: its cells name columns.

Tests: jsdom (`gridMode.test.tsx` Space with and without selection,
`cellEditing.test.tsx` `aria-readonly`, the message outside the table, no
edit on Space); Playwright (`features-grid.spec.ts`: the editor inside its
cell, the message beneath, the table not moving; the Active cell clear of
head and block at a phone's width - red without the padding). No picture
moved: the resting pictures show no editor.
