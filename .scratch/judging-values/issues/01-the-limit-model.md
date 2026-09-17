# 01 — The limit model, in both houses

Status: done

Spec: `.scratch/judging-values/spec.md`

## Scope

The rule that says what a value is. Write ADR-0006 first — the whole ticket rests
on the decision that this module exists twice, and the ADR is where the reasoning
lives.

- **A limit is a value, a side and a severity.** Two severities only, ordered:
  advisory and actionable.
- **A target is a separate field**, not a limit. It is missed by an amount, never
  violated.
- **A tolerance band is derived.** The caller passes limits; two of opposite side
  and equal severity make a region. Nothing takes a band as input.
- **The verdict has four outcomes**: fine, warning, alarm, unknown — ordered by
  severity with unknown between fine and warning. A non-finite or absent value is
  unknown. **Not a null return.** A null invites `?? "ok"` at the call site, and
  that expression is the defect this module exists to prevent.
- **Beyond, not equal.** A value exactly on a limit is acceptable. Decided here,
  once, and written into the ADR.
- **The verdict carries what it found**: which limit was violated, the excess
  beyond it, and — separately — the signed deviation from the target where one
  exists. Two fields, because they are two numbers.
- **Most severe wins**; among equals, the largest excess.
- **No text.** The module returns a verdict, never a word.
- Two homes: package root in charts, beside `balken.ts`; the shared library
  location in ui, because more than one element will need it.

## Acceptance

Unit tests in both packages, plus one conformance test.

- **The case table is a shared artefact**, written once and consumed by all three
  test files. A case added because of a bug in one package is thereby a case in
  the other.
- **All four outcomes**, including unknown from an absent value, from `NaN`, and
  from infinity.
- **Unknown is not fine.** Assert this directly and first. It is the defect the
  current `Meter` ships.
- **The boundary from both sides**: a value exactly on an upper limit is fine, one
  the smallest step beyond it is not; the same for a lower limit.
- **One-sided configurations** in both directions, with no limit on the other
  side, behave as ordinary rather than throwing or defaulting.
- **Severity precedence**: a value beyond both an advisory and an actionable limit
  reports the actionable one.
- **Excess and deviation are independent**: a value beyond a limit *and* off
  target reports both, and neither field is populated from the other.
- **No target** means no deviation field, not a deviation of zero.
- **The conformance test** drives both implementations from the table and asserts
  agreement case by case. On a mismatch it names both answers — "expected true,
  got false" is useless when the question is which of two packages is wrong.
- **The conformance test adds no runtime dependency** of `@umriss/ui` on
  `@umriss/charts`. A dev dependency, a vitest alias or a relative import from the
  test file are all acceptable; a production import is not.

## Notes

Write the unknown case before anything else. Everything else in this ticket is
comparison arithmetic that any implementation gets right; the fourth outcome is
the one that will be quietly collapsed into a boolean if the test does not exist
before the code.

Resist a `Toleranzband` input type. It reads as the obvious primitive and it is
not: it forces a null on one edge for the one-sided case, which is the common
case, not the exception.

Resist hysteresis. It needs the previous state and this is a function of one
value — that is exactly the property that lets the module be duplicated safely.
It is specified in `shopfloor-instruments`, where lifecycle is the subject.
