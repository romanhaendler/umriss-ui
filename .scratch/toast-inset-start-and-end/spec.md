# The toasts' distance from the window's sides is two tokens

Status: ready-for-agent
Date:   2026-10-13
Origin: a proposal made the day core 0.36.0 was released, after the toasts had
learned to stand above a modal dialog. Checked against the toast's stylesheet,
the token sheet and the browser tests of `--u-toast-inset-top` and
`--u-toast-inset-bottom` the same day. The proposal named one token; it became
one per side the same day, for the phone's sake - see "Implementation
Decisions".

## Problem Statement

An application sets how far the **Toast** deck stands from the window's top and
bottom edge: `--u-toast-inset-top` and `--u-toast-inset-bottom` keep it clear
of a fixed header or a toolbar at the bottom. The distance from the window's
sides has no such handle. It is `--u-space-5` in the toast's stylesheet,
`--u-space-4` up to 600 px wide, and nothing an application may write changes
it.

So a toast at `bottom-start` lies over a navigation rail fixed at the side, one
at `bottom-end` over a help button fixed in the corner, and an application
whose page gutter is 32 px has toasts that stand 20 px from the side and line
up with nothing. The only way out is a rule on the region's `data-along`
attribute or its class name, and both are internal (ADR-0045): they may change
in a patch.

## Solution

Two new tokens, one per side, named with the words the positions already use:
`--u-toast-inset-start` and `--u-toast-inset-end`. Set on `:root`, the first
moves the `*-start` positions away from the start side, the second the `*-end`
positions away from the end side. On a phone, where the toast takes the
window's width, each is the room left at its side.

With the two that exist, every edge of the window has its token, and each moves
the toasts of its own edge only.

Their default is the distance the toasts have today - `--u-space-5`,
`--u-space-4` up to 600 px wide - so an application that sets neither sees
nothing change. Both are listed on the Theming page with the other two, and the
Toast page's example on where the toasts stand names all four.

## User Stories

### Setting the distance

1. As a developer with a navigation rail fixed at the start side, I want to set
   the toasts' distance from that side, so that a toast at `top-start` or
   `bottom-start` stands beside the rail and not over it.
2. As a developer with a help button fixed in the bottom end corner, I want to
   move the toasts at `bottom-end` further in, so that neither covers the
   other.
3. As a developer whose page gutter is wider than 20 px, I want the toasts to
   stand at my gutter, so that they line up with the page's content.
4. As a developer, I want to set the distances with tokens on `:root`, the way
   I set the top and bottom distance, so that I learn one way and not two.
5. As a developer, I want the tokens named `start` and `end`, the words of
   `toast.position`, so that I know which token moves which position without
   looking it up.
6. As a developer, I want each token to take any length - a pixel value, a
   `calc()` with my rail's width, another token - so that it follows my layout
   and not a fixed scale.
7. As a developer, I want to set another value per width in a media query of my
   own, so that the distance follows my rail when it folds away.
8. As a developer, I want each of the four tokens to move its own edge and no
   other, so that I change one distance without checking three.

### What stays as it is

9. As a developer who sets nothing, I want the toasts to stand exactly where
   they stood - 20 px from the side, 16 px on a phone - so that an update moves
   nothing in my application.
10. As a developer who has set `--u-toast-inset-top` or
    `--u-toast-inset-bottom`, I want those to work as before, so that the new
    tokens cost me nothing.
11. As a reader, I want a toast at `top-center` or `bottom-center` to stay in
    the middle of the window whatever the side distances are, so that "center"
    means what it says.
12. As a reader, I want the deck to open, close up and leave as it does today
    at any side distance, so that only its place changes.

### On a phone

13. As a reader on a phone, I want the toast to keep taking the window's width
    less the distance at each side, so that it stays readable.
14. As a developer whose rail stays at the start side on a phone, I want to
    keep the toast clear of it without giving up the same room at the end side,
    so that the toast keeps the width a narrow window can spare.
15. As a developer, I want a token I set on `:root` to hold on a phone too, at
    every position including the center ones, so that one value means one
    distance at every width - as the top and bottom tokens do.

### Reading direction

16. As a reader of a right-to-left page, I want `start` to be the right side
    and `end` the left, so that each token applies at the side its toasts
    really stand at.

### Above a modal dialog

17. As a reader with a modal dialog open, I want the toasts to stand at the
    same distance from the side as without one, so that they do not jump when
    the dialog opens or closes.

### Finding it

18. As a developer, I want both tokens on the Theming page with their default
    and what they are for, so that I find them where every token is listed.
19. As a developer reading the Toast page, I want the example on where the
    toasts stand to name the side tokens beside the other two, so that I meet
    them where I look for the toasts' place.
20. As a developer reading the changelog, I want the tokens under "Added" with
    their default and the positions each moves, so that I know what the version
    brings.
21. As a developer who wrote a rule on the region's `data-along` to get this, I
    want the changelog to say that the tokens replace it, so that I can delete
    a rule that was never safe.

## Implementation Decisions

- **Two tokens, `--u-toast-inset-start` and `--u-toast-inset-end`.** They stand
  in the token sheet's Toast group beside `--u-toast-inset-top` and
  `--u-toast-inset-bottom`; the group's comment, which is what the Theming page
  prints, is widened from "top and bottom edge" to the sides as well.
- **Why two and not one.** Above 600 px one would do: the toasts stand at one
  side at a time. On a phone the region reads both sides at once, and one token
  would take from the end side whatever the start side needs - in the window
  that has the least width to give. Two also complete what is there: one token
  per edge, each moving the positions of its edge only, tested the same way.
  And tokens are the public styling API (ADR-0045): splitting one into two
  later would leave three names to keep.
- **Named for the positions, not for the property.** `start` and `end` are the
  words of `ToastPosition`; the tokens are logical, as those are. In a
  right-to-left page they follow the direction.
- **The default is today's distance**: `--u-space-5` for both, and
  `--u-space-4` in the token sheet's existing phone rule at 600 px, beside the
  other two. No new breakpoint.
- **The toast's stylesheet reads the tokens in the three places that hold the
  number now**: the start positions read the start token, the end positions the
  end token, and the phone's rule, which gives the region the window's width,
  reads both. The center positions above 600 px read neither.
- **Center is the middle of the window**, not the middle of what the two tokens
  leave. Unset the two are equal and the question does not arise; set, a toast
  at the center does not shift with a rail.
- **The region's width stays 360 px above 600 px.** A side distance large
  enough to push a 360 px region past the far side of a narrow window is the
  application's to lower in a media query of its own, as the group's comment
  already says of the other two.
- **Nothing in the component changes**: no prop, no export, no `data-*`
  attribute, no change to `ToastConfig`. `API.md` stays as it is.
- **Inside a modal dialog nothing is added.** The region there is the same
  element with the same rules and inherits the tokens from `:root`.
- **Documentation**: the lead of the Toast page's example on where the toasts
  stand names the tokens; the Theming page's note on panels in a portal names
  them with the other two; the token table takes them from the token sheet by
  itself, and the site gate fails if one is missing.
- **No ADR.** ADR-0045 already says a wish to style what no token reaches is
  answered with a token, and that a new token is a feature.
- **Release**: a feature for core, so the next minor. The changelog entry is
  written at release, under "Added".

## Testing Decisions

- A good test here reads what a reader sees: where the region's box stands in
  the window, in a real browser. It does not read the stylesheet's text, a
  class name or a token's computed value. jsdom has no layout, so there is no
  unit test.
- **One seam, and it exists**: core's browser tests against the Toast page's
  example on where the toasts stand, through the helper that today sets tokens
  on `:root`, clicks each of the six positions and returns the region's
  distance from its top or bottom edge. It is widened to return the distance
  from each side as well.
- The cases, each at 1280 px and at 320 px, as the tests of the other two
  tokens run:
  - unset, the toasts stand 20 px from their side, 16 px from both at 320 px;
  - the start token moves the `*-start` toasts only at 1280 px, and at 320 px
    the start side of all six, the end side staying at 16 px;
  - the end token likewise, mirrored;
  - at 1280 px the center positions stay centred with either token set;
  - neither side token moves the top or bottom distance; and the existing tests
    of the top and bottom tokens show the reverse once they read the sides too.
- The existing test that the inset tokens move the toasts above a modal as they
  do without one takes the side tokens in.
- The lead of the example changes, which may move the pictures below it on the
  Toast page; pictures that move are renewed in both themes and under forced
  colours, and nothing else may differ in them.
- Prior art: the tests of `--u-toast-inset-top` and `--u-toast-inset-bottom` in
  core's basic feature tests, and the test above a modal beside the other
  tests of toasts in a dialog.

## Out of Scope

- A shorthand token that sets both sides, and a token for the center positions.
- Centring the center positions in the room the two tokens leave.
- A token or a prop for the region's width, and any limit that shrinks the
  region when the side distances leave less than 360 px.
- The gap between the cards of an open deck, and how much of a card behind the
  front one shows.
- Keeping the toasts clear of a rail by themselves: the application knows its
  rail's width and says it.
- A prop on `UmrissProvider` or `ToastProvider` for any of the distances.

## Further Notes

- The toast's stylesheet says of the phone's breakpoint that a new one there is
  a new one in the token sheet; this change adds none and keeps both at 600 px.
- An application's `:root` rule wins over the token sheet's phone rule, since
  the tokens stand in a layer: a value set plainly on `:root` holds at every
  width. That is how the top and bottom tokens behave, and the tests at 320 px
  hold it for the sides.
