# Spec: Four instruments a plant actually reads

Status: done

Origin: brainstorming session, 26 Aug 2026, on components for manufacturing
dashboards, followed by `/to-spec`. This is bundle B of three; see
`.scratch/judging-values/spec.md` for the foundation and
`.scratch/plant-at-a-glance/spec.md` for what follows.

The operating-time axis route was put to the author and confirmed: the
**pre-transformed channel**, which is the route ADR-0001 itself prescribes for a
non-affine axis. ADR-0001 is therefore extended by this work, not contradicted.

Decisions to be recorded as ADRs: **ADR-0008** — a control limit is not a
specification limit, and it is never computed from what is on screen.
**ADR-0009** — the library owns an alarm's lifecycle, not its generation.
Numbers are provisional; assign at write time.

Vocabulary to be added to `CONTEXT.md`: Alarm, Alarm type, Standing, Cleared,
Acknowledged, Priority, Flood, Chatter, Centre line, Control limit, Reference
window, Violation rule, Operating time, Operating calendar, Operating interval,
Cumulative share, Collapsed remainder.

Sequencing: 01 before 02. 03 before 04, and 04 needs `<Limit>` from
`judging-values` issue 02. 05 and 06 depend on nothing in this package and can
land in any order. 07 is last.

**Dependency on `judging-values`:** only the control chart needs it, and only for
the limit line. The alarm list, Pareto and the operating-time axis are
independent of bundle A entirely.

---

## Problem Statement

The four things a plant screen shows that a business dashboard never does, and
that this library cannot express.

**An alarm is not a table row.** Applications built on this library render alarms
as a filtered table sorted by timestamp, and that rendering loses the state that
matters most. An alarm has a lifecycle — it becomes true, a human sees it, it
becomes false — and the four combinations of those two facts are all real and all
different. The one that a naive list loses is the fleeting alarm: **it came, it
went, and nobody saw it.** A table sorted by "currently true" drops it. A table
sorted by timestamp buries it. It is the alarm most worth investigating and it is
the one the ordinary rendering makes invisible. Beyond that, the ordinary
rendering sorts by newest first, which answers the wrong question — an operator
needs the worst thing, not the latest thing — and it has no notion of an alarm
that has fired forty times in an hour, or of the flood that arrives when one
failure trips nine interlocks in twenty seconds.

**Statistical process control cannot be drawn, and drawing it wrong is worse than
not drawing it.** Every plant with a quality function runs control charts, and
every naive implementation makes the same two errors. It confuses the
specification limit — chosen by engineering, a statement about what the customer
will accept — with the control limit, computed from the process, a statement
about what the process normally does. These are different numbers with different
meanings, and a process can be in control and out of specification, or in
specification and out of control, and each of those four states calls for a
different action. The second error is subtler: it computes the control limits
from whatever data is currently on screen, so scrolling the window moves the
limits, an out-of-control process gradually redefines "normal" around itself, and
the chart stops being able to detect the thing it exists to detect.

**"Which three reasons cost us the most?" cannot be answered.** It is the first
question after a bad shift and the standard answer is a Pareto chart — bars sorted
descending with a cumulative line — and this library has bars and lines and no way
to combine them into that. The pieces exist since mixed kinds shipped; the
sorting, the cumulation, the second axis and the tail collapse do not.

**Time on a plant floor is not continuous, and pretending it is wastes most of
every chart.** A week of production data drawn on a wall-clock axis is roughly
forty per cent flat lines over an empty hall: two weekend days, five night shifts,
ten breaks. The flat lines are not data. They compress the part that is data into
the remaining sixty per cent, they make two adjacent working days look far apart,
and they make a Monday-morning problem look unrelated to the Friday-afternoon one
that caused it.

## Solution

Four instruments, three of which are mostly a pure module and a composition, and
one of which is a genuine new surface.

**The alarm list owns lifecycle, not generation** (issues 01–02, ADR-0009). The
model takes alarms the caller produces and owns what happens to them: standing or
cleared, acknowledged or not, all four combinations, none of them dropped. It
orders by priority first and acknowledgement second and time third, because that
is the order in which an operator needs them. It counts repeats per alarm type and
it identifies floods. It does **not** turn measurements into alarms — that is the
caller's process layer, and the boundary is the same one the tree draws when it
reports that a branch was opened rather than fetching its children. It also does
not suppress anything: an interface library does not get to make a safety
decision about which alarms a human sees.

**Hysteresis lands here**, because this is where state over time lives. A limit
in bundle A is a pure function of one value and deliberately cannot express "must
come back past a different threshold before clearing". An alarm can, because it
knows what it was a moment ago.

**The control chart separates the two kinds of limit and refuses to compute from
the window** (issues 03–04, ADR-0008). Control limits come from a caller-supplied
baseline or from a caller-named reference window — never silently from everything
on screen. Violation rules are four named predicates, each pure, each toggleable,
each attributed to the standard it comes from. Rendering adds no new drawing
code: the chart is a line series, limit lines from bundle A, faint zone lines, and
a scatter of the violating points. `<ControlChart>` exists as a thin convenience
over exactly that composition, and the test that it adds no drawing code is a real
test.

**Pareto is a transform plus a composition** (issue 05). A pure module sorts,
cumulates, finds the crossing of a share threshold and collapses a long tail into
a remainder. The chart is bars on the numeric x axis they already sit on by
ADR-0002, with categories as indices and labels through `tickFormat`, plus a line
on a second y axis. No new kinds, no new machinery.

**The operating-time axis pre-transforms** (issue 06). An x axis gains an optional
operating calendar. Materialisation maps wall-clock values into operating time;
the scale stays affine; ticks are generated at wall-clock-nice boundaries and
mapped in; the axis marks each excluded interval so the reader can see where time
was removed. This is exactly the route ADR-0001 names for a non-affine axis, and
it means the draw loop, the scale contract and R-5.2 are all untouched.

## User Stories

1. As a developer, I want to hand the library alarms rather than measurements, so that generating them stays in my process layer where the plant's rules live.
2. As a developer, I want the library to own what happens to an alarm after it exists, so that I stop writing the same four-state machine in every application.
3. As a developer, I want an alarm that went away unacknowledged to stay in the list, so that a fault nobody saw is not silently discarded.
4. As a developer, I want the four lifecycle combinations to be named, so that my code branches on a state rather than on two booleans.
5. As a developer, I want an alarm's priority to be a small ordered set, so that a screen does not end up with seven colours of urgency.
6. As a developer, I want the default ordering to put the worst thing first, so that an operator's eye lands on what matters rather than on what is newest.
7. As a developer, I want to override the ordering, so that an investigation view can sort by time without fighting the component.
8. As a developer, I want repeats counted per alarm type in a window, so that a chattering sensor is visible as one problem rather than as forty.
9. As a developer, I want floods identified, so that the interface can say "forty alarms in ninety seconds" instead of showing forty rows and no context.
10. As a developer, I want the library not to suppress anything, so that no safety decision is made by a component I did not write.
11. As a developer, I want a return threshold on a clearing condition, so that a value oscillating on a limit does not produce a hundred alarms.
12. As a developer, I want the alarm model to compose with the table model rather than replace it, so that filtering, sorting and paging behave the way they already do everywhere else.
13. As a developer, I want bulk acknowledgement to act on the selection, so that it reuses the selection rules I already understand.
14. As a developer, I want to be told how many alarms an acknowledgement will cover before it happens, so that the interface can ask before acknowledging forty things.
15. As a developer, I want a reference time passed in rather than read, so that an alarm's age is deterministic in a test.
16. As a developer, I want control limits I supply to be used as given, so that a baseline established last quarter is not quietly recomputed from this week.
17. As a developer, I want to name a reference window when I want limits computed, so that the computation is a decision I made rather than a side effect of scrolling.
18. As a developer, I want specification limits and control limits to be different objects, so that my chart can show both and the reader can tell them apart.
19. As a developer, I want the violation rules named after the standard they come from, so that a quality engineer can tell me which ones we run.
20. As a developer, I want each violation rule to be individually switchable, so that a process with a known drift does not drown in rule-two hits.
21. As a developer, I want the violating indices returned as data, so that I can list them beside the chart as well as mark them on it.
22. As a developer, I want the control chart to be a composition of parts I could have written myself, so that when I need something it does not do, I can drop to the parts.
23. As a developer, I want a Pareto transform that sorts and cumulates, so that the arithmetic behind the standard answer is not mine to write.
24. As a developer, I want ties broken predictably, so that two fault reasons with the same count do not swap places between renders.
25. As a developer, I want a long tail collapsed into one remainder bar, so that two hundred fault reasons produce a readable chart.
26. As a developer, I want the remainder bar to stay last and look distinct, so that it is not mistaken for a real category.
27. As a developer, I want the share threshold to be a parameter, so that a plant that talks about ninety per cent is not forced into eighty.
28. As a developer, I want to give an x axis an operating calendar, so that a week of data is a week of production and not a week of clock.
29. As a developer, I want the scale to stay affine, so that adding the calendar costs the draw loop nothing.
30. As a developer, I want ticks at boundaries a human recognises, so that the axis reads in shifts and days rather than in elapsed production hours.
31. As a developer, I want removed intervals marked on the axis, so that the chart does not claim a continuity it does not have.
32. As a developer, I want a measurement that falls inside a removed interval treated as a gap, so that data from a time the calendar says does not exist cannot be placed at a lie.
33. As an operator, I want the alarm I have to act on at the top of the list, so that I do not read forty rows to find it.
34. As an operator, I want to see that an alarm came and went while I was elsewhere, so that I can investigate what happened.
35. As an operator, I want to acknowledge one alarm or a selection of them, so that a flood does not take forty clicks.
36. As an operator, I want to see how long an alarm has been standing, so that I can tell a fresh fault from one that has been open all shift.
37. As an operator, I want a repeated alarm shown once with its count, so that one flapping sensor does not hide everything else.
38. As an operator, I want priority conveyed by something other than colour, so that the list is readable to me and to my colleague who cannot distinguish two of them.
39. As a quality engineer, I want a point outside the control limits marked, so that I see the signal without scanning.
40. As a quality engineer, I want a run on one side of the centre line marked, so that a shift the eye misses is caught.
41. As a quality engineer, I want the control limits and the specification limits drawn differently, so that I can see at once whether the problem is the process or the tolerance.
42. As a shift lead, I want the three biggest stoppage reasons to be obvious, so that the morning meeting is about the right things.
43. As a shift lead, I want a week's chart to show only the hours we ran, so that the shape of Tuesday is as visible as the shape of Friday.
44. As a screen-reader user, I want the count of standing unacknowledged alarms announced when it changes, so that I know something needs attention without each arrival being read aloud.
45. As a library maintainer, I want the alarm lifecycle proven as a pure state machine, so that the fleeting-alarm case is asserted rather than hoped for.
46. As a library maintainer, I want the control-limit source proven, so that the chart cannot be made to compute limits from the visible window by accident.
47. As a library maintainer, I want the convenience component proven to add no drawing code, so that "it is a composition" is a fact rather than a claim in a comment.
48. As a library maintainer, I want the operating-time mapping proven in both directions, so that a tick placed at a boundary comes back as the boundary.

## Implementation Decisions

### The alarm model (ADR-0009)

**The library takes alarms; it does not make them.** The caller's process layer
decides that a temperature crossing a limit is an alarm. The library owns what
happens next. This is the same boundary the tree draws — it reports that a branch
was opened and does not fetch — and it exists for the same reason: the moment a
component generates alarms it needs thresholds, deadbands, scan rates, suppression
and a clock, and every one of those is a plant decision with a plant's
consequences attached.

**An alarm type is a separate concept from an alarm.** The type is the condition
that can become true; the alarm is one occurrence of it becoming true. Counting
repeats, detecting chatter and grouping a flood are all statements about a type
over a window, and none of them is expressible if the model only knows about
occurrences.

**Four lifecycle states, all named, none dropped.** Standing and unacknowledged;
standing and acknowledged; cleared and unacknowledged; cleared and acknowledged.
The third is the fleeting alarm and it is the reason the state is one field rather
than two booleans — a boolean pair invites the filter `if (standing)` and that
filter is the bug. The fourth leaves the list, which is the only removal the model
performs.

**Ordering is priority, then acknowledgement, then time.** An operator needs the
worst thing, not the newest thing. The default is expressed as the table model's
existing multi-stage sort, so a caller who wants time-first replaces one value
rather than fighting a hardcoded comparator.

**Priority is three levels.** Not two, because an alarm system genuinely ranks
actionability more finely than a limit does; not seven, because every level above
about four gets used as a synonym for the one below it. **Priority is a different
scale from a limit's severity, on a different object, and `CONTEXT.md` says so
explicitly** — mapping one to the other is the caller's, in the caller's code,
where the plant's convention lives.

**Hysteresis is a property of the clearing condition.** An alarm may carry a
return threshold: the value must come back past it, not merely past the limit that
raised the alarm, before the alarm clears. This is the deadband, it is what stops
a value sitting on a limit from producing a hundred alarms, and it is expressible
here — and only here — because the model knows what the alarm was a moment ago.
The bundle-A limit model deliberately cannot express it.

**Flood and chatter are pure functions over timestamps.** A flood is a run of
alarms exceeding a rate over a window; chatter is one type recurring above a count
in a window. Both take their window and their thresholds as parameters and take
the reference time as a parameter, never reading a clock. Both **mark**; neither
**suppresses**. Suppression is a safety decision, it belongs to the plant's alarm
management, and an interface library that quietly hides alarms is a hazard.

**The model composes with `tabellenModell` rather than replacing it.** It produces
rows with their derived fields — lifecycle state, age, repeat count, flood
membership — and hands them to the existing filter-then-sort-then-page pipeline.
Everything the table already guarantees continues to hold, including that figures
come from the filtered set rather than from the visible page.

**Bulk acknowledgement acts on the selection**, reusing the existing selection
helper, so that "all filtered" versus "this page" behaves as it does elsewhere in
the library. The component reports the size of the set it would acknowledge before
acting; whether that becomes a confirmation dialog is the application's decision,
because a confirmation the operator cannot switch off is its own hazard.

**The reference time is a parameter.** An alarm's age is derived from it. Nothing
in the model reads a clock, which is the repo's existing rule and what makes the
tests deterministic.

**Accessibility: one polite live region reporting the count of standing
unacknowledged alarms.** Not each arrival — a list that announces forty arrivals
during a flood is worse than one that announces nothing, because the operator
turns it off. The count is the actionable fact and it changes rarely enough to be
useful. Priority is conveyed by text as well as colour, as everywhere else in this
library.

### The control chart (ADR-0008)

**A specification limit and a control limit are different objects with different
origins.** The specification limit is chosen and comes from bundle A's `<Limit>`.
The control limit is computed from the process and is a property of the control
chart. They are drawn differently — the specification limit as bundle A draws it,
the control limit in the chart's own weight — because a reader must be able to
tell in one glance whether the problem is the process or the tolerance.

**Control limits are never computed from what is on screen.** Either the caller
supplies them, having established them from a reference period, or the caller
names a reference window and the module computes them from exactly that window.
The silent alternative — computing from everything currently rendered — makes the
limits move when the chart scrolls, lets an out-of-control process redefine normal
around itself, and defeats the entire purpose of the instrument. This is the
decision ADR-0008 records.

**The chart is an individuals chart.** A library that receives a stream of
measurements cannot know the subgroup structure, and guessing one is worse than
not offering subgroups. Sigma is estimated from the average moving range using the
standard constant, and the constant and its provenance are named in a comment
where the arithmetic is, because a bare `1.128` in a source file is unmaintainable.

**Four violation rules, named and attributed.** One point beyond three sigma; a run
of points on one side of the centre line; a run of consecutive increases or
decreases; two of three consecutive points beyond two sigma on the same side. Each
is a pure predicate returning the violating indices. Each is individually
switchable. **The run lengths differ between the Western Electric rules and
Nelson's**, most visibly eight versus nine for the run rule; the module picks one,
names which, and exposes the length as a parameter so a plant with a house
convention is not arguing with the library.

**Zone lines at one and two sigma are drawn faintly**, because rule four is about
them and a reader cannot check it against a chart that does not show them.

**`<ControlChart>` adds no drawing code.** It is a thin convenience over a line
series, limit lines, zone lines and a scatter of violating points — all existing
parts. It exists because the composition has enough pieces that a caller can wire
them inconsistently, not because it needs to draw anything. **This is asserted:**
if the component gains a canvas call of its own, the composition was wrong and the
missing capability belongs in the parts.

### Pareto

**A pure module sorts, cumulates, collapses and finds the crossing.** Descending
by value; **ties broken by input order**, stably, so that two reasons with the same
count do not swap between renders; a running cumulative share; the index at which
the cumulative share first crosses a threshold that defaults to eighty per cent
and is a parameter.

**A long tail collapses into a remainder.** Everything beyond a rank the caller
names becomes one entry, placed last regardless of its value, and marked as the
remainder so the chart can draw it distinctly. Two hundred fault reasons is the
ordinary case, not the pathological one.

**Categories are indices on the numeric x axis.** ADR-0002 already decided that
bars sit on a numeric x axis, and labels already come through `tickFormat`. Pareto
needs nothing new: category *n* is *x* = *n*, and the axis formats the label.

**The cumulative line sits on a second y axis** from zero to one hundred per cent,
positioned on the right, using the axis stacking that already exists. Its points
sit at bar centres — which, on a numeric x axis with integer categories, are the
integers themselves.

**The remainder label defaults to a German word**, consistent with the rest of the
library's defaults, and is a prop. `@umriss/charts` has no `wortlaut` module —
every string it renders today is caller-supplied — and this work does not
introduce one for a single label. That asymmetry between the two packages is real
and is noted rather than resolved here.

### The operating-time axis

**An x axis gains an optional operating calendar**: a list of intervals during
which time counts. Materialisation maps that axis' x channel from wall clock into
operating time. **The scale stays affine, the draw loop is untouched, and ADR-0001
is satisfied rather than contradicted** — the ADR itself names this route for a
non-affine axis, and the calendar is its first user.

**The mapping is monotone and non-decreasing**, constant across a removed
interval, and it is needed in both directions: forward for materialisation and for
placing ticks, backward for turning a pointer position into a wall-clock time for
the tooltip.

**Ticks are generated at wall-clock-nice boundaries and mapped in**, not generated
in operating time. Operating-time ticks land in the middle of a shift at
unreadable values; a reader wants hours, shift changes and days. The tick
generator produces candidate boundaries in wall clock, drops those inside removed
intervals, and maps the rest.

**Each removed interval is marked on the axis.** A chart that removes a weekend
and does not say so is claiming a continuity it does not have, and the reader has
no way to know. The mark is in the axis band, in HTML, like every other axis
decoration.

**A point whose x falls inside a removed interval is a gap.** It maps to no
position — a measurement from a time the calendar says did not exist cannot be
placed honestly, and placing it at the interval's edge would stack it with
whatever is genuinely there. It becomes `NaN`, the encoding every gap in this
library already uses, and the existing draw loop breaks the mark at it for free.

**Two points either side of a removed interval are adjacent, and the line between
them is drawn.** This is not a lie: in operating time they *are* adjacent, and
saying so is the entire reason for the axis. The axis mark tells the reader that
time was removed there.

## Testing Decisions

**What makes a good test here.** All four instruments are dominated by pure
modules, and the pure modules are where the tests go: call with arguments, assert
the return. The surfaces get behaviour tests that assert what a user or an
assistive technology can observe. Nothing asserts a class name, a helper's name,
or the shape of an intermediate structure.

**Modules under test.**

- **The alarm model**, in ui. The four lifecycle transitions, the fleeting alarm
  surviving, the default ordering, age from a passed reference time, repeat
  counting per type, flood detection, the return threshold. Pure, no DOM.
- **The alarm list**, in jsdom and in a browser. Acknowledgement of one and of a
  selection; the live region's content; priority carried in text.
- **The control chart module**, in charts. Sigma from the moving range against a
  hand-computed fixture; the four violation rules each in isolation, each with a
  case that just misses and a case that just qualifies; limits taken as supplied;
  limits computed from a named window and **not** from the whole series.
- **The Pareto module**, in charts. Sorting, tie stability, cumulation, the
  threshold crossing including exact-hit and never-crossing cases, the tail
  collapse and the remainder's position.
- **The operating-time module**, in charts. Round-tripping wall clock through
  operating time and back; a point inside a removed interval; the boundary of a
  removed interval from both sides; tick generation dropping candidates inside
  removed intervals; an empty calendar behaving as no calendar.

**Prior art.** For the pure charts modules, `balken.ts` and `balken.test.ts` — a
small module owning one rule with no visual intuition behind it, tested directly.
For the alarm model, `tabellenModell.ts` and its test, which is the same shape:
a pure pipeline over rows producing a view. For the alarm surface, the table
interaction suite, which already tests selection and bulk actions against a real
browser.

**A new browser test file for the alarm list.** The repo splits its interaction
suites by surface — basis, table, virtual, tree — and the alarm list is a surface.
It gets its own file rather than growing the table's.

**Expected values come from an independent source.** The repo's standing rule.
Sigma constants from the published tables, not from the implementation's own
arithmetic; violation-rule fixtures hand-constructed so that the expected indices
are obvious by inspection; operating-time expectations computed by hand from the
calendar, not by running the mapping.

**Count what happened; do not compare the result.** For acknowledgement in
particular: acknowledging a selection twice produces the same set, and a test that
compares sets cannot tell the difference between working once and working twice.

**Screenshots.** Four new tiles: the alarm list showing all four lifecycle states
and a flood marker; a control chart with a violation of each rule and both kinds
of limit; a Pareto with a collapsed remainder and a threshold crossing; a week of
data on an operating-time axis with the removed intervals marked. All in both
themes, all added to the shared tile list.

**Accessibility.** All four tiles pass axe at WCAG 2.1 AA in both themes with no
new suppression entry. The alarm list is the one to watch: priority in colour
alone would fail, and so would a live region that is assertive.

**Coverage priorities, in order.** The fleeting alarm surviving every filter and
every sort, because it is the state the ordinary implementation loses and the
reason the model exists. Then the control limits' source, because computing them
from the window is the plausible wrong implementation and it produces a chart that
looks right. Then the return threshold, because without a test it will be built as
a plain comparison. Then the operating-time round trip at an interval boundary.
Then Pareto's tie stability.

**Regression safety.** No existing screenshot baseline moves. The operating-time
work touches materialisation and the axis, which are covered by existing unit
tests: those must pass unchanged, because an axis without a calendar must behave
exactly as it does today. If one needs editing, the calendar was not optional.

## Out of Scope

- **Generating alarms from measurements** (ADR-0009). The caller's process layer.
- **Suppressing, shelving or filtering alarms out of existence.** Marking a flood
  is the library's job; deciding a human should not see an alarm is not.
- **Alarm history, persistence, or a journal.** The model takes what it is given.
- **Alarm sound.** An interface library that makes noise is a decision nobody
  asked it to make.
- **Subgroup control charts** (x-bar and R, and the rest). A library receiving a
  stream of measurements cannot know the subgroup structure. The individuals chart
  is what a stream supports honestly.
- **Process capability indices.** They belong to the same domain and are a
  different instrument; specifying them alongside would double this package for a
  number that is one division.
- **The remaining Western Electric and Nelson rules** beyond the four named.
  Adding them is a pure predicate each once the shape exists; adding all of them
  now buys rules nobody has asked for and dilutes the four that matter.
- **A `wortlaut` module for `@umriss/charts`.** The asymmetry is noted, not fixed.
  One default label does not justify a text layer in a package that has none.
- **Zoom and pan on the operating-time axis.** The library has neither today.
- **A shift model.** The calendar is a list of intervals. Deriving those intervals
  from a shift pattern, with its exceptions, holidays and handovers, is a plant
  data problem and belongs above this library.
- **Sankey, material-flow and energy-flow diagrams.** Same domain, different
  instrument, no dependency on any of this.

## Further Notes

The alarm list is the piece that will look like a table with coloured rows to
anyone who has not built one. The distance between that and a real alarm list is
one field — the lifecycle state — and one ordering decision, and both are cheap.
What is not cheap is discovering afterwards that the fleeting alarm was never
displayed, because by then applications have been built on the assumption that the
list shows everything.

ADR-0008 is the most valuable document in this package, and it is worth writing
before any code. The specification-versus-control-limit confusion is not an
implementation detail: it is the single most common error in shop-floor software,
it produces charts that look professional and mislead, and a library that gets it
right is doing something a quality engineer will notice immediately.

The operating-time axis is included here rather than deferred because it is
cheaper than it looks. The pre-transformed channel route means the whole feature
is one pure module, one optional field on the axis configuration, and one line in
materialisation — and ADR-0001 already worked out that this is how a non-affine
axis has to be built, three packages before anyone needed one. That is worth
noticing as evidence that the ADR was written at the right altitude.

One thing this package deliberately leaves uncomfortable: the alarm priority scale
has three levels and the limit severity scale has two, and they are not the same
type. Every instinct says to unify them. Resist it. A limit is either advisory or
actionable — a third level would be a third colour on a chart for no gain. An
alarm system ranks actionability more finely because an operator with forty
standing alarms needs an order among the actionable ones. They are different
scales because they answer different questions, and the mapping between them is a
plant convention that belongs in the plant's code.

---

## Follow-up: what the implementation decided differently

**A point in distant time gets a position, not a gap in the X channel.** The
spec says it is a gap and maps to `NaN` — right as a statement, wrong as an
encoding. A `NaN` in the X channel breaks every binary search silently: every
comparison with `NaN` is false, the search carries on to the left and lands on a
point from an earlier shift, and the sortedness guard fails to fire for the same
reason. The point is therefore clamped to the seam — that keeps the channel
ascending — and becomes a gap via its VALUE: never drawn, never hit, not in the
value range. The statement of the spec stays unchanged, only the encoding is a
different one.

**A calendar axis without `tickFormat` labels with a time.** The first version
wrote thirteen-digit milliseconds there and laid out the axis band for them. An
operating-time axis carries time by definition.

**The control limits in the chart carry a role, not a severity.** The spec says
"drawn differently"; that is expressed as `rolle` on `<Limit>`
(`spezifikation` | `eingriff` | `zone`), which determines colour and dash
pattern. A computed limit asserts nothing about good or bad, so it carries no
severity colour either.
