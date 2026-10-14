# 04 - The glide across a modal dialog

Status: ready-for-agent
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

- [ ] Browser test: a modal opens and the top token changes in the same frame;
      sampled per frame, the deck's top takes values between the two places.
- [ ] Browser test: the same when the modal closes and the token goes back.
- [ ] Browser test: the same under `prefers-reduced-motion`: only the two
      places.
- [ ] The existing tests "A toast standing before the modal opens, and while
      it closes, does not move" and "Two toasts standing before the modal
      opens keep their boxes while it opens and closes" stay green.
- [ ] The unit group "Toast – inside a modal dialog" stays green (no second
      entrance, no second announcement on a move).
- [ ] `pnpm check core`, `pnpm test:visual:quick core`.
