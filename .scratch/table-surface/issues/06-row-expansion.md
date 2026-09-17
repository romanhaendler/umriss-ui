# 06 — Row expansion

Status: done

Spec: `.scratch/table-surface/spec.md`

## Scope

Let a user open a row and see its detail below it, without losing their filter
and their page.

- A set of open row keys in the model; several rows may be open at once.
- A rendering component for the detail row, spanning the visible column count.
- The expander is a real button carrying the standard expanded and controls
  attributes.
- The detail row's content is entirely the caller's.

## Acceptance

- Companion tests for the expansion set: opening, closing, several open at once,
  and what happens to open rows when the filter changes.
- Interaction test: a row opens and closes from the keyboard.
- Demo tile with two expandable rows showing different detail content.
- Screenshot baselines in both themes with a row open.

## Notes

Decide and record what happens to open rows when the filter changes and the row
leaves the filtered set — dropping the key, or keeping it so the row re-opens if
it returns. Either is defensible; leaving it undecided means the answer differs
between the model and what a user observes. Test whichever is chosen.

The detail row spans the **visible** column count, which is derived state from
ticket 05. If 05 has not landed, span the full column count and revisit.
