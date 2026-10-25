# 01 - A late answer leaves the table loading

Status: ready-for-agent
Type: task
Size: M

Blocked by: none
Spec: `.scratch/table-server-mode-2/spec.md`, "A late answer and an error (T1)"
ADR:    ADR-0072, given in `.scratch/after-shakedown/order.md`; use it wherever this ticket says "the next free number" or ADR-NNNN

## What to build

The fault first. In server mode `answers?: TableRequest` names the request the
rows answer. The table compares it by `requestKey` with its current request
(the snapshot gains `request`, `null` outside server mode). Not equal: the table
is busy exactly as `loading` makes it over rows already shown (dimmed after a
moment, no pointer, `aria-busy`, widths kept; skeleton where no rows stand),
while the search, conditions and page already show the new request. Without
`answers` nothing changes and DEV does not warn; with it, DEV warns once when it
has matched none of the requests reported so far.

The ticket also writes the ADR for the server mode's contract (the next free
number at the time), with the decisions of all four pieces in the spec's
words. It does not edit `CONTEXT.md`; ticket 07 does.

## Acceptance

- [ ] A test with two requests answered out of order: the table is busy until the
      answer whose `answers` equals the current request, and the older rows never
      stand as current.
- [ ] `answers` equal to the current request: not busy; `loading` still works alone.
- [ ] No `answers`: the existing `serverMode.test.tsx` passes untouched, no DEV warning.
- [ ] DEV warns once for an `answers` that matches nothing reported.
- [ ] Type tests: `answers` exists in server mode, is `never` in automatic mode.
- [ ] `snapshot.request` is the request `onRequest` receives.
- [ ] The ADR is written and listed in `docs/adr/README.md`.
- [ ] The demo's server-mode example answers out of order on purpose and shows it holds.
