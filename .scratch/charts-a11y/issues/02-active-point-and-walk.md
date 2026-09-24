# 02 - The Active point and the walk

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/charts-a11y/spec.md` - Q1-Q3, R1-R9; ADR-0030.

## Scope

- A pure walk over materialised series (`keyboard.ts` or beside `hit.ts`):
  positions in the visible domain (R5), next/previous, first/last, a tenth,
  the emphasised series up/down (R4), gaps skipped, the kinds of R7.
- The scene keeps one Active point for pointer and keyboard (R3), draws it as
  a hit, sends it over `syncId`.
- With a `<Tooltip>`: the plot area gets `tabIndex=0`, `role="application"`,
  `aria-roledescription` from the wording; key handling for Q2 and R2; the
  start of R1; the ring of R8. Without a tooltip nothing changes.

## Acceptance

- Unit tests of the walk at its seam, with literals.
- Interaction tests: Tab in, every key of Q2 and R2, pointer/keyboard handover,
  a synced chart follows.
- The own-base focus check passes with the new tab stop.
