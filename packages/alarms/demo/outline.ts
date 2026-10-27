/* The outline of the demo of @umriss-ui/alarms - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it. What is NOT here: the
   examples. They come from the files under `demo/examples/` and from nothing
   else - the folder is named like the page. */

import { addresses, apiIndexRubric } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "getting-started",
    name: "Getting started",
    sentence: "What an alarm is for, and what an application sets up before the first list.",
    pages: [
      {
        id: "alarmlist",
        installs: true,
        name: "AlarmList",
        sentence: "The list of alerts someone has to see and acknowledge, worst first, with their state, age and frequency (also called an alarm or alert console). Reach for it wherever alerts arrive and a person answers for them.",
        about: [
          "The library receives alerts and raises none (ADR-0078). `alarmModel` turns them into a sorted view – priority, then acknowledgement, then time – and the list shows it; your application applies the transitions (`acknowledge`, `snooze`, `unsnooze`, `disable`, `enable`) to its own state. The lifecycle is one field with four values, active or resolved × acknowledged or not, so an alert that came and went unseen stays until someone acknowledges it.",
          "Availability is a second field: snoozed by a person, with an end and a name, and the reason when it has one, all in the badge's tip and in what is spoken; suppressed by the application's logic; or disabled. A hidden alert keeps its lifecycle, stays in the list drawn neutral with its state as a word, and is counted; a snooze ends by the model's clock, with no timer. A flood is marked, never thinned out.",
          "The live region announces one number, the active unacknowledged alerts, not each arrival. With `onSnooze` and `snoozeDurations` the list offers snoozing beside “Acknowledge” (with `snoozeReason`, as a small panel that also asks for a reason, passed on as a third argument), and with `onUnsnooze` the ending of a snooze: it reports what the operator asked for and snoozes nothing - your application calls `snooze()` or refuses. The durations are yours; there is no default list. A filter by state or priority is the projection's `filter`, fed by controls of your own. The terms follow ISA-18.2; `docs/standards.md` maps each to its name here.",
        ],
        keys: [
          { key: "Tab", action: "Move through the row boxes, “Acknowledge” and the hidden-alerts switch." },
          { key: "Space", action: "On a box: tick or untick the alert. On the switch: show only the hidden alerts, or all." },
          { key: "Enter", action: "On “Acknowledge”: hand the ticked alerts to `onAcknowledge`. On “Snooze”: open the durations; on a duration: hand the ticked alerts and the end to `onSnooze`. With `snoozeReason`, “Snooze” opens a panel instead (see Escape and Arrow keys). On “Unsnooze”: hand the ticked snoozed alerts to `onUnsnooze`." },
          { key: "Arrow keys", action: "In the durations menu, or among the durations of the reason panel: move between them; Escape closes the menu." },
          { key: "Escape", action: "In the reason panel: close it without reporting; the focus returns to “Snooze”. A click outside closes it the same way." },
          { key: "Enter (in the reason field)", action: "Report the snooze, as the panel's “Snooze” button does; with `\"required\"` and no text it does nothing." },
        ],
        limits: [
          "It raises no alerts: limits, delays and dead bands belong to the application (ADR-0078).",
          "It never removes an alert to thin out a flood; deciding that a person should not see one stays with the application.",
          "No latched alerts, and no alarm-system figures beyond the frequency per type.",
          "The columns do not sort and the list does not page: the model sets the order.",
        ],
        accessibility: [
          "A native table named “Alarms”, each alert's type its row header. The state stands as a word in every row, never as a colour alone, and a hidden alert's short badge is spoken whole - snoozed until when, and by whom.",
          "One polite live region says one number: the active alerts nobody has acknowledged, “3 active alarms, unacknowledged”. It speaks when that number changes, never per arrival, so a flood is one sentence and not forty.",
          "Each row's box is named after the alert, and “Acknowledge” names how many it will acknowledge; while there is none it is disabled.",
          "With `snoozeReason`, “Snooze” opens a dialog named after how many alerts it acts on. The focus moves to the chosen duration when it opens and back to “Snooze” when it closes; the durations and the reason field are labelled, and with `\"required\"` the field is marked and the button disabled until it holds text.",
        ],
        types: ["AlarmListProps"],
        exports: ["AlarmList", "alarmModel"],
      },
    ],
  },
  {
    id: "marks",
    name: "Marks",
    sentence: "The small signs an operator reads at a glance.",
    pages: [
      {
        id: "prioritymark",
        name: "PriorityMark",
        sentence: "The mark of an alarm's priority: a shape, a number and a colour per level, so that four priorities are told apart in a dark room, in forced colours and by a colour-blind reader. Reach for it wherever an alarm's priority is shown; the list uses it.",
        about: [
          "Level 1 is a diamond, 2 a triangle, 3 a square, 4 a circle, each with its number inside; the outlines differ, so they hold in greyscale and in forced colours. The colours come from one token per level (`--u-color-priority-critical`, `-high`, `-medium`, `-low`), each holding AA under the number and 3:1 against the surface.",
          "Hand it the alarm's `lifecycle` and `availability` as the list knows them. The mark of an active, unacknowledged alarm in service flashes at 1 Hz and is steady once acknowledged; a returned, unacknowledged one is steady. A shelved, suppressed or out-of-service alarm's mark is neutral and keeps its number. The rate is umriss's choice, no source gives one; `--u-duration-alarm-flash` sets it, and `none` turns the flash off.",
        ],
        limits: ["It raises nothing and decides nothing: the application says which level an alarm has."],
        accessibility: [
          "Its name is “Priority 1, critical”, in the wording's language. Under `prefers-reduced-motion: reduce` nothing animates and an unacknowledged mark carries a steady ring.",
        ],
        types: ["PriorityMarkProps"],
        exports: ["PriorityMark"],
      },
    ],
  },
  apiIndexRubric("@umriss-ui/alarms"),
];

export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromPlace } = ADDRESSES;
