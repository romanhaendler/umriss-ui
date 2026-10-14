# 02 - The deck glides when its distance changes

Status: done
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/toasts-held/spec.md`, Implementation Decisions ("The glide");
user stories 30, 31, 34, 35, 37, 38

## What to build

When an application changes `--u-toast-inset-top`, `-bottom`, `-start` or
`-end` while toasts are seen, the deck glides to its new place instead of
jumping, in `--u-duration-medium` with `--u-ease-out` like its height. An inset
that is `auto` for the region's edge does not move. It moves at once under
reduced motion and when the region is first drawn. A token set again to the
same value (an application may set it in every frame) causes no movement.

The move across a modal dialog is ticket 04; the hold is ticket 03 and 05.

## Acceptance

- [x] Browser test: a change of `--u-toast-inset-top` while toasts are seen,
      sampled per frame: the deck's top takes values between the old and the
      new place; under `prefers-reduced-motion` only the two.
- [x] Browser test: the same for a side token (the end side).
- [x] Browser test: the first toast stands at its place in its first frame
      (no glide in from elsewhere).
- [x] The existing browser tests of the inset tokens and of the toasts above
      a modal stay green.
- [x] `pnpm check core`, `pnpm test:visual:quick core`.

## Comments

2026-10-14: The glide runs on four registered custom properties
(`@property --_toast-top/-bottom/-start/-end`, `<length-percentage>`, inside
the components layer) that the region copies the tokens into and transitions;
each position reads the one its edge and side use. So a change of `position`
(the "Where they stand" example switches it on one region) never glides, only
a change of token does, and an inset that is `auto` or `0` for the region's
place reads no token and stays still. Departure in the mechanism, not the
behaviour: the spec says "the region transitions its four insets"; a plain
transition on `top`/`inset-inline-*` would also have glided on a change of
position (centre to start moves the start inset from 0 to the token).

"While toasts are seen" is the region's landmark state: the transition stands
on `.region[role="region"]`, so a token changed while no toast stands is taken
at once and the first toast does not glide in (a browser test changes both
tokens right before the first toast; it fails without that condition). The
reduced-motion rule names that selector too. The hold (ticket 03) takes the
landmark away while held, which then also stops the glide while held, as the
spec asks - check it stays so.

Browser tests added: the top and the end token glide (frames between old and
new), only the two values under reduced motion, the first toast in its first
frame, a token set again to its value moves nothing. Checks: `pnpm check
core`, `pnpm check:site`, `pnpm test:visual:quick core`, every toast test of
`features-basics.spec.ts` (46, the inset and modal tests among them), the
toast pictures in both themes (32) and `check:dist` green.
