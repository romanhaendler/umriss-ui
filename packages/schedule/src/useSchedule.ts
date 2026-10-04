/* useSchedule - where a schedule is declared, as a table is through useTable
   (ADR-0017, ADR-0048).

   It binds no row type: subtasks, tasks, lanes and blocked time are the
   library's own types. What it gives is the one place a schedule is declared
   from - and where its view and setters will stand (ADR-0047). Until then the
   parts are the same on every call and every render, so nothing is remounted. */

import { Schedule } from "./Schedule";
import { BlockedTimes, Dependencies, Lane, LaneGroup, Subtasks } from "./parts";

const PARTS = { Schedule, Lane, LaneGroup, Subtasks, Dependencies, BlockedTimes };

/** What `useSchedule` hands back: the schedule and what is declared inside it. */
export type ScheduleParts = typeof PARTS;

/** Declares a schedule: hands back `Schedule` and the parts declared inside it
    - `Lane`, `LaneGroup`, `Subtasks`, `Dependencies`, `BlockedTimes`. A ref
    on `Schedule` still gives the `ScheduleHandle`. */
export function useSchedule(): ScheduleParts {
  return PARTS;
}
