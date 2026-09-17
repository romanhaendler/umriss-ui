# 05 — The span: the seventh kind

Status: done

Spec: `.scratch/plant-at-a-glance/spec.md`

Should not start before `judging-values` issue 03 (the state band) has landed —
see the spec's Further Notes for why the two kinds are related and nevertheless
separate.

## Scope

A series of things with a start and an end.

- **A span has an explicit start and end on x, and a lane on y.** This is the
  difference from the state band and it is the entire point: a partition implies
  each segment's end from the next segment's start, which forbids **idle time
  between spans** and **two spans overlapping on one lane**. Both are real in a
  schedule; the second is what a planner is looking for.
- **Lanes come from the y axis' domain**, exactly as the state band's do. A hundred
  resources are a hundred-unit domain, one unit per lane, labelled through
  `tickFormat`. The two kinds share this because it was the right answer both times,
  not because one is built on the other.
- **Overlapping spans are drawn overlapping**, offset within the lane so both are
  visible. **No automatic sub-lane packing**: packing hides the conflict by making
  it look like a layout decision, and the conflict is the finding.
- **A span with no end runs to the edge of the x axis' domain** and is marked open.
  A job still running is worth seeing; drawn at zero width it is not.
- **The hit rule reports one defined span** when spans overlap — defined, not
  arbitrary. Pick a rule (topmost, or last registered) and write it down.
- **Nothing is virtualised, and that is a decision.** A hundred lanes is a hundred
  rectangles per frame, which canvas does not notice; a hundred axis labels is
  something the axis layer already does. The alternative was reaching for
  `@umriss/ui`'s virtualisation from `@umriss/charts`, which the lint rule forbids
  and which would have been the wrong trade anyway.

## Acceptance

Unit tests in charts.

- **Overlap on one lane**: two spans covering the same interval both exist, both
  are placed, neither is moved to another lane.
- **A gap between spans stays a gap.** Assert that nothing is painted between them —
  this is the assertion that proves the span kind is not the state band.
- A span with no end reaches the domain edge and is marked open.
- The hit rule with two overlapping spans reports the same span every time, matching
  the written rule.
- A zero-length span, and a span whose end precedes its start: decide what each
  means and assert it. A backwards span is a data error and silently swapping it is
  the wrong kindness.

## Notes

Write the gap assertion first. It is two spans and one assertion and it permanently
separates this kind from the state band, which is the thing a later reader will
otherwise try to merge.

Resist packing. Every scheduling tool that packs overlaps into sub-lanes makes
double-booking invisible, and the reason people open a Belegungsplan is to find
double-booking.
