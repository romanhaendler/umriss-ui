# The schedule in daily use

Status: ready-for-agent
Date:   2026-09-17
Origin: conversation after the delivery of `.scratch/schedule/` - the list of
improvements (all but keyboard and screen-reader access, which stays a spec of
its own) and the two ideas parked before it: reporting the selected subtask and
placing work by dragging it in from outside. Vocabulary in `CONTEXT.md`, "The
schedule"; decisions in ADR-0022 and ADR-0023, which this spec extends and does
not revise.

## Problem Statement

The first version of `@umriss-ui/schedule` draws a plan correctly and lets a
planner move what is on it. In daily use it falls short in ways a planner
notices within minutes:

- A bar shows a colour and nothing else. Which order it is, when exactly it
  runs, what the finding on it is - all of that needs a click, or a lookup in
  the application beside it.
- There is no mark for the present. A plan without "now" does not say what is
  late already and what is still ahead.
- On a page, the wheel over the schedule zooms. A planner scrolling down a long
  page gets stuck in the plan and changes its scale by accident; twenty lanes
  cannot be scrolled with the wheel at all.
- A subtask can only be dragged as far as the visible part of the plan. Moving
  something into tomorrow means dropping it at the edge, panning, and dragging
  again.
- Snapping lies on local midnight. A plant whose shifts change at 06:00, 14:00
  and 22:00 cannot snap to its shifts.
- Moving a whole order - every stop of it - takes one drag per subtask.
- Work that is not planned yet cannot be put on the plan by hand: the schedule
  accepts no drop from outside.

An application developer meets the other half:

- Pan and zoom are the schedule's own and nobody hears of them, so a schedule
  cannot be kept in step with a second schedule or with a chart of the same
  hours.
- A point on the screen cannot be turned into a time and a lane, so an
  application cannot build anything on top of the plot that the schedule does
  not already offer.
- The selection is reported as a task only; which subtask of it was clicked
  stays inside.

And the package itself carries debts from its first delivery: one module of a
thousand lines doing six things, findings recomputed over the whole plan on
every pointer movement of a drag, two capabilities checked only by pictures, a
context menu whose position is checked only through its anchor, and the word
**Grip** used for something the glossary gives to the dock.

## Solution

The schedule grows the things a plan in use needs, each within the controlled
model of ADR-0023 - it still draws what it is given and reports what is asked:

- Hovering a subtask or a transport shows a tooltip: the order, the subtask,
  its times, setup and teardown, the transport's duration, and the findings on
  it. An application can replace its content or switch it off.
- An optional **Now line** marks the present across the lanes.
- The wheel scrolls the lanes; Ctrl or ⌘ with the wheel, and a pinch, zoom; a
  horizontal wheel or Shift pans through time. At the end of its lanes the wheel
  lets the page scroll on.
- A drag near the edge of the plot pans the plot along, so a subtask can be
  moved anywhere in one gesture.
- The snap raster can carry an offset: shifts at 06:00, 14:00 and 22:00.
- A pure function computes the moves that shift a whole task by an amount; the
  demo offers it from the context menu.
- Unplanned work can be dragged in from any list of the application. While it is
  over the plot, a ghost shows where it would land and what it would collide
  with; the drop reports a **place** intent. The application creates the
  subtask.
- The schedule reports its visible time span when a planner pans or zooms, so
  two schedules - or a schedule and a chart - can move together.
- A handle on the schedule turns a client point into a time and a lane and back.
- The selection is reported with its subtask.

Inside, the scene is divided along its responsibilities, the ghost's findings
are assessed only on the lanes and transports a drag can touch, and the missing
browser checks are written.

## User Stories

### Reading the plan

1. As a planner, I want a tooltip when I rest the pointer on a subtask, so that I can read which order it belongs to without clicking.
2. As a planner, I want the tooltip to show the subtask's main time, and its setup and teardown where it has them, so that I can read exact times without counting ticks.
3. As a planner, I want the tooltip to name the findings on a subtask - an overlap, and with whom; a late transport, and by how much - so that a marked bar explains itself.
4. As a planner, I want a tooltip on a transport showing where it goes from and to, how long it takes and whether it is late, so that a line on the plan explains itself too.
5. As a planner, I want the tooltip out of the way while I drag, so that it never covers the ghost and its label.
6. As a planner, I want the tooltip to stay inside the schedule and flip at its edges, so that it is never cut off.
7. As a planner, I want a line marking the present moment, so that I can see what is already overdue and what lies ahead.
8. As a planner, I want the present line to move on as time passes, so that a schedule left open on a wall screen stays true.

### Moving through the plan

9. As a planner, I want the mouse wheel over the schedule to scroll through the lanes, so that it behaves like every other scrolling area.
10. As a planner, I want the page to scroll on once the lanes are at their end, so that the schedule never traps my wheel on a long page.
11. As a planner, I want Ctrl or ⌘ with the wheel, and a trackpad pinch, to zoom the time scale around the pointer, so that zooming is deliberate and never accidental.
12. As a planner, I want a horizontal wheel movement, or Shift with the wheel, to pan through time, so that I can move along the day without dragging.
13. As a planner, I want the plot to pan along when I drag a subtask near its edge, so that I can move a subtask beyond what is visible in one gesture.
14. As a planner, I want the auto-panning to speed up the closer I get to the edge, so that I control how far it goes.
15. As a planner, I want the ghost, its label and its findings to follow while the plot pans under the drag, so that I always see where the subtask would land.
16. As a planner, I want auto-panning to happen vertically as well, so that I can drag a subtask onto a lane that is scrolled out of view.

### Editing the plan

17. As a planner, I want my drags to snap to my plant's shift raster - 06:00, 14:00, 22:00 - so that work lands on shift changes.
18. As a planner, I want to shift a whole order by an amount in one action, so that I do not drag each of its stops.
19. As a planner, I want shifting a whole order to keep the distances between its stops, so that its transports still fit exactly as before.
20. As a planner, I want to drag an unplanned order from a list onto a lane at a time, so that I put work on the plan the way I move work that is already there.
21. As a planner, I want a ghost of the dragged-in work while it is over the plan, with its times and the findings it would create, so that I see a collision before I drop.
22. As a planner, I want the dragged-in ghost to snap like any other drag, so that new work lands on the same raster as moved work.
23. As a planner, I want a drop outside every lane to do nothing, so that a missed drop never creates a subtask somewhere.
24. As a planner, I want Escape to cancel a drag from outside as it cancels any other drag, so that I can change my mind.
25. As a planner, I want dragged-in work to appear only once the application has put it on the plan, so that the picture never disagrees with the plan of record (ADR-0023).

### Building on the schedule

26. As an application developer, I want to replace the tooltip's content with my own, so that it shows what my domain needs - a customer, a material, a status.
27. As an application developer, I want to switch the tooltip off, so that an application with its own detail panel is not doubled.
28. As an application developer, I want the tooltip's default text to come from the wording and formats of `@umriss-ui/core`, so that one provider switches its language with everything else.
29. As an application developer, I want to switch the present line on, and to fix it at a given instant, so that screenshots, replays and tests show a stable present.
30. As an application developer, I want the schedule to report its visible time span whenever the planner pans or zooms, so that I can keep another view in step.
31. As an application developer, I want that report to come from the planner's gestures only and not from my own change of the span, so that two schedules synchronised with each other do not feed back.
32. As an application developer, I want to hand the reported span to a second schedule, or to a chart's time axis, so that the plan and the measurements of the same hours line up.
33. As an application developer, I want to turn a client point into a time and a lane, so that I can build interactions on top of the plot - a drop of my own, a marker, a measuring tool.
34. As an application developer, I want to turn a time and a lane into a client point, so that I can place my own DOM beside something on the plot.
35. As an application developer, I want the snap raster as a step with an offset, so that my shift model decides where the raster lies.
36. As an application developer, I want a pure function that shifts every subtask of a task by an amount and returns move intents, so that I apply them like any other intent - or run `ripple` over them first.
37. As an application developer, I want the selection reported with the clicked subtask, so that I can show the stop and not only the order.
38. As an application developer, I want the selection reported again when the planner clicks another subtask of the same task, so that my detail follows the click.
39. As an application developer, I want to declare what is being dragged in - its task, the length of its main time, its setup and teardown - while the drag runs, so that the schedule can draw a ghost before the drop.
40. As an application developer, I want the drag from outside to work with the platform's drag and drop, so that any list - mine, a table's, a tree's - can be the source.
41. As an application developer, I want the drop reported as a place intent carrying the task, lane, times, setup, teardown and my own key for the dragged item, so that I know what to create and where.
42. As an application developer, I want a place intent to be one more intent name in `intents`, so that a schedule that does not list it accepts no drop.
43. As an application developer, I want `applyIntent` to leave the data unchanged for a place intent and a helper to build the new subtask from it, so that creating stays my decision and my identity scheme.

### Demo and documentation

44. As a demo reader, I want an example of the tooltip with its default content and one with content of the application's own, so that I see both before the source.
45. As a demo reader, I want an example of the present line, so that I see how it reads against a plan.
46. As a demo reader, I want the wheel, zoom and pan behaviour stated where the schedule is introduced, so that I know how to move through it.
47. As a demo reader, I want an example of a shift raster with an offset, so that I can copy a plant's raster.
48. As a demo reader, I want an example of two schedules - or a schedule and a chart - kept in step, so that the domain report has a recipe.
49. As a demo reader, I want an example of unplanned orders dragged from a list onto the plan, so that the place intent has a recipe.
50. As a demo reader, I want the demonstration's context menu to offer shifting the whole order, so that the task shift is shown where a planner would reach for it.
51. As a demo reader, I want the example "What the pointer reports" to include the selected subtask, so that the richer selection report is visible.

### The package itself

52. As a maintainer, I want the scene divided into registration and data, view and layout, drawing, and gestures, so that a change to one does not mean reading all of them.
53. As a maintainer, I want the ghost's findings assessed over the lanes and transports the drag touches only, so that a plan of hundreds of tasks stays fluid during a drag.
54. As a maintainer, I want pinch zoom and the operating calendar under pan, zoom and drag checked in the browser, so that two capabilities are no longer proved by pictures only.
55. As a maintainer, I want the context menu's real position checked in the browser, including its flip at the window edge, so that its one novelty is tested where layout exists.
56. As a maintainer, I want one word for the part of a component a drag takes hold of, defined once in the glossary for the dock and the schedule, so that **Grip** is used as it is defined.

## Implementation Decisions

- **Model unchanged in spirit (ADR-0023).** Every new editing capability is an
  intent: the place intent joins move, lane, stretch, setup and teardown. No new
  internal state holds data; the schedule never creates or changes a subtask.

- **Tooltip.** A DOM overlay inside the plot, positioned beside the hovered
  subtask or transport, clamped to the schedule and flipped at its edges; hidden
  while any drag is in flight. Default content from core's wording and formats:
  task name, subtask name, main time, setup and teardown, transport route and
  duration, findings with their partner or shortfall. A prop takes `false` to
  switch it off, or a render function receiving the hit and the findings on it
  to replace the content. New wording entries in core for the labels it needs,
  English and German. Not keyboard-reachable in this spec (that belongs to the
  accessibility spec).

- **Now line.** A prop: absent or `false` draws none; `true` draws the present
  and moves it on once a minute; a number fixes it at that instant. Drawn on the
  data canvas above the grid and below the subtasks, in the accent colour,
  mapped through the operating calendar (in removed time it stands on the seam).
  Off by default, so no existing picture moves.

- **Wheel (a change of behaviour).**
  - The plain vertical wheel scrolls the lanes. When they are at their end in
    the wheel's direction, or fit without scrolling, the event is not prevented
    and the page scrolls.
  - Ctrl or ⌘ with the wheel zooms around the pointer; a trackpad pinch arrives
    the same way.
  - A horizontal delta, or Shift with a vertical one, pans through time.

  User story 10 of the first spec ("zoom the time scale with the wheel or a
  pinch") is superseded; the changelog states it under **Changed**.

- **Auto-pan during a drag.** Within an edge zone of the plot (a fixed number of
  pixels on each side), the plot pans every frame at a speed that rises toward
  the edge, horizontally and vertically, while a move, lane, stretch, setup,
  teardown or place drag is in flight. The ghost is recomputed from the pointer's
  last position after each pan step. The speed curve is a pure function of the
  distance into the zone.

- **Snap raster with offset.** `snap` additionally accepts a step with an offset
  measured from local midnight (a shift raster: eight hours from six). The raster
  lies on local time as today. A number keeps its meaning (offset zero), as does
  `"ticks"` and `false`. The pure snapping module takes the offset.

- **Shifting a whole task.** A pure function takes the subtasks, a task id and
  an amount, and returns one move intent per subtask of that task, lengths and
  distances kept. No gesture in the component; the demonstration's context menu
  applies it.

- **Place intent.**
  - Shape: kind `"place"`, the caller's key for the dragged item, task, lane,
    main-time start and end, setup and teardown.
  - `applyIntent` ignores it (there is no subtask to apply it to yet); a helper
    turns a place intent plus a caller-chosen id into a subtask.
  - `ripple` accepts it: the new subtask, once given an id, is assessed like any
    other.

- **Dragging in from outside.**
  - Built on the platform's HTML drag and drop, so any draggable element of the
    application can be the source.
  - The browser does not expose the dragged data before the drop, so the
    application declares the item while the drag runs through a controlled prop
    - set on its own `dragstart`, cleared on `dragend` - carrying the key, task,
    length of main time, setup and teardown.
  - While an HTML drag is over the plot and that prop is set, the schedule
    accepts it, draws a ghost at the pointer's time (snapped) and lane, assesses
    it like data, and labels it as any other ghost.
  - A drop on a lane reports the place intent; a drop outside every lane, a
    leave, or Escape reports nothing.
  - Without `"place"` in `intents` the schedule does not accept the drop at all.

- **Domain report.**
  - A callback receives the visible span as two wall-clock instants after a
    pan or zoom gesture - wheel, drag, pinch, auto-pan - at most once per frame.
  - A change of `initialDomain` from outside resets the view and is not
    reported, which is what keeps two schedules that feed each other from
    looping.
  - A chart's time axis can take the span as its fixed domain; with an operating
    calendar on the schedule, the caller passes wall-clock spans, as the chart's
    axis expects.

- **Point ↔ time and lane.**
  - A ref handle on `Schedule` with two methods: client point to time and lane
    (lane null below the last one, the whole result null outside the plot), and
    time and lane to client point.
  - Both go through the same scale, calendar and scroll the drawing uses.
  - No new prop; the handle is the one imperative surface of the component, and
    what it exposes is arithmetic, not state.

- **Selection with subtask (a change of behaviour).**
  - The selection callback receives the task and the clicked subtask; a click on
    a transport or on nothing reports no subtask.
  - It is called whenever either changes, including a click on another subtask
    of the same task.
  - `selectedTask` stays the controlled value; no controlled subtask prop in this
    spec.

- **Scene division.**
  - The scene is split into modules with one reason to change each:
    registration and derived data; view (domain, scroll, size, layout of boxes
    and paths); drawing (both canvases); gestures (pointer, wheel, pinch,
    auto-pan, drag from outside, ghost and intents).
  - The snapshot the DOM reads stays one object.
  - No public API changes because of the division.

- **Ghost assessment.** During a drag, findings are computed over the subtasks
  of the ghost's current lane and its original lane, and over the transports
  touching the ghost; the overlaps of all other lanes are taken from the data
  already assessed.

- **Vocabulary.** `CONTEXT.md` widens **Grip** from "the one part of a dock that
  moves it" to the part of a component a drag takes hold of, naming the dock's
  grip and the schedule's setup and teardown grips; its _Avoid_ list stays.
  **Now line** and **Place** (the intent) are added to "The schedule". The
  tooltip is the existing **Tooltip** word where core has one; otherwise it is
  defined there.

- **Documents.** The schedule's changelog lists the wheel and the selection
  callback under **Changed**; the charts and core changelogs get entries only
  where their public surface changes (core: wording entries).

## Testing Decisions

- **Good tests observe external behaviour only:** what the DOM chrome says,
  what is reported through callbacks, what an example writes down - never scene
  internals, module boundaries or pixel mechanics. The division of the scene
  must not change a single existing test.
- **Seams, confirmed before writing this spec: no new one.**
  - The highest seam is the schedule demo in the browser:
    `features-schedule.spec.ts` for reading and moving (tooltip content and
    hiding, now line through a fixed instant, wheel scrolling the lanes and
    releasing the page, Ctrl-wheel zoom, pinch, the calendar under pan and zoom,
    domain report and synchronisation, point ↔ time and lane);
    `features-editing.spec.ts` for editing (auto-pan during a drag, shift
    raster with offset, drag from a list with the ghost's findings and the
    reported place intent, a drop outside the lanes, Escape, the demonstration's
    task shift, the selection with its subtask).
  - Unit tests for the pure modules, named after their subject: snapping with
    an offset, the task shift, the auto-pan speed.
  - `ContextMenu`'s real position and its flip at the window edge in core's
    browser suite, beside the menu's own interaction tests.
- **Screenshots** follow `CONTEXT.md` **Baseline**: new examples bring new
  pictures; no existing schedule picture may move except where a ticket names
  it (the now line is off by default for exactly this reason).
- **Prior art:** the drag-and-assert pattern of `features-editing.spec.ts`
  (ghost label and data attributes before the drop, reported intent as JSON
  after it); the canvas-at-rest wait in the schedule's `navigation.ts`; the
  pure-module tests `snap.test.ts` and `ripple.test.ts`; charts'
  `features-interaction.spec.ts` for a tooltip read through the DOM; core's
  `features-dock.spec.ts` for a pointer gesture observable only in a browser.
- **Pinch** is reproduced through synthetic touch pointer events or a
  Ctrl-wheel, whichever the browser under Playwright delivers faithfully; the
  test states which and why.
- **Expected values come from an independent source**: times written as ISO
  text with offsets, spans worked out by hand from the example's declared
  domain.

## Out of Scope

- Keyboard operation and screen-reader access of subtasks and findings - a spec
  of its own (item 6 of the list this spec came from).
- Creating subtasks by drawing on an empty lane, and deleting by drag.
- Dragging subtasks out of the schedule into another component.
- A controlled domain prop beyond `initialDomain` plus the report; persistence
  of the view.
- A controlled selected-subtask prop.
- Moving a whole task by a gesture; the task shift is a function and a menu
  entry.
- Touch editing, including dragging in from outside by touch.
- A tooltip on the lane headers or the bands.
- Keeping a chart and a schedule in step automatically; the recipe is the
  application's.
- The charts' non-reproducible example pictures.

## Further Notes

- The two ideas parked after the first delivery - the selected subtask and the
  drag from outside - are user stories 37-43 here; the open questions noted
  then are decided above (the application declares the dragged item through a
  prop; the platform's drag and drop is the transport).
- The wheel change reverses a decision of the first spec, not an ADR; if a
  reviewer wants it recorded beyond the changelog, it is the size of an ADR
  addendum, not a new ADR.
- Recommended order for tickets: scene division first (it touches everything
  else), then wheel and auto-pan, tooltip and now line, snap offset and task
  shift, domain report and handle, selection with subtask, place intent and the
  drag from outside, the context menu position test, documents.
