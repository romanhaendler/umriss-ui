# A channel is named, never overloaded

Status: accepted
Date:   2026-08

The matrix needs a third number per point — the value that decides the colour.
The span needs a second x — its end. Neither fits the three channels a
materialised series had.

`MaterializedSeries` therefore gains two **named** optional channels: a value
channel and a second x channel. Each is `null` for every kind that does not use
it.

The alternative was reuse. The baseline channel is right there, it is already
nullable, and putting the matrix' value in it saves a field. It also makes the
type stop describing what it holds — and in a package whose entire performance
argument rests on the reader trusting the channel layout, that is a poor trade
for one field. It is the kind of overloading discovered by someone debugging an
area chart at midnight.

The codebase already had this rule for the configuration types: a property
meaningful to only some kinds belongs in their members and not in the base with a
comment. This ADR applies the same rule to the materialised form.

## Consequences

A test asserts that both channels are `null` for every kind that does not use
them — line, area, bar, scatter and the state band. Without that assertion the
channels become general-purpose within a release, and then the type is back to
not describing what it holds.

Cell size for the matrix comes from the grid spacing of **both** axes, which is
ADR-0002's reasoning in two dimensions: the existing one-dimensional spacing
measurement gains a sibling that works on an unsorted channel, because a matrix
runs row-wise and its y values are not ascending.

The library does not interpolate colours. A continuous ramp is exactly the list
of its stops: as many steps as the caller names colours. Interpolating between
two arbitrary CSS colour values would mean shipping a colour parser in a package
that has none and should not acquire one. Where a ramp cannot carry the number —
and it never can, for a reader who cannot compare two blues — the answer is that
the cell's value is reachable as text, not a better ramp.
