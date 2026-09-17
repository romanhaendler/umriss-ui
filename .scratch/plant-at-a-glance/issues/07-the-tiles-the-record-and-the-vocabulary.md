# 07 — The tiles, the record and the vocabulary

Status: done

Spec: `.scratch/plant-at-a-glance/spec.md`
Blocked by: 02, 04, 06

## Scope

Closing the package, and the workspace's manufacturing vocabulary with it.

- **Three new demo tiles** in the shared tile list and the charts demo: `<Stat>` in
  all three freshness states each keeping a visible verdict; the matrix in both
  colouring modes with holes; the schedule with an overlap, an idle gap and an
  open-ended span.
- **`CONTEXT.md` gains the vocabulary**: As-of time (Stand), Freshness
  (Aktualität), Fresh (frisch), Stale (alt), Disconnected (abgerissen), Value
  channel (Wertkanal), Cell (Zelle), Cell size (Zellgröße), Colour ramp
  (Farbverlauf), Span (Spanne), Lane (Spur), Idle (Leerlauf), Overlap
  (Überlappung).
- **Freshness gets an explicit note** that it is a separate axis from the verdict
  and that a stale value keeps its verdict, pointing at ADR-0010.
- **Span gets an explicit note** distinguishing it from the state series, naming
  idle and overlap as the reason there are two kinds, and recording the open
  question about whether one could later become sugar over the other.
- **Two ADRs land**: ADR-0010 (a stale value keeps its verdict) and ADR-0011 (the
  named value channel). Both should already exist from 01 and 03; verify numbering,
  cross-references and that the vocabulary points at them.
- **`TESTS.md` is updated**: new pure modules in the seam table, new tile count, new
  unit-test files.

## Acceptance

- All three tiles are in the shared tile list, photographed in both themes, and
  pass axe with no new suppression entry.
- `pnpm test:unit` and `pnpm test:visual` are green.
- No existing screenshot baseline has moved.
- `CONTEXT.md` names every term with its avoided words and carries both notes.
- `TESTS.md` reflects actual counts.

## Notes

With this ticket the workspace has a manufacturing vocabulary spanning three
packages, and the two notes are what keep it from decaying: freshness is not a
verdict, and a span is not a state. Both are distinctions that are obvious while
the code is being written and invisible six months later, which is exactly what
`CONTEXT.md` is for.

Worth doing at the same time: re-read the Severity note from `judging-values` issue
06 and the Priority note from `shopfloor-instruments` issue 07 alongside the two
here. Four distinctions of the same shape — two things that look like one thing —
now live in one glossary, and they should read as a set.
