# 01 - Toasts follow the topmost modal dialog

Status: done
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/toasts-above-a-modal/spec.md`, "The rule", "Knowing the
topmost modal dialog", "Portalling the region"; user stories 1-4, 8, 9, 11,
23, 24, 26-29, 32, 34, 35, 38, 39, 42, 43, 45, 47

## What to build

The tracer: while a modal dialog is open, the toast region is a DOM descendant
of the one opened last, and it comes back when that dialog closes. That alone
makes a toast seen, pressed and heard above the library's own `Modal`,
`Drawer`, `ConfirmDialog` and `CommandPalette`, whose `<dialog>` does not
transform itself. The top layer comes in ticket 04; here the region inside a
dialog is the plain fixed box it is today.

- An internal tracker with a hook that yields the topmost modal dialog or
  nothing, beside `portalTargetFor` and internal like it. It observes changes
  of the `open` attribute only, keeps the order of opening in a list, is
  seeded once with the modal dialogs already in the document, and lives as
  long as a `ToastProvider` is mounted.
- Modal, not merely open: the test is `:modal`, and where the selector is not
  understood "has `open`" stands in for it. **Every** use of the selector is
  guarded, the seeding query too - the unit test environment throws on it.
- A dialog that leaves the document while open gives the region back. Removed
  nodes are watched only while the region is hosted in a dialog.
- `ToastProvider` holds its target in state, set in a layout effect, as
  `Popover` does. The order - the topmost modal dialog, the provider's portal
  target, the body - is written once, in the portal target module.
- `UmrissProvider`'s `portalTarget` text says that the toasts follow the
  topmost modal dialog and that this beats the setting, like the popover seam.

What a move does to hover, focus, the entrance and the clocks is ticket 02.

## Acceptance

- [ ] A new group "Toast – inside a modal dialog" in core's toast unit tests,
      through `ToastProvider` and `useToast` with a real `<dialog>`; no test
      imports the tracker or its hook.
- [ ] The region is a descendant of a dialog opened with `showModal()`, before
      and after a toast arrives.
- [ ] It returns to the body when the dialog closes, and to the provider's
      `portalTarget` when one is set.
- [ ] Of two open dialogs it follows the one opened last, and goes to the
      first when the second closes.
- [ ] A dialog removed from the document while open gives the region back.
- [ ] The action runs and reports `action` when pressed inside the dialog.
- [ ] Both live regions exist inside the dialog before the next message
      arrives.
- [ ] Under StrictMode there is one region, inside the dialog.
- [ ] Without a dialog the region stands where it stood and carries no
      `popover` attribute; every existing toast test passes unchanged.
- [ ] Core's `API.md` is regenerated for the `portalTarget` text.
- [ ] `pnpm check core` and `pnpm check:site` pass.
