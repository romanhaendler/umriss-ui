# The limit model lives in both packages, on purpose

Status: accepted
Date:   2026-08

A limit is a value, a side and a severity; a verdict is what a number *is* given
a set of them. Both packages need that rule. `@umriss-ui/charts` needs it to colour
a matrix cell and to reason about a specification limit; `@umriss-ui/core` needs it
to colour a tile and, later, a table cell.

It is written twice.

The three alternatives were considered and each costs more than the duplication:

**`@umriss-ui/core` depends on `@umriss-ui/charts`.** The lint rule only forbids the
reverse direction, so this is legal. It also puts a canvas rendering library in
the bundle of every consumer who wanted a coloured number, in exchange for about
thirty lines of comparison.

**A third package.** A build, a version, a release and a place in the workspace,
for thirty lines with no dependencies, no state, no text and no I/O.

**One package owns it and the other does without.** Then the tile and the chart
beneath it can disagree about the same number, which is the failure this model
exists to prevent.

What makes the duplication honest is that it is declared and the declaration is
executable. One table of cases lives in the charts package's test directory and
is consumed three times: by the charts unit tests, by the ui unit tests, and by a
conformance test that drives both implementations and asserts they agree case by
case. The table lives on the charts side because ui may import charts and charts
may not import ui. The conformance test must not add a runtime dependency of
`@umriss-ui/core` on `@umriss-ui/charts`, and a second test asserts that it has not.

## Consequences

A bug found in one implementation is fixed twice, and the case that found it is
added once — to the shared table, where it immediately constrains both. Drift
becomes a red test rather than a support question.

This reasoning is specific to what is being duplicated. It is a pure function of
one value and one configuration: no state, no clock, no text. Anything that
acquires state — hysteresis, for instance, which needs the previous value — is
outside it by construction and belongs somewhere that has state, which is why
the deadband lives in the alarm model and not here.

If a third thing ever needs this rule, revisit. Two houses is a considered
trade; three is a smell.
