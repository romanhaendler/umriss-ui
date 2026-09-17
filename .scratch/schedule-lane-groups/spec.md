# One language for the bars, a refusal one can see, a demo one can copy, and lanes that fold

Status: done
Date:   2026-09-17
Origin: Roman's review after `schedule-legibility` was delivered - the bar
appearances "do not fit and are not thought through", a refused move is not
clear enough, the demo has too few chapters with too much on a page and code
that cannot be run as copied, and one new feature: lanes that fold. The
decisions below were taken with him on the same day: the collapsed group shows
a **miniature**, groups nest to **any depth**, the bar system proposed here goes
into the spec **directly** (no prototype round), and every example **carries its
own data**.

## Delivered

All eleven tickets, each with its own commit and its own delivery report in
`issues/`. What was decided along the way and is not in the spec:

1. **`dropEffect` follows the ghost and not the pointer.** The spec asked for
   `"none"` over a refused lane; the platform then delivers no `drop` event at
   all, and a release over a refused lane would have placed nothing while the
   ghost still stood somewhere allowed. Roman chose: the ghost stays the
   promise. Ticket 01.
2. **The spring-open delay stayed a constant**, against the spec's "the timer
   is given to the scene like `now`". Ticket 10 says why and names the cheaper
   door if the wait becomes a cost.
3. **The fifth why page moved from 06 to 09**, where the miniature it describes
   exists.
4. **`where-it-may-go` has two examples**, not one: the refusal within the plot
   and the same rule for work dragged in. Ticket 06 says what to cut if that
   reads as teaching drag-in twice.
5. **`ResolvedAppearance.hatched` keeps its name**, as the spec instructed, and
   its doc now names the channel it really owns. Ticket 02 flags it.

### What the review changed

`/code-review` ran both axes over the eleven commits and found four things the
delivery had got wrong. All four are repaired:

- **The group headers were not under "nothing in its own way"**, which the
  Testing Decisions ask for by name. A header's row is the clipping box now.
- **A late transport inside a folded group was not marked on its row** (user
  story 31 says "an overlap or a late transport"). It is.
- **An `open` bar that passes neither edge faded at its own end.** The table
  says "at whichever edge of the view the bar passes", and the deviation had a
  cost the deviation had not seen: the fixed painting order then let the fade
  eat a `fixed` bar's cap where there really was an end to mark. The spec's
  letter is restored.
- **Ticket 04 claimed Out of Scope demanded the change to the charts' demo.**
  It does not; what forced it was the check being called by all four suites.
  The report says so now, with what to undo if the call was wrong.

Three vocabulary clashes the review found were settled in `CONTEXT.md` and
ADR-0025 rather than in the code: **Page** now says a page is a component where
a package is a shelf of components and a FEATURE where it is one component with
two dozen things to say; **Grip** qualifies its `_Avoid_: handle` against
`ScheduleHandle`, which is not a grip and not drawn; and ADR-0025 stops
claiming *row* appears nowhere in the API, because `data-row` is on a header on
purpose.

One it found and could not settle: **`ResolvedAppearance.hatched`** is a public
name that now means capped ends, and the entry **Appearance** says a hatch
means a refused lane. The spec forbade renaming it ("`resolveAppearance` stays
as it is"), so it stands, flagged in ticket 02 and here. It is one rename away
from consistent.

Two findings that belong to no ticket of this spec and are recorded rather than
fixed: `onDomainChange` and `initialDomain` can stand a frame apart (ticket 04),
and a muted bar is the closest thing in the picture to a setup (ticket 02).

## Problem Statement

- **The appearances are four inventions, not one system.**
  - `provisional` dashes its outline *and* drops the fill to 45 per cent - while
    a faint fill already means setup or teardown in this picture, the very
    reason `muted` was made slim instead of faint.
  - `fixed` hatches the whole face: the loudest pattern for the calmest
    statement, and it lies under the bar label.
  - `muted` is half as high, loses its label and reads as a different kind of
    thing.
  - The progress rail runs on under the teardown and sits off the bar.
  - `open` fades the right end only; a bar that began before the view says
    nothing.
  - Hover and selection are the same colour and almost the same rectangle:
    hovering a selected bar shows nothing, and the subtask that was clicked
    cannot be told from its siblings.
- **A refused lane is a word in bold.** No cursor, no mark on the lane, nothing
  before the pointer is already there. A drag from outside even shows the
  "copy" cursor while it is refused. And a refused drop throws away the move in
  time together with the lane change.
- **The demo is seven chapters for a component with twenty-five things to say.**
  `Intent/04-drag-in` shows about seven features, `05-where-it-may-go` teaches
  drag-in a second time to show one prop, `Transports/03-routes` is three props
  in five schedules. Eleven of twenty-six examples import `../../data`, ninety
  lines of plant the reader never sees - the code shown is not the code that
  can be run. The schedule is the only demo without a single *why* page.
- **Twenty lanes are twenty lanes.** A plant has machine groups, halls, lines;
  the schedule has a flat list and one height. A planner who works on the
  presses scrolls past everything else.

## Solution

Four pieces:

- **One channel per statement.** Fill says how binding the work is, the ends say
  whether it may move, saturation says whose it is, a rail says how far it is,
  a fade says it goes on. No channel is used twice, and the faint fill stays
  what it was: setup and teardown.
- **A refusal seen before it is met.** When a drag begins, the lanes the subtask
  may not go to are drawn back and hatched; over one of them the cursor says
  so, and a tether ties the ghost to the pointer it is not following. Still no
  warning colour: **Refusal** is not an error (`CONTEXT.md`).
- **A demo cut by feature, with code that runs.** About twenty-five chapters,
  one feature per example, every example with its own few lines of data, *why*
  pages, and a check that keeps it so.
- **Lane groups.** `<LaneGroup>` around lanes and other groups, to any depth,
  with a controlled collapsed state. A collapsed group is one row that shows a
  **miniature** of everything in it - every lane a thin strip - so that a bar
  never loses its place: transports still arrive, findings still show, hover
  and selection still work.

## User Stories

### One language for the bars

1. As a planner, I want provisional work drawn hollow with a dashed outline, so that I can tell it from a setup, which is faint, at a glance.
2. As a planner, I want fixed work marked at its ends and not across its face, so that I can still read its label.
3. As a planner, I want another shift's work at full height but drawn back in colour, so that it keeps its label and still does not shout.
4. As a planner, I want muted work to be told from a setup without doubt, so that the distinction I objected to once does not return.
5. As a planner, I want the progress rail to lie within the main time, so that it measures the work and not the teardown.
6. As a planner, I want a bar that began before the view to fade at the left as one that continues fades at the right, so that neither edge of the screen reads as an end.
7. As a planner, I want any combination of appearances to be readable, so that fixed, muted work that runs on is still three statements and not a smear.
8. As a planner, I want hover to be a different kind of mark from selection, so that I see what I point at on a selected task.
9. As a planner, I want the subtask I clicked to stand out among its task's selected bars, so that I know which one the grips belong to.
10. As an application developer, I want the list of appearances and its words unchanged, so that my data does not change because the picture did.
11. As a maintainer, I want the rule "one channel per statement" written where the drawing is, so that the fifth appearance does not become a fifth invention.

### A refusal one can see

12. As a planner, I want the lanes a subtask may not go to marked the moment I start dragging, so that I know before I try.
13. As a planner, I want the cursor to change over a refused lane, so that my hand knows what my eye may have missed.
14. As a planner, I want a line from the ghost to my pointer while the ghost stays behind, so that I see it is held on purpose and not stuck.
15. As a planner, I want a drag from outside to show the same marks and the "no drop" cursor, so that both ways of placing work speak alike.
16. As a planner, I want a drop on a refused lane to keep the move in time on the last allowed lane, so that one refusal does not cost me the other half of my gesture.
17. As a planner, I want none of this to look like an error, so that a rule of the plant does not read as a mistake of mine.
18. As an application developer, I want `canMoveTo` asked again at the drop of a drag from outside as it is for a drag within, so that a rule that changed during the drag holds either way.
19. As an application developer, I want the refused lanes in the snapshot, so that my own styling beside the schedule can follow.

### A demo one can copy

20. As a reader of the demo, I want every example to run as copied, so that I paste it and see a schedule.
21. As a reader of the demo, I want one feature per example, so that the code I read is the code for what I came for.
22. As a reader of the demo, I want a chapter per feature, so that the outline is the table of contents of the component.
23. As a reader of the demo, I want the demonstration to show its plant data in a second code tab, so that the one large example is copyable too.
24. As a reader of the demo, I want *why* pages as the other demos have, so that I learn why a lane is not a row and why nothing is packed.
25. As a maintainer, I want a check that no example imports anything but the package, so that the next shared fixture is a failing test.
26. As a maintainer, I want the re-cut delivered chapter by chapter with the feature specs moved along, so that no ticket renews pictures it cannot account for.

### Lanes that fold

27. As a planner, I want to fold a group of lanes into one row, so that I see the part of the plant I work on.
28. As a planner, I want groups within groups, so that the plan follows the plant: hall, line, machine.
29. As a planner, I want the folded row to show every lane in it as a thin strip with its work in the tasks' colours, so that a folded group still tells me how busy it is and with what.
30. As a planner, I want a transport into a folded group to arrive at its strip, so that connections do not vanish because I tidied up.
31. As a planner, I want an overlap or a late transport inside a folded group to show on its row, so that folding never hides a finding.
32. As a planner, I want to hover and select work in the miniature, so that folding costs me detail and not access.
33. As a planner, I want a folded group to open when I hold a dragged bar over it, and to close again after the drop, so that I can move work into a group without preparing the view first.
34. As a planner, I want no grips in the miniature, so that I do not stretch a bar three pixels high.
35. As a planner, I want a group's header to say how many lanes it holds, so that I know what is behind it.
36. As a planner, I want the fold control to be a real button, so that I can reach it by keyboard and a screen reader says whether the group is open.
37. As an application developer, I want to declare groups by composition, so that a group reads in JSX as it reads in the plant.
38. As an application developer, I want the collapsed state controlled, with an uncontrolled default, so that I can store it, link two schedules or leave it alone.
39. As an application developer, I want findings, `canMoveTo` and every intent to speak of real lanes only, so that folding never changes what is true or what is reported.
40. As an application developer, I want the inner groups' state kept while an outer group is folded, so that opening it again gives back the view I had.
41. As an application developer, I want `clientPointOf` and `positionAt` to answer for a folded lane with its strip, so that my pins keep pointing at the work.
42. As a reader of this repository, I want the decision and the word recorded, so that "a lane is not a row" and "never packed into sub-lanes" are seen to stand.

## Implementation Decisions

- **The bar system.** `SubtaskAppearance` and `resolveAppearance` keep their
  words and the contradiction rule; only `drawSubtask`, `barRect` and the
  constants move.

  | statement | channel | drawing |
  |---|---|---|
  | setup, teardown | faint fill | unchanged: 28 per cent and a hairline |
  | `provisional` | fill | **no fill** over the surface, dashed outline in the task colour at full weight; the label takes the text colour |
  | `fixed` | ends | a cap at each end of the main time, 3 px, in the colour the label would take on this bar; no hatch |
  | `muted` | saturation | full height, the task colour mixed half with the surface, **opaque and without outline** - a setup is transparent and outlined, so the two cannot be confused |
  | `progress` | rail | within `[mainFrom, mainTo]` only, inset from the bottom edge |
  | `open` | fade | at whichever edge of the view the bar passes, left or right |

  - Order of painting is fixed and written at the site: fill, rail, caps, fade,
    outline. The fade is last but the outline, so a fixed bar that runs on
    loses its cap there - which is the statement.
  - `barRect` no longer halves a muted bar; the label check follows.
  - Hover becomes a lightening of the bar (a surface-coloured wash), selection
    stays an outline; the clicked subtask's outline is 2 px, its siblings' 1 px.
- **The refusal.**
  - At the start of an edit with `lane` among the intents, and at the first
    `dragOver` of a placing, `canMoveTo` is asked once per real lane; the
    answer is held for the gesture and drawn: refused lanes get a wash of the
    surface's muted tone and a fine hatch. (The hatch leaves the bars and
    arrives here: "not available" is what a hatch says on a plan.)
  - Over a refused lane: `cursor: not-allowed`, `dropEffect = "none"`.
  - The tether is a 1 px dashed line in the text colour from the ghost's
    nearest edge to the pointer, drawn only while `refused`.
  - The drop: the ghost is on an allowed lane by construction, so the intents
    of that ghost are reported - `move` survives a refused `lane`. `drop()` of a
    placing re-asks `canMoveTo` as `pointerUp` does.
  - The snapshot's ghost summary gains `refusedLanes: readonly string[]`.
  - `.refusal` keeps its wording and stays without a warning colour.
- **The demo.**
  - Every example defines its data in the file, small and made for the feature,
    with the `at()` helper the self-contained ones already use. `demo/data.ts`
    stays for `99-demonstration` alone.
  - The shell (`@umriss-ui/demo`) learns one thing: an example may name sibling
    files to show, each as a further tab of the code view, and Copy takes the
    tab in front. No other demo uses it yet.
  - A check beside `ownBase` in `@umriss-ui/demo/checks`: an example imports
    from the package's `src` and from npm only; shown siblings are the named
    exception.
  - Chapters, by rubric (names may still move in delivery; the cut may not):
    - **Drawing:** First schedule · Lanes · Lane groups · Time axis and
      calendar · Pan and zoom · Now line · Subtasks · Bar labels ·
      Appearances · Overlap · Transports · Routes
    - **Reading:** Selection · Interactions · Tooltip · Linked schedules ·
      The handle
    - **Editing:** Move and lane · Stretch, setup, teardown · Snapping ·
      Placing from outside · Where a subtask may go · Ripple · Demonstration
    - **Findings:** Findings as data
  - One feature per example: `routes`, `attach` and `ends` become three
    examples; each appearance its own plus one of combinations; drag-in is
    taught once, and `where-it-may-go` shows a drag within and links to
    placing.
  - *Why* pages, at least: a lane is not a row · an overlap is never packed ·
    the schedule changes nothing (ADR-0023) · a refusal is not an error · a
    folded group keeps every bar its place.
  - The feature specs' fixture coupling (`plot.ts`, ids `a-2041-1`…) moves with
    the example it belongs to: a spec reads the data of the example it tests.
- **Lane groups.**
  - **The word.** *Lane group* enters `CONTEXT.md`; an ADR (0025) records: a
    group is structure over lanes and never a lane - nothing sits on a group,
    nothing is reported for one, findings are per lane. The folded row is a
    *miniature*: the real lanes at a smaller scale, not a packing. Both
    standing sentences - "a lane is not a row", "never packed into sub-lanes" -
    are cited as still true.
  - **Declaration.** `<LaneGroup id label>` with `<Lane>` and `<LaneGroup>`
    children. A group gives its id to its children through context;
    `LaneConfig` gains `parent?: string`, and `SceneData` derives the tree in
    registration order as it derives `laneIndex` today.
  - **State.** `collapsedGroups?: readonly string[]`,
    `defaultCollapsedGroups?`, `onCollapsedGroupsChange?` on `<Schedule>` - the
    shape `selectedTask` has. Not an **Intent**: folding changes the view, not
    the plan. A folded outer group hides inner ones without touching their
    entries in the list.
  - **Rows.** The layout stops multiplying. A pure module beside `geometry.ts`
    turns the tree and the collapsed set into **rows** - the module's private
    word, never the API's - each with `top`, `height` and a kind: `lane`,
    `groupHead` (open group: a slim head, 24 px, empty in the plot but for a
    hairline) or `miniature` (folded group). `laneTop`/`laneAt` become a prefix
    sum and a binary search over them; bar height becomes per row. Every real
    lane resolves to a **slot**: its own row, or its strip within a miniature.
  - **The miniature.** Height `max(laneHeight, leaves × 4 px + insets)`, so a
    strip is never thinner than 3 px and a large group folds to a taller row
    instead of an unreadable one. A strip draws main time in the task colour,
    setup and teardown faint, nothing else - no appearance, no label, no rail.
    Inner groups show as a hairline between strips. Overlap keeps its danger
    mark, drawn over the strip and as the bar at the row's top.
  - **Hit, hover, selection, tooltip** work on strips through the same boxes.
    Grips are not published for a box in a miniature.
  - **Transports** take their y from the slot, so they arrive at strips; the
    `attach` rule compares slots' tops instead of lane indices.
  - **Dragging over a folded group.** 600 ms of rest over a miniature opens it
    *for the gesture*: the scene holds a transient open set, the rows are laid
    out again, the ghost continues; at the end of the gesture it is dropped.
    The caller's list is never touched and `onCollapsedGroupsChange` is not
    called - the application did not fold anything. Without that rest, a
    miniature is not a drop target: `laneIdAt` answers no lane there.
  - **The header column.** Group heads and miniatures get a header with a
    chevron button (`aria-expanded`, `aria-controls`), the label, and the count
    of lanes within; children indent by one step per depth, the step a token.
    Wording: two entries (fold, unfold) in English and in `wording/de`.
  - **The handle.** `clientPointOf` answers with the slot; `positionAt` over a
    miniature answers the strip's lane.

## Testing Decisions

- **Seams: the ones the package has.** Unit tests for pure modules, the demo in
  the browser for everything visible. One new pure module (rows) - and it is
  written test-first, because every y in the package will come from it.
  - Unit: rows (flat list equals today's arithmetic exactly; nested; folded;
    folded inside folded; the miniature's height; `laneAt` as the inverse of
    `laneTop` over random trees), slots, the transient open set, the refused
    lanes of a gesture, `resolveAppearance` untouched and still green.
  - Browser, `features-schedule`: each appearance through occupied canvas
    pixels (hollow centre, caps at the ends, left fade); hover against
    selection; a group folded by its button, by keyboard, controlled from
    outside; a transport arriving at a strip; a finding visible on a folded
    row.
  - Browser, `features-editing`: refused lanes marked at drag start, cursor,
    tether, `move` reported after a refused `lane`, the same for a placing with
    `dropEffect`; spring-open after rest, closed after drop, no
    `onCollapsedGroupsChange`.
  - The check of `schedule-legibility` ("nothing in its own way") runs over the
    new chapters unchanged and must cover group headers: a header never leaves
    its row.
- **Pictures.** Three tickets may renew pictures in bulk, each stating the
  count read beforehand, as `CONTEXT.md` **Baseline** demands: the bar system
  (every picture with an appearance, a hover or a selection), and the two demo
  re-cuts (renamed and split examples; a rename must show an unchanged picture
  under a new name, and the ticket says how it verified that). The row layout
  ticket must renew **none**: a flat schedule is pixel-identical before and
  after, and that is its acceptance.

## Out of Scope

- Keyboard operation of the plot itself and screen-reader access to bars -
  still its own spec. The fold button is reachable because it is a button.
- Virtualising rows or headers.
- Anything sitting on a group: group-level subtasks, summaries computed by the
  schedule, utilisation bands. The miniature is the real work, smaller.
- Dragging lanes between groups, reordering, or folding by drag.
- Animating the fold.
- Deriving groups from data (`group` on a lane object): composition only.
- New appearances or new words in the list; per-task or per-subtask overrides
  of the appearance drawing.
- Per-lane heights as an API. Rows have heights; callers still give one
  `laneHeight`.
- A documentation site, and the other three demos' structure.

## Further Notes

- Recommended order: the refusal (small, independent, fixes two defects), the
  bar system, then the demo re-cut - so that the group work lands in a demo
  that already has a chapter waiting for it - then rows, groups, miniature,
  dragging over groups, documents.
- The hatch changes owner in this spec: off the `fixed` bar, onto the refused
  lane. The two tickets should land in that order or together, so that no
  commit shows a hatch meaning two things.
- The working tree held uncommitted follow-up work of `schedule-legibility`
  when this spec was written (routes, `where-it-may-go`, formats). It is not
  part of this spec and should be committed before ticket 01 begins.
- `Schedule.tsx` references `styles.headerRun`, which `Schedule.module.css`
  does not define. The header ticket (08) touches that element and settles it.
