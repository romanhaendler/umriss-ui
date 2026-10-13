# Toasts stand above a modal dialog, and can be used there

Status: ready-for-agent
Date:   2026-10-13
Origin: a guide written from the portal application against core 0.35.0, with
a throwaway prototype in Chromium and WebKit; checked against the toast's
source and the unit test environment on 2026-10-13. What the check added
stands under "Further Notes". It departs from the guide in one point, decided
the same day: the guide left a tooltip under the toasts while a dialog is open,
as a known limit; here the tooltips follow, so that the order holds everywhere.

## Problem Statement

A reader acts inside a modal dialog - removes a line, saves a form that fails -
and the application reports it with a **Toast** that offers "Undo" or "Retry".
The toast is drawn behind the dialog and its backdrop. It cannot be pressed,
Alt+T cannot reach it, and a screen reader says nothing, because a modal dialog
lies in the top layer above every `z-index` and makes everything outside itself
inert. The toast leaves before the dialog does, and the reader never learns
that anything was offered.

This holds while any modal dialog is open: `Modal`, `Drawer`, `ConfirmDialog`,
`CommandPalette`, or an application's own `<dialog>` opened with `showModal()`.
`Popover`, `Tooltip` and `announce()` already escape it through the nearest
`<dialog>` ancestor of their anchor. A toast has no anchor, so it has no rule.

## Solution

While a modal dialog is open, the toasts stand above it and work as they do
anywhere else: they are seen, pressed, reached by the keyboard and heard. They
stand at the same place in the window as without a dialog, and a toast that was
already standing does not move, enter again, restart its clock or get read a
second time when a dialog opens or closes behind it.

The order a reader knows holds above a dialog as it does in the page: a tooltip
lies above a toast, a toast above an open menu. So a toast never hides the
tooltip of a control it happens to cover.

Nothing changes for an application that opens no modal dialog, and nothing has
to be written by one that does: no new prop, no new export, no new token.

## User Stories

### Seeing and pressing a toast above a dialog

1. As a reader with a modal dialog open, I want a toast that arrives to be
   drawn above the dialog and its backdrop, so that I see what my action inside
   the dialog led to.
2. As a reader, I want to press a toast's action ("Undo", "Retry") while the
   dialog is open, so that the offer is one I can take.
3. As a reader, I want to press a toast's close cross while the dialog is open,
   so that I can clear a message that covers a control, and the dialog stays
   open when I do.
4. As a reader, I want a toast that stood before I opened a dialog to stay
   visible and usable above it, so that opening a dialog does not take a
   message away from me.
5. As a reader, I want the toasts to stand at the same place in the window with
   and without a dialog, so that I look for them in one corner.
6. As a reader, I want a standing toast to stay still while a dialog opens or
   closes behind it - no jump, no second entrance - so that nothing calls for
   my eye that has not happened.
7. As a reader, I want a toast's clock to run on with the time that was left
   when a dialog opens or closes, so that a message does not stay twice as long
   or vanish early.
8. As a reader, I want the toasts to stand above a second dialog opened on top
   of the first (a `ConfirmDialog` out of a `Modal`), so that they are on top
   of whatever is on top.
9. As a reader, I want the toasts to stay usable above the first dialog once
   the second has closed, so that the way back costs me no message.
10. As a reader, I want a toast reported by the action that also closes the
    dialog ("Save" closes and confirms) to stand in the page afterwards, having
    entered once, so that the commonest case looks like one event.
11. As a reader, I want the same behaviour above a `Drawer`, a `ConfirmDialog`
    and the `CommandPalette`, so that I do not have to know which dialog I am
    in.
12. As a reader of an application whose own dialogs slide in by `transform` or
    clip their content, I want the toast to stand still and whole while such a
    dialog moves, so that it does not ride in with the panel or get cut by it.
13. As a reader with several toasts standing, I want the deck to open under the
    pointer and by its count above a dialog as it does elsewhere, so that I can
    read the ones behind the front toast.
14. As a reader whose pointer rests on the deck while a dialog opens, I want
    the toasts' clocks to run again afterwards, so that no toast stays for good
    because a leave was never noticed.
15. As a reader on a phone, I want a toast above a dialog to take the window's
    width as it does without one, so that it does not shrink to a corner.
16. As a reader with reduced motion, I want toasts above a dialog to appear and
    leave without movement, as everywhere.
17. As a reader in forced colours, I want a toast above a dialog to look as it
    does without one - no extra border, no canvas-coloured box around the deck.

### The keyboard

18. As a keyboard user inside a modal dialog, I want Alt+T to move the focus
    into the toasts, so that I can reach an action without a pointer.
19. As a keyboard user with the focus in the toasts, I want Escape to give the
    focus back to where it was inside the dialog and leave the dialog open, so
    that leaving the deck does not cost me the dialog.
20. As a keyboard user, I want Tab to move through the toasts' actions and
    crosses above a dialog as it does elsewhere, and the deck to open and hold
    every clock while my focus is inside.
21. As a keyboard user, I want the focus ring of the toast region to be visible
    above a dialog, so that I see where Alt+T took me.
22. As a keyboard user whose focus is in the toasts when a dialog opens, I want
    the deck to close and the clocks to run on, so that a focus that went with
    the old place does not hold the deck open for good.

### Hearing a toast

23. As a screen reader user inside a modal dialog, I want a toast that arrives
    to be read out, so that I learn of an outcome I cannot see.
24. As a screen reader user, I want a warning or danger toast to interrupt and
    a neutral, success or loading one to wait politely inside a dialog exactly
    as outside, so that the urgency means the same thing in both places.
25. As a screen reader user, I want a toast that is already standing not to be
    read a second time when a dialog opens or closes, so that I am not told
    twice that something happened once.
26. As a screen reader user, I want the first toast after a dialog opened to be
    read as reliably as any other, so that it does not matter whether the
    message or the dialog came first.

### Writing an application

27. As an application developer, I want this to work without a new prop, export
    or token, so that an upgrade is all it takes.
28. As an application developer who opens no modal dialog, I want the toast
    region to stand where it stood in 0.35.0, ordered by `--u-z-toast` and
    without a `popover` attribute, so that nothing I rely on has moved.
29. As an application developer who set a `portalTarget`, I want the toasts to
    stand there whenever no modal dialog is open, and to return there when the
    last one closes, so that my setting still means what it says.
30. As an application developer, I want `onClose` not to be called when the
    toasts move, so that I am told a toast went only when it went.
31. As an application developer, I want `update()` and `dismiss()` to reach a
    toast by its id whether a dialog opened or closed since I showed it, so
    that a `loading` toast shown inside a dialog still turns into its outcome
    after the dialog has closed.
32. As an application developer with a `<dialog>` of my own, I want the toasts
    to follow it when I open it with `showModal()`, without registering it, so
    that the rule covers dialogs the library did not draw.
33. As an application developer who opens a `<dialog>` with `show()`, I want
    the toasts to stay where they are, since such a dialog makes nothing inert
    and lies in no top layer.
34. As an application developer who renders a `<dialog>` conditionally, I want
    the toasts to return to the page when the dialog is unmounted while open,
    so that they do not disappear with it.
35. As an application developer whose dialogs were open before the
    `ToastProvider` mounted, I want the toasts to stand above them too.
36. As an application developer, I want a toast inside a dialog to take the
    tokens of the dialog's place, as every portalled surface does, and
    `--u-toast-inset-top` and `--u-toast-inset-bottom` set on `:root` to reach
    it there.
37. As an application developer who serves a browser without the Popover API,
    I want the toasts still to be on top and usable above a dialog, and the
    one thing that is lost to be written down.
38. As an application developer, I want a page that opens no dialog to pay
    nothing I can measure for the rule, so that toasts stay cheap.
39. As an application developer under React's StrictMode, I want the toasts to
    behave the same, so that development shows me what production does.
40. As an application developer, I want the changelog to say what moved in the
    DOM and what to check - a selector or a test that expects the region under
    `<body>`, dialogs with controls in the corner where the toasts stand - so
    that I find a break before my readers do.
41. As an application developer reading the Toast page, I want one sentence
    saying that toasts stand above an open modal dialog and can be used there,
    and the limits named, so that I do not build a workaround.
42. As an application developer reading `UmrissProvider`'s `portalTarget`, I
    want it to say that the toasts follow the topmost modal dialog and that
    this beats the setting, as the popover seam's rule does.

### Maintaining the library

43. As a maintainer, I want the order of portal targets - the dialog, the
    setting, the body - to stand in one module for the anchored surfaces and
    the toasts alike, so that two callers cannot drift apart.
44. As a maintainer, I want a decision record saying why the toasts are a
    descendant of the dialog, why they are in the top layer, why only inside a
    dialog, and what the fallback is, so that nobody "simplifies" it to one of
    the two mechanisms or to "always in the top layer".
45. As a maintainer, I want the rule proven through `ToastProvider` in the unit
    tests and through an example in a real browser, so that the tracker of
    dialogs can be rewritten without a test noticing.
46. As a maintainer, I want an example on the Toast page that shows a toast
    above a `Modal`, so that the rule has a picture, a screenshot baseline and
    a page for the accessibility run.
47. As a coding agent reading `API.md`, I want the `portalTarget` text there to
    carry the new sentence, so that I do not tell a developer to portal toasts
    by hand.

### The tooltip above the toast

48. As a reader with a modal dialog open and a toast standing, I want the
    tooltip of a control the toast covers to lie above the toast, so that I
    can still read what the control does.
49. As a reader of a table inside a modal dialog, I want the tip that shows
    the whole of a cut value to lie above a toast as well, so that the two
    kinds of tip do not behave differently.
50. As a reader, I want an open menu, select list or date picker to lie under
    the toasts above a dialog as it does in the page, so that the order is one
    order.
51. As a reader, I want a tooltip in a `Modal` or a `Drawer` to stand where it
    always stood - at its trigger, flipped where the window ends - so that the
    change is one I cannot see.
52. As a reader of an application whose own dialog moves or centres itself by
    `transform`, I want a tooltip in it to stand at its trigger.
53. As an application developer, I want `--u-z-tooltip`, `--u-z-toast` and
    `--u-z-popover` to order the surfaces outside a dialog exactly as before,
    so that an override of mine keeps its meaning.
54. As an application developer who serves a browser without the Popover API,
    I want a tooltip in a dialog to lie above a toast there too, by the tokens.
55. As a maintainer, I want the rule to have no exception to explain - inside
    a modal dialog the toasts and everything the scale puts above them stand
    in the top layer - so that the decision record states one sentence and not
    a sentence and a limit.

## Implementation Decisions

### The rule

- While at least one modal dialog is open, the toast region is a DOM descendant
  of the **topmost** one, the one opened last. Only there is it not inert.
- Inside a dialog the region stands in the **top layer itself**, as a manual
  popover, so that the dialog's own `transform`, `opacity`, `overflow` and
  `filter` do not reach it.
- When that dialog closes, the region goes to the next modal dialog still open,
  else to where it stands today: the **Provider**'s portal target, else the
  body.
- A move changes nothing a reader can see or hear except what lies behind the
  toast: same place in the window, no second entrance, clocks keep their
  remaining time, `onClose` is not called, nothing is announced twice.
- Without a modal dialog everything is as in 0.35.0: no `popover` attribute,
  `--u-z-toast` orders the region.
- The scale's order holds inside a dialog. What the scale puts above the
  toasts - the tooltip, and the table's tip for a cut value, which is drawn on
  the tooltip's token - takes the same way there and stands in the top layer
  too. What it puts below them, the `Popover` and every panel built on it,
  stays as it is and lies under the toasts, as in the page.
- Both mechanisms, on purpose. A prototype compared them against dialogs that
  animate themselves by `transform`: re-parenting alone puts the toast on top
  and makes it usable, but the toast jumps sideways by a sliding panel's offset
  or rides in with a rising sheet, because a transformed ancestor becomes the
  containing block of a fixed descendant and clips it. The library's own
  `Modal` and `Drawer` are safe (their `<dialog>` is an untransformed
  full-screen container, the sheet inside moves); applications' dialogs are
  commonly not. An element in the top layer is laid out against the viewport
  whatever its ancestors do and is still a descendant for inertness.

  The prototype's core, as the decision it encodes and not as code to keep (it
  moves a live node from outside; the library portals instead):

  ```js
  const host = [...document.querySelectorAll("dialog:modal")].at(-1) ?? document.body;
  if (region.parentElement !== host) host.append(region);
  if (host === document.body) region.removeAttribute("popover");
  else if (!region.matches(":popover-open")) {
    region.popover = "manual";
    region.showPopover();
  }
  // run by: new MutationObserver(move).observe(document, { subtree: true, attributes: true, attributeFilter: ["open"] })
  ```

### Knowing the topmost modal dialog

A small internal tracker with a hook that returns the topmost modal dialog or
nothing. It lives beside `portalTargetFor` and is internal like it.

- It observes the document for changes of the `open` attribute only, across
  the subtree. `showModal()`, `close()`, Escape and a form with
  `method="dialog"` all change that attribute; the filter means only dialogs
  and `<details>` ever reach the callback.
- It keeps the order of opening in a list, since the top layer's order cannot
  be read from the DOM and document order is wrong for nested dialogs: a
  dialog that became modal is appended if not yet listed, one that is no longer
  modal is removed. The topmost is the last entry still connected and still
  modal. The list is seeded once with the modal dialogs already in the
  document, in document order - the best guess for dialogs opened before the
  provider mounted.
- Modal, not merely open: `show()` sets `open` too. The test is the `:modal`
  selector; where the selector is not understood, "has `open`" stands in for
  it - the way `keyboardFocus` treats `:focus-visible`. Every use of the
  selector is guarded, the seeding query included (see "Further Notes": the
  unit test environment throws on it).
- A dialog that leaves the document while open sends no `open` record. Only
  while the region is hosted in a dialog does the tracker also watch for
  removed nodes, and then it checks nothing but whether its host is still
  connected. It does not watch the child list permanently: that would run on
  every DOM change of the page.
- It observes for as long as a `ToastProvider` is mounted, not only while a
  toast stands: a toast may arrive long after a dialog opened, and the order
  has to be known by then. One observer per mounted provider; no sharing
  between providers.
- It reads the DOM, so it runs in an effect, never in rendering, and yields
  nothing where there is no document.

### Portalling the region

- `ToastProvider` holds its target in state, set in a layout effect, and
  portals the region there - the pattern of `Popover`. Until the target is
  known nothing is portalled.
- The order of targets is: the topmost modal dialog, then the provider's
  portal target, then the body. The dialog beats the setting, for the reason
  `portalTargetFor` gives. That order is written once, in the portal target
  module, beside the order for anchored surfaces.
- A changed target remounts the region's DOM. That is accepted as the simpler
  of two ways; a holder element moved by hand loses focus and restarts CSS
  animations just the same. The toasts and their timers live in the provider's
  state and refs and survive. What does not survive is handled on every change
  of target:
  - **Hover, focus and the pin** are set to false and the focus-return
    reference is given up, since the old node sends no leave and no blur and
    every countdown would otherwise stand still for good.
  - **The entrance.** A card that stood before the move arrives settled: its
    entrance animation is suppressed for the commit of the move only, and
    cards that arrive later enter as always.
  - **The measured heights** are read again from the new nodes; the deck must
    not collapse for a frame.
- The two live regions are created with the move, so they stand in the dialog
  before the next toast arrives.
- A toast and a closing dialog in one tick: whichever order the two happen in,
  the toast ends up outside the dialog and has not entered twice.

### The top layer

- The region carries `popover="manual"` only while its target is a dialog, and
  only where the Popover API exists.
- It is shown in a layout effect keyed on the target, so that nothing is
  painted between the attribute and the showing, and guarded against being
  shown already (StrictMode runs the effect twice).
- Shown after the dialog opened, it lies above that dialog. A second modal
  dialog opening on top changes the target; the region remounts inside the new
  one, is shown again and is on top again.
- `manual` on purpose: no light dismiss, no Escape, and it closes no other
  popover.
- **Fallback** where the Popover API is missing (Firefox 120 to 124 lie inside
  the stated browser floor; the unit test environment): the region is a plain
  fixed box inside the dialog at `--u-z-toast`. On top and usable; it only
  rides along with a dialog that transforms itself.

### The stylesheet

- The browser's sheet gives a popover an inset of zero, an auto margin, a
  border, a padding, `overflow: auto`, canvas colours and a fit-content size.
  The region takes all of it back, so that it looks and stands as before.
- That rule stands **before** the rules for the edge, the place along it and
  the phone's width in the toast's stylesheet: they have the same specificity
  and must win. With the zero inset left in place a `top-end` deck sticks to
  the start edge - the prototype hit exactly that.
- The region's focus ring and its height transition hold in the top layer.
- A manual popover's backdrop is transparent and takes no pointer events; it
  is left alone.

### The tooltip takes the same way

- The top layer orders by the moment of showing, not by a number. The toast
  region is shown when the dialog becomes its target, whether a toast stands
  or not; a tooltip is shown each time it opens, which is later. So a tooltip
  shown as a manual popover lies above the toasts without anything comparing
  the two. This is also why the `Popover` must not follow: a menu opened after
  the region was shown would lie above the toasts, against the scale.
- `Tooltip` already portals into the nearest `<dialog>` ancestor of its
  trigger. It now carries `popover="manual"` there, under the same two
  conditions as the region: its target is a dialog, and the Popover API
  exists. Outside a dialog nothing changes and `--u-z-tooltip` orders it.
- It is shown **before it is measured**. A popover is not displayed until it
  is shown, and the tooltip finds its place from its own measured size; a
  tooltip measured first has no size and stands wrongly.
- It takes the browser's popover sheet back as the region does: the inset, the
  auto margin, the border and the overflow. Its place still comes from the
  values the component sets. Left in place, the zero inset and the auto margin
  pull it away from its trigger.
- The two conditions and the showing stand once, in the portal target module,
  for the region and the tooltip alike.
- **The table's tip for a cut value** follows by hand, as it follows the order
  of portal targets by hand today: the same attribute under the same
  conditions, shown before it is measured, the same sheet taken back. Core
  gains no export for it.
- **Fallback** without the Popover API: both are plain fixed boxes inside the
  dialog, and the tokens put the tooltip above the toast, as they always did.
- One moment to check: a tooltip opened by the focus a dialog sets as it opens
  lies above the toasts. The region is shown as the dialog opens and the
  tooltip after its delay, so it should; a tooltip with no delay is the case
  to look at.

### What needs no change, but a check in a real browser

- **Alt+T**: the listener is on the document and the region is focusable
  inside the dialog. Escape with the focus in the deck closes only the deck
  and gives the focus back; if the same key would also cancel the dialog, the
  region prevents its default.
- **`Modal`'s leaving choreography** keeps the dialog `open` until its exit
  ends, so the region stays inside until the dialog is really closed.
- **Tokens**: inside a dialog the region inherits from the dialog's place.

### Documentation and release

- A new example on the Toast page: a `Modal` with a form whose "Save" fails
  with a `danger` toast carrying "Retry". It is the page the browser tests
  open and the picture of the rule.
- The Toast page's outline: one sentence in the introduction (toasts stand
  above an open modal dialog and can be used there), one under Accessibility
  (the live regions move with them, so a message is heard inside a dialog),
  and one Known limit (without the Popover API the deck moves with a dialog
  that transforms itself).
- `UmrissProvider`'s `portalTarget` text: the toasts follow the topmost modal
  dialog, and that beats the setting, like the popover seam. `API.md` is
  regenerated for it; no export changes.
- Theming, the paragraph on panels opened in a portal: inside a dialog the
  toasts take the tokens of the dialog's place.
- Core's changelog, drafted for 0.36.0 under **Changed**: where the region
  stands in the DOM while a dialog is open; that inside a modal dialog the
  toasts and the tooltips are ordered by the top layer, so an override of
  `--u-z-toast` or `--u-z-tooltip` decides nothing there; and what callers
  should check. The table's changelog carries one line for its tip. The
  release itself is the maintainer's.
- **A decision record**, with the next free number. These are the first
  surfaces besides a dialog to use the top layer, and they leave "the stacking
  order is a token scale" for one place. It records: why a descendant
  (inertness), why the top layer (foreign dialogs transform themselves), why
  only inside a dialog (outside it the token scale still holds), why the
  tooltip follows and the popover does not (the top layer orders by the moment
  of showing), and the fallback.
- The comment over the stacking tokens says today that popovers portal into
  the nearest dialog and the scale orders the rest; it gains the toasts and
  the tooltips.

## Testing Decisions

A good test here states what a reader or a caller can observe - where the
region stands in the document, whether a press arrives, when `onClose` is
called and with what, when a toast leaves - and survives a rewrite of the
inside. No test names the tracker, its list or its observer, and none imports
the hook: the rule is proven through `ToastProvider` and `useToast`.

**Three seams, all existing. No new one.**

1. **`ToastProvider` rendered in the unit tests** (jsdom, Testing Library), in
   core's toast tests as a new group "Toast – inside a modal dialog", with a
   real `<dialog>` element beside the provider. The test setup's `showModal()`
   and `close()` set and remove `open`; the observer's callback is a
   microtask, so the tests await it. Prior art: the groups of the same file
   (fake timers for the clocks, the exit token set on every element), and
   "Popover – portal target" in the popover's tests.
   - the region is a descendant of a dialog opened with `showModal()`, before
     and after a toast arrives;
   - it returns to the body when the dialog closes, and to the provider's
     `portalTarget` when one is set;
   - of two open dialogs it follows the one opened last, and goes to the first
     when the second closes;
   - a dialog removed from the document while open gives the region back;
   - a move does not call `onClose` and does not restart a countdown (a 5 s
     toast moved at 3 s leaves at 5 s);
   - a deck open under the pointer is closed by a move and its countdowns run
     again;
   - the action runs and reports `action` when pressed inside the dialog;
   - both live regions exist inside the dialog before the next message
     arrives;
   - the same under StrictMode: one region, inside the dialog.

   jsdom has no Popover API, so these tests run the fallback path; that is
   the fallback's proof.

2. **The Toast page's examples in a real browser** (Playwright, core's basics
   feature suite, beside "Toast deck opens with Alt+T and gives the focus back
   on Escape"), against the new example. This is where the top layer and
   inertness are proven; the unit setup's dialog only mirrors the `open`
   attribute, and says itself that it has no top layer.
   - with a `Modal` open, the element at the centre of the toast's close cross
     is the cross, and a click closes the toast while the modal stays open;
   - a toast's action pressed inside the modal runs;
   - a toast standing before the modal opens has the same box in every
     animation frame for 500 ms from the click, and again while the modal
     closes - which also holds the stylesheet's order, since a reset that won
     over the edge rules would move the box;
   - the same against a plain `<dialog>` that animates itself by `transform`
     and has `overflow: hidden` - the case the top layer is for. The test
     builds that dialog in the example's page; a page of its own only if that
     proves not to work;
   - a `<dialog>` opened with `show()` leaves the region where it was. This
     can only be shown here: the unit setup's `show()` and `showModal()` are
     the same function;
   - Alt+T moves the focus into the region while a modal is open, Escape gives
     it back and leaves the modal open;
   - with a modal open and a toast covering a control, the control's tooltip
     is the topmost element at a point where the two overlap. A tooltip takes
     no pointer events, so the test makes it hit-testable for the question.
     The example's modal carries one control with a tooltip that a toast can
     cover at a narrow window;
   - an open menu in the modal lies under the toast at a point where the two
     overlap;
   - a tooltip in the modal stands centred above its trigger at its offset,
     as outside a dialog;
   - a tooltip in the dialog that transforms itself stands at its trigger;
   - the accessibility run covers the new example in both themes, and the
     example gets a screenshot baseline.

   The stillness of a toast is sampled inside the page; a still toast returns
   one value for `x` and one for `y` (from the prototype):

   ```js
   const card = [...document.querySelectorAll("[data-toast]")].find((entry) => entry.textContent.includes(text));
   const xs = new Set(), ys = new Set();
   const start = performance.now();
   const frame = () => {
     const box = card.getBoundingClientRect();
     xs.add(Math.round(box.x));
     ys.add(Math.round(box.y));
     if (performance.now() - start < 500) requestAnimationFrame(frame);
     else resolve({ x: [...xs], y: [...ys] });
   };
   frame();
   ```

3. **The table rendered in its unit tests**, inside a `<dialog>`, for the tip
   of a cut value. No page shows a table in a dialog, and a page built for a
   repeated step would cost more than the step. So this is the one place where
   a test supplies the Popover API itself: with it, the tip in a dialog is a
   manual popover and has been shown before it is measured; without it, and
   outside a dialog, the tip is as it was. That a tip shown this way lies
   above the toasts is proven once, for the tooltip, in the browser.

**Checked by:** `pnpm check core`, `pnpm check table`, `pnpm check:site` (after
regenerating core's `API.md`), `pnpm test:visual:quick core`, and the full
visual suite before the release.

**Not checkable by a test:** whether a standing toast is read a second time
after a move. It is listened to once with VoiceOver, by a person, before the
release.

## Out of Scope

- Toasts always in the top layer, also without a dialog: it would put every
  tooltip under the toasts and change the stacking for all callers, for no
  gain.
- A prop to switch the behaviour off, and an export of the tracker or its
  hook: nobody asked.
- `Popover` in the top layer: it would lie above the toasts, against the
  scale. Whether a panel stands rightly in a dialog that transforms itself is
  a question of its own and is not answered here.
- A tooltip in the top layer outside a dialog: the scale holds there, and
  `--u-z-tooltip` would stop meaning anything.
- Non-modal dialogs: they make nothing inert, the toasts stay where they are.
- An export of the portal target module for the table: the table repeats the
  step by hand, as it repeats the order.
- Raising the browser floor to drop the fallback.
- The release of 0.36.0 itself.

## Further Notes

- **What the check of the unit test environment found** (jsdom 26.1, probed
  on 2026-10-13): `:modal` is not understood and **throws**, in `matches` and
  in `querySelectorAll` alike, so the fallback "has `open`" is what runs
  there, and an unguarded seeding query would break every toast test.
  `:popover-open` throws as well, and neither `showPopover` nor a native
  `showModal` exists; the shared setup supplies `show()`, `showModal()` and
  `close()` as attribute changes plus a `close` event. No change to that setup
  is needed.
- **The prototype's finding**, in Chromium and WebKit, against an
  application's dialogs that animate by `transform`:

  | | region re-parented into the dialog | the same, plus `popover="manual"` |
  |---|---|---|
  | on top and usable once the dialog rests | yes | yes |
  | "Undo" pressed inside the open dialog | works | works |
  | while a dialog that animates by `transform` opens | the toast jumps sideways by the panel's offset, or rides in from the bottom with the sheet | stands still |

- **Read from the code, not yet seen in a browser:** a tooltip is a fixed box
  placed by window coordinates, so in a dialog that transforms itself - also
  one that merely centres itself by `transform` at rest - it should stand
  wrongly today and rightly in the top layer. The browser test for it settles
  which. The same reading applies to the `Popover`, which this spec leaves.
- **The surfaces on the scale**, all of them: `Popover` (`--u-z-popover`),
  the toast region (`--u-z-toast`), `Tooltip` and the table's tip for a cut
  value (`--u-z-tooltip`). Nothing else in the workspace reads these tokens
  for stacking.
- **Where the browser tests run:** Chromium and WebKit. Firefox from 125 has
  the Popover API and takes the same path; 120 to 124 take the fallback, which
  the unit tests cover.
- **Vocabulary:** "top layer" is the platform's term and is used as such, as
  the portal target module already does; it is not the **Shadow step** the
  glossary keeps the word "layer" away from. The glossary's **Toast** entry
  says nothing about where a toast stands in the document and needs no change.
- **No conflict with an existing decision record.** The sentence this leaves
  for one case, "the stacking order is a token scale", stands in core's
  changelog and in the comment over the stacking tokens, not in a record -
  which is one more reason to write this one.
