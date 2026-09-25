# 01 - The shared announcer

Status: done
Type: task

Spec: `.scratch/listbox-announcements/spec.md`

## Scope

B1 with a unit test.

## Acceptance

- jsdom test: text arrives, repeats are re-announced.

## Comments

Delivered: `packages/core/src/lib/announce.ts`, internal like
`portalTargetFor` - `announce(text, at?)`. One polite region (`role="status"`)
per place, held in the module and not in the provider, so it works without
one and stays one under several. The place is `portalTargetFor(at, () =>
null)`: the anchor's `<dialog>`, else the body - the provider's portal target
is left out on purpose, it says where a surface is laid out and a region is
laid out nowhere. The region is built at the call and written after
`ANNOUNCE_REST` (150 ms, the charts' readout pause), a later call replacing a
pending one; every text goes in as a new node, so the same words twice are
spoken twice. A region the page removed is built anew. Hidden with
`VisuallyHidden`'s class, no style of its own.

Tests: `packages/core/tests-unit/announce.test.ts` (6) - the rest, the last
call winning, the region standing before its text, a repeat as a new node,
the dialog's own region, one region for several callers, rebuilt after removal.
