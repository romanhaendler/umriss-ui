# The schedule

Status: done
Date:   2026-09-17
Origin: grilling session 2026-09-17; vocabulary in `CONTEXT.md` ("The
schedule"), decisions in ADR-0022 and ADR-0023.

## Problem Statement

An application team building plant software needs to show how work moves
through the plant: one task runs across several machines in a fixed order,
each stop has a main time plus setup and teardown, and between the stops lie
transports with durations of their own. A planner in front of that application
needs to see the whole picture — which machine does what and when, where a
task travels next, where two things claim the same machine at the same time,
and where a transport cannot possibly arrive in time — and needs to adjust it
by direct manipulation, without the display ever silently changing the plan
underneath them.

The workspace has nothing for this today. Charts can draw spans on lanes but
knows no editing, no panning, no zoom, no transports; the table is not a
picture of time at all.

## Solution

A fourth package, `@umriss-ui/schedule`. It shows **Subtasks** on **Lanes**
over time: lane headers at the left name the machines, a coarse axis band
above the plot area carries the calendar unit, a fine one below it carries
adaptive time ticks down to the quarter hour. Subtasks are drawn with their
main time, setup and teardown; **Transports** connect them as lines from end
to start; **Overlaps** and **Late transports** are drawn as findings — offset,
marked, never packed away — and reported as data.

The planner pans in both directions and zooms the time scale; headers and axis
bands hold still. Selection takes the whole **Task**. Editing is direct — drag
to move, edges to stretch, grips for setup and teardown on the selected
subtask — but controlled: the schedule shows a **Ghost** with live findings
and reports an **Intent**; the application decides whether the data moves
(ADR-0023). Right-click and every other pointer interaction is reported with
its target and position; a new `ContextMenu` component in `@umriss-ui/core`
gives applications the menu to open there, and the demo shows the wiring.

## User Stories

1. As a planner, I want every machine shown as a lane with a lane header at the left, so that I can read down one edge what each lane means.
2. As a planner, I want a coarse time band above the plot area and a fine one below it, so that I can read the day and the quarter hour without counting pixels.
3. As a planner, I want the fine ticks to adapt to the zoom (hour steps out wide, quarter-hour steps in close), so that the axis is always legible and never crowded.
4. As a planner, I want each subtask drawn so that main time, setup and teardown are distinguishable at a glance, so that I can tell work from preparation.
5. As a planner, I want all subtasks of one task to share one colour, so that I can follow a task across lanes.
6. As a planner, I want transports drawn as lines from one subtask's end to the next subtask's start, so that I can see where a task travels and how much time the move has.
7. As a planner, I want an overlap on a lane drawn offset and clearly marked, so that a double booking is a visible finding and never disappears into layout.
8. As a planner, I want a late transport marked the same way, so that a connection that cannot work is as loud as a double booking.
9. As a planner, I want to pan horizontally through time and vertically through lanes, so that the plan can be larger than the screen.
10. As a planner, I want to zoom the time scale with the wheel or a pinch, so that I can move between the week and the quarter hour.
11. As a planner, I want lane headers and both axis bands to hold still while I pan and zoom, so that I never lose the frame of reference.
12. As a planner, I want clicking one subtask to select its whole task — every subtask and every transport of it — so that I see everything the task touches.
13. As a planner, I want hover feedback on subtasks and transports, so that I know what a click would take.
14. As a planner, I want to drag a subtask to another time or another lane and see a ghost with live findings, so that I see the consequences before I drop.
15. As a planner, I want to stretch a subtask's main time at its edges, so that changing a duration is as direct as moving it.
16. As a planner, I want grips for setup and teardown to appear on the selected subtask, so that I can change each on its own without every subtask bristling with handles.
17. As a planner, I want drags to snap to the tick raster, so that times land on sensible boundaries.
18. As a planner, I want a right-click on a subtask, a transport or a lane to open a menu of actions, so that everything I can do is reachable where I am looking.
19. As a planner, I want my edit to change nothing until the application accepts it, so that the picture never disagrees with the plan of record.
20. As an application developer, I want the schedule controlled — it draws my data and reports intents — so that my application stays the single owner of the data (ADR-0023).
21. As an application developer, I want every pointer interaction reported with its target and position, so that I can attach my own behaviour, such as opening a menu.
22. As an application developer, I want a `ContextMenu` component in core that opens at a position, so that the right-click menu looks and behaves like every other core overlay.
23. As an application developer, I want to declare the schedule's contents by composition, so that it reads like the charts and the table do.
24. As an application developer, I want overlaps and late transports available as data, not only as pixels, so that I can list findings and act on them.
25. As an application developer, I want a pure ripple function beside the component, so that I can cascade a move over successors when my domain allows it — and not when it does not.
26. As an application developer, I want to declare per transport where its line anchors — at the main time or beyond setup and teardown — so that the line matches what the transport actually connects.
27. As an application developer, I want an operating-calendar option on the time scale, so that nights and weekends can be cut out of the axis when the plant does not run.
28. As an application developer, I want the task colours under my control, so that colour can mean what my domain needs.
29. As an application developer, I want snapping configurable, so that my raster can be the shift, the hour or nothing.
30. As an application developer, I want the schedule to follow the inherited `color-scheme` and load its own styles, so that light and dark work with no configuration (ADR-0021).
31. As an assistive-technology user, I want the schedule to carry an accessible name and the lane headers to be real text, so that the component is not a silent bitmap.
32. As a demo reader, I want a schedule demo in the shared shell with pages and examples, so that I meet the component before its source (ADR-0020).
33. As a demo reader, I want one demonstration wiring right-click to the core `ContextMenu` and intents back to data, so that the full recipe is copyable.

## Implementation Decisions

- **Package.** `@umriss-ui/schedule`, with `@umriss-ui/core` and
  `@umriss-ui/charts` as peer dependencies — the first dependency on charts
  (ADR-0022). It imports only the public entries of both; lint enforces this
  as it does for the table, and no package imports the schedule.
- **Vocabulary.** The `CONTEXT.md` section "The schedule" is binding: Schedule,
  Task, Subtask, Setup, Teardown, Transport, Late transport, Lane header,
  Intent, Ghost — and the avoided words (Gantt, timeline, row, bar, conflict,
  dependency …) hold in identifiers, prose and the demo.
- **Rendering.** Hybrid after the charts pattern: canvas layers for subtasks,
  transports and findings; DOM for lane headers, both axis bands and overlays.
  Composition through child elements that render nothing and register
  configuration; where drawing order matters it follows registration order.
- **Domain model.** A task has an identity and a colour, both the caller's. A
  subtask belongs to a task, sits on one lane and has a main interval plus
  optional setup and teardown durations. A transport goes from one subtask to
  another, has a duration, and declares where its two anchors sit relative to
  setup and teardown. Transports run end to start; there is no other kind.
- **Findings.** Overlap (per lane; setup and teardown occupy the lane) and
  late transport (successor starts before predecessor's end plus transport
  duration). Both are computed by pure functions, drawn offset and marked —
  never packed, never resolved — and exposed programmatically.
- **Axes and scale.** The scale is affine (ADR-0001); pan and zoom exchange
  the domain and nothing else. Top band: calendar unit (day). Bottom band:
  adaptive time ticks, hour down to quarter hour with zoom. The operating
  calendar is an option of the scale from the start; wall clock is the
  default. Deriving a calendar from shift patterns stays above the library.
- **Interaction.** Click, right-click and hover are reported with the hit
  (subtask, transport, lane, or nothing) and positions. Selection is
  task-wide. Editing per ADR-0023: intents (move, stretch main time, set
  setup, set teardown, change lane) with a live ghost assessed like data.
  Grips are staged: drag moves, edges stretch the main time, setup/teardown
  grips appear on selection. Snapping is configurable, default tick raster.
- **Ripple.** A pure function — given subtasks, transports and one change,
  return the cascaded changes — ships in the package; the component never
  applies it.
- **ContextMenu.** A new public core component: opens at a given position,
  built on `Popover`, reusing `MenuItem` and `MenuSeparator` and the `Menu`
  keyboard behaviour. The schedule does not import it; the demo wires the two.
- **Size.** Sized for roughly 20 lanes and hundreds of tasks; no
  virtualisation.
- **Styling.** Core regime: CSS modules, `--u-*` tokens, `light-dark()`,
  cascade layers, self-loading stylesheet, own text context and box model
  (ADR-0021).
- **Demo.** Its own demo on the shared shell (ADR-0020), pages and examples
  as documentation, at most one demonstration: the intent round trip with the
  `ContextMenu`. Rubrics are decided when the demo is built, against the demo
  vocabulary.

## Testing Decisions

- Tests observe external behaviour only: what is drawn, what is reported,
  what the DOM chrome says — never scene internals or registration plumbing.
- The highest seam is the demo: the package's browser suite drives the demo
  pages, following the house pattern every package shares —
  `screenshots.spec.ts` for the pictures, `features-<subject>.spec.ts` for
  behaviour, `accessibility.spec.ts` for the axe run, with `pages.ts` and
  `navigation.ts` as the derived lists. Prior art: the suites of core, table
  and charts.
- Canvas output is checked by screenshot baselines, under the Checking rules
  of `CONTEXT.md`: named exceptions at their site, no bulk rebuilds.
- Editing is tested through the seam: a browser test performs the drag and
  asserts the reported intent and the findings shown on the ghost — not the
  pixel mechanics in between.
- The pure modules — findings, ripple, tick and zoom arithmetic, snapping —
  get unit tests named after their subject, as the workspace's unit tests
  are.
- `ContextMenu` is tested in core the way `Menu` is: keyboard cycle, focus
  return, portal behaviour, plus its one novelty — opening at a position.

## Out of Scope

- Auto-ripple as component behaviour: the cascade ships only as a pure
  function (ADR-0023).
- Deriving the operating calendar from shift patterns, exceptions and
  holidays — a plant data problem above the library.
- Virtualisation of lanes or subtasks.
- Transport kinds other than end to start.
- Persistence of pan, zoom or selection — where a view is remembered is the
  application's business, as with the table's View.
- Undo and redo: the owner of the data owns its history.
- Creating or deleting subtasks and transports by drag. Version one edits
  times and lanes; structure changes come through the caller's own UI, for
  which the reported interactions and the `ContextMenu` are the hooks.
- Touch editing beyond pan and pinch zoom.

## Further Notes

- The glossary section, ADR-0022 and ADR-0023 were written with this spec;
  the spec quotes them rather than restating them.
- When the package lands, the workspace prose that counts packages and demos
  (`CLAUDE.md`, ADR-0020's "all three demos") needs the small factual update.
- Visible strings, if any, follow ADR-0018/0019: English default; if the
  schedule needs wording entries, it follows the same mechanism the table
  uses.

## Comments

### Status corrected (2026-09-24)

Delivered in commits `schedule 01`-`08` and the review follow-up; released as `@umriss-ui/schedule` 0.1.x. The Status line had not been moved when the work landed.
