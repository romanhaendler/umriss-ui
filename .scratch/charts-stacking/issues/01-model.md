# 01 - Stacking in the materialisation

Status: done
Type: task

Spec: `.scratch/charts-stacking/spec.md`

## Scope

K1-K3 as pure functions.

## Acceptance

- Unit tests with literals, gaps and negatives.

## Comments

**2026-09-25 (agent).** Done. `src/stack.ts` (`stackSeries`) sums the members'
own values per x in registration order, matched by equal x rather than by
index: bottom and top per point, the value shown and the stack's total. A gap
stays a gap in its member and stacks as zero above it; negatives stack downward
from zero apart from the positives. `barGroups` gives the members of one stack
one place. Tests: `tests-unit/stack.test.ts` (literals, gaps, negatives, x
matching, normalising), `bars.test.ts` (one place per stack).

In the scene the raw materialisation stays per series (`own`); `stackAll()`
sums every stack anew after each materialisation and writes the top into `y`
and the stack below into `y0` (K2, the baseline channel of ADR-0011). A hidden
member marks the materials dirty and gives up its place. The stack key is the
id plus the x and the y axis.
