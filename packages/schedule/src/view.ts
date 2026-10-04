/* The view of a schedule (ADR-0047): the span in view and the folded lane
   groups - how the planner is looking at the plan, never the plan itself.

   The schedule holds it and puts it nowhere; `useSchedule` takes a start
   through `initialView` and reports every change through `onViewChange`. */

import type { Subtask } from "./model";
import type { ZoomLimits } from "./timeAxis";

/** How a planner is looking at the plan. Whatever is at its default is absent. */
export interface ScheduleView {
  /** The span in view, as two wall-clock instants. Absent, the schedule shows
      the extent of its subtasks, within `zoomLimits`. */
  domain?: readonly [number, number];
  /** The **Lane group**s that are folded, by id. An id no group carries falls
      out. A folded outer group hides the inner ones without their ids leaving
      the list, so unfolding it gives back the view that was there. */
  folded?: readonly string[];
}

/** What a view handed in is compared by: its content, not its identity - a
    view written in the call is a new object on every render. The folded groups
    are a set, so their order does not count, and an empty fold is no fold. */
export const viewKey = (view: ScheduleView): string =>
  JSON.stringify([view.domain ?? null, [...(view.folded ?? [])].sort()]);

/** The view without folded groups that no declared group carries. As long as
    none is declared it stays as it is - otherwise the first render would erase
    every fold. */
export function onlyKnown(view: ScheduleView, known: ReadonlySet<string>): ScheduleView {
  if (known.size === 0 || view.folded === undefined) return view;
  const folded = view.folded.filter((id) => known.has(id));
  if (folded.length === view.folded.length) return view;
  return { ...(view.domain ? { domain: view.domain } : {}), ...(folded.length ? { folded } : {}) };
}

/** The span a schedule shows while its view names none: the extent of the
    subtasks, lead-in and lead-out included, widened or narrowed around its
    middle into the zoom limits. None without subtasks. `toAxis` maps a
    wall-clock instant onto the axis the limits count on - working time, where
    a calendar removes some. */
export function defaultSpan(
  subtasks: readonly Subtask[],
  limits: ZoomLimits,
  toAxis: (wallClock: number) => number = (v) => v,
): [number, number] | null {
  if (subtasks.length === 0) return null;
  let from = Infinity;
  let to = -Infinity;
  for (const s of subtasks) {
    from = Math.min(from, s.from - (s.leadIn ?? 0));
    to = Math.max(to, s.to + (s.leadOut ?? 0));
  }
  from = toAxis(from);
  to = toAxis(to);
  const span = Math.min(limits.max, Math.max(limits.min, to - from));
  const middle = (from + to) / 2;
  return [middle - span / 2, middle + span / 2];
}

/** How long a view reported may take to come back as `initialView`. */
const ECHO_MS = 1000;

/** The views a schedule reported that may still come back. An application
    keeping the view hands it back a frame or more late - by then a pan has
    moved on, and going to the view handed in would jump back. So a view handed
    in that equals one reported since the last one handed in, within a second,
    is the schedule's own state coming back, not a view to go to. The echoes
    come in order: one drops itself and every older report, a view from outside
    drops them all. The second bounds the list where nothing is handed back,
    and lets such an application still restore a view it kept. */
export class Echoes {
  private reports: { key: string; at: number }[] = [];

  reported(key: string): void {
    const now = performance.now();
    this.reports = this.reports.filter((r) => now - r.at < ECHO_MS);
    this.reports.push({ key, at: now });
  }

  /** Whether the view handed in is a report coming back. */
  has(key: string): boolean {
    return this.at(key) >= 0;
  }

  /** Forgets what the view handed in answers. */
  handed(key: string): void {
    const at = this.at(key);
    this.reports = at < 0 ? [] : this.reports.slice(at + 1);
  }

  private at(key: string): number {
    const now = performance.now();
    return this.reports.findIndex((r) => r.key === key && now - r.at < ECHO_MS);
  }
}
