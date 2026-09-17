# Spec: Judging a value — limits, states and the tile that reads them

Status: done

Origin: brainstorming session, 26 Aug 2026, on components for manufacturing
dashboards, followed by `/to-spec`. Four seam decisions were put to the author
and confirmed: three bundle-level specs rather than ten component-level ones;
the limit model lives in **both** packages with one shared vocabulary and no
shared code; the state band is a **fifth series kind** rather than a separate
strip; and the operating-time axis takes the pre-transformed-channel route that
ADR-0001 already prescribes (that one is specified in `shopfloor-instruments`).

Decisions to be recorded as ADRs: **ADR-0006** — the limit model exists twice,
on purpose. **ADR-0007** — a state is a number, which is what keeps the fifth
kind inside ADR-0001 and R-5.2. Numbers are provisional; assign at write time.

Vocabulary to be added to `CONTEXT.md`: Limit, Target, Tolerance band, Severity,
Verdict, Excess, Deviation, State, State series, Segment, State list.

Sequencing: issue 01 before everything else. 02 and 03 are independent of one
another once 01 is in; 04 needs 03; 05 needs 01; 06 is last.

This package is the foundation the other two stand on. `shopfloor-instruments`
needs the limit line from issue 02 for the control chart, and
`plant-at-a-glance` needs the verdict from issue 01 for the matrix and the
freshness rule.

---

## Problem Statement

The library can display a number. It cannot say whether the number is any good.

In an office application that is fine, because the reader supplies the judgement:
a revenue figure means what the reader knows it to mean. On a shop floor it is
not fine, because **no value there stands alone**. 47 °C is inside tolerance or
above it. 82 % is over target or under it. The reader is an operator on the
second hour of a night shift who has eleven tiles in front of them and needs to
know which one to walk to, and the answer has to be in the tile, not in their
head.

Today an application building that screen has to reimplement the judgement each
time, and it reimplements it slightly differently each time. The three places it
shows up are all in this workspace already and none of them helps:

**The chart draws data and nothing else.** There is no way to say "the alarm
limit is here". An application that wants a line at 90 draws a one-point series
and hopes, or overlays absolutely-positioned HTML and recomputes its position on
every resize. The limit is the most important thing on the chart and it is the
one thing the chart has no word for.

**`Meter` takes a `tone` prop.** The caller decides that 0.94 is `danger`. That
decision — the actual rule — lives in the application, is written as a ternary in
JSX, and is written again three components over with a different threshold. The
library holds the colour and gives away the rule, which is exactly backwards:
the colour is the easy part.

**The most important time series in a plant cannot be drawn at all.** A machine's
day is not a curve. It is "6:00 to 6:12 setup, then production, then a fault at
9:41 that lasted nineteen minutes". That is a sequence of states over time, and
the only four series kinds are line, area, bar and scatter — every one of them a
mapping from x to a number. Applications fake it with a row of absolutely
positioned `div`s that share no axis with the chart above them, so the two drift
apart on resize and the tooltip works on one and not the other.

Underneath all three is one missing concept, and its absence has a specific
failure mode worth naming: **a value that is absent currently reads as fine.**
`Meter` with `value={undefined}` renders an empty bar in the neutral tone. A
sensor that stopped reporting looks exactly like a sensor reporting zero
utilisation looks a little like a healthy idle machine. Nothing in the library
distinguishes "I know this is good" from "I do not know".

## Solution

Give the library the concept it is missing — **a value read against something** —
and then build the two things that need it most.

**The limit model is a rule, not a colour** (issue 01). A `Grenzwert` is one
boundary: a number, a side, and a severity. A `Sollwert` is the value being aimed
at, which is a different thing — a target is missed by an amount, never violated.
A `Bewertung` is what a value *is* given a set of limits, and it is a pure
function of the two. The verdict has **four** outcomes, not three: `ok`,
`warnung`, `alarm` and `unbekannt`. The fourth exists so that a missing
measurement can never be reported as fine, which is the bug the current `Meter`
ships by construction.

**The model exists in both packages, deliberately** (ADR-0006). `@umriss/charts`
is standalone by acceptance rule R-1.2 and may not import `@umriss/ui`; making
`@umriss/ui` depend on `@umriss/charts` for thirty lines of arithmetic would put
a canvas library in the bundle of every consumer who wanted a coloured tile; and
a third package to hold thirty lines is a build, a version and a release for
thirty lines. So the rule is written twice, the word is written once in
`CONTEXT.md`, and a conformance test drives both implementations from one table
of cases and asserts they agree. Drift becomes a red test rather than a support
question.

**The chart gains a limit line and a limit band** (issue 02). `<Limit>` draws one
boundary at a domain value on a named axis. `<LimitBand>` fills the region
between two. Both register with the scene the way a series does, both take part
in the axis extent by default — because a chart of a good day that silently hides
its alarm line is worse than a chart that is squashed, and only one of those two
failures is visible to the person who built it.

**The fifth series kind is the state band** (issue 03, ADR-0007). `<StateBand>`
takes an accessor that returns a **state code as a number**, and paints each
point's state from that point's x until the next point's x. Because the code is a
number, the materialised series is the same three `Float64Array` channels every
other kind uses, the draw loop stays monomorphic, and the affine scale contract
is untouched. The band lives inside the ordinary chart on an ordinary y axis,
which means it shares the x axis, the crosshair and the tooltip with the curves
above it — and sharing those is the entire reason to put it there rather than in
a strip of its own.

**A state band's hit is the segment containing the pointer, not the nearest
point** (issue 04). Every existing kind answers "which data point is closest".
For a band that is the wrong question and gives the wrong answer for the whole
right-hand half of every segment. The tooltip reports the state, when it started,
when it ended and how long it lasted, because that is what an operator is
pointing at it to find out.

**`<Stat>` is the tile** (issue 05). A value, its unit, its label, optionally a
target and a sparkline — and it colours itself from the verdict rather than from
a `tone` prop. It carries the verdict in text as well as in colour, because
colour alone is never the carrier and because the accessibility suite in this
repo runs against every tile and would say so.

**No new test seam** (issue 06). Everything here is either a pure function or a
rendered tile, and both already have a home.

## User Stories

1. As a developer, I want to describe a limit as a value, a side and a severity, so that the rule lives in data rather than in a ternary inside JSX.
2. As a developer, I want to describe a target separately from a limit, so that "aiming for 95 %" and "alarming above 98 %" are not the same field.
3. As a developer, I want to ask what a value is, given a set of limits, and get an answer, so that I do not write the comparison chain again in every component.
4. As a developer, I want a value with no measurement to come back as unknown rather than as fine, so that a dead sensor cannot look like a healthy machine.
5. As a developer, I want a one-sided limit to be ordinary rather than an edge case, so that "never above 90" does not force me to invent a lower bound.
6. As a developer, I want a value exactly on its limit to have one defined answer, so that two components in the same screen do not disagree about the boundary.
7. As a developer, I want the verdict to report which limit was violated, so that I can name it in a message instead of saying only that something is wrong.
8. As a developer, I want the verdict to report by how much the limit was exceeded, so that I can show the size of the problem and not only its existence.
9. As a developer, I want the deviation from target reported separately from the excess beyond a limit, so that one number does not silently mean two things.
10. As a developer, I want the most severe violation reported when several apply, so that a warning cannot mask an alarm.
11. As a developer, I want the verdict to be a pure function, so that I can assert my thresholds in a unit test without rendering anything.
12. As a developer, I want the same limit rule in the chart package and the interface package, so that a tile and the chart beneath it never disagree about the same number.
13. As a developer, I want a limit line at a value on a named axis, so that the most important number on the chart is on the chart.
14. As a developer, I want a filled band between two values, so that "inside tolerance" is a region rather than two lines the reader has to relate.
15. As a developer, I want a limit to widen the axis when it falls outside the data, so that a good day still shows me where the edge is.
16. As a developer, I want to switch that off for the case where a distant limit would flatten the plot, so that the default being safe does not make the rare case impossible.
17. As a developer, I want a limit to carry a label, so that a line at 90 says what 90 is.
18. As a developer, I want a series whose values are states rather than numbers, so that a machine's day can be drawn as what it is.
19. As a developer, I want a state to hold from its point until the next point, so that a state log — which is what my data actually is — needs no conversion.
20. As a developer, I want to declare the closed set of states with their labels and colours in one place, so that the same state is the same colour in every chart on the page.
21. As a developer, I want a state band to sit on an ordinary y axis between two domain values, so that stacking four machines is four series on one axis and not a new layout concept.
22. As a developer, I want the y axis of a lane stack to label its lanes, so that the reader knows which strip is which machine without a legend.
23. As a developer, I want a state band to share the x axis with the curves above it, so that the fault at 9:41 lines up with the temperature spike at 9:41.
24. As a developer, I want a missing state to leave a hole rather than paint an "unknown" colour, so that absence looks like absence.
25. As a developer, I want the legend of a state band to list its states rather than its series name, so that the legend explains the colours the reader is actually looking at.
26. As a developer, I want a tile that takes a value, a unit and a set of limits, so that the commonest object on a plant dashboard is one component.
27. As a developer, I want the tile to colour itself from the verdict, so that changing a threshold changes the screen and not eleven ternaries.
28. As a developer, I want to pass a series to the tile and get a sparkline, so that the shape of the last hour is next to the number from it.
29. As a developer, I want the tile to show the deviation from target when there is a target, so that "under by 3" is visible without arithmetic.
30. As a developer, I want tiles of equal width to align their numbers without a wrapper component, so that a row of them is a layout I already know how to build.
31. As an operator, I want to see at a glance which of eleven tiles needs me, so that I can walk to the right machine.
32. As an operator, I want a value I cannot trust to look different from a value that is fine, so that a dead sensor does not read as a healthy one.
33. As an operator, I want to see the limit on the chart, so that I can tell how close today came without reading the axis.
34. As an operator, I want the tolerance region shaded, so that "inside" is something I see rather than something I work out.
35. As an operator, I want to point at a coloured strip and be told what the state was, so that a colour I have not memorised is still readable.
36. As an operator, I want to be told when a state started and how long it lasted, so that pointing at a fault answers the question I have about it.
37. As an operator, I want the strip and the curve to line up, so that I can see which state the spike happened in.
38. As a screen-reader user, I want the verdict conveyed in words, so that a colour I cannot see is not the only carrier of the meaning.
39. As a screen-reader user, I want a value with no measurement announced as unknown, so that silence is not read as zero.
40. As a library maintainer, I want the two limit implementations driven from one table of cases, so that a drift between them is a failing test rather than a report from the field.
41. As a library maintainer, I want the state code to be a number, so that adding a fifth kind costs nothing in the draw loop and nothing in the scale contract.
42. As a library maintainer, I want the segment hit rule asserted directly, so that the difference between "nearest point" and "containing segment" is proven and not assumed.
43. As a library maintainer, I want the boundary case — a value exactly on a limit — written down in an ADR and asserted, so that it is decided once.
44. As a library maintainer, I want no new test seam in this package, so that this work extends the seams that exist rather than adding a sixth.

## Implementation Decisions

### The limit model

**A limit is a value, a side and a severity.** The side says whether the limit is
an upper or a lower boundary. The severity has exactly two levels — a level that
is advisory and a level that is actionable. Two, not five: an interface that
offers five severities gets five colours, and five colours on a plant screen is
noise. A caller who needs a third distinction has a second limit at a different
value, which is what they mean anyway.

**A target is not a limit.** A target is the value being aimed at; it is never
violated, only missed, and it is never a boundary of a region. It is a separate
optional field on the limit set. Conflating the two is how a component ends up
colouring a tile red because it is above target.

**A tolerance band is derived, not primitive.** Two limits of the same severity
on opposite sides enclose a region; the region is what gets drawn. The caller
supplies limits, never bands, so that a one-sided configuration is expressible
without a null on one edge.

**A limit is violated when the value is beyond it, not when it equals it.** A
value exactly on an upper limit is still acceptable. This is decided here, once,
and asserted from both sides, because it is the boundary that two independent
implementations will otherwise disagree about within a month.

**The verdict has four outcomes.** In order of severity: fine, warning, alarm, and
**unknown**. Unknown is what an absent or non-finite value produces. It is a
first-class outcome rather than a null return, deliberately: a null invites a
`?? "ok"` at the call site, and that expression is precisely the defect this
model exists to prevent. Unknown sorts as more severe than fine and less severe
than warning — a value nobody has is a reason to look, not a reason to relax.

**The verdict carries what it found.** Which limit was violated, and by how much
the value is beyond it. Where a target exists, the verdict also carries the signed
deviation from the target. These are two separate fields because they are two
separate numbers, and a single `abweichung` that means one thing when a limit is
violated and another when it is not is the kind of overloading that reads fine
and is wrong at 3 a.m.

**When several limits are violated, the most severe wins**; among equally severe
violations, the one the value is furthest beyond.

**Hysteresis is not part of this model, and it belongs somewhere specific.** A
value oscillating around a limit will flip the tile, and the fix — requiring the
value to come back past a different threshold before the condition clears — needs
the previous state, which a function of one value cannot have. That makes it a
property of an alarm's lifecycle rather than of a limit, and it is specified in
`shopfloor-instruments` where lifecycle is the subject. The limit model stays a
pure function of one value and one configuration, which is why it can be
duplicated safely.

**The model produces no text.** It returns a verdict; the words for the verdict
live in `wortlaut` on the interface side and are caller-supplied on the chart
side. This is what makes duplicating it across the package boundary cheap: there
is nothing to duplicate but arithmetic.

### The two houses (ADR-0006)

**The rule lives in `@umriss/charts` and in `@umriss/ui` as two modules with one
vocabulary and no shared code.** In charts it sits at package root beside
`balken.ts`, the existing home for a pure geometry-adjacent rule with no React
in it. In ui it sits in the shared library location, because more than one
element needs it — the tile now, the meter and the matrix later — which is the
placement rule the package already follows.

**A conformance test holds them together.** One table of cases, both
implementations, asserted to agree case by case. The test lives on the ui side,
because ui may import charts and charts may not import ui. How it reaches the
charts module — a workspace dev dependency, a path alias in the vitest config, a
relative import — is left to implementation, under one hard constraint: **it must
not add a runtime dependency of `@umriss/ui` on `@umriss/charts`.** If the
simplest route would, take the second-simplest.

**The table of cases is the artefact, not the assertions.** It is written once and
consumed three times: by the charts unit tests, by the ui unit tests, and by the
conformance test. A case added for a bug found in one package is thereby a case
in the other.

### Limits on the chart

**`<Limit>` and `<LimitBand>` register with the scene like a series does.** They
take an axis id, one or two domain values, a severity and an optional label.
They are not series: they have no accessor, no data and no legend entry by
default, and they are not hit-testable.

**A band paints beneath every series; a line paints above every series.** These
are different answers because they are different objects. A filled region behind
a curve is ground, and drawing it over an area series would hide the data. A
single line is a landmark, and drawing it under a filled area series would hide
the landmark. Both stay beneath the overlay layer, so the crosshair is still on
top of everything.

**Limits take part in the axis extent by default**, with a prop to opt out. The
two failure modes are not symmetric. A limit outside the data that is excluded
produces a chart which looks correct and is missing the most important line on
it, and nobody notices until the day it matters. A limit outside the data that is
included produces a visibly squashed plot, which the author fixes within a
minute of seeing it. Default to the failure that announces itself.

**A limit label is rendered in the axis band, in HTML, next to its value** — the
same layer the axis ticks already use, so it inherits their font, their theme
tokens and their overflow behaviour, and no text is drawn to canvas.

### The state band (ADR-0007)

**A state is a number.** The accessor returns the index of the state in the
declared state list, matching the existing `Accessor<T>` signature exactly. A
caller whose data holds strings maps them in the accessor, which is one line and
happens once per point at materialisation time. Everything downstream follows
from this: the materialised series is the same three channels, the draw loop
stays monomorphic, the affine scale contract is untouched, and the fifth kind
costs the performance rules nothing. An implementation that widened
`MaterializedSeries` with a string channel would have paid for the whole of
R-5.2 to make one accessor prettier.

**A state series declares its lane in domain units.** It carries `von` and `bis`
on its y axis; without them it fills that axis' domain. Four machines stacked are
one y axis with a domain of four units and four series occupying one unit each,
labelled through the axis' existing `tickFormat`. There is no new lane concept,
no new layout, and no pixel arithmetic in the caller's code — the axis machinery
that already exists does all of it.

**A state series contributes no y extent.** Its lane is a statement about where
to draw, not about what the data spans; a lane must not stretch the axis it sits
on. Its x extent is contributed normally.

**A segment runs from a point's x to the next point's x.** The last point's
segment needs an end, and there is no next point: it runs to the end of the x
axis' domain. This is stated because the alternative — dropping the last state —
loses the state the reader most often cares about, which is the current one.

**A gap is a hole.** A point whose accessor returns nothing is `NaN`, the same
encoding every kind uses, and its segment is not painted. It is not painted in an
"unknown" colour, because a colour for "unknown" is a claim about the interval,
and the truthful claim is that nothing is known about it.

**The state list is a prop of the series.** Code, label and colour per state.
Colours resolve once per frame into an array indexed by code, alongside the
existing theme palette resolution, so the draw loop reads a colour by index and
never resolves a CSS variable per segment.

**The legend of a state series lists its states.** One entry per state, not one
entry per series. A legend that says "Machine 4" next to a grey swatch explains
nothing; the reader needs to know what orange means.

### Hits and the tooltip

**A state series' hit is the segment containing the pointer's x.** A new pure
function beside the existing `nearestIndex`: the largest index whose x is at or
below the target, and nothing when the target is before the first point. This is
a different question from the one every other kind asks, and answering it with
`nearestIndex` would report the wrong segment for the right-hand half of every
one of them.

**The tooltip entry for a state carries its segment.** Start, end and the state
code, in addition to the fields every entry has. This is an optional field on the
existing tooltip point type rather than a second type, and it is documented as
present exactly for state series.

**Duration is not a field.** It is the difference of two numbers the entry
already carries, and formatting a duration requires knowing what the x axis
means, which charts deliberately does not. The caller's tooltip renderer computes
and formats it; the demo shows how.

### The tile

**The component is `<Stat>`.** Not `Metric`: this package already exports `Meter`,
and two exported names one letter apart, both about numbers, both in the same
import statement, is a defect waiting for a tired reader. `Stat` is short, it is
the established word for this object in dashboard vocabulary, and it collides with
nothing.

**`<Stat>` takes a value, a unit, a label, an optional target, an optional limit
set and an optional series.** With a limit set it derives its verdict and colours
itself accordingly. Without one it is a neutral tile, which is the honest
rendering of a number nobody has given a rule for.

**There is no trend arrow.** A direction computed from the last two points of a
noisy signal is noise with an arrowhead, and it is read as information. A caller
who wants the shape passes the series and gets the sparkline, which shows what
actually happened. Where a target exists, the tile shows the deviation from it,
which is a fact rather than an inference.

**The verdict is carried in text as well as in colour.** A short marker beside the
value, drawn from `wortlaut`, plus the accessible name of the tile. This is not
decoration: the accessibility suite runs axe against every tile in both themes,
and colour as the sole carrier of meaning fails it.

**An unknown verdict renders as unknown**, with a placeholder in the value slot
and the reason in text. It does not render as an empty tile, a zero or a dash
that could be a value.

**No row or group component.** A row of tiles is a layout problem, and this
package has a layout module that already solves it. `<Stat>` uses a fixed
internal grid so that tiles of equal width align their labels, values and units
without any wrapper knowing about them. Adding a `StatRow` would add a component
whose only job is a gap.

**The value is set in the monospaced face** the package already uses for figures,
with tabular figures, so that a value updating in place does not shift its
neighbours.

**New `wortlaut` entries** for the four verdicts, for the unknown placeholder, for
the target label and for the deviation phrasing. Parameterised entries are
functions, as the module's existing convention requires.

## Testing Decisions

**What makes a good test here.** For the pure modules: call the function with
arguments, assert the returned value. No mounting, no reaching into a React body,
no assertion on class names or internal helper names. For the tile: assert what a
user or an assistive technology can observe — the accessible name, the text
content, the role — never the class that produced the colour. For the chart
work: assert the scene's computed output and the pure geometry, and prove the
pixels only through the screenshot baselines.

**Modules under test, and where.**

- **`grenzwert` in charts and `grenzwert` in ui** — the verdict in all four
  outcomes, one-sided configurations, the on-the-boundary case from both sides,
  severity precedence, excess and deviation, non-finite input. Unit tests in each
  package's existing unit-test directory.
- **The conformance test**, in ui. One table of cases, both implementations,
  asserted to agree. A case whose two answers differ names both answers in its
  failure message; "expected true, got false" is useless here.
- **`zustand`** in charts — the segment hit rule, the last segment's end, gaps,
  the empty series and the single-point series. Pure, no DOM. Prior art:
  `balken.test.ts`, which is the same shape of module tested the same way.
- **The scene** — that a state series registers, that its lane does not stretch
  its y axis, that a limit does stretch its axis by default and does not when
  told not to, that the legend of a state series produces one entry per state.
  Extends the existing `scene.test.ts`.
- **Materialisation** — that a state accessor's output lands in the y channel
  unchanged and that an absent state becomes `NaN`. Extends the existing
  `materialize.test.ts`.
- **`<Stat>`** in jsdom — the accessible name, the verdict in text for all four
  outcomes, the unknown rendering, the presence of the unit, the absence of the
  sparkline when no series is given. Prior art: the existing behaviour tests
  using Testing Library.

**Prior art for the pure charts modules is `balken.ts` and its test**, deliberately:
same package, same shape (a small module with no React and no DOM, owning one
rule that has no visual intuition behind it), same test granularity. Follow it.

**Browser tests.** One: hovering a state band reports the segment under the
pointer, and reports a *different* segment when the pointer moves within the same
band. That second half is the test that would have caught using `nearestIndex`,
and it is the reason this is in a real browser rather than jsdom — the existing
charts interaction suite drives real pointer events against a real canvas, and
this belongs beside them.

**Count what happened; do not compare the result.** The convention this repo
adopted after the tree shipped a defect that a result comparison could not see.
Where a test drives an interaction, it asserts how many times something fired, or
which segment was reported, not that the resulting state matches a set.

**Screenshots.** Two new tiles. A charts tile showing a limit line, a limit band
and a stacked state band under a curve on a shared x axis. A ui tile showing a
row of `<Stat>` in all four verdicts including unknown, with and without a
sparkline. Both in both themes, both added to `kacheln.ts` — which is one list
read by both the screenshot suite and the accessibility suite, so adding them
there is what gets them checked.

**Accessibility.** Both new tiles pass axe at WCAG 2.1 AA in both themes, with no
new entry in the suppression list. If a verdict colour pair fails contrast, the
colour changes; the suppression list is not the answer. New token pairs, if any
are introduced, are added to the existing token contrast test.

**Determinism.** No test reads the current time. The tile takes no clock in this
package — freshness arrives in `plant-at-a-glance` and brings its own reference-
time parameter with it.

**Coverage priorities, in order.** The unknown verdict first, because it is the
defect this package exists to fix and the one an implementation will be tempted
to collapse into `ok`. Then the on-the-boundary case, because it is the thing the
two implementations will drift on. Then the segment hit rule at the right-hand
edge of a segment. Then the last segment's end. Then the limit extent default.

**Regression safety.** No existing screenshot baseline moves. Every existing unit
test passes unchanged: the fifth series kind is an addition to a union, limits are
new registrations, and nothing here changes an existing kind's behaviour. If an
existing test needs editing, something was changed that should have been added.

## Out of Scope

- **Generating alarms from limit violations.** The verdict says what a value is
  now. Turning a run of verdicts into an alarm with a lifecycle is
  `shopfloor-instruments`, and the boundary is deliberate: this module is a pure
  function of one value, which is what makes duplicating it across the package
  boundary safe.
- **Hysteresis and deadband.** Same reason. Specified where lifecycle lives.
- **Freshness and staleness.** A stale value keeps its verdict; the two are
  separate axes and collapsing them here would be the same mistake as collapsing
  unknown into fine. Specified in `plant-at-a-glance`.
- **More than two severities.** A caller who needs a third boundary adds a second
  limit.
- **A radial gauge.** A dial reads less accurately than a bar with a marked
  tolerance region and costs more area to do it. The band and the meter cover the
  need.
- **A dashboard grid with draggable, resizable tiles.** Large, undifferentiated,
  and in a control room the layout is usually fixed by the people who own the
  process, not by the person looking at it.
- **Vertical limits (a line at an x value).** The axis id is part of the interface
  from the start so this is a small later addition, but nothing in this package
  needs it and an untested code path is worse than an absent one.
- **A state series on a category x axis.** There is no category scale; bars
  already sit on a numeric x axis by ADR-0002 and state bands follow.
- **Zoom and pan.** Not in the library today; unchanged by this work.
- **Announcing chart contents to assistive technology beyond the existing
  `role="img"` and label.** The state band makes this question sharper and does
  not answer it. Noted below.

## Further Notes

The interesting decision in this package is the one that looks like a compromise
and is not: writing the limit rule twice. The instinct is that duplicated logic is
a defect, and the instinct is usually right. It is wrong here because of what the
duplicated thing is — thirty lines of comparison with no dependencies, no state,
no text and no I/O — and because of what the alternatives cost, which is either a
canvas library in the bundle of a consumer who wanted a coloured number, or a
third package to hold thirty lines. The conformance test is what makes it honest:
the duplication is declared, and the declaration is executable.

The second decision worth revisiting later is that a state is a number. It reads
as a concession to the draw loop, and it is, but it also turns out to be the
better model: a state list with codes, labels and colours is something a caller
declares once and shares across every chart on a page, which is what makes the
same fault the same orange everywhere. A string-keyed accessor would have made
each series carry its own mapping and would have made that consistency the
caller's problem.

One question is left open on purpose. A chart is `role="img"` with a label, and a
state band makes that thinner than it was: a curve summarised in a sentence is a
reasonable approximation, and a day of machine states summarised in a sentence is
not. The right answer is probably a table equivalent behind the chart, which is a
work package of its own and should be scoped against a real screen reader rather
than against a reading of the specification. It is noted here so that the next
accessibility claim this library makes has to deal with it.

---

## Follow-up: what the implementation decided differently

**A limit's label covers the tick beneath it.** The spec says it stands in the
axis band beside its value — that is right, and it collides: a limit often lies
exactly on a tick, and „Toleranz" over „800" is unreadable twice over. Of the two
pieces of information the limit is the more important, so its label gets the
background of the surface and covers the tick. Became visible on the tile's first
screenshot.

**The legend lists each state once, not per series.** Three machines share one
state list; the spec says "a state series explains its colours", and taken
literally that yielded twelve entries for four states. A legend explains colours,
so it explains each colour once.

**An area hit is always included in tooltip mode `x`.** The grouping collects
hits whose X pixels lie close together. A band's pixel is the start of its
segment and lies arbitrarily far to the left of the pointer — the band fell out
of the group and turned up sometimes and sometimes not. The browser test from
ticket 04 found this; both calculations were right in themselves.

**`<Stat>` passes no verdict at all without limits.** The spec says "neutral";
the first version wrote „In Ordnung" there, because the verdict without rules
yields `ok`. That is an assertion nobody has made.
