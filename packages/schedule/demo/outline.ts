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

   The rubrics answer three different questions a planner's application asks in
   turn: what the schedule DRAWS, what a reader may take OUT of it, how it is
   EDITED, and what it FINDS. `Intent` stays a page although it is a type and
   not a component: it is the editing API (ADR-0023), and a reader looks it up
   by that name.

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else - the folder is named like the page,
   in the component's spelling. */

import { addresses } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "drawing",
    name: "Drawing",
    sentence: "What the schedule shows: lanes over time, the work on them, and everything a bar says besides its colour.",
    pages: [
      {
        id: "schedule",
        name: "First schedule",
        sentence: "Subtasks on lanes over time, with a day band above and adaptive time ticks below - the whole picture in thirty lines.",
        types: ["ScheduleProps"],
        exports: ["Schedule", "Lane", "Subtasks", "Transports"],
      },
      {
        id: "lane",
        name: "Lanes",
        sentence: "One machine or station per lane, named by its header - in the order the lanes are declared, however many there are.",
        types: ["LaneProps"],
        exports: ["Lane"],
      },
      {
        id: "time-axis",
        name: "Time axis and calendar",
        sentence: "The two bands, and the operating calendar that cuts the hours the plant does not run out of the axis.",
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
      {
        id: "now-line",
        name: "Now line",
        sentence: "A line across the lanes at the present moment, following the clock or fixed where a replay needs it.",
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "subtasks",
        name: "Subtasks",
        sentence: "The drawn intervals: a main time with its setup and teardown, in the colour of the task they belong to.",
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
        id: "transports",
        name: "Transports",
        sentence: "A task's moves between its subtasks, from an end to a start - with what they connect and where their lines touch.",
        types: ["TransportsProps", "Transport"],
        exports: ["Transports"],
      },
      {
        id: "routes",
        name: "Routes",
        sentence: "How a transport is drawn between its two ends: a curve that leaves forwards, a straight line, or orthogonal segments.",
        types: [],
        exports: ["Transports"],
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
        sentence: "A click takes a whole task, across every lane - controlled or kept by the schedule, with the stop that was hit.",
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "interactions",
        name: "Interactions",
        sentence: "Click, context menu and hover, each with its target and its position - for a menu, a detail panel or a status line.",
        types: ["ScheduleInteraction"],
        exports: ["Schedule"],
      },
      {
        id: "tooltip",
        name: "Tooltip",
        sentence: "What the pointer rests on, named with its times and its findings - or replaced by content of the application's own.",
        types: ["ScheduleTooltipTarget"],
        exports: ["Schedule"],
      },
      {
        id: "linked-schedules",
        name: "Linked schedules",
        sentence: "Two plans of the same hours, kept in step through the span each reports when it is panned or zoomed.",
        types: [],
        exports: ["Schedule"],
      },
      {
        id: "handle",
        name: "The handle",
        sentence: "The arithmetic between a point on the screen and a time on a lane, for an application's own marks beside the plot.",
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
        id: "intent",
        name: "Intent",
        sentence: "What a drag asks for - move, lane, stretch, setup, teardown - shown as a ghost with live findings and reported when it ends.",
        types: [],
        exports: ["Schedule", "applyIntent", "snapTime"],
      },
      {
        id: "ripple",
        name: "ripple",
        sentence: "The cascade as arithmetic: the moves that push every successor whose transport no longer fits - for the application to run, or not.",
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
        name: "findings",
        sentence: "Overlaps on a lane and late transports, computed from the data - to list, count and act on.",
        types: ["Overlap", "LateTransport"],
        exports: ["findings", "overlaps", "lateTransports"],
      },
    ],
  },
];

export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
