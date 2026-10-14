# 08 - An open deck casts no shadow on its cards

Status: ready-for-agent
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

- [ ] Browser test: an open deck of three at `top-end`, light and dark: the
      face of card 2 just below its top edge is as light as near its bottom
      (read from the picture, not from `z-index`).
- [ ] Browser test: the same at `bottom-end` (it stays as it is).
- [ ] Browser test: while a top deck opens, sampled per frame, the element at
      a point in the front card's lower part is always the front card.
- [ ] Browser test: while it closes, the same.
- [ ] A new picture: the open deck at the top, both themes. The existing deck
      pictures are unchanged or renewed with the reason in the commit.
- [ ] Unit tests of the deck stay green.
- [ ] `pnpm check core`, `pnpm check:site`, `pnpm test:visual:quick core`.
