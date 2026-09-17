# Spec: The whole plant at once, and whether to trust it

Status: done

Origin: brainstorming session, 26 Aug 2026, on components for manufacturing
dashboards, followed by `/to-spec`. This is bundle C of three; see
`.scratch/judging-values/spec.md` for the foundation and
`.scratch/shopfloor-instruments/spec.md` for the instruments.

Decisions to be recorded as ADRs: **ADR-0010** — a stale value keeps its verdict;
freshness and judgement are separate axes and are never collapsed. **ADR-0011** —
the materialised series gains a named third channel rather than overloading the
baseline channel. Numbers are provisional; assign at write time.

Vocabulary to be added to `CONTEXT.md`: As-of time, Freshness, Fresh, Stale,
Disconnected, Value channel, Cell, Cell size, Colour ramp, Span, Lane, Idle,
Overlap.

Sequencing: 01 before 02. 03 before 04. 05 before 06. The three strands — freshness,
matrix, schedule — are independent of one another and can be worked in any order.
07 is last.

**Dependencies on the earlier bundles.** Freshness needs `<Stat>` from
`judging-values` issue 05 and the alarm list from `shopfloor-instruments` issue
02. The matrix needs the verdict from `judging-values` issue 01. The span series
needs nothing from either, but it should not be started before the state band from
`judging-values` issue 03 has landed — see Further Notes for why the two are
related and why they are nevertheless separate kinds.

---

## Problem Statement

Three gaps, all of which appear only once a dashboard has more than one machine on
it or has been open for more than a few minutes.

**A number on a control-room screen has an age, and this library has no word for
it.** Every value on the screen was true at some moment, and the distance between
that moment and now decides whether it is worth acting on. A tile showing 82 %
looks identical whether the reading is two seconds old or forty minutes old, and
the second one is not a reading — it is a memory of one. The failure is worse than
it first sounds, because the natural place to put staleness is the verdict, and
that is the wrong place: a value that was in alarm forty minutes ago is still the
last thing we knew, and greying it into "unknown" throws away the only
information there is. **Freshness and judgement are two axes and the library has
neither the second nor the discipline to keep them apart.**

**Fifty machines cannot be shown at once.** A plant with fifty machines and a
shift's worth of hours has two thousand four hundred readings that a supervisor
wants in one glance, and the shape that answers it is a grid — machine by hour,
each cell coloured. `Table` renders two thousand four hundred cells of DOM and a
`Meter` in each one, which works and is slow and is not what anyone means by a
heatmap. `Chart` draws marks positioned in two dimensions and coloured by a
palette index, which is nearly right and is missing the one thing a matrix needs:
a **third number per point**, the value that decides the colour.

**A schedule cannot be drawn at all, and the near-miss is dangerous.** A
Belegungsplan — resources down the side, time across the top, jobs as bars — looks
like the state band from bundle A with different labels, and it is not. A state
band is a partition: every moment has exactly one state and there are no gaps by
construction. A schedule has **holes** (a machine sitting idle) and **overlaps**
(two jobs booked on one machine, which is a planning error and showing it is the
entire point of looking). Building a schedule out of a state band silently forbids
both, and it forbids them in a way that looks like it works right up until the
first double-booking is invisible.

## Solution

Three strands, independent of one another, each small.

**Freshness is its own axis** (issues 01–02, ADR-0010). A value carries an
**as-of time** — when it was true, not when it was fetched. A pure function turns
that plus a reference time plus two thresholds into one of three states: fresh,
stale, disconnected. A stale value **keeps its verdict** and is shown as old; it
does not become unknown, because the last thing we knew is not nothing. The
component ticks itself through a small hook whose interval derives from the
thresholds rather than from a fixed second, so a tile that goes stale after five
minutes does not spin a timer sixty times a minute to find out.

**The matrix is a sixth series kind with a named third channel** (issues 03–04,
ADR-0011). `MaterializedSeries` gains an optional value channel — named, not the
baseline channel overloaded, because the codebase's own rule is that a property
meaningful to only some kinds belongs in their members and not smuggled into the
base with a comment. Cell size comes from the grid spacing of both axes, which is
ADR-0002's reasoning in two dimensions. Cells colour either by verdict — discrete,
reusing bundle A, accessible by construction — or by a continuous ramp the caller
supplies. A missing cell is a hole, not a zero.

**The span is a seventh kind, and it is not the state band** (issues 05–06). A
span has an explicit start and end on the x axis and a lane on the y axis. Holes
and overlaps are both expressible, because they are both real. Lanes come from the
y axis' domain in exactly the way the state band's do, so a hundred resources are
a hundred-unit domain and the axis labels them. Nothing needs virtualising: canvas
does not care how many rectangles it draws, and a hundred HTML axis labels is a
hundred HTML axis labels — which matters, because the alternative would have been
a dependency from `@umriss/charts` on `@umriss/ui`'s virtualisation, and the lint
rule forbids it for good reasons.

## User Stories

1. As a developer, I want a value to carry the time it was true, so that the interface can reason about its age rather than about when I happened to fetch it.
2. As a developer, I want freshness to be a pure function of an as-of time, a reference time and two thresholds, so that I can assert my thresholds without waiting.
3. As a developer, I want three freshness states rather than two, so that "a bit old" and "the connection is gone" are not the same message.
4. As a developer, I want a stale value to keep its verdict, so that the last thing we knew survives the value getting old.
5. As a developer, I want freshness and verdict to be separate fields, so that no component can collapse one into the other by accident.
6. As a developer, I want the reference time passed in, so that freshness tests are deterministic like every other test in this repo.
7. As a developer, I want a hook that ticks a tile as it ages, so that I do not wire a timer per tile in my application.
8. As a developer, I want that hook's interval derived from the thresholds, so that a five-minute threshold does not cost a timer every second.
9. As a developer, I want the age rendered in words, so that "vor 3 Minuten" is the library's problem and not mine.
10. As a developer, I want the alarm list to show the age of its data too, so that an empty alarm list can be distinguished from a dead connection.
11. As a developer, I want a matrix of values on two axes, so that fifty machines by twenty-four hours is one component.
12. As a developer, I want the cell colour to come from the verdict, so that the same threshold that colours a tile colours the grid.
13. As a developer, I want a continuous ramp as an alternative, so that a temperature field is not forced into three buckets.
14. As a developer, I want to supply the ramp, so that the library's default is a starting point rather than a constraint.
15. As a developer, I want a missing cell to be a hole, so that "no reading" does not read as zero.
16. As a developer, I want cell size derived from the axes, so that I do not compute cell widths in my own code and get them wrong on resize.
17. As a developer, I want to point at a cell and be told its value, so that colour is not the only carrier of a number.
18. As a developer, I want the axes to label rows and columns, so that a matrix needs no legend to say which row is which machine.
19. As a developer, I want a series of spans with explicit starts and ends, so that a schedule is expressible as what it is.
20. As a developer, I want two spans on one lane to be allowed to overlap, so that a double-booking is visible rather than impossible.
21. As a developer, I want gaps between spans to stay gaps, so that idle time is idle rather than filled by the next job.
22. As a developer, I want lanes to come from the y axis' domain, so that a hundred resources need no new layout concept.
23. As a developer, I want to point at a span and be told which one, so that overlapping bars are still readable.
24. As a developer, I want a span with no end to be drawn to the edge of the axis, so that a job still running is visible as still running.
25. As an operator, I want a value I cannot trust to look different from one I can, so that I do not act on a reading from forty minutes ago.
26. As an operator, I want to see how old a value is, so that I can judge whether to wait or to walk over.
27. As an operator, I want a lost connection to say so, so that I do not read a frozen screen as a calm plant.
28. As an operator, I want the last known value kept when it goes stale, so that I still know what was happening when the link dropped.
29. As a supervisor, I want fifty machines and a shift of hours in one picture, so that I can see where the bad hours clustered.
30. As a supervisor, I want a bad hour on one machine to stand out from a bad hour on all of them, so that I can tell a machine problem from a plant problem.
31. As a planner, I want to see two jobs booked on one machine, so that the conflict is something I can find rather than something I discover on the day.
32. As a planner, I want idle time between jobs visible, so that I can see where capacity is.
33. As a screen-reader user, I want staleness stated in words, so that a grey tile is not the only indication.
34. As a screen-reader user, I want a cell's value reachable as text, so that a colour field is not the only way to read the grid.
35. As a library maintainer, I want the value channel named rather than the baseline channel overloaded, so that the type says what it holds.
36. As a library maintainer, I want the freshness rule proven at both thresholds from both sides, so that the two boundaries are decided once.
37. As a library maintainer, I want it proven that a stale value keeps its verdict, so that the one decision this bundle exists for cannot be quietly reversed.
38. As a library maintainer, I want overlap and idle proven on the span kind, so that the difference from the state band is a test rather than a paragraph.
39. As a library maintainer, I want the hook's interval derived and asserted, so that a per-second timer per tile cannot ship.
40. As a library maintainer, I want no dependency from the chart package on the interface package, so that the standalone rule survives a component with a hundred rows.

## Implementation Decisions

### Freshness (ADR-0010)

**A value carries an as-of time: when it was true.** Not when it was fetched, not
when it was rendered. The distinction matters because a poll that returns a
five-minute-old reading instantly is not fresh, and a naive implementation stamps
it as fresh at the moment of arrival.

**Three states: fresh, stale, disconnected.** Two thresholds. Three, not two,
because "a bit old" and "we have lost the link" call for different actions and
different words, and because the third state is what makes an empty alarm list
readable — an empty list from a live connection means the plant is calm, and an
empty list from a dead one means nothing at all.

**A stale value keeps its verdict.** This is the decision the bundle exists for.
The tempting implementation makes a stale value unknown, reusing bundle A's fourth
verdict, and it is wrong: unknown means we have no value, and here we have a value
whose age we also know. Discarding the last known state at exactly the moment the
plant stops telling us anything removes the only information available. **Freshness
and verdict are separate fields and no component collapses them.** ADR-0010 says
so and the tests assert it.

**The reference time is a parameter**, per the repo's standing rule, and the
function is pure.

**A hook owns the ticking, and its interval derives from the thresholds.** A tile
that goes stale after five minutes needs to re-evaluate at most as often as the
smaller threshold requires, not sixty times a minute. The pure function sits
beneath the hook; the hook is the thin React shell, which is the pattern this
package already uses everywhere. The hook is what makes the timer one decision in
one place rather than one per tile.

**Placement: the shared library location in ui.** More than one element needs it —
`<Stat>`, the alarm list, the matrix — which is the package's placement rule.

**Charts gets no freshness.** A chart shows the data it was given, and how old
that data is is a statement about the feed, which belongs in a tile or a header
above the chart. Keeping it out preserves the charts package's freedom from text
and from clocks.

**Staleness is stated in words as well as in appearance**, and the age is rendered
through `wortlaut` as a parameterised entry, per the module's convention. Greying a
tile is not sufficient and would fail the accessibility suite.

### The matrix (ADR-0011)

**`MaterializedSeries` gains an optional value channel.** A named third
`Float64Array`, null for every kind that does not use it. **Not the baseline
channel reused.** The codebase's own rule — a property meaningful to only some
kinds belongs in their members, not in the base with a comment — applies to the
materialised form as well, and a baseline channel holding a colour value is the
kind of overloading that is discovered by someone debugging an area chart at
midnight.

**The matrix is a sixth series kind.** x is the column position, y is the row
position, the value channel decides the colour. Both are ordinary numeric axes
with ordinary `tickFormat` labels, so rows and columns are labelled by the machinery
that already labels everything else.

**Cell size comes from the grid spacing of both axes**, which is ADR-0002's
reasoning applied in two dimensions: the existing grid-spacing measurement is
one-dimensional and this needs it on the y channel too. Where no spacing is
measurable — a single row, a single column — the axis' domain span is used, exactly
as the bar geometry already does.

**Two colouring modes.** By verdict: discrete, reusing bundle A's model, which
means the same thresholds colour the tile and the grid, and which is accessible by
construction because it is the same small palette that already passes contrast. By
continuous ramp: an array of stops the caller supplies, with one library default.
**The continuous mode is where accessibility gets hard, and the answer is not a
better ramp — it is that a cell's value is reachable as text.** Colour cannot carry
a number to a reader who cannot compare two blues, and no ramp fixes that.

**A missing cell is a hole.** `NaN` in the value channel, not painted. The same
rule as every other gap in this library, for the same reason: absence must look
like absence and not like zero.

**A hit is the cell containing the pointer**, in both dimensions — the same shape
of question the state band answered in one dimension, and a separate pure function
because the answer is a pair of indices.

### The span (the schedule)

**A span is a seventh kind, and the difference from the state band is the point.**
A state band is a partition — every moment has exactly one state, gaps arise only
from missing data, and the end of each segment is implied by the start of the
next. A span has an explicit start and an explicit end, which makes two things
expressible that a partition forbids: **idle time between spans**, and **two spans
overlapping on one lane**. Both are real in a schedule and the second is the one a
planner is looking for.

**Lanes come from the y axis' domain**, exactly as the state band's do. A hundred
resources are a hundred-unit domain, one unit per lane, labelled through
`tickFormat`. The two kinds share this because it was the right answer both times,
not because one is built on the other.

**Overlapping spans on one lane are drawn overlapping**, offset within the lane so
that both are visible. They are not stacked into sub-lanes automatically: automatic
packing hides the conflict by making it look like a layout, and the conflict is the
finding.

**A span with no end runs to the edge of the x axis' domain** and is marked as
open, because a job still running is a fact worth seeing and a job with no end
drawn as zero width is not.

**Nothing is virtualised, and that is a decision.** A hundred lanes is a hundred
rectangles per frame, which canvas does not notice, and a hundred axis labels in
HTML is a hundred elements, which the axis layer already handles. The alternative
would have been reaching for `@umriss/ui`'s virtualisation from
`@umriss/charts`, which the lint rule forbids and which would have been the wrong
trade even if it did not.

**The Belegungsplan is a documented composition, not a component.** A chart, a span
series, a y axis whose domain is the lane count and whose `tickFormat` names the
resources, and an x axis which may carry an operating calendar from bundle B.
Wrapping that in a component would mean owning the axis formatting, which is the
part a caller most wants to control. The demo shows the composition; if it turns
out to have more pieces than a caller can wire correctly — the test being whether
the demo's version and a second caller's version diverge — a thin convenience is
added then, the way `<ControlChart>` earned its.

## Testing Decisions

**What makes a good test here.** Same as the earlier bundles: pure functions
called directly and asserted on their return; surfaces asserted on what a user or
an assistive technology can observe; pixels proven only by screenshot.

**Modules under test.**

- **Freshness**, in ui. Both thresholds from both sides; a stale value keeping its
  verdict; an as-of time in the future (a clock skew, which is real and must not
  produce a negative age or a crash); a missing as-of time, which is not the same
  as an old one.
- **The tick interval**, in ui. Derived from the thresholds, asserted as a value
  rather than observed as a timer. The hook's timer itself is not tested; the
  interval calculation is, and that is where the defect would be.
- **The matrix module**, in charts. Cell size from measurable spacing in both
  dimensions; the degenerate single-row and single-column cases; the cell hit in
  both dimensions including the far edge of a cell; a `NaN` value producing a hole.
- **Materialisation**, in charts. The value channel is populated for the matrix
  kind and **null for every other kind**. That second half is the assertion that
  keeps ADR-0011 honest.
- **The span module**, in charts. Overlap on one lane; a gap between spans staying
  a gap; a span with no end reaching the domain edge; the hit rule with overlapping
  spans, which must report one defined span rather than an arbitrary one.
- **`<Stat>` and the alarm list**, in jsdom. Staleness in text; the verdict
  surviving staleness; the disconnected state distinguishable from the stale one.

**Prior art.** `balken.ts` for the charts modules, again and for the same reasons.
For the hook, the existing pattern of a pure module with a thin React shell over
it, which this package uses in several places. For the jsdom assertions, the
existing behaviour tests.

**Determinism.** No test reads a clock. Every freshness test passes a reference
time. The repo's visual suite already freezes its clock, so the new tiles are
deterministic without further work.

**Count what happened; do not compare the result.** Standing convention.

**Screenshots.** Three new tiles: a row of `<Stat>` covering fresh, stale and
disconnected, each keeping a visible verdict; a matrix in both colouring modes with
holes; a schedule with an overlap, an idle gap and an open-ended span. All in both
themes, all in the shared tile list.

**Accessibility.** All three pass axe at WCAG 2.1 AA in both themes with no new
suppression entry. The matrix is the one to watch: a continuous ramp will not pass
on colour alone, and the answer is the value reachable as text rather than a
different ramp.

**Coverage priorities, in order.** A stale value keeping its verdict, first and
before any of it is built — it is the single decision this bundle exists for and
the one an implementation will reverse for the sake of a simpler render. Then the
value channel being null for kinds that do not use it. Then overlap and idle on the
span kind, because they are the difference from the state band and a paragraph is
not a test. Then the freshness thresholds from both sides. Then the tick interval.

**Regression safety.** No existing screenshot baseline moves. Widening
`MaterializedSeries` with an optional channel must leave every existing
materialisation test passing unchanged; if one needs editing, the channel was not
optional.

## Out of Scope

- **Fetching, polling, reconnecting or any transport concern.** The library is told
  when a value was true. How it found out is the application's.
- **A connection-state component.** Freshness of a value is not the state of a
  socket, and a library that renders one from the other would be guessing.
- **Freshness in `@umriss/charts`.** Keeps that package free of text and clocks.
- **Dragging a span to reschedule.** Canvas hit-testing plus a drag gesture plus a
  controlled value contract is a work package of its own, and a read-only schedule
  is already useful. It is the obvious next step and it is not this step.
- **Automatic sub-lane packing of overlapping spans.** It hides the conflict by
  making it look like a layout decision.
- **Dependency links between spans**, critical paths, and everything else that
  makes a scheduling tool a scheduling tool. This is a picture of a plan, not a
  planner.
- **Clustering, sorting or reordering a matrix' rows by similarity.** Useful, and a
  data transform the caller applies before handing over rows.
- **A legend for a continuous ramp.** Needed eventually; it is a chart decoration
  in its own right and it does not fit in the same package as the kind it
  describes.
- **Turning the state band into sugar over the span kind.** See Further Notes: it
  is a real question and answering it belongs in its own package, after both have
  shipped and there is evidence.

## Further Notes

The strongest thing in this bundle is one sentence: **a stale value keeps its
verdict.** It sounds like a detail and it is the difference between a screen that
degrades honestly and one that lies quietly. When a link drops, the naive
implementation greys everything into "unknown", and the operator loses the last
picture they had at exactly the moment they most need it. The right behaviour is to
keep showing what was last true, say clearly how old it is, and let the human
decide — which is also, not coincidentally, what a good instrument panel has always
done.

The state band and the span kind deserve a note, because a reviewer will
reasonably ask why there are two. A state band could be expressed as spans: run
through the points, pair each with the next, emit a span. The reason it is not is
that a state log is what state data actually looks like — a sequence of "at 09:41
it became X" — and requiring the caller to convert it means every caller writes the
same pairing loop, gets the last element wrong, and loses the current state. The
span kind exists because a schedule genuinely has explicit ends, holes and
overlaps, and forcing that through a partition forbids the finding a planner is
looking for. Two kinds, two data shapes, both honest. **If, after both have
shipped, the span kind turns out to cover the state band's cases with no loss —
including the implied end and the current-state-to-the-edge behaviour — then making
the state band sugar over it is a good later package.** That is a question to answer
with two working implementations in front of you, not now.

The decision not to virtualise the schedule is worth keeping in mind as evidence
about where the packages' boundary sits. The instinct was to reach for the
virtualisation in `@umriss/ui`, and the lint rule stopped it, and stopping it led
to the observation that canvas does not need it — a hundred rectangles is nothing,
and the only DOM in play is a hundred axis labels the axis layer already draws. The
rule prevented a dependency and also prevented a solution to a problem that did not
exist. Both are the rule working.

---

## Follow-up: what the implementation decided differently

**`stufen` on the gradient is deleted without replacement.** The spec names a
number of steps beside the stops. The two together are contradictory as soon as
the library does not interpolate — and it does not and should not (ADR-0011).
The stops ARE the steps; whoever wants a finer gradation names more colours.

**The matrix does not colour `unbekannt`.** The spec sets up the verdict as a
discrete mode, and that has four outcomes. A missing value becomes a hole here —
the same rule as with the state band and for the same reason: a colour would be
an assertion about the cell. The palette therefore has three colours, not four,
and in the theme there is no token for „unbekannt".

**The cell edge is substituted only when drawing, not when measuring.** The first
version drew the substitute from the span of the SERIES — which with a single row
is likewise zero. Out of zero and zero comes no cell, and the chart looked as
though no data were present. The substitute now comes from the axis domain,
exactly as with the single bar (ADR-0002).

**The overlap depth is computed at materialisation, not per frame.** The
calculation is quadratic; `spanne.ts` writes it down that way too, and the first
wiring nevertheless called it from the drawing path.

**The alarm list counts and acknowledges the same set.** The selection may carry
identifiers that the filter hides. Counting was done over the filtered set and
acknowledging over the whole selection — a button that does more than it
announces.
