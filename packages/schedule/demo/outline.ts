/* The outline of the demo of @umriss-ui/schedule - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it. One page per thing a
   reader looks up by name, as in the other demos.

   The rubrics were decided when the demo was built (spec, "Demo"), against the
   demo's vocabulary: what the schedule DRAWS - the component and the three
   things declared inside it -, how it is EDITED - the intents and the cascade a
   caller may run -, and the FINDINGS as data. `Intent` is a page although it is
   a type and not a component: it is the editing API (ADR-0023), and a reader
   looks it up by that name.

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else. */

import { addresses } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "drawing",
    name: "Drawing",
    sentence: "What the schedule shows: lanes over time, the subtasks on them and the transports between them.",
    pages: [
      {
        id: "schedule",
        name: "Schedule",
        sentence: "Subtasks on lanes over time, with a day band above and adaptive time ticks below - panned and zoomed, with the headers and bands holding still.",
        types: ["ScheduleProps", "ScheduleTooltipTarget"],
        exports: ["Schedule", "Lane", "Subtasks", "Transports"],
      },
      {
        id: "lane",
        name: "Lane",
        sentence: "One machine or station, named by its lane header - in the order the lanes are declared.",
        types: ["LaneProps"],
        exports: ["Lane"],
      },
      {
        id: "subtasks",
        name: "Subtasks",
        sentence: "The drawn intervals: a main time with its setup and teardown, in the colour of the task they belong to.",
        types: ["SubtasksProps", "Subtask", "Task"],
        exports: ["Subtasks"],
      },
      {
        id: "transports",
        name: "Transports",
        sentence: "A task's moves between its subtasks, from an end to a start - anchored where the transport says, and marked where it cannot arrive in time.",
        types: ["TransportsProps", "Transport"],
        exports: ["Transports"],
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
        types: ["ScheduleInteraction"],
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
