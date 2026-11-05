/* The view of a schedule (ADR-0047): the span in view and the folded lane
   groups - how the planner is looking at the plan, never the plan itself.

   The schedule holds it and puts it nowhere; `useSchedule` takes a start
   through `initialView` and reports every change through `onViewChange`. */

import { DEV, warnOnce } from "./dev";
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

/** What a view is compared by: its content, not its identity. The folded groups
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

/** A span a caller handed in, if it is two finite, ordered numbers of
    milliseconds; else null - the view then names none - and, in development,
    a warning naming the shape (Dates and strings are not drawn). */
export function validSpan(span: unknown): [number, number] | null {
  if (span === null || span === undefined) return null;
  const [from, to] = Array.isArray(span) ? span : [];
  if (Array.isArray(span) && span.length === 2 && Number.isFinite(from) && Number.isFinite(to) && typeof from === "number" && typeof to === "number" && from < to) return [from, to];
  if (DEV) warnOnce("domain", `the view's domain must be [from, to], two numbers in milliseconds since 1970 with from before to (as Date.getTime() gives), not ${JSON.stringify(span)}; the schedule shows its subtasks instead.`);
  return null;
}

/** The span a schedule shows while its view names none: the extent of the
    subtasks, lead-in and lead-out included, into the zoom limits - widened
    around its middle, or, where the work is wider than the widest span, from
    its earliest start, so the first window shows work and not the empty
    middle. None without subtasks. `toAxis` maps a wall-clock instant onto the
    axis the limits count on - working time, where a calendar removes some.
    `wide: "middle"` narrows around the middle instead. */
export function defaultSpan(
  subtasks: readonly Subtask[],
  limits: ZoomLimits,
  toAxis: (wallClock: number) => number = (v) => v,
  wide: "start" | "middle" = "middle",
): [number, number] | null {
  let from = Infinity;
  let to = -Infinity;
  for (const s of subtasks) {
    /* An unreadable time (NaN, a string) would carry NaN into the span; such a subtask is warned of, not fitted to. */
    if (!Number.isFinite(s.from) || !Number.isFinite(s.to)) continue;
    from = Math.min(from, s.from - (s.leadIn ?? 0));
    to = Math.max(to, s.to + (s.leadOut ?? 0));
  }
  if (from === Infinity) return null;
  from = toAxis(from);
  to = toAxis(to);
  const span = Math.min(limits.max, Math.max(limits.min, to - from));
  if (wide === "start" && to - from > span) return [from, from + span];
  const middle = (from + to) / 2;
  return [middle - span / 2, middle + span / 2];
}
