# A state is a number

Status: accepted
Date:   2026-08

The state band is the fifth series kind. Its accessor returns the **index of the
state in the declared state list** — a number, matching the `Accessor<T>`
signature every other kind uses. A caller whose data holds strings maps them in
the accessor.

The alternative was a string-keyed accessor, because a state log is a sequence of
strings and mapping them is work the caller would rather not do. It would have
cost the following: `MaterializedSeries` gains a channel that is not a
`Float64Array`; the draw loop gains a branch that is not arithmetic; the loop
stops being monomorphic; and R-5.2 — the rule that holds sixty frames per second
at three million points — is paid for, in full, to make one accessor prettier.

The mapping the caller writes instead is one line and runs once per point at
materialisation time.

## Consequences

Everything downstream follows for free. The materialised series is the same three
channels. The affine scale contract (ADR-0001) is untouched: a state code is
affine in itself, like any other number. Adding the fifth kind cost the draw loop
nothing.

The state list — code, label, colour — becomes a prop the caller declares once and
shares across every chart on a page. That turns out to be the better model rather
than a concession: it is what makes the same fault the same orange everywhere. A
string-keyed accessor would have made each series carry its own mapping and made
that consistency the caller's problem.

A gap stays a gap. An absent state is `NaN`, the encoding every kind uses, and
its segment is not painted — **not** painted in a colour for "unknown", because a
colour is a claim about the interval and the truthful claim is that nothing is
known about it.

The lane a band occupies is declared in domain units of its y axis, not in pixels
and not in fractions of the plot. Four machines are one axis with a four-unit
domain and four series of one unit each, labelled through the axis' existing
`tickFormat`. There is no lane concept, no new layout, and no pixel arithmetic in
the caller's code.
