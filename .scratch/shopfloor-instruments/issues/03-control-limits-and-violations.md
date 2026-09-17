# 03 — Control limits and violation rules

Status: done

Spec: `.scratch/shopfloor-instruments/spec.md`

## Scope

The arithmetic of statistical process control, as a pure module in charts. Write
ADR-0008 first — it is the most valuable document in this package and it must
exist before the temptation to compute limits from the visible data arrives.

- **A control limit is not a specification limit.** The specification limit is
  chosen by engineering and comes from `<Limit>` in `judging-values`. The control
  limit is computed from the process. A process can be in control and out of
  specification, or the reverse, and each calls for a different action.
- **Control limits are never computed from what is on screen.** Either the caller
  supplies them, having established them from a reference period, or the caller
  names a reference window and the module computes from exactly that window. The
  silent alternative lets an out-of-control process redefine normal around itself
  and defeats the instrument entirely.
- **An individuals chart.** Sigma from the average moving range using the standard
  constant. **Name the constant and its provenance in a comment beside the
  arithmetic** — a bare `1.128` in a source file is unmaintainable.
- **Four violation rules**, each a pure predicate returning violating indices,
  each individually switchable:
  1. one point beyond three sigma;
  2. a run of points on one side of the centre line;
  3. a run of consecutive increases or decreases;
  4. two of three consecutive points beyond two sigma on the same side.
- **Run lengths differ between Western Electric and Nelson** — eight versus nine
  most visibly. Pick one, **name which in the code**, and expose the length as a
  parameter so a plant with a house convention is not arguing with the library.

## Acceptance

Unit tests in charts. Prior art: `balken.test.ts` — same package, same shape, same
granularity.

- **Sigma from a hand-computed fixture.** The expected value comes from the
  published constant and hand arithmetic, never from running the implementation.
- **Supplied limits are used as given.** Assert that a supplied limit survives a
  series whose own statistics would produce a different one. This is the assertion
  that pins ADR-0008.
- **Computed limits come from the named window only.** Assert with a series whose
  tail is wildly out of control: the limits must be identical with and without that
  tail present, because the tail is outside the reference window.
- **Each rule in isolation**, with a case that just misses and a case that just
  qualifies. A run of eight where the length is nine is not a violation; a run of
  nine is.
- **Rules are independently switchable**: a series violating all four reports only
  the enabled ones.
- **Degenerate input**: a series shorter than a run length, a series of identical
  values (sigma zero), a series with gaps.

## Notes

Write the "computed limits ignore the out-of-control tail" test before writing the
computation. It is two fixtures and one assertion, and it is the only thing
standing between this module and the wrong implementation everybody builds.

Sigma zero is not an error. A perfectly flat process has no variation, the limits
coincide with the centre line, and every point is on them — which by the
beyond-not-equal rule from `judging-values` violates nothing. Assert that rather
than guarding it.
