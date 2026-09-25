/* The outline of the demo of @umriss-ui/schedule - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it. One page per thing a
   reader looks up by name, as in the other demos.

   Cut by FEATURE, not by component (schedule-lane-groups 05 and 06). The
   schedule is one component with some twenty-five things to say, and a demo
   whose pages are its four exports had to put seven of them on one page: a
   reader who came for the now line read past pan, zoom, the tooltip and the
   selection to reach it. The outline is now the table of contents of the
   component - a reader looks up "Bar labels" and finds a page about bar
   labels, with one example per feature on it.

   Getting started comes first: what an application installs and hands over.
   The other rubrics answer four questions a planner's application asks in turn: what
   the schedule DRAWS, what a reader takes OUT of it, how it is EDITED, and
   what it FINDS. There is no page called after the `Intent` type any more:
   every editing chapter is about the intents it raises, and a reader looking
   for "how do I move a bar" looks up *Move and lane*, not a type name
   (ADR-0023 stands behind all of them).

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else - the folder is named like the page,
   in the component's spelling. */

import { addresses } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "getting-started",
    name: "Getting started",
    sentence: "What an application installs and hands over before the first plan.",
    pages: [
      {
        id: "installation",
        name: "Installation",
        sentence: "Install the schedule with its two peers and hand it plain data: lanes, tasks, subtasks and dependencies. It draws them and reports what a planner wants to change.",
        about: [
          "Install it with its peers: `pnpm add @umriss-ui/schedule @umriss-ui/core @umriss-ui/charts`, with React 18 or 19. The stylesheets load themselves - each package's script imports its own, so there is nothing to import by hand; `@umriss-ui/schedule/styles.css` stays exported for setups that link stylesheets themselves.",
          "The plan is plain data (ADR-0023). A lane is a person, a vehicle or a room, declared in JSX by its id. A task is an id, a colour and a name; a subtask is a main time on one lane, belonging to a task, with an optional lead-in and lead-out; a dependency joins two subtasks of one task with a lag. Times are epoch milliseconds.",
          "The schedule reports, the application decides. It draws the data it is given and changes none of it: a drag ends in an intent reported to `onIntent`, and only the application's own state update moves a bar. Without `intents` the schedule is read-only - see [Move and lane](#/move-and-lane).",
        ],
        types: [],
        exports: ["Schedule", "Lane", "Subtasks", "Dependencies"],
      },
    ],
  },
  {
    id: "plan",
    name: "Plan",
    sentence: "What the schedule draws: work on lanes, and everything a bar says besides its colour.",
    pages: [
      {
        id: "schedule",
        name: "First schedule",
        sentence: "Work on lanes over time, with a day band above and time ticks that follow the zoom (also called a Gantt chart, resource plan or timeline). Reach for it when a planner needs to see who or what is busy when, and what does not fit.",
        about: [
          "Lanes stand in the order they are declared; a subtask on a lane that is not declared is not drawn. Declare `Dependencies` before `Subtasks` and its lines run beneath the bars.",
          "What cannot work is drawn, never repaired: two subtasks on one lane at once, a dependency whose lag does not fit, work in blocked time. [Findings as data](#/findings) returns the same list for the application to act on.",
          "The plot is one tab stop. The keys walk the subtasks as the pointer would hover them, the tooltip names the active one, and a live region reads it once the keys rest (ADR-0030, ADR-0033).",
        ],
        keys: [
          { key: "Tab", action: "Moves the focus into the plot; the first subtask in view becomes the active one." },
          { key: "← / →", action: "The previous or next subtask on the same lane." },
          { key: "↑ / ↓", action: "The nearest subtask on the lane above or below." },
          { key: "Home / End", action: "The first or last subtask on the lane." },
          { key: "PageUp / PageDown", action: "Along the lane by about a tenth of the visible span." },
          { key: "] or t", action: "Out along the active subtask's dependency; pressed again, on to the subtask it arrives at." },
          { key: "[ or Shift+T", action: "Back along the dependency to the subtask it leaves." },
          { key: "Enter / Space", action: "Selects the active subtask's task, as a click does." },
          { key: "Escape", action: "Lets go of the active subtask." },
          { key: "Alt+← / Alt+→", action: "Proposes a move by one step of the raster, where the application handles `move`." },
          { key: "Alt+Shift+← / →", action: "Proposes a new end, where the application handles `stretch`." },
        ],
        limits: [
          "No dependency types, critical path or auto-scheduling: the application decides where work goes, the schedule shows the result and its findings (ADR-0032).",
          "No milestones yet: a point in time on a lane has no mark of its own.",
          "A dependency joins two subtasks of one task; dependencies across tasks are not yet possible.",
        ],
        types: ["ScheduleProps"],
        exports: ["Schedule", "Lane", "Subtasks", "Dependencies"],
      },
      {
        id: "lane",
        name: "Lanes",
        sentence: "One row per person, vehicle or room, named by its header and kept in the order it is declared, however many there are (also called resources).",
        about: [
          "A lane is declared by its id, the one subtasks name, and a label. The label is content, not a string: a name with a plate number, a status beside it. It is real text, read by a screen reader, and it stays at the left edge while the plot pans.",
          "A lane keeps its height whatever lies on it. Nothing is moved to another lane to make room: two subtasks on one lane at once are a finding (see [Overlap](#/overlap)).",
        ],
        alternatives: [{ when: "Lanes that belong together, folded into one row", use: "lane-groups" }],
        types: ["LaneProps"],
        exports: ["Lane"],
      },
      {
        id: "lane-groups",
        name: "Lane groups",
        sentence: "Teams, depots or regions over the lanes, to any depth, folded into one row when a planner wants only the part they work on.",
        about: [
          "A group is structure, never a lane: nothing sits on it, no finding is reported for it and no intent names it (ADR-0025). The lanes keep the order they were declared in, whatever group they are in.",
          "Folded, a group shows a miniature: every lane in it as a thin strip with its work in the tasks' colours. Dependencies still arrive at the right strip, findings are marked on the row, and a strip can be hovered and selected. Labels, appearances and grips need room and wait for the group to open.",
          "Folding is a view state and never an intent. `collapsedGroups` and `onCollapsedGroupsChange` hand it to the application; left out, the schedule keeps it.",
        ],
        keys: [
          { key: "Tab", action: "Reaches each group's fold button - the only buttons the schedule puts in the tab order." },
          { key: "Enter / Space", action: "Folds or unfolds the group." },
        ],
        limits: ["A folded group shows no summary - no utilisation band, no bar spanning its work: a computed claim would look like a drawn fact (ADR-0025)."],
        types: ["LaneGroupProps"],
        exports: ["LaneGroup", "Lane"],
      },
      {
        id: "subtasks",
        name: "Subtasks",
        sentence: "The bars: a main time with an optional lead-in before it and lead-out after it, in the colour of the task they belong to (also called bookings or assignments).",
        about: [
          "Lead-in and lead-out are durations beside the main time, not times of their own: moving the subtask takes them along. They are drawn faint in the task's colour, so preparation reads as belonging to the work and as not being it, and they occupy the lane as the main time does.",
        ],
        types: ["SubtasksProps", "Subtask", "Task"],
        exports: ["Subtasks"],
      },
      {
        id: "bar-labels",
        name: "Bar labels",
        sentence: "A line of text inside each bar: cut off where the bar is too narrow, left out where it would say nothing, and held at the view's edge while the bar runs on.",
        about: [
          "The text lies on the main time, not on the lead-in. Its colour follows the bar: light text on a dark bar, dark text on a pale one, measured by contrast in either theme.",
        ],
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "appearances",
        name: "Appearances",
        sentence: "What a bar says besides its colour: provisional, fixed, muted, running on past the view, and how far the work has got. Each takes one channel of the drawing, so several on one bar stay readable.",
        about: [
          "`\"provisional\"` owns the fill (none at all), `\"fixed\"` the ends (a cap inside each), `\"muted\"` the saturation, `\"open\"` a fade at the edge of the view, and `progress` a rail inside the main time. The faint, outlined fill belongs to a lead-in and a lead-out and to nothing else.",
          "`\"provisional\"` and `\"fixed\"` contradict, and the later one in the list wins. `resolveAppearance` is that rule, exported for the application to read as well.",
        ],
        types: [],
        exports: ["Subtasks", "resolveAppearance"],
      },
      {
        id: "overlap",
        name: "Overlap",
        sentence: "Two subtasks claiming one lane at the same time (also called a double booking or conflict): both drawn, offset and marked, never packed into sub-lanes.",
        about: [
          "The later bar is offset a few pixels and edged, and the shared time is marked across the lane. Lead-in and lead-out occupy the lane too, so a lead-out meeting the next lead-in is an overlap. The offset stops at three levels and never leaks into the lane below.",
        ],
        alternatives: [{ when: "The overlaps as a list to count and act on", use: "findings" }],
        limits: ["No stacked layout on request yet: an overlap is always drawn offset, as the finding it is."],
        types: [],
        exports: ["Subtasks"],
      },
      {
        id: "dependencies",
        name: "Dependencies",
        sentence: "Lines from one subtask's end to the next one's start within a task, with the lag that must pass between them (also called links or predecessors). A lag that does not fit is marked, not repaired.",
        about: [
          "`leaves` and `arrives` say what a dependency connects - the main time, or the outer edge of the lead-out and the lead-in - and so decide whether it is violated. `attach`, `ends` and `route` only change how the line is drawn.",
          "Nothing moves to make a dependency fit. [Ripple](#/ripple) computes the moves that would, for the application to run or not.",
        ],
        alternatives: [{ when: "The shape of the line", use: "routes" }],
        limits: ["Only finish-to-start within one task; no dependency types and no critical path (ADR-0032)."],
        types: ["DependenciesProps", "Dependency"],
        exports: ["Dependencies"],
      },
      {
        id: "routes",
        name: "Routes",
        sentence: "The shape of a dependency's line: a curve that leaves and arrives forwards, a straight line, or orthogonal segments. Set it for the schedule, or for one dependency.",
        types: [],
        exports: ["Dependencies"],
      },
    ],
  },
  {
    id: "time",
    name: "Time",
    sentence: "The axis the work stands on: the calendar, blocked time, the now line, and moving through it.",
    pages: [
      {
        id: "time-axis",
        name: "Time axis and calendar",
        sentence: "A day band that names the days and a time band whose ticks follow the zoom, from quarter hours to days. A working calendar cuts the hours nobody works out of the axis.",
        about: [
          "The calendar is a list of intervals in which time counts, nothing more; deriving it from opening hours and holidays is the application's business. A dotted line marks each seam, and a drag that would end in removed time stops at the seam where time counts again.",
        ],
        alternatives: [{ when: "Time a single lane is not available", use: "blocked-time" }],
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "blocked-time",
        name: "Blocked time",
        sentence: "Leave, maintenance and other time a lane is not available: hatched behind the work, a finding where work covers it, and closed to a drag.",
        about: [
          "Blocked time is data beside the work: one list, each interval naming its lane, as a leave table or a maintenance plan holds it. `findings` takes the same list as its third argument.",
          "Work the data already put into blocked time is never locked there: it may be moved within it and out of it, and the finding stays until it is.",
        ],
        alternatives: [{ when: "Hours nobody works, on every lane", use: "time-axis" }],
        types: ["BlockedTimesProps", "BlockedTime"],
        exports: ["BlockedTimes", "findings"],
      },
      {
        id: "now-line",
        name: "Now line",
        sentence: "A line across the lanes at the present moment, so that whatever should have happened by now stands to its left. It follows the clock, or stays at a fixed instant for a replay.",
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "pan-and-zoom",
        name: "Pan and zoom",
        sentence: "Moving through a plan with the gestures of any scrolling surface: drag, wheel, Ctrl with the wheel, and a pinch. Only the view moves; the plan stays as it is.",
        about: [
          "Dragging the background pans through time and through the lanes. The wheel scrolls the lanes and hands the scroll back to the page at their end; Shift with the wheel pans through time; Ctrl or ⌘ with the wheel, or a pinch, zooms around the pointer.",
          "Nothing is reported and no intent is raised: pan and zoom change the visible span and nothing else (ADR-0001). `onDomainChange` reports the span for a second view to follow - see [Linked schedules](#/linked-schedules).",
        ],
        types: [],
        exports: ["Schedule"],
      },
    ],
  },
  {
    id: "reading",
    name: "Reading",
    sentence: "What a planner takes out of the picture: what is selected, what the pointer is on, and what a second view makes of it.",
    pages: [
      {
        id: "selection",
        name: "Selection",
        sentence: "A click on a bar selects its whole task on every lane, so a planner sees every part of one job at once (also called highlighting). Reach for it when a list or a detail panel beside the plan should follow what was picked.",
        about: [
          "The schedule keeps the selection itself unless you pass `selectedTask`; then your state holds it and every change is reported. The report also names the subtask that was clicked, the one the editing grips belong to.",
          "Selection and hover are two different marks: the selected task is outlined, the one under the pointer washed, and both show at once.",
        ],
        keys: [
          { key: "Tab", action: "Focuses the plot; the first subtask in view becomes the active one." },
          { key: "← →", action: "The previous or next subtask on the same lane." },
          { key: "↑ ↓", action: "The subtask on the lane above or below that lies nearest in time." },
          { key: "Home End", action: "The first or last subtask on the lane." },
          { key: "Page Up Page Down", action: "A tenth of the view back or on along the lane." },
          { key: "] or T", action: "Out along the dependency that leaves the active subtask." },
          { key: "[ or Shift+T", action: "Back along the dependency that arrives at it." },
          { key: "Enter or Space", action: "Selects the active subtask's task, as a click does." },
          { key: "Escape", action: "Lets go of the active subtask." },
        ],
        limits: ["One task at a time: there is no multiple selection."],
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "interactions",
        name: "Interactions",
        sentence: "Reports what the pointer does on the plan - hover, click, right-click - with what it hit and the time and lane under it. Reach for it to open a menu, fill a detail panel or write a status line.",
        about: [
          "A hit names a subtask together with the part of it (lead-in, main time, lead-out), a dependency, a lane, or nothing.",
          "While `onInteraction` is set, a right-click opens no browser menu: your application is expected to answer it.",
        ],
        alternatives: [
          { when: "You only need to know which task was picked", use: "selection" },
          { when: "You need the time at a point outside an interaction", use: "handle" },
        ],
        types: ["ScheduleInteraction"],
        exports: ["Schedule"],
      },
      {
        id: "tooltip",
        name: "Tooltip",
        sentence: "Names what the pointer rests on - a subtask with its times and findings, a dependency with its lag - without a click (also called a hover card). Replace its content when your application knows more than the schedule.",
        about: [
          "Its words come from the wording of @umriss-ui/core and its numbers from its formats, so a provider switches it with everything else. It steps aside while a drag is in flight and is placed where it has room.",
          "The keyboard's active subtask shows the same tooltip as the pointer.",
        ],
        types: ["ScheduleTooltipTarget"],
        exports: ["Schedule"],
      },
      {
        id: "linked-schedules",
        name: "Linked schedules",
        sentence: "Keeps two schedules on the same hours: pan or zoom one and the other follows (also called synchronised views). Reach for it when two sets of lanes stand apart on a screen but belong to the same time.",
        about: [
          "`onDomainChange` reports the visible span after a pan or zoom, at most once per frame. A span handed in as `initialDomain` is not reported back, so two schedules never feed each other.",
          "While a drag is in flight the two can stand a frame apart; they settle as soon as it ends.",
        ],
        alternatives: [{ when: "The lanes belong together in one plan", use: "lane-groups" }],
        limits: ["Only the span is shared - not the selection, the hover or the vertical scroll."],
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "handle",
        name: "The handle",
        sentence: "Converts between a point on the screen and a time on a lane, so marks of your own - a cut-off, a delivery window, a pin - stand at the right place beside the plan.",
        about: [
          "The handle holds three functions and nothing else: `clientPointOf(time, lane?)`, `positionAt(clientX, clientY)` and `visibleDomain()`. Everything else the schedule does is props.",
          "Place your marks again whenever `onDomainChange` reports a new span.",
        ],
        alternatives: [{ when: "You need the time under the pointer during a hover or a click", use: "interactions" }],
        types: [],
        exports: ["Schedule"],
      },
    ],
  },
  {
    id: "editing",
    name: "Editing",
    sentence: "Direct manipulation that changes nothing by itself: the schedule reports, the application decides.",
    pages: [
      {
        id: "move-and-lane",
        name: "Move and lane",
        sentence: "Drag a bar to a new time or onto another lane (also called drag-and-drop rescheduling). A ghost shows where it would land and what that would cause; the drop reports the change for your application to apply.",
        about: [
          "Each name in `intents` enables one gesture. Without `intents` the schedule is read-only, and pressing a bar pans the plot.",
          "The schedule never changes your data (ADR-0023): `onIntent` reports a move and a lane change as values, and `applyIntent` is the arithmetic to apply them. A drop across lanes and time reports both, and your handler may apply them, refuse them, or apply one.",
          "Held at the edge of the plot, a drag pans it along; Escape cancels the drag.",
        ],
        alternatives: [
          { when: "The work is not on the plan yet", use: "placing" },
          { when: "Some lanes or times must not take some work", use: "where-it-may-go" },
          { when: "Later work should follow a move", use: "ripple" },
        ],
        keys: [
          { key: "Alt+← Alt+→", action: "Proposes moving the active subtask one raster step earlier or later, stepping over blocked time." },
          { key: "Escape", action: "Cancels a drag in flight: the ghost goes and nothing is reported." },
        ],
        limits: [
          "No undo: your application owns the data, and with it the history (ADR-0032).",
          "The keys move work in time only; a lane change needs the pointer.",
        ],
        types: [],
        exports: ["Schedule", "applyIntent"],
      },
      {
        id: "stretch",
        name: "Stretch, lead-in, lead-out",
        sentence: "Change how long work takes, or how long its preparation and its wrap-up take, by dragging an edge (also called resizing). Each part changes on its own and is reported for your application to apply.",
        about: [
          "`stretch` enables the two edges of the main time. `leadIn` and `leadOut` add a grip at the outer edge of each; the grips show on the selected subtask only, so click a bar first.",
          "Stretching the main time leaves the lead-in and the lead-out as long as they were.",
        ],
        keys: [{ key: "Alt+Shift+← Alt+Shift+→", action: "Proposes ending the active subtask one raster step earlier or later." }],
        limits: ["A main time never becomes shorter than one raster step, or a minute without a raster."],
        types: [],
        exports: ["Schedule", "applyIntent"],
      },
      {
        id: "snapping",
        name: "Snapping",
        sentence: "Makes a drag land on a raster - the axis' own step, a fixed duration, or a pattern with an offset - so dropped work starts on a time a planner can read.",
        about: [
          "Without `snap` a drag lands on the fine band's step, which follows the zoom. A number is a step in milliseconds; `{ step, offset }` counts from local midnight; `false` places to the minute.",
          "Snapping shapes the ghost and so the intent; it never moves data that is not being dragged. `snapTime` is the same arithmetic for your own use.",
        ],
        types: [],
        exports: ["Schedule", "snapTime"],
      },
      {
        id: "placing",
        name: "Placing from outside",
        sentence: "Drag work that is not on the plan yet - from a backlog or a list of unassigned jobs - onto a lane, with the browser's own drag and drop. The drop reports where it should go; your application creates it.",
        about: [
          "The browser hands over dragged data only on the drop, so declare what is being dragged in `placing` on your `dragstart` and clear it on `dragend`. The schedule then shows the ghost at the snapped time, with the findings the drop would create.",
          "A `place` intent carries your item's key, the task, the lane and the times. The id of the new subtask is yours; `subtaskFromPlace` builds it from the intent.",
        ],
        alternatives: [{ when: "The work is already on the plan", use: "move-and-lane" }],
        types: [],
        exports: ["Schedule", "subtaskFromPlace"],
      },
      {
        id: "where-it-may-go",
        name: "Where a subtask may go",
        sentence: "Marks the lanes and times a piece of work may not go to as soon as a drag begins, and holds the ghost where it is allowed. Reach for it when rules of your domain - equipment, skills, leave - limit where work can stand.",
        about: [
          "`canMoveTo(subtask, lane)` is asked once per lane when a drag takes hold, and again at the drop. Refused lanes are drawn back and hatched; over one, the ghost stays on the last lane allowed, tied to the pointer by a line.",
          "Blocked time refuses a place in time rather than a lane: a drag cannot put work into it, and Alt with an arrow key steps over it. Work the data already put there is never locked in.",
          "A refusal costs only what it refuses - a drop across a closed lane still reports the move in time - and wears no warning colour, because a rule is nobody's mistake.",
        ],
        alternatives: [{ when: "The rule depends on the result, such as no double booking", use: "move-and-lane" }],
        limits: ["A rule that changes while a drag runs is noticed at the drop, not before."],
        types: [],
        exports: ["Schedule", "BlockedTimes"],
      },
      {
        id: "ripple",
        name: "Ripple",
        sentence: "Works out which later work has to move when one piece moves: every successor whose dependency no longer fits, pushed by exactly what is missing (also called a cascade). The schedule never runs it; your application decides.",
        about: [
          "`ripple(subtasks, dependencies, intent)` returns move intents down the whole chain, in the order they were pushed. A successor keeps its length and is never pulled earlier: room that opens up is the planner's.",
          "`shiftTask` moves every subtask of one task by the same amount, so all its dependencies keep fitting.",
        ],
        limits: [
          "No dependency types, slack or critical path: the schedule is no project-planning engine (ADR-0032).",
          "A dependency joins subtasks of one task, so work of other tasks is never pushed.",
        ],
        types: [],
        exports: ["ripple", "shiftTask", "applyIntent"],
      },
    ],
  },
  {
    id: "findings",
    name: "Findings",
    sentence: "What a planner opens a schedule for, as data beside the picture.",
    pages: [
      {
        id: "findings",
        name: "Findings as data",
        sentence: "Lists what is wrong with a plan - double bookings on a lane, dependencies that do not fit, work in blocked time - from the same data the schedule draws. Reach for it to list, count or filter the problems beside the picture.",
        about: [
          "`findings(subtasks, dependencies, blocked)` returns all three kinds; `overlaps`, `violatedDependencies` and `inBlockedTime` return one each. They are pure functions: run them wherever the data changes, with or without a schedule on screen.",
          "Lead-in and lead-out count as occupied time; touching at a shared edge is no overlap.",
        ],
        limits: ["Overlapping work is marked, not packed into sub-lanes; stacked overlap is not built yet."],
        types: ["Overlap", "ViolatedDependency", "InBlockedTime"],
        exports: ["findings", "overlaps", "violatedDependencies", "inBlockedTime"],
      },
    ],
  },
];

export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
