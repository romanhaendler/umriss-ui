# Holding the toasts back, and a deck that glides

Status: done
Date:   2026-10-14
Origin: a guide written by an application against core 0.37.0, checked
against the toast's source on 2026-10-14. What the check added stands under "Further
Notes". It departs from the guide in one point: the guide lets the deck glide
"none when it moves into a dialog". But an application that moves the deck
beside a modal dialog changes the distance token in the moment the dialog
opens, which is the moment the region moves into it, so under that rule the one
glide the guide was written for would never be seen. Here a move into or out of a dialog is still no reason to move,
but a change of place that comes with it glides from where the deck was seen.

## Problem Statement

An application has a surface that the toasts must not cover for a while,
for example a modal `<dialog>` that holds a navigation: a panel beside the
toasts on a wide window, a surface over the whole window on a phone. Since
0.36.0 the toasts stand above every modal dialog, so a toast covers whatever of
the dialog lies under the region's place: a search field, the top rows, the
control that closes it.

Where the window is wide enough, the application can move the deck beside the
surface with `--u-toast-inset-top`. Where it is not, there is no place a toast
could stand without covering the surface, and umriss-ui gives the application
no way to keep the toasts out of sight:

- styling the region by its markup is not allowed (ADR-0045), and would break
  with the next change of that markup;
- dismissing the toasts loses them, and with them an "Undo" the reader may
  still want;
- letting them run out unseen loses them the same way.

And when the application moves the deck with a token, the deck jumps: it has a
transition on its height, none on its place, so a deck of several cards leaps
across the window when a menu opens or closes.

To decide whether the deck has room beside a surface, the application needs the
toast's width. Today that is `360px` written into the stylesheet, so the
application has to copy the number and hope it does not change.

## Solution

**`held` on `ToastProvider`.** While it is true, the toasts are held back: none
is seen, heard, pressed or reached by the keyboard, and what lies under the
region's place can be seen and used as if no toast stood. No countdown runs,
and a toast that arrives waits. When it is false again, every toast comes back
with the time it had left, the ones that arrived meanwhile are heard then, and
nothing was lost. The application decides when to hold, because where the deck
may stand is the application's layout.

**The deck glides.** When one of the four distance tokens changes while toasts
are seen, the deck glides to its new place in the time and easing its height
already uses. Under reduced motion, while held, and when the region is first
drawn, it moves at once.

**`--u-toast-width`.** The toast's width is a token, `360px` by default, in the
token group of the toasts. An application reads it to decide whether the deck
has room, and may set it.

Without `held`, or with `false`, everything is as in 0.37.0 except the glide.

## User Stories

### Holding

1. As an application author, I want to hold the toasts back while a surface is
   open that they must not cover, so that the reader can use all of it.
2. As an application author, I want to hold them with one prop on the
   provider I already have, so that I write no styling against the region's
   markup.
3. As an application author, I want `held` to default to false, so that an
   application that never holds sees no difference.
4. As a reader, I want nothing of a toast to be drawn while the toasts are
   held, so that the surface I opened is whole.
5. As a reader, I want a click on the place where a toast's cross stood to
   reach what lies beneath, so that a held toast is not an invisible wall.
6. As a reader using a screen reader, I want held toasts to be absent from
   the accessibility tree, so that I do not land on a message I cannot see.
7. As a keyboard reader, I want held toasts to be out of the tab order, so
   that Tab moves through the surface and nothing else.
8. As a keyboard reader, I want Alt+T to do nothing while the toasts are held,
   so that the key never moves my focus somewhere unseen.
9. As a keyboard reader whose focus is in the deck when the hold begins, I
   want the focus to go back where it came from, as with Escape, so that it
   does not stay on something that vanished.
10. As a reader whose deck is open (by pointer, focus or its count) when the
    hold begins, I want the deck to close, so that it is closed when it comes
    back.
11. As a reader, I want the toasts to go out of sight at once when the hold
    begins, so that the surface is free the moment it opens.

### Nothing is lost

12. As a reader, I want a toast that stood before the hold to come back with
    the time it had left, so that a 5 s toast held after 3 s still gives me
    2 s.
13. As a reader, I want a toast that arrived during the hold to give me its
    full duration from the moment I see it, so that I can read it.
14. As a reader, I want a toast with "Undo" to still offer it after the hold,
    so that the hold never costs me an undo.
15. As an application author, I want `toast()` to return its id during the
    hold as always, so that my code does not know about the hold.
16. As an application author, I want `dismiss()` during the hold to close the
    toast with `onClose("dismiss")` at once, so that it never appears and my
    cleanup runs when I expect it.
17. As an application author, I want `update()` during the hold to change what
    will appear, so that the reader sees the latest state, not a stale one.
18. As an application author, I want a loading toast turned into success
    during the hold to begin its countdown when it becomes visible, so that its
    success is seen for its full duration.
19. As an application author, I want the limit to hold during the hold, the
    oldest giving way with `dismiss` at once, so that at most the limit's
    number of toasts comes back.
20. As an application author, I want the hold not to call `onClose` of any
    toast, so that holding is never mistaken for closing.

### Coming back

21. As a reader, I want the toasts to come back at the region's current place,
    so that they stand where the layout now wants them.
22. As a reader, I want them to come back with their usual entrance, so that I
    notice they are there again.
23. As a reader who prefers reduced motion, I want them to come back at once,
    without an entrance, so that nothing moves.
24. As a reader using a screen reader, I want a toast that arrived during the
    hold to be announced when the hold ends, by the live region of its tone,
    so that I hear it as if it had just arrived.
25. As a reader using a screen reader, I want a toast that was announced
    before the hold not to be announced a second time, so that I am not told
    old news twice.
26. As a reader, I want the order to be as if no hold had happened, ordered by
    arrival with the newest in front, so that the deck reads as I know it.
27. As a reader, I want the hold to end in the place the deck now has even if
    that place changed during the hold, without a glide from the old one, so
    that nothing travels across the window as the toasts reappear.

### Dialogs and the top layer

28. As a reader, I want the toasts to stand in the topmost modal dialog during
    a hold as they do without one, so that they are usable the moment the hold
    ends.
29. As an application author, I want a hold to be independent of any dialog,
    so that I can hold for a surface that is no dialog as well.

### The glide

30. As a reader, I want the deck to glide when the application changes its
    distance from the window's top, bottom or sides, so that I can follow where
    it went.
31. As a reader, I want the glide to take the time and easing of the deck's
    other movements, so that it feels like part of the same thing.
32. As a reader, I want the deck to glide when a dialog opens or closes and
    its distance changes in the same moment, so that the case it was made for
    is not a jump.
33. As a reader, I want a deck that does not change its distance to stay
    still when a dialog opens or closes, as in 0.36.0, so that the glide adds
    no movement where there was none.
34. As a reader who prefers reduced motion, I want the deck to move at once,
    so that nothing glides.
35. As a reader, I want the deck to stand at its place at once when it is
    first drawn, so that a first toast does not fly in from elsewhere.
36. As a reader, I want a change of distance during a hold to take effect at
    once, so that nothing glides unseen and is caught mid-way.
37. As an application author, I want a token that is set again to the same
    value (for example in every frame) to cause no movement, so that I may set
    it as often as I measure.
38. As an application author, I want the glide without opting in, so that I
    animate no foreign token myself.

### The width

39. As an application author, I want the toast's width as a token, so that I
    can compute whether the deck has room beside a surface without copying a
    number.
40. As an application author, I want the token to hold a plain length, so that
    reading it from the computed style gives me a number.
41. As an application author, I want to set the width with the token, so that
    a theme can have wider or narrower toasts.
42. As a reader on a phone, I want the toast to keep the window's width minus
    the side tokens below 600 px, so that the token changes nothing there.

### Documentation

43. As an application author, I want the prop's text to say what `held` is for
    and that nothing is lost, so that I reach for it instead of dismissing.
44. As an application author, I want an example on the Toast page with a
    switch "Hold the toasts" beside a button that sends one, so that I can see
    the behaviour before I use it.
45. As an application author, I want the width token in the Theming page's
    group of the toasts, so that I find it beside the distance tokens.
46. As an application author, I want the changelog to name the glide under
    "Changed", so that I know my deck moves differently after the upgrade.

## Implementation Decisions

- **One prop, on the provider.** `held?: boolean` on `ToastProvider`, default
  false. It is a state of the application, not a configuration, so it is not
  part of `UmrissProvider`'s `toast` settings. `ToastProvider` takes only
  `children` today; the props generator picks the new prop up.
- **No new export, no new hook, no ADR.** The hold is a new prop on a known
  seam, the glide a transition, the width a token beside the distance tokens.
- **Countdowns.** Held counts like an open deck: the countdowns already stand
  still while the deck is open, each keeping its remaining time, and a toast
  that is started while they stand still keeps its full duration. The hold
  joins that condition. Nothing else about timing is new.
- **Out of sight.** While held, the cards are neither drawn nor hit, and are
  out of the tab order and the accessibility tree. The region is no landmark
  and not focusable while held (it is one only while a toast stands and can be
  seen). The two live regions stay in the document throughout the hold: a live
  region that enters the document with its text is often not read out, which
  is why they stand before the first message today.
- **Hearing.**
  - A toast that arrived during the hold enters its live region when the hold
    ends, not before.
  - A card that stood before the hold is not inserted into its live region
    again. Its node stays in the document, so its return is no insertion.
    The entrance it plays on return must therefore be restarted on the
    existing node, not by building the card anew (which is how the move into
    a dialog continues an entrance today).
- **Keyboard.** The Alt+T listener is not active while held: the key goes to
  the page as if no toast stood, rather than being swallowed. When the hold
  begins with the focus in the deck, it goes back where it came from, by the
  same path as Escape. Hover, focus and pin are let go, as they are when the
  region moves.
- **Going and coming.** The hold begins at once: no exit transition, no
  `onClose`. A card already leaving when the hold begins finishes unseen. On
  the end of the hold, every standing card plays its entrance (none under
  reduced motion) at the region's current place.
- **Dialogs unchanged.** The region still moves into the topmost modal dialog
  and into the top layer whether held or not.
- **The glide.** The region transitions its four insets (the top, the bottom
  and the two sides) with `--u-duration-medium` and `--u-ease-out`, as its
  height. An inset that is `auto` for the region's edge does not move. No
  transition: under reduced motion (the existing rule that clears the region's
  transitions), while held, and when the region is first drawn.
- **The glide across a dialog** (the departure from the guide). When the
  region moves into or out of a modal dialog it is built anew in the new
  place. If its place in the window is the same as before, it stands still, as
  0.36.0 promises and its browser tests hold. If the place differs (the
  application changed a distance token in the same moment), the new region
  starts where the old one was seen and glides to its place.
- **The end of a hold together with a change of place** (a modal dialog
  closing: the hold ends and the token changes back at once): the deck
  appears at the new place with its entrance, without a glide. The same when
  the hold ends as the region moves out of a dialog.
- **The width token.** `--u-toast-width: 360px` on `:root`, in the token group
  of the toasts, a plain length so that its computed value is a number. The
  region reads it where it reads `360px` today. Below 600 px the region keeps
  the window's width minus the side tokens and ignores it.
- **What the application computes is its own.** umriss offers no "room
  beside" helper and no overlap test: the application computes the window's width,
  minus `--u-toast-inset-end`, minus the surface's right edge, against the
  width plus `--u-space-2`.

## Testing Decisions

A good test here checks what a reader or a calling application can observe:
what is seen and hit at a point of the window, what is in the accessibility
tree and the tab order, what enters a live region and when, when `onClose` is
called and with what, where the deck's box stands frame by frame. It does not
check the region's attributes, classes, state or which element a card hangs
in. Two existing seams, no new one:

- **Unit, in jsdom with fake timers** (a new group "Toast – held" beside the
  groups of the deck, the limit, Alt+T and the live regions), through
  `ToastProvider` and `useToast` as an application uses them:
  - with `held` no card is in the accessibility tree and none is focusable;
  - a 5 s toast held at 3 s for 10 s leaves 2 s after the hold ends;
  - a toast that arrives during the hold leaves its full duration after the
    hold ends, and its text enters the live region only then;
  - a toast that stood before the hold is not inserted into the live region a
    second time (an observer on the live region sees no insertion of its text
    when the hold ends);
  - `dismiss()` during the hold calls `onClose("dismiss")` at once, and the
    toast does not come back;
  - `update()` during the hold: the toast comes back with the new text; a
    loading toast turned into success counts from the end of the hold;
  - four toasts during the hold with limit 3: the oldest goes with `dismiss`
    at once, three come back;
  - Alt+T during the hold moves no focus; a focus in the deck goes back when
    the hold begins;
  - holding calls no `onClose` of a standing toast.
- **Browser, against the Toast page** (beside the tests of the toasts above a
  modal, which already sample the deck's box per frame and ask what lies at a
  point):
  - with `held`, the element at the centre of where the close cross stood is
    the page's element, and a click reaches it;
  - after the hold, the cross is the element there again, and the deck stands
    where it stood;
  - a change of `--u-toast-inset-top` while toasts are seen: sampled per
    frame, the deck's top takes values between the old and the new place;
    under `prefers-reduced-motion` only the two;
  - the same change during a hold, then the hold ends: the deck's first seen
    top is the new place;
  - a modal opens and the top token changes in the same frame: the deck's top
    takes values between the two places; a modal that opens without a change
    of token leaves the deck still (the existing test stays green);
  - the width token set to another length: the card takes it at 1280 px and
    ignores it at a phone's width.
- **Prior art:** the unit groups "Toast – the deck" and "Toast – inside a
  modal dialog" for timers, focus and live regions; the browser tests "A toast
  standing before the modal opens, and while it closes, does not move" and
  "The inset tokens move the toasts above a modal as they do without one" for
  sampling per frame and the inset tokens.
- **The visual suite:** the new example gets its pictures in both themes; the
  full visual suite runs before the release, since the width becomes a token
  and the region gains a transition.
- **Checks:** the props generator, `pnpm check core`, `pnpm check:site`,
  `pnpm test:visual:quick core`, then the full visual suite.

## Out of Scope

- Hiding a single toast, or holding only some: an application holds all or
  none.
- A queue that replays toasts that ran out during the hold: none runs out
  during the hold.
- umriss deciding by itself when to hold (for example "while overlapping this
  element"): where the deck may stand is the application's layout.
- A fading exit and entrance for the hold: the toasts go at once and come back
  with their usual entrance.
- A helper that computes the room beside a surface.
- The application's side: when it holds, when it moves the deck beside its
  surface, and its tests.

## Further Notes

What the check against the source added:

- **The glide across a dialog** (see Origin and the decision above). Without
  it an application that moves the deck beside a dialog as it opens sees a
  jump.
- **Restarting the entrance without a new node.** The move into a dialog
  builds the cards anew and hands them their age, so that an entrance goes on.
  For the hold that path would insert every card into its live region again
  and announce it a second time, against story 25. Hence the decision that the
  node stays and its entrance is restarted in place.
- **Alt+T is let through, not swallowed,** during the hold. The guide said
  "does nothing"; letting the key reach the page is the reading that matches
  "as if no toast stood".
- **The landmark.** The guide said "none in the accessibility tree" for the
  cards; the region's own landmark and focusability go too, while the live
  regions themselves stay.
- **Not provable in jsdom or by Playwright:** whether a screen reader
  announces a card a second time when it becomes visible again inside a live
  region, even without being inserted anew. Some readers treat content that is
  shown again as new. Check it once with VoiceOver in Safari and with NVDA in
  Chrome before the release; if one announces it, the cards that stood before
  the hold need to leave the live region for its duration without being
  re-inserted, which is a question of its own.
- The guide is the source of the behaviour; its wording is kept in the prop
  text: "While true, the toasts are held back: none is seen or heard,
  no time runs out, and a new one waits. When false again they come back with
  the time they had left."
- `CHANGELOG.md` under 0.38.0: **Added** `held`, `--u-toast-width`;
  **Changed** the deck glides when its distance changes, also when that
  change comes with a modal dialog opening or closing.

## Comments

### Delivery report (2026-10-14, core 0.38.0)

Released as 0.38.0 with all five packages, **without the screen reader check**
(ticket 06 stays `ready-for-human`): whether a reader announces a toast that
stood before the hold a second time when it is shown again, and whether a
toast that arrived during the hold is heard once when it ends, also as a modal
dialog closes, is held by unit tests of the live regions but has not been
heard. Should a reader announce a standing toast again, that is a question of
its own for a later version. Every other ticket is done; the folder stays for
06.

Where what was built departs from the spec, or adds to it:

- **A type is exported.** `type ToastProviderProps` is exported from the
  Toast index like the props of every other component; the spec said no new
  export. No runtime export was added.
- **The glide runs on registered properties.** The region copies the four
  distance tokens into `@property` custom properties and transitions those;
  each position reads the one of its edge and side. A plain transition on the
  insets would also have glided on a change of `position`; this way only a
  change of token glides.
- **"While a toast is seen" is the region's own `data-seen`,** set while a
  toast stands and is not held, and only once two animation frames have passed
  since the hold began or ended. So a token written in any callback of the
  frame in which the hold ends - also by an application that writes it in
  every frame - is taken at once. The glide, its starting style and the
  reduced-motion rule read it, not the landmark's role.
- **The glide across a dialog reads the region's place in every frame** while
  a toast is seen in an open modal dialog, because a closing dialog takes its
  region out of rendering before the move is seen. It runs as long as a toast
  stands there, a `duration: 0` one too.
- **Waiting toasts enter a region that already stood.** The toasts that
  arrived during a hold are drawn only once the region they go into is drawn
  and has stood for two animation frames, so a hold that ends as a modal
  dialog closes inserts their text into a live region outside the dialog
  rather than building one with it. A toast sent in the same handler that
  begins the hold counts as arriving during it.
- **Leaving cards and the pointer.** The region takes no pointer while held
  (its empty box was still hit), a card that is leaving when the hold begins is
  removed at once instead of finishing unseen, and a leave during the hold is
  a removal at once.
- **An open deck casts no shadow on its cards** (ticket 08, added to the spec
  after it was written): open, the lower card lies above, at the top edge
  after the cards stand apart. A toast that arrives while a deck at the top
  stands open lies under the cards gliding down past it for
  `--u-duration-medium`; left as it is.
- **Tests.** jsdom focuses hidden elements, so the unit test proves the held
  cards out of the accessibility tree and a browser test proves the tab order.
  The glide across a dialog is tested with the "Where they stand" example and
  a plain `<dialog>`; the hold together with a change of place uses the bottom
  token, since the "Hold the toasts" example stands at the bottom.
- **Pages and pictures.** The Theming page lists `--u-toast-width` through its
  token table, its prose unchanged. The Toast page's keys say Alt+T works when
  the toasts are not held back. The new example and the open deck at the top
  have pictures in both themes; five pictures below the Toast page's new
  sentence were renewed with their cards unchanged.
- **Not done:** ticket 06, the check with real screen readers.
