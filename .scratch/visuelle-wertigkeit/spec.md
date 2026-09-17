# Spec: Perceived quality — strictness over the vocabulary, freedom in the values

Status: ready-for-agent

Origin: grilling session of 24 Aug 2026 on the question of how the design should
be "strictly controlled". The session turned the question around: the goal is not
demonstrable conformance but a library that looks high-grade. The two goals lead
to different work in three places, and this spec follows the second.

Sequencing: independent of `foundation-primitives` and `table-surface`. One
dependency runs forwards: `tone-contrast` adds `--u-color-danger-text`. If this
spec lands first, the vocabulary test from ticket 01 need not know the new token
— it checks that components reference *a* token, not which one. The two can run
in any order.

**Contradicts a recorded decision:** `packages/ui/GLYPHEN.md` decides explicitly
to *leave divergent glyphs standing and write the divergence down*, rather than
to align them. Ticket 03 rolls that back. The reasoning there is methodically
sound and right under the old goal; under this goal it is the wrong trade. See
"Implementation Decisions".

---

## Problem Statement

The library is strict about everything that can be proven and about nothing that
can be seen.

The provable part is well built. `kontrast.test.ts` reads the tokens out of the
stylesheet at runtime and checks them against thresholds from the WCAG standard,
with named exceptions carrying a measured value and a reason. Tabular figures
are set in thirteen places — the most important typographic decision for a
data-dense library, and it has been made. The shadow stacks have one named job
per level. Edges are shadows without offset rather than borders. That is careful
work.

Beside it stands what actually carries the impression, and there nobody has been
strict.

**Motion is described too coarsely, and the description bakes the compromise
in.** `tokens.css` has `--u-ease-out: cubic-bezier(0.22, 1, 0.36, 1)`, described
in the comment as "decisive, landing softly". Two lines above it sits the
collective token `--u-transition: 120ms ease-out` — and it carries the CSS
keyword, not the carefully chosen curve. Of 39 `transition` declarations, **28**
take this collective token, 8 the good curve, and 3 are `transition: none`.

So the discipline is there: **all 39 reference tokens.** Only, the good curve
thereby reaches eight transitions, and the library's most widespread motion runs
on the default curve — not because anyone worked around the token, but
**because the token prescribes it that way.**

Alongside that, the distinctions the library actually makes have no names. Modal
and backdrop have had an exit motion all along — `160ms ease-in`, twice, raw.
The spinner runs `700ms linear`, the skeleton `1.6s ease-in-out`. Entry and exit
differ in the code, and so do continuous processes; in the vocabulary they do
not, and so they stand there as raw values. It is only 6 of 58 motion
declarations — but they are exactly the ones for which no token exists. The
difference between a surface that feels cheap and one that feels expensive is
mostly interaction feel, and that is precisely where the vocabulary says least.

**Overlays come out of nowhere.** Popover, menu, combobox list and modal fade in
instead of unfolding from their trigger. `position.ts` already computes
precisely on which side and with which alignment a popover stands relative to
its anchor — the information from which a motion origin follows is on hand and
is not used for the motion.

**Seven stroke widths.** Across 36 glyph instances, 1.1 · 1.3 · 1.4 · 1.5 · 1.6
· 1.8 · 2 stand side by side, together with eight different nominal sizes. At a
display size of 14 px the gap between 1.4 and 1.8 is visible, and inconsistent
stroke widths in a character set are one of the most reliable signs that a
surface has not been finished. `GLYPHEN.md` recorded this completely — and
decided to write it down rather than fix it.

**Ten font sizes stand outside the token set.** `0.75rem` in eight places,
`0.71875rem` in two. Neither value is provided for in `tokens.css`. Plus two raw
hex values in `Button.module.css`. That is little — and it is exactly the kind
of divergence that reads as sloppiness when it stands in the same picture beside
eight cleanly named colour tokens.

The obvious conclusion from this list would be to force everything onto a grid:
every pixel a multiple of four, every font size on a ratio scale. **That
conclusion would be wrong,** and this spec rejects it explicitly. A modular
scale with factor 1.2 from 14 px gives 11.7 / 14 / 16.8 / 20.2 — the 13 px of
the table header and the 19 px of the subheading fall away, although a
data-dense library needs exactly such closely neighbouring sizes. And a grid
test would turn the asymmetric paddings `7px/5px` in combobox, select and
multiselect red, which are with high probability optical corrections: craft, not
a debt item.

The dividing line this spec draws: **strictness over the vocabulary makes a
surface more high-grade, strictness over the values makes it stiffer.**

## Solution

A single machine check, and it checks the vocabulary and nothing else: is there a
raw value here where a token should stand? It says **nothing** about whether a
value lies on a grid, whether a scale keeps to a ratio, or whether a padding is
symmetrical. That is the borrowing from the strict variant, and it is the only
place where both goals want the same thing.

On top of that, four pieces of judgement work, in descending visibility:

**A motion vocabulary that names the distinctions that exist.** The two
durations, one curve and one collective token that exist do not describe what
the library does — which is why the collective token carries a compromise and
the remaining cases stand there raw. The set is extended to as many durations
and curves as are actually distinguished (entry and exit are not the same, an
overlay and a hover colour change are not the same, a continuous process is
neither), `--u-transition` loses the baked-in keyword, and then all 58 places
are pulled onto it.

**Overlays unfold from their trigger.** `position.ts` already knows on which
side and with which alignment the panel stands. From the same information the
origin of the motion follows as a pure function. A menu that unfolds from its
button at the bottom left, instead of fading in at the centre, is the single
biggest difference in this library's perceived value.

**One stroke width.** All glyphs on one nominal-size ratio and one stroke width,
held by a check rather than by a document. With that, the divergence table in
`GLYPHEN.md` disappears — not because it was badly kept, but because it loses
its purpose the moment there are no divergences left.

**A canon of states.** Hover, active, focus and disabled follow one logic across
all components rather than a habit per component. Perceived quality is noticed
the moment somebody moves the mouse, and it falls apart when three buttons have
three different ideas of "pressed".

Finally, the application in depth: the four pieces are not normalised across
thirty components in a thin layer, but really finished on the three surfaces with
the greatest visual weight — table, date picker, combobox/select — including
optical alignment. A library does not become high-grade by everything being
equally mediocre.

**The screenshot baselines will move, and that is intended.** With
`consumable-package` the rule was the other way round: if a baseline moved, a
migration was not pixel-identical and was taken back. That rule does not apply
here. In its place comes a weaker but still binding one: **every moved baseline
is looked at individually and justified.** A bulk rebuild of the baselines is
ruled out.

## User Stories

1. As a developer using the library, I want controls to feel high-grade when touched, so that my product does not look like a kit.
2. As a developer, I want a menu to unfold from its button, so that the connection between trigger and panel is visible and need not be inferred.
3. As a developer, I want every overlay in the library to appear by the same logic, so that the surface reads as one system.
4. As a developer, I want motion to explain state changes rather than decorate, so that a dense application does not become restless.
5. As a developer, I want a pair of glyphs in a toolbar to have the same stroke width, so that the bar does not fray.
6. As a developer, I want the library to look high-grade without configuration, so that I need not plan for design rework.
7. As a developer, I want a hover state to mean the same thing everywhere, so that I need not explain to users what they should be able to see.
8. As a developer, I want the library to respect reduced motion without making states unreadable, so that it stays usable there too.
9. As a library maintainer, I want a check that rejects raw colour values in component stylesheets, so that the token layer is not quietly bypassed.
10. As a library maintainer, I want the check to reject raw font sizes, so that the size set stays closed rather than proliferating.
11. As a library maintainer, I want the check to reject raw durations and curves, so that a motion for which no token exists forces a token rather than a raw value.
12. As a library maintainer, I want the check to make **no** statement about spacing on a grid, so that optical corrections stay permitted.
13. As a library maintainer, I want the check to read the stylesheets at runtime rather than duplicating values, so that it fails when something changes and not when somebody remembers it.
14. As a library maintainer, I want a deliberate divergence to be possible as a named exception with a reason, so that the check is not circumvented by softening the threshold.
15. As a library maintainer, I want an exception to be visibly countable, so that it is noticeable if they multiply.
16. As a library maintainer, I want the stroke width of the glyphs to be held by a check rather than by a document, so that the divergence table does not grow back.
17. As a library maintainer, I want the motion origin to be a pure function, so that it is testable without a browser.
18. As a library maintainer, I want the origin to sit beside the existing position calculation, so that the library does not gain another seam.
19. As a library maintainer, I want moved screenshot baselines to be justifiable individually, so that a design judgement does not drown in mechanical noise.
20. As a library maintainer, I want the state work not to violate the contrast check, so that perceived quality does not come at the cost of legibility.
21. As a library maintainer, I want the state work not to violate the accessibility check, so that a visible focus stays visible.
22. As a library maintainer, I want the work on a few components to go deep rather than on all of them to go wide, so that the effort lands where it is seen.
23. As a designer, I want every glyph in the library to follow one drawing, so that a row of controls does not show three stroke widths.
24. As a designer, I want an optical correction to be permitted and to carry its reason in place, so that it is not "repaired" at the next tidy-up.
25. As a designer, I want geometric centring to be the starting point and not the goal, so that characters sit where they look right.
26. As a designer, I want the font sizes to be allowed to stay irregular, so that table header and cell content can sit close together.
27. As a designer, I want tracking to be coupled to size, so that large titles do not fall apart and small ones do not stick together.
28. As a designer, I want the shadow stacks left untouched, so that good work is not lost in the course of a unification.
29. As a designer, I want entry and exit to be of different speeds, so that appearing invites and disappearing does not hold things up.
30. As an end user of a dense application, I want motion to show me where something comes from, so that I keep my bearings when much changes at once.
31. As an end user, I want a panel to disappear faster than it appears, so that the surface does not get in my way.
32. As an end user sensitive to motion, I want switched-off motion not to swallow states, so that I still see what happened.
33. As an end user with impaired vision, I want a new hover or active state still to have enough contrast, so that an optical upgrade costs me nothing.
34. As an end user working with the keyboard, I want the focus ring to look the same across all components, so that I find it without searching.

## Implementation Decisions

**The check closes the vocabulary, not the values.** It answers exactly one
question per site: *is there a raw value here where a token should stand?*
Checked are colours, font sizes, line heights, durations, timing curves, radii
and shadows. **Explicitly not checked** are spacing, paddings, widths and
heights — raw values are permitted there, because optical correction happens on
exactly those properties. This omission is the central decision of this spec and
not a convenience: a check that turns `padding: 7px 5px` red destroys craft.

**The check reads the source text, not the result.** It follows the pattern of
`kontrast.test.ts`: stylesheets come in as text via Vite's `?raw`, in this case
through a glob over all component stylesheets, and additionally through the
component source texts for the glyph attributes. No CSS parser, no path
arithmetic, no browser. That way it fails the moment somebody writes a raw
value, and not only at the next screenshot.

**Exceptions are named, carry a reason and are counted.** The same pattern as
with the contrast exceptions: a divergence is entered at its site, with file,
property and reason. Taking on an exception is permitted; softening the
threshold itself is not. The list stands in the test and not in a document
beside it, so that it cannot age independently of the code.

**The motion vocabulary is extended before it is enforced.** The finding is
explicitly **not** a discipline problem — all 39 transitions reference tokens.
It is a finding about the token set itself: `--u-transition` bakes in `ease-out`
as a keyword and thereby pushes 28 of 39 transitions onto the default curve, and
the six raw motion values in the stock stand exactly where the vocabulary offers
no name. In future the set distinguishes at least entry from exit (exit shorter,
with a curve that starts immediately — `modalOut` and `backdropOut` already do
that today, only unnamed), micro transitions — colour on hover — from path
transitions, in which something moves or unfolds, and both from the continuous
process. Only then are the sites pulled over. Worked in the reverse order, an
exception per site arises again.

**`linear` stays permitted, but only for continuous processes.** Spinner and
progress are the only cases. As a named token, not as a raw keyword.

**The motion origin is a pure function beside the position calculation.**
`position.ts` already exports `Side` and `Align` and computes the panel's
position relative to the anchor. From the same information follows the origin
from which the panel grows. The function belongs in this module and is covered
by its existing test file — the library thereby gains **no additional seam**.
The result is a value that the stylesheet uses as `transform-origin`; the
component passes it through, it does not compute.

**What opens also closes, and differently.** The panel appears from its origin
with a slight scaling down and opacity; it disappears faster and without
retracing the path backwards. Symmetrical animation makes a surface feel
sluggish.

**Under reduced motion the path is dropped, not the state change.**
`tokens.css` already sets the durations to zero, and `motion.ts` knows the
query. A panel then appears immediately — but it appears, and the state change
stays visible. A focus ring must not become invisible under reduced motion
because it hung its appearance on an animation.

**One stroke width and one nominal-size ratio for all glyphs.** The stock shows
1.1 / 1.3 / 1.4 / 1.5 / 1.6 / 1.8 / 2 across 36 instances and eight nominal
sizes. The goal is one stroke width, expressed relative to the nominal size, so
that a character at 14 px has the same perceived weight as one at 10 px. The
starting value is the 1.4 from `GLYPHEN.md`, because it is already proven there
to be the most frequent; whether it survives implementation is a visual decision
and explicitly open.

**This decision contradicts `GLYPHEN.md` and deliberately rolls it back.** It
says there: *"Where a component's glyph differs from the specification, leave it
and record the difference."* The reasoning — a standard that collects its
exceptions is no longer a standard — is correct and is not disputed here. What
is disputed is the conclusion. `GLYPHEN.md` solves the problem by protecting the
*standard* and leaving the *surface* as it is; under the goal of "demonstrable
consistency" that is the right choice, and under the goal of "looking
high-grade" the wrong one. The resolution is to enforce the standard rather than
document it: after this work there are no divergences, so no table is needed
either. What remains of `GLYPHEN.md` is the specification in six points; what
disappears is the divergence list — and by becoming empty, not by being deleted.

**What is not a glyph stays out of it.** `GLYPHEN.md` has already separated this
cleanly and the separation stays valid: the spinner carries an accessible name,
the funnel in the table filter switches to `fill` to show a state, the sparkline
is a chart. Those are state depictions and graphics, not characters, and the
stroke-width check exempts them by name.

**The canon of states fixes by what means a state comes about, not only how
strongly.** Across all components: hover changes the surface, active changes the
surface more strongly and may additionally suggest a minimal settling, focus is
exclusively the existing ring and is never replaced by anything else, disabled
reduces opacity and removes every reaction. A single control must not break away
from this without a reason.

**The font sizes stay irregular, the set is closed.** The six existing sizes
(11 / 13 / 14 / 16 / 19 / 24 px) stay, because a ratio scale would destroy the
closely neighbouring pairs a dense library needs. The ten sites outside the set
are resolved: either pulled onto an existing size or — if they denote a real,
recurring role — taken on as a seventh token. Which of the two is a decision per
site and not a blanket one.

**Tracking belongs coupled to size.** `--u-tracking-display` and
`--u-tracking-tight` show the right instinct but hang free. Every font size is
assigned its tracking, so that the assignment is not made afresh at every use.

**Depth before breadth.** Table, date picker and the combobox/select/multiselect
group carry the most visual weight and get the full treatment, including a review
of the optical alignment. All remaining components get the new vocabulary and
nothing else. A thin-layer normalisation across thirty components has the full
regression cost and almost no visible return.

**Left untouched are the shadow stacks, the edge treatment and the colour
world.** Near-monochrome with a single accent for interactive things is already
the demanding choice, and the stacks with one job per level are good work. There
is nothing to gain here, and a unification could only do harm.

## Testing Decisions

**What makes a good test here.** The greater part of this work is visual and thus
not testable by assertions about values. A test that records that a duration is
140 ms checks the implementation against itself. Two other things are testable:
that **no raw value** stands in a place where a token should stand — that is a
statement about the source text, not about a number — and that the **pure
derivations** are right, first among them the motion origin. Everything else is
held by the screenshots, and their role here is making visible, not preventing.

**The vocabulary test is a unit test over the source text.** The prior art is
`tests-unit/kontrast.test.ts`, which reads `tokens.css?raw` and derives
statements from it, without a file system and without a browser. The same
access, via a glob over all component stylesheets. It reports every site with
file and property, so that the error message is itself the work list.

**The stroke-width check lies in the same test.** It reads the component source
texts and collects the `strokeWidth` and `viewBox` attributes. The exceptions —
spinner, table-filter funnel, sparkline — stand there by name with a reason, just
as the contrast exceptions do. That turns the divergence table in `GLYPHEN.md`
into a check that cannot age independently of the code.

**The motion origin is checked in the existing test file.**
`tests-unit/position.test.ts` already covers `berechnePosition`. What is checked
are properties of the mapping, not the formula: that the origin lies on the edge
**opposite** the panel (a panel below the anchor grows from the top), that the
alignment follows, and that every combination of `Side` and `Align` yields a
valid value. That is the same property-oriented style as in `skala.test.ts`,
where the margin and the inversion of the axis are checked rather than the
calculation path.

**Reduced motion gets its own test.** That a panel with motion switched off
appears rather than disappears, and that the focus ring stays visible. The prior
art for component tests in the simulated document is `popover.test.tsx`.

**The state work is bounded from below by the existing checks.**
`kontrast.test.ts` covers every new token a state introduces;
`tests-visual/barrierefreiheit.spec.ts` makes sure an optical upgrade does not
cost a visible focus. Both run already — nothing new is added, they are only not
to be broken.

**The screenshots are evidence here, not guards.** With `consumable-package` the
rule was: if a baseline moves, the part is taken back. **That rule does not
apply here** — the work is meant to change the picture. In its place comes: every
moved baseline is looked at individually, and the justification stands in the
delivery of the respective ticket. A bulk rebuild without review is ruled out; it
would be exactly the convenience the old rule was written against.

**Order within each ticket: check before rebuild.** The vocabulary test is
written while it is still red, and the sites are worked off against it. The other
way round it only proves that the new code agrees with itself.

## Out of Scope

- **A spacing grid and any check on it.** Explicitly rejected, not deferred: it
  would destroy optical corrections. The 57 off-grid values (of 214 px literals)
  in the components stay where they are.
- **A modular type scale.** Explicitly rejected: it destroys the closely
  neighbouring sizes a data-dense library needs.
- **A baseline grid / vertical rhythm.** In a component library without control
  over the surrounding page largely fiction, and today broken anyway in five
  places with `line-height: 1`.
- **The shadow stacks, the edges-as-shadows treatment and the colour world.**
  Already good work.
- **The contrast of the tokens.** Settled by `kontrast.test.ts`; open points
  belong to `tone-contrast`.
- **New components, new variants, new properties.** This work changes how what
  exists looks and feels, and does not extend the surface.
- **The thin-layer depth treatment of all components.** Deliberately limited to
  three surfaces.
- **Springs and physical motion models.** The library animates in CSS;
  introducing a runtime library for motion would be a different and larger
  decision.
- **Density / a compact token set.** That is work package B.13 from the handoff.
- **Multilingualism, server rendering, publication.** Decided in
  `consumable-package`.

## Further Notes

The order is not arbitrary. **Ticket 01 first**, because it is mechanical,
low-risk and the precondition for the following tickets not working around the
token layer. Then **02**, because motion has by far the greatest visible return.
**03** and **04** are independent of each other. **05** comes last, because it
applies the results of 02 to 04.

The risk of this spec lies not in the technology but in the judgement. Ticket 01
is verifiably finished; with 02 to 05, "finished" means *looks good*, and that is
not a property a test can deliver. That is why the rule about the screenshot
baselines is the most important line in this document: it is the only place where
a visual judgement becomes visible and has to be justified. Drop it, and this
work becomes a bulk rebuild of baselines with a story about it.

On the rolled-back decision in `GLYPHEN.md`: it is worth noting the order in
which this happened. `GLYPHEN.md` arose as a follow-up to
`consumable-package/issues/05-glyph-set.md`, whose acceptance criterion was to
migrate only what could be taken over pixel-identically. Under that criterion,
writing the divergences down was the only possible answer — the alternative
would have been to break the criterion. This spec breaks it, explicitly and with
the opposite sign on the baselines. That is not the correction of a mistake but a
decision under a different goal.

The terms this work introduces collide with existing vocabulary, and that is to
be borne in mind when naming. **Raster** in this repo already means the date
picker's 42-cell month grid, **Skala** the value projection of the DataViz
marks, **Maß** the height calculation of the multiline field. A design "Raster"
or a typographic "Skala" would give three words a second meaning each. The terms
used in this spec — vocabulary, motion origin, canon of states — are deliberately
chosen to be free. They now stand in `CONTEXT.md`.
