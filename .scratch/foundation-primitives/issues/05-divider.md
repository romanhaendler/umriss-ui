# 05 — Divider

Status: done

Spec: `.scratch/foundation-primitives/spec.md`

## Scope

Add a divider as the third layout primitive beside the stack and the grid. A
separating hairline is currently re-declared as a private rule in module after
module.

Behaviour:

- Horizontal or vertical.
- Drawn from the existing hairline tokens, in both weights.
- Optional centred label.
- Presentational by default in the accessibility tree; a labelled divider that
  genuinely separates sections may be a separator with an accessible name.

## Acceptance

- Demo tile: horizontal plain, horizontal labelled, vertical inside a toolbar
  row, both hairline weights.
- Screenshot baselines in both themes.
- No existing component changed.

## Notes

Existing private hairline rules are **not** migrated onto this in this ticket.
Migration would touch a dozen components for no user-visible gain and would put
a dozen screenshot baselines at risk; it is a follow-up, if it is worth doing at
all.

The vertical variant needs a height to be visible. Take it from the flex context
rather than a fixed value, so it works at both control heights.
