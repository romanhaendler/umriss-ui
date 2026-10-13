# 05 - A tooltip lies above the toasts in a dialog

Status: done
Type: task
Size: M

Blocked by: 04
Spec: `.scratch/toasts-above-a-modal/spec.md`, "The tooltip takes the same
way"; user stories 48, 50-55

## What to build

The scale's order holds above a dialog as it does in the page: a tooltip above
a toast, a toast above an open menu. Since ticket 04 the toasts stand in the
top layer inside a dialog, and a tooltip there, still ordered by its token,
would lie under them.

- The top layer orders by the moment of showing. The region is shown when the
  dialog becomes its target; a tooltip is shown each time it opens, which is
  later. So `Tooltip` carries `popover="manual"` under the same two conditions
  as the region - its target is a dialog, the Popover API exists - through the
  shared step of ticket 04, and lies above the toasts without anything
  comparing the two.
- It is shown **before it is measured**: a popover is not displayed until it
  is shown, and the tooltip finds its place from its own size.
- It takes the browser's popover sheet back - the inset, the auto margin, the
  border, the overflow. Its place still comes from the values the component
  sets.
- `Popover` and every panel built on it stay as they are: under the toasts, in
  a dialog and outside. Sent the same way, a menu opened after the region was
  shown would lie above the toasts.
- Outside a dialog nothing changes, and `--u-z-tooltip` orders the tooltip.
  Without the Popover API the tokens order both inside the dialog, as before.
- The comment over the stacking tokens gains the tooltips.

Read from the code and not yet seen: in a dialog that transforms itself - also
one that merely centres itself by `transform` at rest - a tooltip should stand
wrongly today and rightly in the top layer. The test below settles which; the
ticket's report says what it found.

## Acceptance

- [ ] With the example's modal open and a toast covering the control with the
      tooltip, the tooltip is the topmost element at a point where the two
      overlap. A tooltip takes no pointer events, so the test makes it
      hit-testable for the question.
- [ ] An open menu or select list in the modal lies under the toast at a point
      where the two overlap.
- [ ] A tooltip in the modal stands centred above its trigger at its offset,
      as outside a dialog, and flipped where the window ends.
- [ ] A tooltip in a `<dialog>` that transforms itself, built by the test,
      stands at its trigger.
- [ ] A tooltip with no delay, opened by the focus the modal sets as it opens,
      lies above the toasts.
- [ ] Outside a dialog the tooltip carries no `popover` attribute; every
      existing tooltip test passes unchanged.
- [ ] No existing screenshot moves.
- [ ] The tests run in Chromium and WebKit.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core`
      pass.
