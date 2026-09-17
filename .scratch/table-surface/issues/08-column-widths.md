# 08 — Column widths

Status: done

Spec: `.scratch/table-surface/spec.md`

## Scope

Let a user widen a column whose contents are clipped.

- A drag handle on the trailing edge of the header cell resizes.
- A double-click fits the column to its content.
- The column descriptor gains a flag for whether a column may be resized, and a
  default width.
- Widths are **model state**, so they serialise with everything else through
  ticket 02.

This is the first ticket in the spec that modifies the header cell.

## Acceptance

- The resize handle owns its own hit area and stops the event, so it does not
  trigger the existing sort activation on the header. Interaction test for
  exactly this: dragging the handle resizes and does **not** sort.
- Interaction test: double-clicking the handle fits the column to content.
- Widths survive a round trip through the query string.
- Existing header behaviour — sort activation, the accessibility attributes, the
  sticky header — is unchanged. Screenshot baselines must not move for a table
  at its default widths.

## Notes

The handle-versus-sort collision is the whole risk in this ticket. The header
cell currently activates a sort on click across its full area; introducing a drag
region inside it without carefully bounding the hit area produces a control that
sorts when the user meant to resize, which is precisely the kind of regression
the handoff's standing instruction forbids.
