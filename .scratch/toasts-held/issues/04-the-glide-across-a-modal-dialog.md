# 04 - The glide across a modal dialog

Status: done
Type: task
Size: M

Blocked by: 02
Spec: `.scratch/toasts-held/spec.md`, Origin, Implementation Decisions ("The
glide across a dialog"), Further Notes; user stories 32, 33

## What to build

An application that moves the deck beside a modal dialog changes
`--u-toast-inset-top` in the moment the dialog opens or closes, which is the
moment the region moves into or out of it and is built anew. Ticket 02's transition cannot run on a new element, so
that case would still jump. Here: when the region moves into or out of the
topmost modal dialog and its place in the window differs from where the old
region was seen, the new region starts at the old place and glides to its own.
When the place is the same, it stands still, as 0.36.0 promises. Under reduced
motion it moves at once. A running entrance goes on as today.

## Acceptance

- [x] Browser test: a modal opens and the top token changes in the same frame;
      sampled per frame, the deck's top takes values between the two places.
- [x] Browser test: the same when the modal closes and the token goes back.
- [x] Browser test: the same under `prefers-reduced-motion`: only the two
      places.
- [x] The existing tests "A toast standing before the modal opens, and while
      it closes, does not move" and "Two toasts standing before the modal
      opens keep their boxes while it opens and closes" stay green.
- [x] The unit group "Toast – inside a modal dialog" stays green (no second
      entrance, no second announcement on a move).
- [x] `pnpm check core`, `pnpm test:visual:quick core`.

## Comments

2026-10-14: The new region is given the old place as `--_from-top/-bottom/
-start/-end` inline, and an `@starting-style` rule on `.region[role="region"]`
starts its registered `--_toast-*` there (falling back to the tokens), so the
transition of ticket 02 runs from the old place on the new element - also for
a region in a dialog, whose starting style applies when its popover is shown.
Same place, no `--_from-*`, no toast seen, or reduced motion (no transition):
it stands still. The old place is the old region's computed `--_toast-*`, read
when the move is seen (MutationObserver, before the next frame) if the old
region is still drawn (opening: it stands in the page behind the dialog, a
glide under way is caught mid-way). A dialog that closes takes its region out
of rendering before that moment, so while a toast is seen in a dialog the
region's distances are read in every animation frame and the last reading is
the old place (a test with only the read at the move fails the closing case).
Only a seen region hands on a place: one without its landmark or held hands
on none.

The ticket's browser tests use the "Where they stand" example (top end) and a
plain `<dialog>` opened with `showModal()`/closed in the same task as the
token change, since the "Inside a modal" example's toasts stand at the bottom
where the top token does nothing. One test per motion preference covers
opening and closing.

Checks: `pnpm check core`, `check:dist`, `pnpm test:visual:quick core`, every
toast/modal test of `features-basics.spec.ts` (88, the "does not move" and
"keep their boxes" tests among them), the toast pictures in both themes (36),
unit group "Toast – inside a modal dialog" green.
