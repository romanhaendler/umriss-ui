# 06 — The operating-time axis

Status: done

Spec: `.scratch/shopfloor-instruments/spec.md`

## Scope

An axis that shows only the hours the plant was meant to run. Read ADR-0001
first: it names this exact route for a non-affine axis, three packages before
anyone needed one, and the calendar is its first user.

- **An x axis gains an optional operating calendar**: a list of intervals during
  which time counts.
- **Materialisation maps that axis' x channel from wall clock into operating
  time.** The scale stays affine, the draw loop is untouched, R-5.2 is untouched,
  and ADR-0001 is satisfied rather than contradicted.
- **The mapping is monotone and non-decreasing**, constant across a removed
  interval, and needed **in both directions**: forward for materialisation and
  ticks, backward for turning a pointer position into a wall-clock time.
- **Ticks are generated at wall-clock-nice boundaries and mapped in**, never
  generated in operating time. Operating-time ticks land mid-shift at unreadable
  values; a reader wants hours, shift changes and days. Generate candidates in
  wall clock, drop those inside removed intervals, map the rest.
- **Each removed interval is marked on the axis**, in the axis band, in HTML, like
  every other axis decoration. A chart that removes a weekend and does not say so
  claims a continuity it does not have.
- **A point inside a removed interval is a gap.** It maps to no position — a
  measurement from a time the calendar says did not exist cannot be placed
  honestly, and placing it at the interval's edge would stack it with what is
  genuinely there. It becomes `NaN`, and the existing draw loop breaks the mark at
  it for free.
- **Two points either side of a removed interval are adjacent and the line between
  them is drawn.** In operating time they *are* adjacent; saying so is the whole
  point of the axis, and the axis mark tells the reader what happened there.

## Acceptance

Unit tests in charts, in a new pure module.

- **Round trip**: wall clock → operating time → wall clock returns the input, for
  points inside operating intervals.
- **A boundary from both sides**: the instant an interval starts and the instant it
  ends each map to one defined operating-time value, and map back to themselves.
- **A point inside a removed interval becomes a gap**, not the interval's edge.
  Assert the `NaN`.
- **Tick generation** drops candidates inside removed intervals and keeps the rest,
  with a fixture whose expected ticks are obvious by inspection.
- **An empty calendar behaves exactly as no calendar.** Assert against the
  unmapped values.
- **Every existing materialisation and axis test passes unchanged.** An axis
  without a calendar must behave exactly as it does today; if a test needs editing,
  the calendar was not optional.
- A screenshot tile: a week of data with weekends and night shifts removed and
  marked, in both themes.

## Notes

Expected values are computed by hand from the calendar, never by running the
mapping. This is the repo's standing rule and it matters more here than usual,
because a mapping that is self-consistently wrong round-trips perfectly.

Resist deriving intervals from a shift pattern. The calendar is a list of
intervals; turning a shift model with its exceptions, holidays and handovers into
that list is a plant data problem and belongs above this library.

Resist generating ticks in operating time because it is easier. It produces an
axis labelled 14.5, 29.0, 43.5 and a reader who cannot use it.
