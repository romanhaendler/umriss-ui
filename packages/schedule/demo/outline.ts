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

   The rubrics answer four questions a planner's application asks in turn: what
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
    id: "plan",
    name: "Plan",
    sentence: "What the schedule shows: work on lanes, and everything a bar says besides its colour.",
    pages: [
      {
        id: "schedule",
        name: "First schedule",
        sentence: "Subtasks on lanes over time, with a day band above and adaptive time ticks below - the whole picture in thirty lines.",
        types: ["ScheduleProps"],
        exports: ["Schedule", "Lane", "Subtasks", "Dependencies"],
      },
      {
        id: "lane",
        name: "Lanes",
        sentence: "One machine or station per lane, named by its header - in the order the lanes are declared, however many there are.",
        types: ["LaneProps"],
        exports: ["Lane"],
      },
      {
        id: "lane-groups",
        name: "Lane groups",
        sentence: "Halls, lines and machine groups over the lanes - to any depth, and folded into one row when a planner wants the part they work on.",
        types: ["LaneGroupProps"],
        exports: ["LaneGroup", "Lane"],
      },
      {
        id: "subtasks",
        name: "Subtasks",
        sentence: "The drawn intervals: a main time with its lead-in and lead-out, in the colour of the task they belong to.",
        types: ["SubtasksProps", "Subtask", "Task"],
        exports: ["Subtasks"],
      },
      {
        id: "bar-labels",
        name: "Bar labels",
        sentence: "What stands written in a bar - cut off where it must be, left out where it would say nothing, held at the view's edge.",
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "appearances",
        name: "Appearances",
        sentence: "What a bar says besides its colour: provisional, fixed, another shift's, running on - one channel of the drawing each.",
        types: [],
        exports: ["Subtasks", "resolveAppearance"],
      },
      {
        id: "overlap",
        name: "Overlap",
        sentence: "Two subtasks claiming one lane at one time: offset, marked, and never packed into sub-lanes.",
        types: [],
        exports: ["Subtasks"],
      },
      {
        id: "dependencies",
        name: "Dependencies",
        sentence: "A task's moves between its subtasks, from an end to a start - with what they connect and where their lines touch.",
        types: ["DependenciesProps", "Dependency"],
        exports: ["Dependencies"],
      },
      {
        id: "routes",
        name: "Routes",
        sentence: "How a dependency is drawn between its two ends: a curve that leaves forwards, a straight line, or orthogonal segments.",
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
        sentence: "The two bands, and the working calendar that cuts the hours the plant does not run out of the axis.",
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "blocked-time",
        name: "Blocked time",
        sentence: "Leave, maintenance and other time a lane is not available: hatched behind the work, a finding where work covers it, and closed to a drag.",
        types: ["BlockedTimesProps", "BlockedTime"],
        exports: ["BlockedTimes", "findings"],
      },
      {
        id: "now-line",
        name: "Now line",
        sentence: "A line across the lanes at the present moment, following the clock or fixed where a replay needs it.",
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "pan-and-zoom",
        name: "Pan and zoom",
        sentence: "Dragging the background, the wheel, Ctrl and a pinch: what moves the view, and what the view never changes.",
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
