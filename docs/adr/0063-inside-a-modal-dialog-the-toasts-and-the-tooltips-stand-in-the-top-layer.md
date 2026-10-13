# Inside a modal dialog the toasts and the tooltips stand in the top layer, and everywhere else the token scale orders them

Status: accepted
Date:   2026-10

A modal dialog lies in the browser's top layer, above every `z-index`, and
makes everything outside itself inert. A toast shown while one was open was
drawn behind the dialog and its backdrop: it could not be pressed, Alt+T could
not reach it and a screen reader said nothing. The toast left before the dialog
did, and the reader never learned that something was offered. `Popover`,
`Tooltip` and `announce()` already escaped the dialog by portalling into the
nearest `<dialog>` ancestor of their anchor; a toast has no anchor, so it had
no rule.

**While a modal dialog is open, the toast region is a DOM descendant of the
topmost one, and inside a dialog the region, the tooltip and the table's tip
for a cut value are manual popovers in the top layer. Outside a dialog
nothing changes: no `popover` attribute, and `--u-z-popover`, `--u-z-toast`
and `--u-z-tooltip` order the surfaces.**

## What follows

- **A descendant of the dialog, because of inertness.** Only what stands in
  the dialog is not inert. The region's target is the topmost modal dialog
  (the one opened last), else the provider's `portalTarget`, else the body; the
  dialog beats the setting, as it does for `portalTargetFor`. The order is
  written in `lib/portalTarget.ts`, beside the order for anchored surfaces.
  The topmost dialog comes from a tracker that keeps the order of opening from
  the changes of the `open` attribute, since the top layer's order cannot be
  read from the DOM and document order is wrong for nested dialogs. Modal is
  tested by `:modal`, and by `open` where the selector is not understood.
  A dialog that leaves the document while open sends no record, so removed
  nodes are watched only while a dialog hosts the region.
- **The top layer as well, because applications' dialogs transform
  themselves.** A prototype in Chromium and WebKit showed that re-parenting
  alone puts the toast on top and makes it usable, but a dialog that slides in
  by `transform` or cuts its content becomes the containing block of the
  fixed region inside it: the toast jumped sideways by the panel's offset,
  rode in with a rising sheet or was clipped. An element in the top layer is
  laid out against the window whatever its ancestors do, and still counts as
  a descendant for inertness. The library's own `Modal` and `Drawer` do not
  need it - their `<dialog>` is an untransformed full-screen container - but
  an application's dialog commonly does. The region is shown in a layout
  effect, so that nothing is painted between the attribute and the showing.
  The browser's sheet for a popover (zero inset, auto margin, border, padding,
  overflow, canvas colours, fit-content size) is taken back before the rules
  for the edge, so that the region stands where it stood.
- **Only inside a dialog, because outside it the scale holds.** A region in
  the top layer without a dialog would put every tooltip under the toasts and
  make `--u-z-tooltip` mean nothing, for no gain. So `popover` is set only
  while the target is a dialog and only where the Popover API exists.
- **The tooltip follows and the popover does not, because the top layer orders
  by the moment of showing.** The region is shown when a dialog becomes its
  target; a tooltip is shown each time it opens, which is later, and lies
  above the toasts without anything comparing the two - the scale's order. A
  `Popover` shown as a manual popover would be opened after the region too and
  lie above the toasts, against the scale, so it and every panel built on it
  stay as they were and lie under the toasts. The tooltip is shown before it
  is measured, since a popover has no size until it is shown, and takes the
  browser's sheet back. The table's tip for a cut value, drawn on the
  tooltip's token, repeats the step by hand, as it repeats the order of portal
  targets; core exports nothing for it. The conditions and the showing stand
  once in `lib/portalTarget.ts` (`topLayerPopover`, `useShownInTopLayer`) for
  the region and the tooltip.
- **The fallback without the Popover API** (Firefox 120 to 124 lie inside the
  browser floor; the unit test environment): the region and the tooltip are
  plain fixed boxes inside the dialog, ordered by the tokens. They are on top
  and usable, the tooltip above the toast as always; only the deck rides along
  with a dialog that transforms itself, which the Toast page names as a limit.
- **A move changes nothing a reader sees or hears.** A changed target remounts
  the region. The toasts and their clocks live in the provider and go on:
  `onClose` is not called, no countdown starts afresh, `update` and `dismiss`
  still reach a toast by its id. Hover, focus and the pin are given up on
  every change of place, since the old node sends neither a leave nor a blur;
  the cards standing at that moment arrive without the entrance they have
  played. The tracker hands a change on synchronously, and only a change: for
  one frame after a dialog closed (about 4 runs in 40 in Chromium) a toast
  stood in the dialog no longer drawn, because the change was applied in a
  task of its own.

## What the browsers showed

- **Escape in the deck needed no guard.** With the focus in the toasts above a
  modal, Escape closes only the deck and does not cancel the dialog, in
  Chromium and WebKit. Nothing is prevented.
- **A tooltip in a dialog that transforms itself stood wrongly before.** It
  stood off by exactly the dialog's transform; in the top layer it stands at
  its trigger. A tooltip in `Modal` and `Drawer` stands where it always did.
- **A toast shown in the same tick as a dialog that closes at once arrives
  without an entrance:** it was mounted in the dialog first and counts as
  having entered. `Modal` and `Drawer` stay open until their exit ends, so
  there the toast enters as always.

## What it costs

- The region is no longer always a child of the body or of the configured
  target. A selector or a test that expects it there breaks while a dialog is
  open.
- Inside a modal dialog `--u-z-toast` and `--u-z-tooltip` decide nothing: the
  top layer orders by the moment of showing. Outside a dialog they decide as
  before. The sentence "the stacking order is a token scale" holds for one
  place less.
- A dialog with controls in the corner where the toasts stand has them
  covered, as the page is.
- Not tested: a dialog that only centres itself by `transform` at rest; a menu
  under a toast in a modal (true by construction, `Popover` is untouched); a
  tooltip with no delay opened by the focus a modal sets. The browser tests
  run in Chromium; the same tests were also run once in WebKit and passed;
  Firefox was not run. The fallback is proven by the unit tests alone.
- Whether a standing toast is read a second time after a move is not
  checkable by a test; it is listened to once with VoiceOver, by a person.

## What it is not

- Not toasts in the top layer always, and not a `Popover` in it. Not a prop
  to switch the behaviour off, and not an export of the tracker. Non-modal
  dialogs make nothing inert and lie in no top layer, so a dialog opened with
  `show()` leaves the toasts where they are.
- Not the Shadow step: "top layer" is the platform's word, as the portal
  target module already uses it.
