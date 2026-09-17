# 06 — The tiles, the record and the vocabulary

Status: done

Spec: `.scratch/judging-values/spec.md`
Blocked by: 02, 04, 05

## Scope

Closing the package: what the demo shows, what the tests cover, and what the
project now has words for.

- **Two new demo tiles**, added to `packages/ui/tests-visual/kacheln.ts` and to
  the charts demo respectively. One list is read by both the screenshot suite and
  the accessibility suite — adding them there is what gets them checked.
  - A charts tile: a limit line, a limit band, and a stacked state band under a
    curve on a shared x axis, with a gap in one lane.
  - A ui tile: a row of `<Stat>` covering all four verdicts, with and without a
    sparkline, with and without a target.
- **`CONTEXT.md` gains the vocabulary**: Limit (Grenzwert), Target (Sollwert),
  Tolerance band (Toleranzband), Severity (Stufe), Verdict (Bewertung), Excess
  (Überschreitung), Deviation (Abweichung), State (Zustand), State series
  (Zustandsserie), Segment, State list (Zustandsliste). Each with the words it
  replaces, in the format the file already uses.
- **Two ADRs land**: ADR-0006 (the limit model exists twice, on purpose) and
  ADR-0007 (a state is a number). Both should already have been written as part of
  01 and 03; this ticket verifies they exist, are numbered without collision, and
  that the vocabulary entries point at them.
- **`TESTS.md` is updated**: the new pure modules in the seam table, the new tile
  count, the new browser test, the new unit-test files.

## Acceptance

- Both new tiles are in `kacheln.ts`, photographed in both themes, and pass axe.
- The full suite is green: `pnpm test:unit` and `pnpm test:visual`.
- No existing screenshot baseline has moved.
- `CONTEXT.md` names every term this package introduced, with its avoided words.
- `TESTS.md` reflects the actual counts, not approximate ones.

## Notes

The vocabulary entry worth spending time on is **Severity**. `shopfloor-
instruments` introduces a second ranking — an alarm's priority, which has three
levels rather than two — and if both are called the same thing in prose the two
will be merged by someone six months from now. Write the Severity entry so that
it says what it belongs to (a limit) and add the note that an alarm's priority is
a different scale on a different object. That sentence is cheap now and expensive
later.
