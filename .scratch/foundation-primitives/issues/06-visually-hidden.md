# 06 — Screen-reader-only text helper

Status: done

Spec: `.scratch/foundation-primitives/spec.md`

## Scope

Add the helper for text that is available to assistive technology but not shown.
Accessibility is declared part of the definition of done for every component,
and the technique for this is currently re-derived per project.

Behaviour:

- Hides content visually while leaving it in the accessibility tree.
- Becomes visible when it receives focus, so that a skip link works.
- Renders as a span by default, with the ability to render as another element
  where the surrounding markup requires it.

## Acceptance

- Demo tile demonstrating both cases: hidden text read by assistive technology,
  and a skip link that appears on focus.
- Screenshot baseline covering the focused state, in both themes.
- No existing component changed.

## Notes

The smallest ticket here, and the one most likely to be skipped as trivial. It
is worth its own delivery precisely because it is the thing every subsequent
accessibility fix reaches for — including the ones in
`.scratch/consumable-package/issues/04-accessibility-check.md`.

Use the established clip-based technique rather than moving content off-screen
with a large offset; the offset approach breaks in right-to-left contexts and
can cause spurious scrolling.
