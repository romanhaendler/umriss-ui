# 07 - The decision record, the changelogs and the full check

Status: ready-for-agent
Type: task
Size: S

Blocked by: 04, 05, 06
Spec: `.scratch/toasts-above-a-modal/spec.md`, "Documentation and release";
user stories 40, 44, 55

## What to build

The decision is written down where the next person looks, and the work is
handed over ready for a release.

- **A decision record** with the next free number, listed in the records'
  index. These are the first surfaces besides a dialog to use the top layer,
  and they leave "the stacking order is a token scale" for one place. It
  records, as built:
  - why a descendant of the dialog (inertness);
  - why the top layer (applications' dialogs transform themselves);
  - why only inside a dialog (outside it the token scale holds);
  - why the tooltip follows and the popover does not (the top layer orders by
    the moment of showing);
  - the fallback without the Popover API;
  - what tickets 03 and 05 found in the browser - whether Escape in the deck
    had to be kept from the dialog, and whether a tooltip stood wrongly in a
    dialog that transforms itself.
- **A draft of the changelogs** under this ticket's `## Comments`, for 0.36.0.
  A version is released by raising it, so no manifest and no `CHANGELOG.md` is
  touched here.
  - Core, under **Changed**: where the toast region stands in the DOM while a
    modal dialog is open; that inside a modal dialog the toasts and the
    tooltips are ordered by the top layer, so an override of `--u-z-toast` or
    `--u-z-tooltip` decides nothing there; what a caller should check - a
    selector or a test that expects the region under `<body>`, and dialogs
    with controls in the corner where the toasts stand.
  - Table, under **Changed**: one line for the tip of a cut value.
- **The sentence ticket 03 left out.** The Toast page's introduction says that
  toasts stand above an open modal dialog and can be used there, after the
  line on `ToastProvider`. It adds a line to the page head and so moves the
  pictures below it - the page head and the toast pictures of that page, in
  both themes. Those baselines are renewed here, on purpose, and no other.
- **The full check before a release.**
- **Left to the maintainer**, said plainly in the report: listening once with
  VoiceOver for whether a standing toast is read a second time after a move,
  and the release itself.

## Acceptance

- [ ] The decision record exists, is listed in the index, and contradicts
      nothing the tickets built.
- [ ] The changelog drafts for core and the table stand under `## Comments`.
- [ ] The Toast page's introduction carries the sentence; the baselines it
      moved are renewed, and only those.
- [ ] The full check: lint, types, unit, build, visual - parallel suites
      waited for, ports 4173-4177 free, the machine kept awake.
- [ ] Every generated document is current (`pnpm check:site`).
- [ ] The spec's status set to `done` with the delivery report under
      `## Comments`, naming every place where what was built departs from it;
      every ticket's status set to `done`.
