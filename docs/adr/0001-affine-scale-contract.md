# Every scale is affine, and the draw loop may rely on it

Status: accepted
Date:   2026-08

The series draw loop converts domain values to pixels for up to a million points
a frame. It does this by reading a precomputed line equation — a slope and an
intercept — off the scale and inlining `v * m + b`, rather than calling
`scale.toPx(v)` per point. That keeps the loop monomorphic and allocation-free,
which is what holds sixty frames per second at three million points.

Until now this was an accident that the code denied: the `Scale` interface
declared only `toPx`/`fromPx`, `LinearScale` happened to expose `m` and `b` as
extra fields, and the draw module imported the concrete class while a comment in
the scale module claimed the opposite — that nothing in the draw code presumed
`LinearScale`. We are making the reliance honest instead of removing it: `m` and
`b` become part of the `Scale` interface, documented as the fast path, and the
draw code types against `Scale` again.

## Consequences

A future non-linear scale cannot be expressed as a scale alone. A logarithmic
axis is affine in `log(v)`, not in `v`, so it would have to pre-transform values
during materialisation and hand the draw loop the transformed channel. That is a
larger change than swapping a scale implementation, and this ADR is the reason.
Time and category axes are unaffected: both are affine in the number the
accessor already returns.

The alternative — calling `toPx` per point through the interface — was measured
against the acceptance targets in the package's performance rules and rejected.
An interface that is pure but cannot meet the one requirement the library exists
to meet is the wrong interface.
