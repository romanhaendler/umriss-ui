# umriss

The shared vocabulary of this workspace. All five published packages —
`@umriss-ui/core`, `@umriss-ui/charts`, `@umriss-ui/table`,
`@umriss-ui/schedule` and `@umriss-ui/calculation` — speak it.

The codebase is English throughout: identifiers, file and directory names,
comments, prose, and the text the library ships. Each term below names one
concept with one word, and that word is the one to grep for — there is no second
language to cross over into. See ADR-0018, which reversed ADR-0015 once the npm
scope was settled as `umriss-ui`, the audience turned out not to be German-speaking, and nothing had been published yet.

`core` is the component library itself — the package you install first, not a
layer the others sit on. `@umriss-ui/charts` deliberately depends on nothing and
will keep depending on nothing, and `@umriss-ui/table` enters `core` only by its
public entry (ADR-0016). A reader who finds that `charts` never imports `core`
has read the name right: it names the first package, not a shared base.

The glossary grows lazily: a term appears here when a decision has fixed its
meaning, not before. Where a ticket needs a word this file does not have, it is
added here rather than decided at the call site — that is what lets several
branches rename the same concept without talking to each other.


## Language

A prop and the identifier behind it are the same word. ADR-0015 drew a seam at
the destructuring pattern, because props were English and everything below them
was German; with ADR-0018 there is nothing on the other side of that seam and it
is gone. What stands from ADR-0015 is the spelling of the accessible name:
`aria-label` wherever the named element is the component's root, and `ariaLabel`
only where it is not.


## Design language

These entries arrived with `.scratch/visuelle-wertigkeit/` and stood beside this
glossary for three efforts, in German and under a "not yet reconciled" marker,
because five of their words collided with entries above and the collisions got
worse in English rather than better. They are settled here and merged in;
`english-and-umriss-ui` 15 is the ticket, and each decision is recorded at its
own entry rather than in a note at the top.

How the five went: **Kachel** is retired, because the thing it named no longer
exists. **Ebene** moved out of the way of both Layer and Level. **Skala** and
**Scale** turned out to be one idea in two packages and keep one word.
**Raster** and **Zustands-Kanon** stand with a qualifier, which is what the
glossary's own rule prescribes when two live concepts want the same word.

**Token**:
A named value of the design layer, declared as a CSS property with the prefix
`--u-` on `:root`, in the layer `umriss.tokens`. The only source for colours, type
sizes, line heights, durations, easing curves, radii and shadows. A token with
a light and a dark value is written once, `light-dark(<light>, <dark>)`, and
follows the `color-scheme` its element inherits (ADR-0021). An application
overrides a token by declaring it outside a layer.
_Avoid_: theme attribute — see **Theme**

**Own element**:
An element a component rendered and put one of its own classes on — as opposed
to content a caller placed inside the component. The library's stylesheets
select own elements only: `.field input` is one, `.stack > *` is the caller's
(ADR-0021). The build gives every own element `box-sizing: border-box` and, where
it has a radius, squircle corners.

**Text context**:
What an element sets for the text inside it: font family, size, line height,
colour and smoothing. Every component that renders text, and every portalled
panel, sets its own through `composes: text from "#own-styles"`
(`scripts/styles/own.module.css`, in the layer `umriss.base`, so the component's
own values win). Pure layout — `Stack`,
`Grid` — sets none. Text a caller places inside a component that has one takes it
on; that is the component deciding for its own surface, not for the page.

**Vocabulary**:
The set of tokens together with the rule that components reference them instead
of writing raw values. A *closed* vocabulary contains no raw values in checkable
places. The claim expressly does not cover spacing, padding, widths and heights —
raw values are allowed there.
_Avoid_: design system, style guide

**Edge**:
The boundary of a surface, implemented as a shadow without offset rather than as
a border.
_Avoid_: Border, frame, outline

**Shadow step**:
One step in a surface's shadow stack, with exactly one job — contact with the
ground, near shadow, depth. Cards and overlays each have a stack of their own.
_Avoid_: **Layer**, **Level**. This entry was `Ebene`, and neither English word
was free: **Level** is a tree node's depth in the glossary above, and "layer" is
already spoken for by the token layer. "Shadow step" says what it is and collides
with nothing.

**Tone**:
A semantic colour role: success, warning, danger. A tone carries a surface and,
where needed, a type colour of its own — the two cannot be the same value.
_Avoid_: using it for a **Verdict**. The two may stand beside each other only
while a colour role never means a verdict; that condition is the whole reason
**Verdict** avoids the word.

**Glyph**:
A character from the shared set: drawn with the stroke, without fill, in
`currentColor`, hidden from assistive technology. Anything that depicts a state,
is animated, or carries an accessible name is **not** a glyph — which is why the
spinner, the filter funnel and the sparkline fall outside it.
_Avoid_: icon, symbol

**Motion origin**:
The point an overlay grows out of, derived from the side and alignment it
really stands at relative to its anchor - after flipping. A panel below the
anchor grows from its top edge, at the end its alignment holds; a flipped one
from its bottom. An overlay without an anchor, the modal, grows from its
centre. Computed by `motionOrigin` in `position.ts`; the stylesheet draws it as
`transform-origin`.
_Avoid_: transform-origin, anchor point

**Interaction-state canon**:
The settlement of **what** produces hover, active, focus and disabled — not how
strongly. It holds across every component.
_Avoid_: "state canon" on its own. **State** is the charts' word (ADR-0007), and
an unqualified "state canon" reads as a canon of those.

### How the library is built

**Provider**:
The root context holding the application-wide decisions: density, portal target
for overlays, toast configuration, formats and wording. Optional — every
component works without it, on the defaults. It holds no **Theme** and writes
nothing onto the document; its settings reach its subtree through context
(ADR-0021).
_Avoid_: root, configuration

**Wording**:
The directory of the library's visible and assistive-technology strings, named
after what they label. A directory of entries, not a translation function.
English is the default; German ships as `GERMAN_WORDING` under
`@umriss-ui/core/wording/de`. Both are typed `Wording`, which makes a missing
entry a type error; nothing guards against the two texts drifting apart in
content, and that is deliberately accepted (ADR-0019).
_Avoid_: translation, i18n, locale strings

**Theme**:
Light or dark: the `color-scheme` an element inherits from the application.
Light is the default — an application that sets nothing stays light. To be
distinguished: a theme *explicitly chosen* (`color-scheme: dark`) and one
*followed* (`color-scheme: light dark`), which tracks the system setting. The
library chooses neither and sets `color-scheme` nowhere (ADR-0021); its tokens
answer either through `light-dark()`.
_Avoid_: theme attribute, `data-theme`


### Checking

**Named exception**:
A deliberate deviation from a bound, entered at its site in the test, with a
measurement and a reason. Taking on exceptions is allowed; softening the bound
itself is not. They live in the test and not in a document beside it, so that
they cannot age independently of the code.

**Baseline**:
A stored screenshot the image check compares against. A baseline moving is either
a fault or the purpose, depending on the undertaking — which of the two is
settled by the ticket at hand. A bulk rebuild without review is never admissible.


## The domains

The vocabulary per subject, in the order the subjects arrived.

### Charts

**Chart**:
The container that owns a plot area, its axes and its series, and paints them
onto two canvas layers. It is generic over the kinds of series inside it.
_Avoid_: LineChart, Diagramm, Graph, Plot

**Series**:
One dataset drawn as one visual mark, bound to exactly one x axis and one y
axis. A series has a kind; it is not itself a chart.
_Avoid_: Datenreihe, dataset, trace

**Series kind**:
What a series is drawn as — line, area, bar or scatter. The kind belongs to the
series, never to the chart, which is why kinds can be mixed in one chart.
_Avoid_: chart type, Diagrammtyp, Charttyp

**Registration order**:
The order in which series register themselves, which is their order in the JSX
on first mount. It is the single drawing order in the library: it decides the
order in which series are painted. It decides the palette only once — a series'
colour follows its **name**, and registration order makes the initial
assignment. A series that unmounts and mounts again under the same name gets its
colour back, instead of landing at the end and shifting every other series. A
series without a name has nothing to keep a colour by and takes the colour of
its place.
_Avoid_: z-order, Zeichenreihenfolge as a separate concept, draw order

**Materialised series**:
The form a series takes once its accessors have run: parallel `Float64Array`
channels of numbers. Everything that draws or hit-tests reads only this.
_Avoid_: normalised data, prepared data

**Gap**:
A point whose y value is absent, encoded as `NaN` in the materialised series. A
gap interrupts a mark; it is never a hit and never contributes to an extent.
_Avoid_: null value, missing point, hole

**Baseline**:
The value a filled mark is drawn back to — zero for a bar, zero or a second
accessor for an area. A baseline is part of the series' extent, so an axis that
carries a filled mark always shows the baseline.
_Avoid_: zero line, Nulllinie (which is the grid line at y = 0), floor

**Step**:
The smallest distance between two consecutive x values of a series, in domain
units. Bar widths are a fraction of it.
_Avoid_: band width, Bandbreite (which is the width of an axis band), spacing

**Axis band**:
The strip outside the plot area on one of its four sides that carries one axis'
ticks, labels and title. Several bands on the same side stack outwards.
_Avoid_: gutter, margin, Achsenbereich

**Plot area**:
The rectangle the marks are drawn into and clipped to. Every pixel coordinate in
the library is relative to it.
_Avoid_: canvas, viewport, drawing area

**Scale**:
The affine mapping from an axis' domain to pixels within the plot area. Affine
is a contract, not an implementation detail — see ADR-0001.
_Avoid_: transform, projection, mapper

**Hit**:
The data point a pointer position resolves to within one series. Hits feed both
the tooltip and the overlay markers.
_Avoid_: selection, match, hover point

**Active point**:
Where a chart stands: one position or none, set by the pointer and by the
keyboard alike, the last input winning. It is drawn as the hits at that
position - crosshair, markers, tooltip - and one series among them is the
emphasised one, read first. It is never a selection and carries no choice (the
chart's counterpart to core's active node, ADR-0003). See ADR-0030.
_Avoid_: selected point, focus point, keyboard hit

### Control charts and Pareto

**Control limit**:
A bound *calculated* from a process — what it normally does — as against a
specification limit, which is *chosen*. The two look different because they mean
different things (ADR-0008), so they are never the same word. It is not a
**Limit**: that word is the model's, and a control limit is never one of its
severities.
_Avoid_: Eingriffsgrenze, action limit, Limit on its own, threshold

**Center line**:
The middle of a control chart, from which the control limits are three sigma
away. Spelled as the identifier is, so that one grep finds both.
_Avoid_: Mittellinie, mean line, average

**Reference window**:
The half-open index range of a series from which control limits are calculated.
It is named explicitly or the limits are given outright; there is deliberately no
third, tacit possibility, because limits calculated from whatever is on screen
would let a process out of control redefine "normal" around itself.
_Avoid_: Referenzfenster, baseline period, training range

**Zone**:
A faintly drawn line at one or two sigma. Rule 4 is about the two-sigma zone, and
a reader cannot check it against a chart that does not show it.
_Avoid_: Zonenlinie, band (which is a limit band), sigma line

**Rule**:
One of the four run-and-outlier tests of a control chart, named and switchable on
its own. A **Violation** is a rule together with the indices it flags. Neither is
a **Verdict**: a verdict judges one value against limits, a rule judges a
sequence against a process.
_Avoid_: Regel as an English word, check, test, signal

**Pareto item** / **Pareto entry**:
An **item** is what the caller counts (a name and a value); an **entry** is that
item as drawn, with its index, share and cumulative share. Two words because they
are two things, and both are prefixed so that neither collides with the **Node**,
the **Candidate** or the **Tool** that also avoid "item" and "entry".
_Avoid_: Posten, Eintrag, bar, category

**Remainder**:
The collected long tail of a Pareto, at most one entry and always last —
independently of its value, because sorted into place the chart would claim there
is a downtime reason called "other" in third place. The package brings no name
for it: whoever collects names it.
_Avoid_: Rest, Sonstige, other as a fixed label, misc

**Cutoff**:
The cumulative share whose crossing a Pareto is read for. Whoever lands exactly
on it counts as the crossing. Not a threshold — that is an avoided word for a
**Limit** — and not a **Target**.
_Avoid_: Schwelle, threshold, quantile

### Trees

**Node**:
One entry in a tree. A node with children is a **branch**, one without is a
**leaf**; nothing else distinguishes them.
_Avoid_: item, element, Eintrag, record

**Root**:
A node with no parent. A tree has a list of them, not a single one.
_Avoid_: top node, Stamm

**Flattening**:
The list of currently visible nodes, in the order they are read down the screen,
each carrying its level. Everything downstream — keyboard movement,
virtualisation, rendering — works on this list and never walks the tree.
_Avoid_: rows, visible list, linearisation

**Flattening entry**:
One element of the flattening: a node together with everything the renderer and
the keyboard need to know about it here and now. It is not a synonym for
**Node** — a node is the caller's data, an entry is that data plus view state —
which is why "Eintrag" is the avoided word for the former and the right word
for the latter.
_Avoid_: row, item, Zeile

**Level**:
How many ancestors a node has; a root is at level zero. It drives indentation
and is what the accessibility layer reports, because the flattening carries no
nesting of its own.
_Avoid_: depth, Tiefe, indent

**Active node**:
The one node that carries focus and answers "where am I". There is exactly one,
or none. It is not a selection — see ADR-0003.
_Avoid_: current, focused, selected, highlighted

**Checked**:
A node the user has ticked. Any number of nodes can be checked, checking
cascades to descendants, and the checked set is a different state from the
active node.
_Avoid_: selected, chosen, marked, ausgewählt

**Disabled**:
A node that may not be checked. It stays visible, focusable and activatable —
being disabled is a statement about the checkbox, not about the node.
_Avoid_: readonly, locked, inactive, deaktiviert

**Unloaded**:
A branch that may have children which are not present. It is not a leaf and not
an empty branch; it is a branch whose contents are unknown. Nothing that needs
to reach its descendants may act on it.
_Avoid_: lazy, pending, async, unexpanded

**Anchor**:
The node a range selection extends from — the last one checked by a single
gesture. It is neither the active node nor part of the checked set.
_Avoid_: pivot, origin, start

**Indeterminate**:
The state of a branch some but not all of whose descendants are checked. It is
always derived from them and never stored.
_Avoid_: partial, mixed, half-checked, teilweise

### Finding

**Query**:
What has been typed into a search field, with surrounding whitespace and case
already discarded. An empty query is not a query: it matches nothing rather than
everything.
_Avoid_: Suche (which is the act — and a table's **Search**, which is not a
query), search term, filter

**Candidate**:
One thing a command palette can find — a name, the group it belongs to, and
whatever the caller wants back when it is chosen. It is the caller's data, not
the palette's view of it. A candidate is neither a **Node** nor an option; those
belong to a tree and to a select list.
_Avoid_: Eintrag, item, entry, Befehl (which is only one kind of payload)

**Find**:
A candidate that matched the current **Query**, together with its **Rank** and its
**Match spans**. Derived on every keystroke and never stored. It is emphatically
not a **Hit**: that word is taken by chart hit-testing, and one grep
must not answer two questions.
_Avoid_: Treffer, Ergebnis, result, match

**Match span**:
A half-open run of character indices in a candidate's name that the **Query**
matched. It exists so the renderer can mark those characters, and it is the
reason a matcher returns a structure rather than a boolean — a fuzzy result whose
connection to the query is invisible reads as arbitrary.
_Avoid_: Trefferspanne, range, Markierung, highlight

**Rank**:
How well a candidate matches, deciding the order among finds. A different scale
from a limit's **Severity**, an alarm's **Priority** and a value's **Verdict** —
three scales already live in this glossary and none of them is this one.
_Avoid_: Bewertung, Punktzahl, score, Relevanz

### Judging a value

**Limit**:
One boundary a value is read against: a number, a side, and a severity. It is a
statement about a value, not about a colour — the colour is derived from it. See
ADR-0006 for why the rule exists once in prose and twice in code.
_Avoid_: threshold, Schwelle, Schwellwert, bound

**Target**:
The value being aimed at. It is never violated, only missed by an amount, and it
is never an edge of a region. Conflating it with a limit is how a tile ends up
red for being above target.
_Avoid_: Zielwert as a second concept, goal, setpoint-as-limit

**Tolerance band**:
The region two limits of opposite side and equal severity enclose. It is derived
and never an input: the caller passes limits, so that a one-sided configuration
— the common case — needs no null on the other edge.
_Avoid_: range, Bereich, corridor, Korridor

**Severity**:
How serious a limit is. Exactly two: advisory and actionable. It belongs to a
**Limit**. An alarm's **Priority** is a different scale on a different object and
is not the same word — see ADR-0009.
_Avoid_: Priorität (which belongs to an alarm), level, Dringlichkeit

**Verdict**:
What a value is, given a set of limits. Four outcomes, ordered: ok, unknown,
warning, alarm. Unknown is what an absent or non-finite value produces; it is a
first-class outcome and never collapses into ok, because a value nobody has is a
reason to look and not a reason to relax.
How heavily a verdict weighs — for sorting, and for comparing two of them — is
a `verdictWeight`, never a **Severity**: severity belongs to a limit.
_Avoid_: status, Zustand (which is a state over time), tone, Ton

**Assessment**:
A verdict together with what led to it: the limit it violated, the **Excess**,
the **Deviation** from the target. English needs two words here because German
had two and both were public — `Urteil` was the outcome, `Bewertung` the finding
that carries it. A **Verdict** answers "what is it" and is one of four values; an
**Assessment** also answers "why" and is what `assess()` returns.
_Avoid_: Bewertung as an English word, evaluation, rating, judgement, score
(which is a **Rank**)

**Excess**:
How far beyond the violated limit a value lies. Always positive, absent when
nothing is violated.
_Avoid_: Abweichung (which is measured against the target), delta

**Deviation**:
The signed distance from the **Target**. Absent when there is no target. It is a
different number from the **Excess** and never populated from it.
_Avoid_: Überschreitung, offset, error

### States and lanes

**State**:
One of a closed set of named conditions a thing can be in over an interval of
time. A state is a place, not a magnitude — but its code is a number, which is
what keeps the fifth series kind inside the affine scale contract (ADR-0007).
_Avoid_: Status, mode, phase

**State series**:
A series whose accessor returns a state code. Each point's state holds from that
point's x until the next point's x.
_Avoid_: timeline, Gantt, status strip

**Segment**:
The run from one point's x to the next point's, painted in that state's colour.
Derived, never stored. The last segment runs to the latest reading of the
chart — one median step past its own point where the band reports last — never
beyond the axis domain; without it the current state, the one read first, would
be missing.
_Avoid_: Abschnitt, block, interval

**State list**:
The closed set of states with their labels and colours, declared once and shared
across charts. It is what makes the same fault the same colour everywhere.
_Avoid_: legend, palette, enum

**Lane**:
The strip of an axis' domain a band occupies, expressed in domain
units. Four machines are one axis with a four-unit domain. There is no lane
concept beyond the axis: no pixels, no fractions of plot height.
_Avoid_: row, Zeile, track, swimlane

**Value channel**:
The third number per point that only the matrix uses; named rather than smuggled
into the baseline channel (ADR-0011).
_Avoid_: z, weight, y0 reused

**Cell**:
One value of a matrix, centred on its pair of axis values. Its edges come from
the grid spacing of both axes — ADR-0002 in two dimensions. A missing value is a
hole, not a zero.
_Avoid_: tile, Kachel (which the `@umriss-ui/core` demo no longer uses at all; the
charts demo still does, and will lose it whenever its shell is rebuilt), bucket

### Alarms

**Alarm**:
One occurrence of a condition becoming true. The library receives them and owns
what happens next; it never generates them (ADR-0009).
_Avoid_: Ereignis, event, notification, Fehler

**Alarm type**:
The condition that can become true. Many alarms share one type. Repeat counts,
chatter and floods are statements about a *type* over a window and cannot be
expressed without it.
_Avoid_: category, Kategorie, kind

**Lifecycle state**:
One field with four values: standing/unacknowledged, standing/acknowledged,
cleared/unacknowledged, cleared/acknowledged. One field and not two booleans,
because a boolean pair invites `if (standing)` and that filter loses the third —
the fleeting alarm, which came and went unseen.
_Avoid_: two flags, open/closed, active

**Priority**:
How urgent an alarm is. Three levels. A different scale from a limit's
**Severity**, on a different object; mapping between them is the caller's.
_Avoid_: Stufe, severity, Schweregrad

**Flood**:
A run of alarms exceeding a rate over a window. It is **marked**, never
suppressed: deciding a human should not see an alarm is a safety decision.
_Avoid_: burst, storm, Schwall

**Availability**:
Whether an alarm is in front of the operator: one field with four values —
in service, **Shelved**, **Suppressed by design**, **Out of service** (the
special states of ISA-18.2). A second field beside the **Lifecycle state** and
never merged into it, because the two answer different questions and a hidden
alarm keeps its lifecycle underneath. Everything but in service is *hidden from
operation*: still in the list, drawn neutrally with its state as a word, and
counted — never removed.
_Avoid_: enabled, active, muted, inhibited, Sperre

**Shelved**:
Taken out of the way by an operator, for a time and under a name: a shelf has
an end (`until`) and a person (`by`), and an alarm shelved without either
cannot be written down. It returns to service when the as-of time reaches the
end — by the model's clock, not by a timer.
_Avoid_: snoozed, silenced, parked

**Suppressed by design**:
Hidden by the plant's own logic — a pump that is off raises no low-flow alarm.
The application writes it from that logic; the model has no transition for it.
_Avoid_: filtered, masked, Unterdrückung (alone)

**Out of service**:
Taken out of operation for maintenance or repair, until returned to service.
The strongest of the three: a shelf does not overwrite it.
_Avoid_: disabled, offline, deactivated

### Operating time

**Operating time**:
Elapsed time counted only inside the intervals the calendar names. An axis in
operating time stays affine, because the mapping happens in materialisation —
the route ADR-0001 prescribed for a non-affine axis.
_Avoid_: Laufzeit, uptime, elapsed

**Operating calendar**:
The list of intervals in which time counts, sorted and merged. Deriving it from a
shift pattern, with its exceptions and holidays, is a plant data problem and
belongs above this library.
_Avoid_: Schichtplan, schedule, roster

**Break**:
The mark in the axis band where the calendar removed time. Without it the chart
claims a continuity it does not have.
_Avoid_: gap, Lücke (which is missing data), Trennung

### Freshness

**As-of time**:
When a value was true. Not when it was fetched and not when it was rendered.
_Avoid_: timestamp, Zeitstempel, updatedAt

**Freshness**:
How old a value is, in three states: fresh, stale, disconnected. It is a
**different axis from the Verdict** and never collapses into it — a stale value
keeps its verdict (ADR-0010). The two ages at which it changes are a
`FreshnessAges`, and deliberately not thresholds: "threshold" is an avoided word
for a **Limit**, and these bound an age rather than a value.
_Avoid_: Gültigkeit, validity, staleness as a verdict

**Cadence**:
How often a display must re-read the clock to keep a **Freshness** current,
derived from the ages rather than from a fixed second — a tile that goes stale
after five minutes must not look sixty times a minute. It is a property of the
ages, not of the component.
_Avoid_: Takt, tick (which is an axis tick), poll, refresh (nothing is fetched),
interval on its own

### Reaching for a tool

**Dock**:
A strip of tools that floats over one host area and carries the actions for
that area. It belongs to its host and never to the screen: two charts side by
side have two docks, and a dock that outlived its host would lie about what it
acts on. It is not a **Table toolbar**, which is a strip in the flow above a
table — one floats and moves, the other does not, and a component that did both
would carry two anatomies.
_Avoid_: toolbar, Werkzeugleiste, Leiste, action bar, palette (which is the
command palette)

**Tool**:
One entry in a dock: a glyph, a name, and what the caller wants done. It is
something one *takes*, which is what separates it from a **Candidate** —
something one *finds*. A tool shows no label, only its glyph, because a dock
standing on a side edge has no room for text; the name reaches the eye through
a tooltip and the screen reader through its accessible name.
_Avoid_: Aktion, action (every button is an action), Befehl, Eintrag, item,
entry

**Resting place**:
One of the four edges of the host area a dock can sit at, named rather than
measured. A dock is always at one of them and never between them, so it cannot
come to rest anywhere it would look unintended. The dock's orientation follows
from the place — lying along the top and bottom edges, standing along the left
and right — which is why a corner is not a resting place: a corner names no
orientation, so the dock would have to invent one.
_Avoid_: Position, Koordinate, Ecke, slot, anchor, Andockpunkt

**Grip**:
The part of a component a drag takes hold of, where the thing being dragged is
not itself the whole target. The **Dock** has one, and it is the one part that
moves it: everything else in the strip is a tool, so without it every press
would be ambiguous between taking a tool and moving the dock, and that
ambiguity could only be settled by a drag threshold; it is also the single
keyboard stop from which the dock is moved, four arrow keys for four resting
places. The **Schedule** has two per selected **Subtask**, at the outer edges
of its **Setup** and **Teardown**, and they appear on selection only — a plan
where every bar bristles with grips is a plan nobody can read. One word,
because it is one gesture: press the small thing to move the big one.
_Avoid_: Anfasser, handle, Ziehfläche, Titelleiste — for the drawn thing. The
**Schedule** has a `ScheduleHandle` as well, and it is not a grip and not drawn
at all: it is what a component offers a caller imperatively, the arithmetic
between a point on the screen and a time on a lane. Two live concepts, so the
word stands with the qualifier the glossary's own rule prescribes — a *grip* is
taken hold of, a *handle* is held by the code.

**Mode**:
The tool a dock currently stands in, at most one, and absent by default — a
dock whose tools all simply fire has no mode. It is emphatically not an
**Active node**: that word answers "where am I" and is not a
selection (ADR-0003), whereas a mode is a chosen, lasting state that nothing
about focus can change. Same word, two questions, so the word is not reused.
_Avoid_: aktiv, active, selected, gewählt, Werkzeugzustand

**Refusal**:
What a place a drag may not land in answers with, drawn in material and edge
rather than in a warning colour and said once in words. The **Dock** refuses a
**Resting place** it does not fit into: the outline it would have there, and a
line in the status line. The **Schedule** refuses a **Lane** a **Subtask** may
not go to, and says so before the pointer arrives: the lanes that are closed
are drawn back and hatched from the first frame of the drag, their headers with
them; over one of them the cursor says no, the **Ghost** stays on the last lane
that was allowed, and a hairline ties it to the pointer it is not following, so
that a held ghost is not read as a stuck one. Neither is an error — a wide, flat
host with no room for a standing dock is nobody's mistake, and a mould that fits
one press is nobody's either — which is why a refusal is neither a warning nor
an alarm, and why the place is never travelled to and then corrected. And a
refusal costs only what it refuses: a drop after a refused lane still reports
the move in time.
_Avoid_: error, Fehler, warning, invalid, rejection

### Tables

**Column**:
One thing every row of a table has, declared once with its value and its
presentation. A column has exactly one value; something shown without a value is
not a column. It is not a **Cell**, which is a value of a chart matrix.
_Avoid_: column definition, Spaltendefinition, field (which is one way to read a
value), Zelle

**Value**:
What a column is for one row: the thing that is sorted, searched, exported,
grouped and aggregated. It is read from the row by a field name or computed from it, and never
read back from what the cell shows.
_Avoid_: data, accessor, raw value, Rohwert

**Presentation**:
How a value looks in its cell. Where the caller gives none, the value's type
decides it. Nothing sorts, searches or exports a presentation.
_Avoid_: render, renderer, cell, Anzeige, format (which chooses a standard
presentation by name)

**Absent value**:
A value that is null, undefined or not a number. It is shown as absent, sorts last
in either direction and counts towards no aggregate. It is not zero and not an empty
string. It is the table's counterpart of a chart's **Gap** and shares neither its
word nor its encoding.
_Avoid_: Lücke (which is the chart's), empty, leer, null value

**Row key**:
The stable identity of a row, which selection, expansion and actions hold on to.
It is never shown and is not the row header.
_Avoid_: id column, Kennung, index

**Row header**:
The column whose value names the row — for a person reading across and for
assistive technology, which announces the row's controls by it. A table has at
most one.
_Avoid_: key column (the row key is identity, not a name), primary column,
Bezeichnerspalte

**Filtered set**:
Every row the **Pre-filter** admits that also matches the current **Search** and
every **Condition**, across all pages. Selecting all, exporting and footers operate on it,
never on the rows on screen.
_Avoid_: result, Ergebnis, visible rows, page

**Pre-filter**:
The application's restriction of which rows a table has at all — by permission,
by plant, by anything the user is not meant to undo. It is invisible: it is never
shown as a condition, never reset, and the total a user sees beside the
filtered set counts only the rows it admits. A table the pre-filter leaves empty
has no entries; nothing has been filtered away. A restriction the user should see
and undo is a **Column filter**, never a pre-filter.
_Avoid_: app filter, Anwendungsfilter, base filter, Grundfilter

**Column filter**:
What a column offers to restrict the filtered set by its value. It has one kind —
a list of the values that occur, a range, or the caller's own — and it is active
while it holds a condition. It is never the pre-filter.
_Avoid_: filter on its own where the pre-filter could be meant, Listenfilter as
the general word (it is one kind), Anwendungsfilter

**Condition**:
What an active column filter currently requires — the chosen values, or the
bounds of a range. Each condition is shown once, in the table toolbar, and is
removed on its own. The search is not a condition.
_Avoid_: Filterwert, active filter, aktiver Filter, chip, Tag

**Search**:
The text in a table's search field, matched against the values of its searchable
columns. An empty search restricts nothing. It is not a **Query**: an empty query
matches nothing and its finds are ranked; a search does neither.
_Avoid_: Query, Begriff, Suchbegriff, filter

**Bulk action**:
An action that acts on a list of rows — the selection, or the single row it was
triggered on — and receives a list either way.
_Avoid_: batch action, mass action, Massenaktion

**View**:
The part of a table's state an application can hand in at the start and read
back: search, conditions, sort levels, page, page size, hidden columns, column
order and widths. The table keeps it nowhere — not in the address, not in
storage; where a view is remembered, if anywhere, is the application's business.
Whatever is at its default is not part of it, and the pre-filter never is.
_Avoid_: view state, settings, Einstellungen, preset, saved view, Ansichtslink

**Table toolbar**:
The strip in the flow above a table carrying its search, column menu and export,
its conditions with the count of the filtered set against every row the
pre-filter admits, and the bulk actions of the selection. It is the one place a
condition appears — there is no second strip for them — and a table with column
filters or a search has one even where none is placed. It does not float and does not move;
that is a **Dock**.
_Avoid_: Dock, action bar, Werkzeugleiste, Filterleiste, Leiste on its own

**Aggregate**:
What a column's values come to over a set of rows — a sum, an average, a
minimum, a count, or the caller's own. Over the filtered set it is the footer;
over a **Row group** it stands in the **Group header**. It is always computed from
the values themselves, never from other aggregates, and absent values do not count
towards it.
_Avoid_: subtotal, Zwischensumme (a maximum is no sum), total, rollup, summary

**Grouping**:
The ordered list of — at most three — columns the filtered set is divided by, the
first one outermost. It is part of the **View**, like the sort levels.
_Avoid_: group by, Gruppe on its own (a lane group and a chart legend group too),
pivot

**Group key**:
A value a table can be grouped by without being a **Column**: it has no cell, is
never exported and does not stand in the column menu — only where a grouping is
chosen. A column can be grouped by as well, hidden or not; a group key is for
the value that should never be one.
_Avoid_: grouping column, hidden column, dimension

**Row group**:
The rows of the filtered set that share one grouping value on one level of the
grouping. Rows whose value is absent form a group of their own, which stands last.
Its form follows its level and nothing else: the outermost level is always a
**Group header**, the innermost of several levels a **Group span** (ADR-0029).
A group of one row is a group like any other.
_Avoid_: group on its own, bucket, category, Kategorie

**Group header**:
The line heading a **Row group** - on the outermost level always, below it on
every level but the innermost of several: the grouping value, how many rows the
group has, and in each column the group's **Aggregate**.
It is not a row — it has no row key and is never exported as one.
_Avoid_: group row, subtotal row, Gruppenzeile, summary row

**Group span**:
The form of a **Row group** on the innermost of several levels: its grouping
column stands first and shows the value once, beside the group's rows, with no
line of its own. Open it carries no aggregate - its sums stand in the header
above it -; folded, it is one line carrying the group's aggregates in the
columns.
_Avoid_: gutter, Randspalte, merged cell, rowspan (which it is not built from)

### The demo

The demos of all three packages are documentation, not decoration,
and they share four words. They are here because a demo is the only artefact a
reader of a package meets before the source, and two sessions calling the same
thing by two names is how its structure comes apart. All three run in one shell, the
private package `@umriss-ui/demo` (ADR-0020); each demo brings its own outline,
examples and "Why it is like this" texts.

**Page**:
Everything the demo says about one thing a reader looks up, at one address. A
page is the unit of the demo: the sidebar lists pages, the palette finds pages,
an address names a page.

What that thing is depends on how many things the package has to say. Where a
package is a shelf of components, a page is a component — with one exception: a
concept that several components share and none owns may have its own page.
**Filter** is one, because a list filter, a range filter and a filter the
application writes itself are one subject that would otherwise be scattered
over `Column` and `Table`.

Where a package is ONE component with two dozen things to say, a page is a
**feature**. That is the schedule: pages by component would have been four, and
seven of its subjects would have shared one — a reader who came for the now
line would have read past pan, zoom, the tooltip and the selection to reach it.
So *Now line*, *Bar labels*, *Snapping* and the rest are pages, and the outline
is the table of contents of the component
(`.scratch/schedule-lane-groups/spec.md`, "The demo").

Either way a page names ONE thing and one only; a page covering three unrelated
subjects would be a page nobody could link to.

A page carries a **"Why it is like this"** where there was a real decision, and
otherwise not at all: where an ADR answers the question the section links it
rather than retelling it, and where there is nothing to explain there is no
section. A section that is always present stops carrying information - a reader
who finds one on every page learns to skip all of them.
_Avoid_: Kachel, tile, panel, Abschnitt, section, entry

**Example**:
One self-contained use of a component on a page, shown running with the source
that produced it. It is a whole file, so what the reader copies is what the
reader saw; the file *is* the example, and there is no list of examples to keep
in step with it. Every example has an anchor and is linkable on its own.
_Avoid_: Demo, snippet, Schnipsel, Ausschnitt, sample, usage

**Demonstration**:
A single, larger example that shows a component's parts working together —
filter, selection, view and export in one table rather than in four separate
examples. It is the answer to a component that has a model rather than a
handful of props, and it earns its place only where the isolated examples would
misrepresent the component by leaving out how the parts meet. A page has at most
one.
_Avoid_: Showcase, Playground, Spielwiese, full example, kitchen sink

**Rubric**:
A named run of pages in the sidebar. It sorts, and it does nothing else: it has
no address, no page of its own, and no meaning inside the library — moving a
page from one rubric to another must never change a link. That is why a
rubric's name is not in the address. The order inside a rubric is part of that
sorting: the pages run from the simple to the composed — `Button` before
`ButtonGroup`, `Tooltip` before `Popover` before `Menu` — and not in the order
in which they happened to be delivered, which is how a sidebar quietly becomes
a list of arrivals.
_Avoid_: Gruppe, group (a chart legend groups series), category, Kategorie,
section

The rubrics of the `@umriss-ui/core` demo are `setup` ("Setup"), `layout`
("Layout and text"), `actions` ("Actions"), `forms`, `status`
("Status and waiting"), `overlays` ("Overlays"), `navigation`
("Navigation and structure") and `monitoring` — eight since `demo-rubrics`
02, which broke up a `foundation` that had become the box for everything left
over and took the overlays apart from what merely orders content;
`@umriss-ui/table` has
`tables`, `rows`, `unbound` ("Unbound parts") and `monitoring`; `@umriss-ui/charts`
has `chart`, `series`, `monitoring` and `around` ("Around the chart"). **Monitoring** and not
"Operations": a figure, a trend and a fraction are not tied to a producing
plant, and the word is taken twice over already - `lib/options.ts` performs set
operations, and several component heads use *operation* for how a control is
worked. The specificity stands in the rubric's sentence, where it costs nothing.
**Overlays** and not "Layers" on purpose: **Ebene** is one of the
five words the design-language tail below leaves undecided, and "Layer" beside
a tree node's **Level** is the collision that section warns about. "Overlay" is
already this workspace's word for what lies above a surface and collides with
nothing. **Status and waiting** and not "State": **State** is the charts' word
(ADR-0007), and a rubric may not take a word a series already owns.

An **Example**'s file exports its name as `title`. A page's address is its
component name, lower-cased, and a rename of the outline never touches it - with
one exception, taken once: the page `Stack and Grid` is `#/stack-and-grid`,
because `#/stack-und-grid` carried a German word in an address that no
component name put there.


### The schedule

The vocabulary of `@umriss-ui/schedule`, the fourth package — fixed in
`.scratch/schedule/` before the package exists, which is this glossary's own
rule: a term appears when a decision has fixed its meaning. The schedule speaks
the charts word where it already holds: a **Lane** is the same strip of a y
domain — here one machine or station, named by its **Lane header**. What is new
is that the intervals carry meaning: a **Subtask** has parts and belongs to a
**Task**. Charts once drew bare intervals on a lane as a `Span`; it was
removed in favour of the schedule, which draws occupancy with lanes, groups and
editing (ADR-0026).

**Schedule**:
The component that shows subtasks on lanes over time: lane headers at the left,
a coarse axis band above the plot area and a fine one below it, the subtasks
and transports painted on canvas. It is not a **Chart** — that word owns a plot
area with series — though it is built in its image and on its arithmetic.
_Avoid_: Gantt, timeline, Plantafel, planning board, Diagramm

**Task**:
One whole undertaking: subtasks in a fixed order across several lanes, joined
by transports. It is never drawn as a thing of its own — it shows as the colour
its subtasks share, which the caller assigns, and in selection, which always
takes the whole task: every subtask and every transport of it.
_Avoid_: Auftrag, job, order, Vorgang

**Lane group**:
Structure over the **Lane**s and never a lane itself: `<LaneGroup>` around
lanes and other groups, to any depth, so that the plan follows the plant —
hall, line, machine. Nothing sits on a group. A **Subtask** names a lane, a
**Transport** connects two subtasks, a finding belongs to a lane, `canMoveTo`
is asked about a lane and every **Intent** names one; none of them can name a
group, and none of them changes when a group is folded. Folding changes the
view and not the plan, which is why it is not an intent (ADR-0025).
_Avoid_: parent lane, super-lane, Gruppenbahn, category, swimlane group

**Miniature**:
What a folded **Lane group** shows: every lane in it as a thin strip, at a
smaller scale, with its work in the tasks' own colours. It is the real work,
smaller — not a summary, not a packing, not a utilisation band. Transports
arrive at a strip, findings show on the row, and a strip can be hovered and
selected: folding costs a planner detail and never access. Both standing
sentences hold inside one — a lane is still a machine, and an **Overlap** is
still not packed, because a change of SCALE moves nothing.
_Avoid_: summary, collapsed lane, aggregate, Übersichtszeile, roll-up

**Subtask**:
The drawn interval: a main time on one lane, with an optional **Setup** before
it and a **Teardown** after it. It is what the pointer hits, a drag moves and
an overlap stands between. It is not the removed charts `Span`: a span had
an extent and nothing else, a subtask has three parts and a task it belongs to.
Where the German wording has to name it, it says *Teilaufgabe*.
_Avoid_: entry, Eintrag, activity, Arbeitsgang, task as the drawn thing

**Idle**:
The gap between two subtasks on one lane. It stays a gap; nothing is drawn
there.
_Avoid_: Lücke (which is missing data), pause, downtime

**Overlap**:
Two subtasks covering the same time on one lane. It is drawn offset within the
lane and never packed into sub-lanes: packing turns the conflict into a layout,
and the conflict is the finding.
_Avoid_: collision, Konflikt as the drawn thing

**Setup** / **Teardown**:
The preparation before a subtask's main time and the clearing after it
(Rüsten, Abrüsten). Both occupy the lane — an overlap that only touches a
setup is still an overlap — and each is changed on its own, never only as a
consequence of the main time moving.
_Avoid_: Vorlaufzeit/Nachlaufzeit as identifiers, lead/lag, run-in/run-out

**Transport**:
A task's move between two of its subtasks: from one, to the next, with a
duration of its own. It is drawn as the line between the two, and where each
end anchors — at the main time, or beyond the setup or teardown — is declared
per transport. A transport always runs from an end to a start; there is no
other kind of connection.
_Avoid_: dependency, link, connection, arrow, edge, Verbindung

**Late transport**:
A transport whose duration does not fit between its subtasks: the successor
starts before the predecessor's end plus the transport's duration. Like an
**Overlap** it is drawn and reported and never resolved by the schedule — the
finding is the point. It is not a **Violation**: that word judges a control
chart's sequence.
_Avoid_: conflict, Konflikt, violation, error

**Lane header**:
The label at the left edge naming what a lane is. The run of lane headers
stands outside the plot area and holds still while the plot pans and zooms. It
is the schedule's counterpart of the table's **Row header** and shares neither
word — a lane is not a row.
_Avoid_: row header, Zeilenkopf, sidebar, y axis label

**Active subtask**:
Where the schedule's keyboard stands: one subtask, or a **Transport** reached
from one, or nothing — set by the keys and by the pointer's hover alike, the
last input winning, and drawn as the hover is. It is the schedule's counterpart
to core's active node and the charts' **Active point** (ADR-0003, ADR-0030):
never a selection — Space or Enter selects its task, as a click does. The keys
walk the rows as the plot lays them out, so a folded **Lane group** is one row
of work, and they walk past the view, which follows them (ADR-0033).
_Avoid_: focused subtask, cursor, current subtask, selected subtask

**Intent**:
What the schedule reports when an interaction asks for a change: move this
subtask, stretch its main time, change its setup, put it on another lane. The
schedule draws what it is given and changes nothing itself; whether an intent
becomes data is the caller's decision (ADR-0023).
_Avoid_: change event, mutation, edit, command

**Ghost**:
The picture of an intent while its drag is in flight, drawn beside the
unchanged data and assessed like data — an overlap or late transport the drop
would create shows before the drop. When the drag ends the ghost goes and the
intent is reported. A drag from outside the schedule has one too: there the
ghost is the work that is not on the plan yet.
_Avoid_: preview, drag image, Vorschau

**Place**:
The **Intent** of work that was not on the plan: the answer to a drag from a
list of unplanned orders onto a lane. It names the lane, the times and the
caller's key for the dragged item, and it carries no subtask — there is none
yet. Creating one is the caller's act, with the caller's identity, as every
other intent leaves the data to the caller (ADR-0023).
_Avoid_: create, add, new, insert, Anlegen

**Bar label**:
The line of text a caller writes into a **Subtask**'s bar. It lies on the main
time, because the setup is not the work; it is cut off where the bar is too
narrow and left out where nothing readable would fit — a letter and an ellipsis
say less than nothing. It is real text in the DOM, as every other thing a reader
has to read in this library is.
_Avoid_: caption, title, Beschriftung as the drawn thing, tooltip

**Appearance**:
What a bar says besides its colour, from a closed list: `provisional` work that
is planned and not released, `fixed` work that may not be moved, `muted` work
that is not this reader's, and an `open` end where work continues past what is
drawn.

Each owns exactly ONE property of the drawing, and no property says two things.
`provisional` owns the fill and has none, so the surface shows through;
`fixed` owns the ends and carries a cap inside each of them; `muted` owns the
saturation and is the task colour mixed half into the surface, at full height,
opaque and unoutlined; `open` owns the fade, at whichever edge of the view the
bar passes. A **Progress** share owns a rail, inside the main time and above
the bar's lower edge. The faint, outlined fill belongs to a **Setup** and a
**Teardown** and to nothing else — which is why provisional work is empty
rather than pale, and another shift's is a paler colour rather than a
transparent one. A hatch says none of these: it says a **Lane** is not
available, and only during a **Refusal**.

Adding a statement means finding a channel, not inventing a mark.
_Avoid_: style, variant, state, Zustand, status

**Route**:
How a **Transport** is drawn between its two ends — a curve, a straight line or
orthogonal segments — together with where its line attaches to the bars and
whether its ends carry a dot. It is the picture and nothing else: what a
transport connects, and therefore whether it is a **Late transport**, is said by
its two anchors alone.
_Avoid_: path as the API word, shape, style, Linienführung

**Now line**:
The line across the lanes at the present moment, with a mark where it meets the
fine axis band. It is off unless a caller asks for it, and it is a statement
about the clock, never about the data: nothing is drawn differently for lying
behind it. A plan on a wall screen follows it by the minute.
_Avoid_: current time indicator, today marker, Zeitmarke, playhead

### Calculations

**Calculation**:
The step-by-step derivation of one number from others, shown so that a reader
can both follow it and redo it. The library evaluates it; a caller never hands in
a figure the calculation claims to have derived. It is not an invoice, which is
at most one thing a calculation can compute.
_Avoid_: Rechnung (which also means invoice), formula, breakdown, worksheet,
derivation (which is one quantity's)

**Quantity**:
A named number with a unit inside a **Calculation** — given or derived. Its unit
is a label the caller writes; nothing converts or checks units, and percent is a
presentation of a plain ratio, not a unit. A quantity whose operands include an
**Absent value**, or whose operation has no answer (a division by zero), is
itself absent, says why, and is never carried on as zero. A quantity can carry a
**Target** and **Limits** and is then assessed like any other value.
_Avoid_: value (which is a table column's), step (which is the charts'
interpolation), line, Größe as an identifier

**Result**:
The quantity a **Calculation** exists to answer. Every other quantity is shown
because the result depends on it.
_Avoid_: outcome (which is a **Verdict**'s), total, Endergebnis

**Given**:
A quantity the calculation does not derive: its number comes from the caller,
and with it, where known, its source and **As-of time**. Every other quantity is
derived by an **Operator**.
_Avoid_: input (which is a core component), parameter, Eingabe, Ausgangswert

**Operator**:
How a derived quantity comes from its operands: sum, difference, product or
quotient, and nothing else. In a **Chain** the same four stand beside each
operand as plus, minus, times and divided by. There is no formula text and no operator of the
caller's own, because a written-out operation that the library did not perform
could say something the number does not.
_Avoid_: operation (taken twice over: set operations, and how a control is
worked), formula, function, Rechenart

**Operand**:
A quantity an operator works on, in order — the first operand of a difference or
a quotient is the one taken from or divided.
_Avoid_: argument, input, Eingang

**Derivation**:
What a derived quantity is computed from: its operands, and theirs in turn, down
to givens and references. Under an **Interim** it is what the chain holds since the
interim before it. A derivation can be folded away, the quantity above it
staying - except in a **Chain** in view, which is always shown whole.
_Avoid_: subtree, breakdown, Teilrechnung

**Reference**:
The place where a quantity defined elsewhere in the calculation stands as an
operand. It shows the quantity's name and number, not its derivation, which
stands once, where the quantity is defined.
_Avoid_: link, alias, copy

**Tree**:
The form of a calculation in which every derived quantity holds its operands,
and they hold theirs. It suits a figure put together from
ratios and products, such as OEE.
_Avoid_: nesting, hierarchy, Baum as an identifier

**Chain**:
The form of a calculation read top to bottom, as on paper: a first quantity,
then each further operand with its operator, worked into the value before it
strictly in order, and ended by an **Interim**. There is no precedence; a times
or divided by therefore stands alone between two named values, so that nobody
multiplies a number they have not seen. A chain and a tree mix: an operand in a chain can be
a tree, and a chain can be an operand in a tree.
_Avoid_: Staffel as an identifier, tape, run, tally, sequence

**Interim**:
The named value of a **Chain** at the place it stands — Zwischenergebnis. Only
an interim shows the running value; the operands between two interims show
their own number. The last interim is the chain's value, and, where the chain
is the whole calculation, its **Result**.
_Avoid_: subtotal (after a times it is no sum), checkpoint, carry,
Zwischensumme


## Module and directory names

A file's name is an identifier too, and these are the ones where the obvious
English word was already taken by something else. The reason is recorded so a
later reader does not "fix" the name back.

| File or directory | Why not the obvious one |
|---|---|
| `table/src/model/` | not `core/` — that would name both the package and the table's model layer, and one grep would have two answers |
| `model/companion.ts` | not `state.ts` — **State** is taken by the charts (state series, state band, ADR-0007) |
| `demo/tooling/` | not `tools/` — a **Tool** is an entry in a dock |
| `core/src/lib/language/` | holds the **Wording** and the **Formats**; not `i18n/`, which promises a translation function that does not exist |
| `DatePicker/grid.ts` | the 42-cell month grid. There is no layout grid in this workspace and there should be none |
| `DataViz/scale.ts` | the projection of the marks, which is not a chart axis' affine **Scale** — see the tail of this file |
| `Dock/place.ts` | the arithmetic of the four **Resting places** |
| `Textarea/measure.ts` | the height calculation, not a design unit of measure |
| `charts/src/limit.ts` | the limit model, the same word as `core/src/lib/limit.ts` — ADR-0006 keeps the two in step. The component beside it therefore yields the bare word; see **Public names** |
| `charts/src/bars.ts`, `cells.ts`, `controlLimits.ts` | plural or descriptive, because the singular collides with the component file beside it. On a case-insensitive file system an import of `./Bar` or `./ControlChart` resolves to `bar.ts` or `controlChart.ts`, and TypeScript then reports TS1149 ("differs only in casing") and resolves the wrong module. `cells.ts` recorded this first; the other two follow it |
| `charts/src/state.ts` | the geometry of the state band. **State** is the charts' word (ADR-0007), and `StateBand.tsx` differs from it by more than case |
| `table/src/groupingChoice.tsx` | the column menu's grouping section and the grouping's tag in the table toolbar; not `grouping.tsx`, which would sit beside `model/grouping.ts` and give one grep two answers |
| `table/src/groupLines.tsx` | the lines of a grouped table - group headers, spans, folded spans; not `groups.tsx`, which reads as the model's **Row group** |
| `demo/examples/Column/13-wrapper.tsx` | a column that brings its own presentation, taken as `of`; not `shell` — that is the demos' own shell (`@umriss-ui/demo`) |

The rest are the plain word, recorded here so that no branch has to guess:
`model/tableModel.ts`, `model/view.ts`, `parts.tsx`, `unbound.tsx` (the header's
own word: these need no binding), `registry.ts`, `toolbar.tsx`, `export.ts`,
`values.ts`, `column.ts`, `columnFilter.tsx`, `filter.tsx`, `types.ts`,
`model/grouping.ts`, `aggregateValue.tsx`, `motion.ts`,
`context.ts`, `useTable.tsx`, `alarms/alarmModel.ts`; in the shell `shell`,
`outline`, `examples`, `checks`; in a demo of its own `App.tsx`, `outline.ts`,
`examples.ts`, `examples/`, `why/`; in `lib` `wording.ts`, `formats.ts`,
`provider/`, `glyphs/`, `freshness.ts`, `limit.ts`, `search.ts`, `virtual.ts`,
`options.ts`, `roleFromTone.ts`, `portalTarget.ts`, `idPart.ts`; in the pickers
`range.ts`, `time.ts`, `contract.ts`, `Calendar.tsx`, `TimeField.tsx`,
`RangePanel.tsx`, `RangeTrigger.tsx`; in the tree `treeModel.ts`, `useTree.ts`;
and `NumberInput/number.ts`.

Each package's browser suite follows one pattern, so that a reader who knows one
package can find the same file in the next: `screenshots.spec.ts` for the
pictures, `features-<subject>.spec.ts` for behaviour, `accessibility.spec.ts` for
the axe run, and `pages.ts` and `navigation.ts` for the two derived lists every
spec of that package reads. In the unit tests a file is named after its subject —
`contrast.test.ts`, `identifiers.test.ts`, `wordingSource.test.ts` — and
`demo/tooling/readmeTable.ts` is the guard over the README's component table.


## Public names

The names that cross out of `@umriss-ui/core` into `@umriss-ui/table`, the demos
and any application. What they were called before September 2026 is no longer
vocabulary and stands in `docs/archive/rename-2026-09.md`; what follows is the
part of that work which is still a rule.

`@umriss-ui/charts` has one public name of its own that had to move, and it moved
because of this list rather than in spite of it: its `<Limit>` component is now
**`LimitLine`**, beside the unchanged `<LimitBand>`. **Limit** is the model type —
the one ADR-0006 keeps in step with `core` — and one module cannot export a
component and a type under that one name (TypeScript reports TS2300). The pair
now reads as what it draws, a line and a band, and matches its own
`LimitLineConfig` and `LimitBandConfig`. Its props follow: `von`/`bis` are
`from`/`to`, `stufe` is `severity`, `imBereich` is `inExtent`.

A `DateRange` is `{ from, to }` and a `RangePreset` is `{ label, range }`.
Both were German, on the argument that they are a shape two packages agree on —
`@umriss-ui/table` reads a chosen span out of a `DateRange` in `columnFilter`,
and a caller writes its own presets against the second field. That argument
names who has to move with them; it is not a reason to leave them. **A shape two
parties agree on is the strongest reason to translate it, not to keep it**: it
is the one name a caller has to type. The same held for the limit model and for
the dock's four resting places, and all three moved.

## Words, and the German that stays

What the rename left behind as a rule rather than as a record: where a word is
taken twice over, which German is an identifier and which is display text, and
which output conventions are deliberately still German. The rule about German
test fixtures moved with the testing conventions and stands in `docs/testing.md`.

**The register rule.** German nouns are capitalised, so a *lowercase* German
word in `de.ts` or `wording.ts` is an identifier and never display text. The
exceptions are `von`, `bis` and `ab`, which also stand in the German sentences —
and those are replaced only in parameter position and inside `${…}`.
`pageOfPages` still reads `Seite ${page} von ${total}`.

**One output convention is still German and is not a name.** `DEFAULT_FORMATS`
was `de-DE` throughout until ADR-0024 made it English and shipped
`GERMAN_FORMATS` beside the German wording. What stays German is the CSV
export: the decimal comma and the semicolon, argued in `model/csv.ts`, and
`ja`/`nein`, which `values.ts` argues are data rather than labels, "lower case,
the way a spreadsheet filters them". It is a machine format for a spreadsheet
and wants its own ticket, not a rename.

Four names the table needed and this file did not have. **Projection** is the
model's computed output — visible columns, the filtered set, the page — and is
deliberately not a **View**: a view is the part an application keeps, and the two
are different objects. **Return band** avoids "threshold", which is an avoided
word for a **Limit**; it is the dead band an alarm's reading must come back past
before the alarm clears.

## Words already taken

**Words already taken, twice over.** Three of these sets share a word with
another set, and each cost a round when a pattern was let loose over the
repository. `oben` is a dock place *and* the upper side of a limit. `wert` is a
limit's number, a filter's value, a context value and a set element. `seite` is
a page number in `pageOfPages` and the side of a time range in the daylight
saving hints. `alt` is a freshness state and an alarm's identifier in a test.
A rename over a word list needs a file list; one grep does not give one answer
here.

These three are already spoken for. For design terms they are to be avoided.

**Month grid**:
The 42-cell grid of a month in the date picker. Always 42, so that the panel
height does not jump.
_Not_: a spacing or layout grid. There is none and there should be none — which
is why this entry carries "month" in its name rather than standing as "Grid".
A glyph that depicts a grid is a picture and not a layout, so `GridGlyph` is not
a breach of this.

**Scale**:
The projection of values onto screen coordinates. It exists twice, in
`charts/src/scale.ts` as the affine mapping of a chart axis and in
`core/src/components/DataViz/scale.ts` as the projection of the DataViz marks.
One word, because it is one idea; two implementations, because charts may not
import from core (R-1.2). Unlike the limit model, the two are not held together
by a conformance test — they are different arithmetic serving the same notion.
_Not_: a type or spacing scale. The type sizes are a deliberately irregular,
closed set and not a scale.

**Measure**:
The height calculation of the multi-line field — measured height, clamped to a
line boundary. `Textarea/measure.ts`.
_Not_: a design unit of measure.


## Retired

**Kachel** named a section of the demo showing a group of components, and was the
seam through which the image and accessibility checks reached every component.
It is retired rather than translated: the demo has had one **Page** per component
since `demo-as-documentation`, and an **Example** within it, and both of those are
entries above. "Tile" stays on the avoid lists of **Page** and **Cell** — there is
now nothing it could mean.
