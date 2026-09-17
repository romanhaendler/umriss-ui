# 01 — Two overlays and the top layer

Status: done

Spec: `.scratch/library-audit/spec.md`

## Scope

`packages/ui/src/components/Tooltip/Tooltip.tsx`, `Modal/Modal.tsx`,
`CommandPalette/CommandPalette.tsx`, `lib/dialogChoreographie.ts`, and one
new function in `lib/` for the portal rule.

- **Tooltip portals like the popover.** Today `Tooltip.tsx:98` portals to
  `document.body`. It takes the rule from `Popover.tsx:143`: nearest
  `<dialog>` ancestor of the trigger, then `usePortalZiel()`, then the body.
  The rule moves into one exported function in `lib/` (`portalZielFuer` or
  similar) so both callers share it. Nothing else about the tooltip changes:
  no focus, no dismissal, its own entrance, hides on scroll.
- **A dialog closes once.** `Modal.tsx:64` and `CommandPalette.tsx:348` wire
  the element's `onClose` to the caller's `onClose`, so a gesture close is
  reported twice: once from the gesture, once from the native `close` event
  after the choreography calls `dialog.close()`. `useDialogChoreographie`
  records that it is closing and returns an `onClose` handler that swallows
  the event in that case and forwards it otherwise (the browser-initiated
  close). Both components use the handler. The palette's focus return stays
  in that handler, as its comment explains.
- The `Dock` needs no change: its tooltips follow once `Tooltip` does.

Verified by reading; the tooltip case follows from the top-layer rules of
`<dialog>` and is the scenario the popover-seam spec documented for menus.

## Acceptance

- `tooltip.test.tsx`: a tooltip on a trigger inside an open `<dialog>` renders
  its panel inside that dialog; with a provider `portalZiel` and no dialog it
  renders there; with neither, at the body.
- A behaviour test for `Modal` and for `CommandPalette`: close by button, by
  Escape and by backdrop each call `onClose` exactly once.
- The existing dialog and palette tests stay green; no baseline moves.
- `TESTS.md`'s "Bekannt offen" entry about the tooltip is updated to say the
  portal rule is now shared and the remaining difference is geometry only.

## Comments

**11 Sep 2026 — delivered.** The portal rule is `lib/portalZiel.ts`
(`portalZielFuer`), called by `Popover` and `Tooltip`. The choreography returns
`beimSchliessen` for the dialog's `onClose`; Modal and CommandPalette use it.

Review follow-up: an Escape the browser refuses to cancel — a second
Escape without user activation — fires a non-cancelable `cancel` and closes the
dialog anyway, which still reported twice. The choreography also returns
`beimAbbrechen`, which ignores such a `cancel` and leaves the report to the
close event. Tested in both components.
