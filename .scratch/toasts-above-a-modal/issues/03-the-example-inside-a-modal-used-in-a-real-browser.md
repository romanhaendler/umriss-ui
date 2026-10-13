# 03 - The example "inside a modal", used in a real browser

Status: ready-for-agent
Type: task
Size: M

Blocked by: 01
Spec: `.scratch/toasts-above-a-modal/spec.md`, "What needs no change, but a
check in a real browser", "Documentation and release", Testing Decisions
seam 2; user stories 2, 3, 13, 18-20, 33, 36, 41, 46

## What to build

The picture of the rule, and its proof where jsdom has none: the unit setup's
dialog only mirrors the `open` attribute and makes nothing inert.

- A new example on the Toast page, after the existing eight: a `Modal` with a
  form whose "Save" fails with a `danger` toast carrying "Retry". Its modal
  also carries one control with a tooltip, standing where a toast can cover it
  at a narrow window - ticket 05 needs it, and building it in now keeps the
  screenshot from moving later. The example follows the pages' rules (the
  components' own base: no bare lists, no plain buttons).
- The Toast page's outline gains one sentence in the introduction (toasts
  stand above an open modal dialog and can be used there) and one under
  Accessibility (the live regions move with them, so a message is heard inside
  a dialog).
- The Theming paragraph on panels opened in a portal says that inside a dialog
  the toasts take the tokens of the dialog's place.
- Browser tests in core's basics feature suite, beside "Toast deck opens with
  Alt+T and gives the focus back on Escape".
- Escape with the focus in the deck closes only the deck. If the same key also
  cancels the dialog, the region prevents its default - found out here, in the
  browser, and fixed here.

## Acceptance

- [ ] With the example's modal open, the element at the centre of the toast's
      close cross is the cross, and a click closes the toast while the modal
      stays open.
- [ ] The toast's action pressed inside the modal runs.
- [ ] Alt+T moves the focus into the region while the modal is open; Escape
      gives it back to where it was inside the modal and leaves the modal
      open.
- [ ] A `<dialog>` opened with `show()` leaves the region where it was. The
      test builds that dialog in the example's page.
- [ ] `--u-toast-inset-top` and `--u-toast-inset-bottom` set on `:root` move
      the toasts above the modal as they do without one.
- [ ] The accessibility run covers the example in both themes.
- [ ] The example has a screenshot baseline; no other baseline moves.
- [ ] The tests run in Chromium and WebKit.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core`
      pass.
