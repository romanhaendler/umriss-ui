# 01 — Multi-line text field

Status: done

Spec: `.scratch/foundation-primitives/spec.md`

## Scope

Add a multi-line text field. It is the most conspicuous absence in the form
layer: today an application that needs a comment or a description drops out of
the library entirely.

Behaviour:

- Binds to the surrounding field context the way the single-line input does —
  taking its identifier, its description reference and its invalid state from
  the context unless given explicitly.
- Carries the two-size convention (small and medium) at the established radii.
- Optional growth with content, up to a caller-supplied maximum number of rows.
- Optional remaining-character indicator, tied to the native length limit.
- Explicit control over whether the browser's resize handle is offered.

No clearing cross. The cross is a single-line gesture and sits wrongly against a
box that changes height.

## Acceptance

- Demo tile covering: empty, filled, grown past its initial height, invalid,
  with a character count, disabled, both sizes.
- Screenshot baselines in both themes, reviewed rather than accepted on sight.
- Unit tests for the two pieces of pure logic: the character-count arithmetic
  and the growth clamp against the maximum.
- No existing component changed.

## Notes

Growth is measured from the DOM, so it belongs behind an effect and must survive
a controlled value changing from outside. Test that case in the demo tile by
including a button that sets a long value programmatically.
