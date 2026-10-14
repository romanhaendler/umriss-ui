# 06 - Screen reader check

Status: ready-for-human
Type: research
Size: S

Blocked by: 03
Spec: `.scratch/toasts-held/spec.md`, Further Notes ("Not provable in jsdom or
by Playwright"); user stories 24, 25

## What to build

An answer from real screen readers to what the tests cannot prove: is a toast
that stood before the hold announced a second time when it becomes visible
again inside its live region, although its node was not inserted anew? And is
a toast that arrived during the hold announced once when the hold ends, by its
tone?

On the example "Hold the toasts", with VoiceOver in Safari and NVDA in Chrome:
send a neutral and an error toast, hold, send one more, end the hold.

Then the same with a modal dialog: a modal dialog opens and the hold begins
together, a toast arrives, the dialog closes and the hold ends together. The
region moves out of the dialog as the hold ends, so the toast that arrived
during the hold goes into a region that was just built: it must be announced
once, and the toasts that stood before the hold not again.

## Acceptance

- [ ] Per reader, written under `## Comments`: what was announced on holding,
      during the hold and on its end, without and with the modal dialog.
- [ ] If a reader announces a standing toast again, that is a new question
      (its own ticket, blocking 07): the cards that stood before the hold
      leave the live region for its duration without being re-inserted.
- [ ] What could not be checked is said plainly (for example NVDA without a
      Windows machine).
