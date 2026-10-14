# 05 - Hold and glide together

Status: done
Type: task
Size: S

Blocked by: 03, 04
Spec: `.scratch/toasts-held/spec.md`, Implementation Decisions ("The glide",
"The end of a hold together with a change of place"); user stories 27, 36

## What to build

Nothing glides while nothing is seen. A change of distance during a hold takes
effect at once, and when the hold ends the toasts appear at the new place with
their entrance, without a glide from the old one. The same when the hold ends
in the moment the place changes, and when it ends as the region moves out of a
modal dialog: a dialog that closes, the hold ending and the token going back
all at once.

## Acceptance

- [x] Browser test: a change of `--u-toast-inset-top` during a hold, then the
      hold ends: the deck's first seen top is the new place.
- [x] Browser test: the hold ends and the token changes in the same frame:
      the first seen top is the new place, no value in between.
- [x] Browser test: a modal closes, the hold ends and the token changes in
      the same frame: the same.
- [x] `pnpm check core`, `pnpm test:visual:quick core`.

## Comments

2026-10-14: A change during a hold, then the hold ends, already stood at the
new place (the registered insets snap while there is no landmark, ticket 02/
03), and so did the modal closing with the hold: the region in the closed
dialog hands on no place, since the per-frame reading of ticket 04 stops
while held. The hold ending in the same frame as the token change glided
(red): React ends the hold inside the switch's click, the landmark and its
transition come back, and a token set after it in the same task starts the
transition. Now the region gets an inline `transition: none` when the hold
ends, and the first animation frame after it reads its style and gives the
transition back, so a token set in that frame, before or after the hold
ends, is taken at once.

Departure: the browser tests use `--u-toast-inset-bottom`, not the top token,
because the "Hold the toasts" example's toasts stand at the bottom; the rule
is the same for all four distances. The sampler (`sampleTheDeck`) now also
reads the bottom distance and skips frames whose card is hidden (held). The
same-frame test runs in both orders (token first, hold first). The modal in
the third test is a plain `<dialog>` opened with `showModal()`.

Checks: `pnpm check core`, `pnpm check:site`, `check:dist`, `pnpm
test:visual:quick core`, every toast/modal/hold test of
`features-basics.spec.ts` (103, the glide, hold, deck order and "does not
move" tests among them), the toast pictures in both themes (36).
