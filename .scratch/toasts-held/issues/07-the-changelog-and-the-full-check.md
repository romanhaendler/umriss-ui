# 07 - The changelog and the full check

Status: done
Type: task
Size: S

Blocked by: 01, 02, 03, 04, 05, 06, 08
Spec: `.scratch/toasts-held/spec.md`, Testing Decisions ("The visual suite",
"Checks"), Further Notes (changelog); user story 46

## What to build

The work is handed over ready for a release.

- **A draft of core's changelog entry** under this ticket's `## Comments`, for
  0.38.0. A version is released by raising it, so no manifest and no
  `CHANGELOG.md` is touched here. **Added:** `held` on `ToastProvider` (what
  it is for, that nothing is lost), `--u-toast-width`. **Changed:** the deck
  glides when its distance changes, also when that change comes with a modal
  dialog opening or closing.
- **The full check before a release.**
- **Left to the maintainer**, said plainly in the report: the release itself.

## Acceptance

- [x] The changelog draft for core stands under `## Comments`.
- [x] The full check: lint, types, unit, build, visual - parallel suites
      waited for, ports 4173-4177 free, the machine kept awake.
- [x] Every generated document is current (`pnpm check:site`).
- [x] The spec's status set to `done` with the delivery report under
      `## Comments`, naming every place where what was built departs from it;
      every ticket set to `done`.

## Comments

2026-10-14. The release followed at once, so the draft went straight into
core's `CHANGELOG.md` under 0.38.0 instead of standing here first, and the
release commit was made here; pushing it is the maintainer's. Besides what
this ticket names, the entry lists `type ToastProviderProps` under Added and
the open deck's order at the top edge under Changed. The other four packages
got a heading with no change of their own; all five manifests and the table in
the root README stand at 0.38.0. The READMEs claim nothing the release changes,
and no roadmap line names this work.

The full check ran on the commit before the release: lint, types
(`typecheck` and `typecheck:demo`), the site gates (again after the versions
moved), unit tests (core 1769, charts 912, table 756, schedule 365,
calculation 165, demo 334), build, `check:dist`, and the whole visual suite
with all five demos from a fresh build (3230 passed, 1046 skipped, none failed
or flaky, 18.4 min). No picture moved. The first `pnpm check` lost one
calculation demo test to its 5 s timeout under load (its first example, cold);
it passed alone and in the whole check run again.

Released without ticket 06: no screen reader has heard the hold yet.

### Delivery report

Built as the spec says, with these departures:

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
