# 01 — Freshness: the rule and the tick

Status: done

Spec: `.scratch/plant-at-a-glance/spec.md`

## Scope

The second axis a value has. Write ADR-0010 first — the whole ticket is one
sentence and the sentence will be reversed by anyone who has not read the
reasoning.

- **A value carries an as-of time: when it was true.** Not when it was fetched, not
  when it was rendered. A poll returning a five-minute-old reading instantly is not
  fresh, and the naive implementation stamps it fresh on arrival.
- **Three states: fresh, stale, disconnected**, from two thresholds. Three, not
  two: "a bit old" and "the link is gone" call for different actions, and the third
  state is what makes an empty alarm list readable — empty on a live connection
  means the plant is calm, empty on a dead one means nothing at all.
- **A stale value keeps its verdict.** This is the decision. The tempting
  implementation reuses bundle A's `unknown`; it is wrong, because unknown means we
  have no value and here we have one whose age we also know. Freshness and verdict
  are **separate fields** and nothing collapses them.
- **The reference time is a parameter.** The function is pure.
- **A hook owns the ticking, and its interval derives from the thresholds.** A tile
  that goes stale after five minutes must not re-evaluate sixty times a minute. The
  pure function sits beneath; the hook is the thin React shell, which is this
  package's established pattern.
- Placement: the shared library location in ui — `<Stat>`, the alarm list and the
  matrix all need it.
- **Charts gets no freshness.** A chart shows what it was given; how old the feed is
  belongs in a tile above it. This keeps the charts package free of text and clocks.

## Acceptance

Unit tests in ui.

- **A stale value keeps its verdict.** Assert this first and before writing the
  rule. It is the single reason this bundle exists.
- **Both thresholds from both sides**: the instant before and the instant after
  each, with the boundary itself decided one way and asserted.
- **An as-of time in the future.** Clock skew is real. It must not produce a
  negative age or a crash; decide what it means and assert it.
- **A missing as-of time is not an old one.** Decide which state it produces and
  assert it; do not let it fall through to disconnected by arithmetic accident.
- **The tick interval is derived and asserted as a value**, not observed as a
  timer. The hook's timer is not under test; the interval calculation is, and that
  is where the defect would be.
- No test reads a clock.

## Notes

The pressure to make stale mean unknown will come from the render, because one
state is easier to draw than two crossed axes. Write ADR-0010 with the operator in
it: when the link drops, the naive version greys everything at exactly the moment
the human most needs the last picture they had.

Resist a connection-state component. The freshness of a value is not the state of a
socket, and deriving one from the other is guessing.
