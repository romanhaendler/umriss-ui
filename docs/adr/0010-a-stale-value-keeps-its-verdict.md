# A stale value keeps its verdict

Status: accepted
Date:   2026-08

Freshness and judgement are two axes, and nothing in this library collapses one
into the other.

A value carries an **as-of time**: when it was true. Not when it was fetched — a
poll that returns a five-minute-old reading instantly is not fresh, and stamping
it fresh on arrival is the naive implementation. From the as-of time, a reference
time and two thresholds comes one of three states: fresh, stale, disconnected.

Three, not two, because "a bit old" and "the link is gone" call for different
actions and different words — and because the third state is what makes an empty
alarm list readable. Empty on a live connection means the plant is calm. Empty on
a dead one means nothing at all.

The tempting implementation makes a stale value **unknown**, reusing the limit
model's fourth verdict. It is wrong. Unknown means we have no value; here we have
a value, and we also know its age. Discarding the last known state at exactly the
moment the plant stops telling us anything removes the only information
available. When the link drops, the naive version greys everything out precisely
when the human most needs the last picture they had.

So: verdict and freshness are separate fields. A tile that is in alarm and forty
minutes old reads as both.

## Consequences

The reference time is a parameter; the rule is a pure function. A hook owns the
ticking, and **its interval derives from the thresholds** — a tile that goes stale
after five minutes must not re-evaluate sixty times a minute. The interval
calculation is itself a pure exported function and is asserted as a value, never
observed as a timer.

Staleness is stated in words as well as in appearance. Greying a tile is not
sufficient and would fail the accessibility suite.

`@umriss-ui/charts` gets no freshness. A chart shows the data it was given; how old
the feed is is a statement about the feed and belongs in a tile or a header above
the chart. Keeping it out preserves that package's freedom from text and from
clocks.
