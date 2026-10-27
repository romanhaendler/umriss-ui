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
          "The screen speaks ISA-18.2's words, in English and German; the API keeps its general names. `\"snoozed\"`, `snooze()` and `unsnooze()` are “Shelved”, “Shelve” and “Unshelve”; `\"suppressed\"` is “Suppressed by design”; `\"disabled\"` is “Out of service”; the count of `hiddenAlarms` reads “Suppressed or shelved: 3”; the lifecycle's four states are “In alarm” or “Returned”, unacknowledged or acknowledged.",
          "Availability is a second field: shelved by a person, with an end and a name, and the reason when it has one, the end in the row and the whole sentence in the badge's tip and in what is spoken; suppressed by the application's logic; or out of service. A hidden alert keeps its lifecycle, stays in the list drawn neutral with its state as a word, and is counted. A shelve ends by the model's clock, with no timer, and an alert still in alarm then returns unacknowledged, so that a shelve never makes one forgotten (one vendor does the same; no standard settles it). A shelve ended by hand keeps the lifecycle underneath. A flood is marked, never thinned out.",
          "The live region announces one number, the active unacknowledged alerts, not each arrival. With `onSnooze` and `snoozeDurations` the list offers shelving beside “Acknowledge” (with `snoozeReason` or `snoozeReasons`, as a small panel that asks for a reason, passed on as a third argument; `snoozeReasons` are the application's own choices above a field for another), and with `onUnsnooze` the ending of a shelve: it reports what the operator asked for and shelves nothing - your application calls `snooze()` or refuses. The durations and the reasons are yours; there is no default list. A filter by state or priority is the projection's `filter`, fed by controls of your own. The terms follow ISA-18.2; `docs/standards.md` maps each to its name here.",
        ],
        keys: [
          { key: "Tab", action: "Move through the row boxes, “Acknowledge” and the hidden-alerts switch." },
          { key: "Space", action: "On a box: tick or untick the alert. On the switch: show only the hidden alerts, or all." },
          { key: "Enter", action: "On “Acknowledge”: hand the ticked alerts to `onAcknowledge`. On “Shelve”: open the durations; on a duration: hand the ticked alerts and the end to `onSnooze`. With `snoozeReason` or `snoozeReasons`, “Shelve” opens a panel instead (see Escape and Arrow keys). On “Unshelve”: hand the ticked shelved alerts to `onUnsnooze`." },
          { key: "Arrow keys", action: "In the durations menu, or among the durations of the reason panel: move between them; Escape closes the menu." },
          { key: "Escape", action: "In the reason panel: close it without reporting; the focus returns to “Shelve”. A click outside closes it the same way." },
          { key: "Enter (in the reason field)", action: "Report the shelve, as the panel's “Shelve” button does; with `\"required\"` and no text it does nothing." },
        ],
        limits: [
          "It raises no alerts: limits, delays and dead bands belong to the application (ADR-0078).",
          "It never removes an alert to thin out a flood; deciding that a person should not see one stays with the application.",
          "No latched alerts, and no alarm-system figures beyond the frequency per type.",
          "The columns do not sort and the list does not page: the model sets the order.",
        ],
        accessibility: [
          "A native table named “Alarms”, each alert's type its row header. The state stands as a word in every row, never as a colour alone, and a hidden alert's short badge is spoken whole - shelved until when, and by whom.",
          "One polite live region says one number: the active alerts nobody has acknowledged, “3 active alarms, unacknowledged”. It speaks when that number changes, never per arrival, so a flood is one sentence and not forty.",
          "Each row's box is named after the alert, and “Acknowledge” names how many it will acknowledge; while there is none it is disabled.",
          "With `snoozeReason` or `snoozeReasons`, “Shelve” opens a dialog named after how many alerts it acts on. The focus moves to the chosen duration when it opens and back to “Shelve” when it closes; the durations, the reasons and the reason field are labelled, and with `\"required\"` the button is disabled until a reason is chosen or typed.",
        ],
        types: ["AlarmListProps"],
        exports: ["AlarmList", "alarmModel"],
      },
      {
        id: "alarmbanner",
        name: "AlarmBanner",
        sentence: "The worst unacknowledged alert on every screen, the count per priority, and one tap to the list or to acknowledge (also called an alarm banner or annunciator bar). Reach for it in the frame of an application that has an alert list.",
        about: [
          "Give it the view of an `alarmModel` call without a filter, so that a filter on the list never hides the worst alert from the banner. It shows the worst active, unacknowledged alert in service - mark, label and time to the second -, how many more there are, the count per priority and a marked flood. Without such an alert it says so, and with a lost source it says the connection is down, never that there are no alerts. Every alert stays shown and counted when the data is stale.",
          "It reports and applies nothing: “Acknowledge” hands `[id]` of the shown alert to `onAcknowledge`, “Open list” calls `onOpen`, each button stands only with its handler. `onAnnunciate` is the cue for sound: `{ kind: \"new\", priority }` when alerts in service join the unacknowledged ones (a shelve that ran out counts), `{ kind: \"cleared\" }` when the last one is gone. The horn, its repetition and a silence button are your application's. To keep the banner on every screen, make it sticky in your layout: `position: sticky; top: 0`.",
        ],
        keys: [{ key: "Tab", action: "Move to “Acknowledge” and “Open list”." }],
        limits: ["No sound, no repetition and no silence button: `onAnnunciate` is the cue, the horn is yours."],
        accessibility: [
          "One region named “Alarms”. A hidden element with `role=\"alert\"` gets its text only when a new alert has a higher priority than the one shown, and then says its priority and label; a count change, an acknowledgement or a re-sort never speaks, and the first render says nothing.",
          "Each count carries its priority's mark and is named “Priority 2, high: 3”; the state never stands as a colour alone.",
        ],
        types: ["AlarmBannerProps"],
        exports: ["AlarmBanner"],
      },
      {
        id: "trips-and-floods",
        name: "Trips and floods",
        sentence: "The first alarm of a trip, the first of a flood and the flood's rate, with the times to the second. Reach for it when one cause raises dozens of alarms and the operator has to start from the first.",
        about: [
          "Give alarms a `group` (the application's trip or unit) and the earliest of each group is marked “First out” - the standards' sense: the first of a group or a trip. Alarms whose `raised` collide go by the application's `sequence`, then by input order; an alarm without a group is never first-out. Done alarms count for the choice, so a trip's first alarm stays the first once it is gone.",
          "The flood stays your rule, with no default. ISA-18.2's reference is more than 10 alarms in 10 minutes per operating position: `{ windowMs: 600000, atLeast: 11 }`, over the alarms of one position. The flood's earliest alarm, `flood.first`, is marked “First in flood”, umriss's own mark and not first-out. The projection's `rate` counts the alarms raised in the ten minutes before the as-of time, and the flood mark in the list and in the banner names it: “Alarm flood: 40 in 10 min”.",
          "A list of a thousand rows ticking once a second keeps focus and the ticked rows; give the list a `maxHeight` and it scrolls inside the page.",
        ],
        keysOf: ["alarmlist"],
        limits: ["Every alarm of a flood stays in the list; the marks help the operator start, they hide nothing."],
        accessibility: [
          "“First out” and “First in flood” are words in the row, never a colour alone, in the wording's language.",
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
