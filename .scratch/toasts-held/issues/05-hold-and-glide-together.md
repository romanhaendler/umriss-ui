# 05 - Hold and glide together

Status: ready-for-agent
Type: task
Size: S

Blocked by: 03, 04
Spec: `.scratch/toasts-held/spec.md`, Implementation Decisions ("The glide",
"The end of a hold together with a change of place"); user stories 27, 36

## What to build

Nothing glides while nothing is seen. A change of distance during a hold takes
effect at once, and when the hold ends the toasts appear at the new place with
their entrance, without a glide from the old one. The same when the hold ends
in the moment the place changes, and when it ends as the region moves out of a
modal dialog: a dialog that closes, the hold ending and the token going back
all at once.

## Acceptance

- [ ] Browser test: a change of `--u-toast-inset-top` during a hold, then the
      hold ends: the deck's first seen top is the new place.
- [ ] Browser test: the hold ends and the token changes in the same frame:
      the first seen top is the new place, no value in between.
- [ ] Browser test: a modal closes, the hold ends and the token changes in
      the same frame: the same.
- [ ] `pnpm check core`, `pnpm test:visual:quick core`.
