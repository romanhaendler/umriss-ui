# Bars sit on a numeric x axis, not on a categorical band scale

Status: accepted
Date:   2026-08

Every other chart library draws bars against a band scale over categories. We do
not. In this library an x accessor returns a number, x values are required to be
sorted, and hit-testing is a binary search over them. A bar therefore gets its
width from the **step** — the smallest distance between two consecutive x values
of its series — and is drawn as a fraction of that step, transformed by the same
affine scale every other mark uses.

## Consequences

One scale contract (ADR-0001), one materialisation shape and one hit model serve
all four series kinds. Mixing a bar with a line means nothing more than
registering two series against the same axes, which is the entire point of the
change this decision belongs to.

The cost is that there is no categorical axis. Labelled categories must be
supplied as numeric positions with a `tickFormat` that names them. Irregularly
spaced x values produce bars of uniform width centred on their values, with
visible gaps where the data is sparse — correct, and not what a band scale would
draw. Several bar series bound to the same x axis are grouped side by side
within one step rather than overlapping.

A genuine categorical scale remains possible later and would be additive: a new
scale kind plus a rule for deriving the step from it. It is deliberately not
built now, because building it would have forced a second hit model and a second
domain-to-pixel path for one series kind.
