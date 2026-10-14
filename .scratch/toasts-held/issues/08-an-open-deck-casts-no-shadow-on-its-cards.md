# 08 - An open deck casts no shadow on its cards

Status: done
Type: task
Size: S

Blocked by: 03 (same files; no logical dependency)
Spec: `.scratch/toasts-held/spec.md` (found while it was built, before the
release; not one of its stories)

## What to build

A reader opens a deck of three toasts at the top of the window (`top-end`)
and sees a grey gradient over the upper part of the second and third
card: the shadow of the card above. The newest card always lies in front, and
at the top edge the newest stands at the top, so its `--u-shadow-overlay`
(about 56 px downwards) falls across the 8 px gap onto the older cards. At the
bottom edge (the default) the lower card already lies in front, so nothing
shows there.

Decided by the maintainer on 2026-10-14 from a prototype (variant B):

- **In an open deck the card lower on the screen lies above the one above
  it**, wherever the deck stands. Every shadow falls under the next card; it
  shows only below the lowest card and in the gaps.
- **A closed deck stays as it is**: the newest in front, its shadow on the
  cards that peek out behind it.
- **The order changes only once the cards stand apart.** On opening, the
  cards still overlap at first; changing the order at once would put an older
  card over the front one for a moment. So on opening the order changes after
  `--u-duration-medium`; on closing at once; under reduced motion at once.
  Accepted: during the opening (about 0.2 s) the shadow still lies on the
  cards and goes at its end.
- A card that leaves keeps today's behaviour.

## Acceptance

- [x] Browser test: an open deck of three at `top-end`, light and dark: the
      face of card 2 just below its top edge is as light as near its bottom
      (read from the picture, not from `z-index`).
- [x] Browser test: the same at `bottom-end` (it stays as it is).
- [x] Browser test: while a top deck opens, sampled per frame, the element at
      a point in the front card's lower part is always the front card.
- [x] Browser test: while it closes, the same.
- [x] A new picture: the open deck at the top, both themes. The existing deck
      pictures are unchanged or renewed with the reason in the commit.
- [x] Unit tests of the deck stay green.
- [x] `pnpm check core`, `pnpm check:site`, `pnpm test:visual:quick core`.

## Comments

2026-10-14 - Built. An open deck at the top turns its order (`zIndex` rank + 1
in `useDeckPlaces`, which now takes the edge); at the bottom the order already
was the lower card above. The wait is the stylesheet's, not a timer: the
region carries `data-open`, and only there the card's transition holds
`z-index 0s var(--u-duration-medium)`. A transition takes its timing from the
style after the change, so opening jumps after `--u-duration-medium`, closing at
once, and under reduced motion (the token is 0 and the block switches the
transition off) at once. The picture helper waits for it like for any other
transition. The stylesheet guard counts `0s` as a duration by hand; it is a
delay's companion, taken on as a listed exception with its reason in
`tests-unit/stylesheets.test.ts`.

Not covered by the ticket and left as it is: a toast that arrives while a top
deck stands open lies under the cards that glide down past it for
`--u-duration-medium`, as the newest takes the lowest place at once.

Checks: the six new browser tests (shadow at top-end and bottom-end in light
and dark, the front card per frame while opening and closing; both frame tests
were seen to fail with the turn at once and with the wait on closing too), the
new picture `toast-deck-open-top` in both themes, every toast test and picture
in both themes (existing deck pictures unchanged), `pnpm check core`,
`pnpm check:site`, `pnpm test:visual:quick core`.
