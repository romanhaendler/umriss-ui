# 07 — The tiles, the record and the vocabulary

Status: done

Spec: `.scratch/shopfloor-instruments/spec.md`
Blocked by: 02, 04, 05, 06

## Scope

Closing the package.

- **Four new demo tiles**, in `packages/ui/tests-visual/kacheln.ts` and the charts
  demo respectively: the alarm list (all four lifecycle states, a flood marking, a
  chatter count); the control chart (a violation of each rule, both kinds of
  limit, the zone lines); Pareto (collapsed remainder, threshold crossing); the
  operating-time axis (a week with weekends and night shifts removed and marked).
- **`CONTEXT.md` gains the vocabulary**: Alarm (Meldung), Alarm type
  (Meldungsart), Standing (anstehend), Cleared (gegangen), Acknowledged
  (quittiert), Priority (Priorität), Flood (Flut), Chatter, Centre line
  (Mittellinie), Control limit (Eingriffsgrenze), Reference window
  (Referenzfenster), Violation rule (Regelverletzung), Operating time
  (Betriebszeit), Operating calendar (Betriebskalender), Operating interval
  (Betriebsintervall), Cumulative share (kumulierter Anteil), Collapsed remainder
  (Rest).
- **Priority gets an explicit note** that it is a different scale from a limit's
  severity, on a different object, and that mapping between them is the caller's.
  This sentence is cheap now and expensive later.
- **Control limit gets an explicit note** that it is not a specification limit,
  pointing at ADR-0008.
- **Two ADRs land**: ADR-0008 (control limits are not specification limits and are
  never computed from the window) and ADR-0009 (the library owns an alarm's
  lifecycle, not its generation). Both should already exist from 01 and 03; this
  ticket verifies numbering, cross-references and that the vocabulary points at
  them.
- **`TESTS.md` is updated**: four new pure modules in the seam table, the new
  browser interaction file, the new tile count, the new unit-test files.

## Acceptance

- All four tiles are in the shared tile list, photographed in both themes, and
  pass axe with no new suppression entry.
- `pnpm test:unit` and `pnpm test:visual` are green.
- No existing screenshot baseline has moved.
- `CONTEXT.md` names every term with its avoided words, and carries both notes.
- `TESTS.md` reflects actual counts.

## Notes

The two vocabulary notes are the point of this ticket. Everything else is
bookkeeping; those two sentences are what stop the next person from unifying two
scales that mean different things, and from computing control limits the easy way.
