# 02 - The deck glides when its distance changes

Status: ready-for-agent
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

- [ ] Browser test: a change of `--u-toast-inset-top` while toasts are seen,
      sampled per frame: the deck's top takes values between the old and the
      new place; under `prefers-reduced-motion` only the two.
- [ ] Browser test: the same for a side token (the end side).
- [ ] Browser test: the first toast stands at its place in its first frame
      (no glide in from elsewhere).
- [ ] The existing browser tests of the inset tokens and of the toasts above
      a modal stay green.
- [ ] `pnpm check core`, `pnpm test:visual:quick core`.
