# A plan one can read, and rules one cannot break

Status: done
Date:   2026-09-17
Origin: Roman's findings after `schedule-refinement` was delivered - what a bar
says, how a transport is drawn, which lane a subtask may go to, and the locale
of the formats, which ADR-0019 left open on purpose. The two defects he found
beside them (the ghost's label clipped in the topmost lane, the now line
outside a fixed plan) were repaired at once and are not part of this spec.

## Problem Statement

The schedule draws a correct plan that a planner still cannot read without the
pointer:

- **A bar carries no text.** Which order a bar is can only be found by hovering
  it or clicking it. On a plan of twenty lanes that is the whole work of
  reading.
- **Every transport is a curve from the middle of one bar to the middle of the
  next.** Where the next stop lies one lane down and two minutes later, the
  curve leaves the bar, swings through a neighbouring lane and comes back - a
  long line for a short move, and it crosses work it has nothing to do with.
- **Every bar looks the same.** Released and unreleased work, fixed and movable
  work, half-finished work: the colour says the order and nothing else can be
  said.
- **Every subtask may go to every lane.** A plant knows better: a mould fits one
  press, a part that has been set up may move in time but not to another
  machine. Today `intents` can only allow lane changes altogether or not at all,
  so an application that must forbid one lane forbids them all.
- **The dates are German in an English library.** `DEFAULT_FORMATS` writes
  `de-DE` whatever the wording says. ADR-0019 says as much and leaves the
  decision open: *"the locale of the formats is a decision about a different
  object and deserves its own."* This is that decision.
- **Nothing checks that the picture is not in its own way.** The clipped ghost
  label was found by eye, not by a test, and the things this spec adds - text in
  bars, shorter transport lines - are exactly the things that overlap each other
  when they go wrong.

## Solution

Six pieces, each optional except the last two:

- **Text in the bars.** A label per subtask, given by the caller, drawn over the
  bar as real text, cut off where the bar is too narrow and following the bar
  while it is partly out of view - as the day band's date does.
- **Transport routes.** Besides the curve, a straight line and an orthogonal
  one; and anchors that take the shortest way: the corner of the bar that faces
  the other stop, instead of always the middle.
- **Bar styling.** A handful of named appearances a caller may give a subtask -
  provisional, fixed, a share done, muted, open at its end - each one a pattern
  or an outline and not only a colour.
- **Where a subtask may go.** The caller answers per subtask and lane; a drag
  snaps to the nearest allowed lane and shows a **Refusal** where there is
  none, the word the dock already has for a drag that may not land.
- **English formats, German optional.** `DEFAULT_FORMATS` becomes English, and
  the German formats ship beside `GERMAN_WORDING` as freight a caller takes on
  purpose. An ADR records it.
- **A check against the picture being in its own way.** One suite at the shell,
  like `ownBase`, over every example of the schedule demo: nothing the schedule
  draws in the DOM leaves its plot, no bar label is wider than its bar, no two
  labels cover each other.

## User Stories

### Reading a bar

1. As a planner, I want the order's name written in its bar, so that I can read the plan without touching it.
2. As a planner, I want the text cut off where the bar is too narrow, so that a short subtask does not write over its neighbours.
3. As a planner, I want no text at all where even a few characters would not fit, so that a bar does not become a row of dots.
4. As a planner, I want the text of a bar that runs off the edge of the view to stay in sight, so that I can read the order of a subtask that started yesterday.
5. As a planner, I want the text to stand out against its bar in both themes, so that a pale order colour does not swallow it.
6. As an application developer, I want to decide what a bar says, so that it can be the order, the article, the quantity or two of them.
7. As an application developer, I want to switch the text off, so that a dense plan stays a picture.
8. As an assistive-technology user, I want the bars' text to be real text, so that what a planner reads is not a bitmap to me.

### Transports that read as short moves

9. As a planner, I want a transport between two stops one lane apart to be drawn as the short line it is, so that a five-minute move does not look like a journey.
10. As a planner, I want a transport to start at the edge of the bar that faces its destination, so that the line does not cross the work it leaves.
11. As a planner, I want a straight transport line where my plan is dense, so that the picture calms down.
12. As a planner, I want an orthogonal route as an alternative, so that the lines read like a wiring diagram where that suits the plant.
13. As a planner, I want transports in the same lane to stay in it, so that a move that changes nothing but time does not leave its lane.
14. As an application developer, I want the route and the anchor to be options of the schedule, so that one decision holds for the whole plan.
15. As an application developer, I want a transport to override the route and the anchor, so that the one connection that must be seen differently can be.
16. As an application developer, I want the finding to stay what it was - the anchors decide when a transport is late - so that changing how a line is drawn never changes what is true.

### Bars that say more than their colour

17. As a planner, I want unreleased work drawn provisionally, so that I can tell a plan from a commitment.
18. As a planner, I want work I may not move drawn as fixed, so that I do not try.
19. As a planner, I want the share of a subtask that is done drawn in its bar, so that I can see progress where the application knows it.
20. As a planner, I want work that is not mine drawn muted, so that another shift's plan does not shout.
21. As a planner, I want a subtask that reaches beyond the view drawn open at that end, so that I do not read the edge of the screen as its end.
22. As a planner, I want every one of these to be a pattern or an outline and not only a colour, so that I can tell them apart without relying on colour vision.
23. As an application developer, I want to name a subtask's appearance in my data, so that my domain decides what provisional means.
24. As an application developer, I want the appearances to be a closed list, so that a plan cannot end up with twelve kinds of bar nobody can read.

### Where a subtask may go

25. As a planner, I want a subtask that belongs to one machine to refuse another lane, so that the plan cannot ask for something the plant cannot do.
26. As a planner, I want the ghost to stay on the nearest allowed lane while I drag across a forbidden one, so that I always see where the drop would land.
27. As a planner, I want a refusal to be visible while I drag, so that I know why the ghost is not following my pointer.
28. As a planner, I want a subtask that may not change lane at all to still be movable in time, so that one restriction does not take the other away.
29. As an application developer, I want to answer per subtask and lane whether a move is allowed, so that the rule stays in my domain.
30. As an application developer, I want the restriction to hold for a drag from outside as well, so that dragged-in work cannot land where placed work may not.
31. As an application developer, I want no intent reported for a refused drop, so that a refusal is not something I have to check for again.

### The locale of the formats

32. As an application developer, I want the library's default dates, times and numbers in English notation, so that a library whose wording is English does not write 17.03.2026.
33. As an application developer, I want German formats available as an import, so that a German application has them without writing them itself.
34. As an application developer, I want to keep reading times on a 24-hour clock by default, so that a plant screen is not read wrongly at 3 in the afternoon.
35. As an application developer, I want one provider to set formats and wording together, so that switching a language stays one act.
36. As a reader of this repository, I want the decision recorded, so that the next reader finds why the formats are English and where the German ones are.

### Nothing in its own way

37. As a maintainer, I want a check that nothing the schedule draws in the DOM leaves its plot, so that a clipped label is a failing test and not a finding of the eye.
38. As a maintainer, I want a check that no bar label is wider than its bar, so that the text's cutting-off is proved and not assumed.
39. As a maintainer, I want a check that no two labels of the schedule cover each other, so that a dense plan stays readable.
40. As a maintainer, I want the check to run over every example of the schedule demo, so that a new example is checked without anything being added anywhere.
41. As a maintainer, I want the check to name what it found and where, so that a failure reads as an address and not as a number.

## Implementation Decisions

- **Bar labels.**
  - A prop takes a function from a subtask to a string, or nothing for no
    labels.
  - Drawn as DOM over the bar, not as canvas text: this workspace keeps text in
    the DOM (axes, lane headers), and DOM text is selectable and reaches
    assistive technology, which the accessibility spec will need. Only bars
    within the view get an element.
  - Each label is clipped by its bar's width with an ellipsis, and left out
    where the bar is narrower than a few characters. A bar that begins before
    the view keeps its label at the view's edge, the way the day band keeps its
    date.
  - The label's colour is resolved for contrast against the bar it lies on -
    the tokens the stat and the verdict already use for text on a coloured
    ground.
- **Transport routes.**
  - `route`: `"curve"` (today's), `"straight"`, `"orthogonal"`; an option of the
    schedule, overridable per transport.
  - `anchor`: `"centre"` (today's) or `"nearest"`. `"nearest"` takes the corner
    of the departing bar that faces the arriving one - bottom for a stop below,
    top for one above, the middle within the same lane - and the mirror of it at
    the arrival.
  - The geometry stays a pure module beside `geometry.ts`, and the hit follows
    from the route: the same polyline that is drawn is the one that is hit.
  - **The findings do not move.** `leaves` and `arrives` decide what a transport
    connects and therefore whether it is late; `route` and `anchor` decide only
    how it is drawn. The two are separate words on purpose.
- **Bar styling.** A closed list on the subtask: `provisional` (a dashed
  outline, a lighter fill), `fixed` (a hatch), `muted` (reduced weight),
  `open` (no end edge at the side it continues past). Progress is a number from
  0 to 1 and is drawn as a filled share, not as a colour of its own. Several may
  hold at once except where they would contradict (`provisional` and `fixed`);
  where they do, the later in the list wins, and the reason stands at the site.
- **Where a subtask may go.** `canMoveTo?: (subtask, lane) => boolean`, asked
  while a drag runs and again at the drop. The ghost stays on the last allowed
  lane and the snapshot carries a **Refusal**, which the DOM shows at the ghost
  and which the demo's own styling follows; nothing is reported for a refused
  drop. It is asked for a drag from outside as well, with the item's task.
  A lane change is still enabled by `intents`; `canMoveTo` only narrows it.
- **The formats.** `DEFAULT_FORMATS` becomes English with a 24-hour clock
  (`en-GB`: 17/03/2026, 09:05, 1,204.5, "Tuesday, 17 March 2026"). The German
  formats ship as `GERMAN_FORMATS` behind the subpath that already carries
  `GERMAN_WORDING`, so a German application takes both in one import line. The
  collation follows the same locale, and the four demos show the English
  default. An ADR records the decision and points at ADR-0019, which left it
  open; the `de-DE` values of today stay reachable and tested.
- **The check.** A module beside `ownBase` in `@umriss-ui/demo/checks`, called
  by the schedule's browser suite with every page: it reads the boxes of the
  schedule's own DOM overlays - lane headers, band labels, bar labels, ghost
  label, tooltip, grips - and reports any that leaves its plot or its band, any
  bar label wider than its bar, and any pair that intersects. Tolerated cases
  stand at the call with a reason, as `ownBase`'s do.

## Testing Decisions

- **Seams: the ones this package already has.** The demo in the browser for
  everything visible; unit tests for the pure modules; no new seam.
  - `features-schedule.spec.ts`: bar labels (present, cut off, left out,
    sticking at the edge), the routes and anchors as drawn geometry read
    through the canvas' occupied pixels or the labels' boxes, the bar
    appearances through the demo's own examples.
  - `features-editing.spec.ts`: a drag across a forbidden lane keeps the ghost
    where it was allowed, the refusal shows, the drop reports nothing; the same
    for a drag from outside.
  - Unit tests named after their subject: the transport geometry (`route` and
    `anchor` - the corner chosen for a stop above, below and in the same lane;
    the polyline the hit uses), the label's cutting-off (how many characters
    fit, when none do), and the appearance resolution (which pattern wins).
  - The formats: the characterisation test of the formats in core is the place
    that pins the change - every format's output for one fixed instant, for the
    English default and for the German import, so that the move is visible as a
    diff and not as a surprise.
- **Pictures.** The bar labels, the routes and the appearances are appearance,
  so each gets its own example and its pictures. The format change moves every
  picture that shows a date or a number in all four demos; the ticket that does
  it names that, and it is the only ticket allowed to renew them in bulk - with
  the count, read and stated, as `CONTEXT.md` **Baseline** demands.
- **The new check is a test of the tests too:** it must fail on the defect it
  was written for. The ghost label clipped in the topmost lane is the case; the
  ticket reproduces it by reverting the clamping in a scratch run and states
  that it did.

## Out of Scope

- Keyboard operation and screen-reader access of the schedule - still its own
  spec, still the largest open piece.
- Text on the transports (a duration written along the line).
- Virtualisation of the bar labels beyond leaving out what is not in view.
- Automatic collision avoidance: nothing is moved because a label does not fit.
  The label is cut off; the plan is not rearranged.
- Route kinds beyond the three named, and appearances beyond the four named.
- Deriving `canMoveTo` from the data (a machine group on the subtask): the
  question is asked, the answer is the application's.
- Changing the locale of the wording, or how a language is chosen. Only the
  formats' default moves.
- The charts' and the table's own use of the formats beyond what the locale
  change forces.

## Deviations, decided during delivery

Recorded here because a delivered spec is read backwards (`CONTRIBUTING.md`):

- **`ends` is a third drawing option**, beside `route` and `attach`: Roman
  asked for the dot at a transport's ends to be optional while the ticket was
  being built. Same shape as the other two, and the Out of Scope line it brushes
  ("route kinds beyond the three named") is about kinds of route, not about
  whether an end carries a dot.
- **`anchor` is called `attach`.** A transport already has two anchors -
  `leaves` and `arrives` - which decide what it connects and therefore whether
  it is late, and the tree has an **Anchor** of its own. The drawing option says
  where the line touches the bar, and that is a third meaning the word cannot
  carry.
- **`progress` is a rail, not a filled share**, and **`muted` is drawn slim,
  not faint**: a faint fill already means a **Setup** or a **Teardown** here, so
  neither would have been distinguishable from a run-out time. Roman found it in
  the first picture; the example now carries a real setup beside both.
- **Story 38 is answered by construction and measured once, not by the
  check.** A bar label is given its bar's width, so it cannot be wider; the
  browser test measures the label's box against the example's own declared
  times, which is the independent source. The check would have compared the
  label to a number the same code wrote.
- **Story 39 does not hold for bar labels.** A label IS its bar, so two labels
  intersect exactly when two bars do - which is an **Overlap**, drawn on
  purpose and never packed away. The labels say so themselves
  (`data-schedule-may-cover`) and the invariant holds for every other overlay.
- **A refused drop lands where the ghost stands.** The spec said a refused drop
  reports nothing; the ghost, meanwhile, stays on the last lane that was
  allowed. Both cannot hold at once, and the ghost wins: it is the promise of
  where a drop lands, in a drag from outside as in one inside. Nothing is
  reported where no ghost stands at all - off the lanes, or when no lane ever
  allowed the work.

## Further Notes

- The two defects behind this spec are already repaired (`a9099a4`): the ghost
  label is measured and clamped like the tooltip, and the now-line example
  gives a fixed instant with the reason at the site. Story 37 exists so that the
  first of them cannot come back unnoticed.
- Recommended order: the formats first, because they move pictures everywhere
  and every later ticket would move them again; then the check, so that what
  follows is checked while it is written; then bar labels, transport routes, bar
  styling, and `canMoveTo`.
- `Refusal` is the dock's word (`CONTEXT.md`), and the schedule takes it as it
  took **Grip**. If the glossary entry needs widening the way **Grip**'s did,
  that belongs to the ticket that uses it.

## Comments

### Status corrected (2026-09-24)

Delivered in commits `schedule-legibility 01`-`06` and the review follow-up. The Status line had not been moved when the work landed.
