/* useSchedule - where a schedule is declared, as a table is through useTable
   (ADR-0017, ADR-0048), and where its view stands (ADR-0047).

   It binds no row type: subtasks, tasks, lanes and blocked time are the
   library's own types. What it gives is the one place a schedule is declared
   from: the parts, the view and its setters. The parts are the same on every
   render, whatever the view does, so nothing is remounted. */

import { createElement, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Schedule as ScheduleOn, type ScheduleProps } from "./Schedule";
import { DataTable } from "./DataTable";
import { BlockedTimes, Dependencies, Lane, LaneGroup, Milestones, Subtasks } from "./parts";
import { ScheduleScene } from "./scene";
import { viewKey, type ScheduleView } from "./view";

/** What `useSchedule` takes: the view to start from and the handler that
    hears every change of it. */
export interface ScheduleOptions {
  /** The view to start from, read once when the hook first runs; a different
      value on a later render is ignored, as React ignores a changed
      `defaultValue`. To go to a view later, call `setView`. The schedule
      remembers none: where a view is kept is the application's decision. */
  initialView?: ScheduleView;
  /** Every change the planner makes, once, always the whole view - the one to
      keep, or to hand another schedule's `setView`. A pan or zoom is reported
      at most once per frame. Not called for the view the schedule starts
      with, nor for one `setView` applies. */
  onViewChange?: (view: ScheduleView) => void;
}

/** What `useSchedule` hands back: the schedule and what is declared inside
    it, its view and the setters that change it. */
export interface ScheduleParts {
  /** The schedule. One per `useSchedule`: a second schedule is a second call. */
  Schedule: (props: ScheduleProps) => ReactNode;
  Lane: typeof Lane;
  LaneGroup: typeof LaneGroup;
  Subtasks: typeof Subtasks;
  Dependencies: typeof Dependencies;
  BlockedTimes: typeof BlockedTimes;
  Milestones: typeof Milestones;
  /** The plan as a table, on demand: placed inside the `Schedule`, it gives the
      schedule a "Show data" key beside the bottom time band, and the key opens
      a table of the subtasks in view - lane, task, subtask, from and to with
      their dates, duration and findings in words. For a reader who wants every
      value at once. It takes no props and renders nothing outside a
      `Schedule`. */
  DataTable: typeof DataTable;
  /** How the planner is looking at the plan: the span and the folded groups. */
  view: ScheduleView;
  /** Goes to a whole view; what it leaves out is shown whole again. Not
      reported through `onViewChange`: two schedules kept in step by
      `onViewChange: (v) => other.setView(v)` in both directions do not answer
      each other. A view with the content already shown changes nothing. */
  setView: (view: ScheduleView) => void;
  /** Puts a span of two wall-clock instants in view; `null` shows the
      subtasks' extent. */
  setDomain: (span: readonly [number, number] | null) => void;
  /** Folds or unfolds one **Lane group**. */
  toggleGroup: (id: string) => void;
  /** The time and the lane at a client point, or null outside the plot - and
      null while no schedule is mounted. */
  positionAt: (clientX: number, clientY: number) => { time: number; lane: string | null } | null;
  /** The client point of a time - on the middle of a lane where one is named -
      or null while the schedule is not on screen. */
  clientPointOf: (time: number, lane?: string) => { x: number; y: number } | null;
  /** The visible span, as two wall-clock instants. */
  visibleDomain: () => readonly [number, number];
  /** Scrolls the lanes until the lane's row is in view, and returns `true`; `false`
      and nothing changed for an unknown lane, one inside a folded **Lane group**
      (none is unfolded), or while no schedule is mounted. */
  scrollToLane: (lane: string) => boolean;
  /** Brings the subtask's lane and time into view, the span moving to it and keeping its
      width as `setDomain` would, and leaves the focus where it is; `false` and nothing
      changed in the cases of `scrollToLane`. */
  scrollToSubtask: (id: string) => boolean;
  /** Does what `scrollToSubtask` does, then makes the subtask the **Active subtask** and
      moves the focus to the plot, where the live region reads it out as the arrow keys do;
      `false` and nothing changed in the cases of `scrollToLane`. */
  focusSubtask: (id: string) => boolean;
  /** Folds every group. */
  foldAll: () => void;
  /** Unfolds every group. */
  unfoldAll: () => void;
}

/** Declares a schedule: hands back `Schedule` and the parts declared inside it
    - `Lane`, `LaneGroup`, `Subtasks`, `Dependencies`, `BlockedTimes`, `Milestones`, `DataTable` -, its
    `view` and the setters `setView`, `setDomain`, `toggleGroup`, `foldAll` and
    `unfoldAll`, `positionAt`, `clientPointOf` and `visibleDomain`, and `scrollToLane`, `scrollToSubtask` and
    `focusSubtask`. */
export function useSchedule(options: ScheduleOptions = {}): ScheduleParts {
  const { initialView, onViewChange } = options;
  const [scene] = useState(() => new ScheduleScene(initialView));
  /* The key of the view last reported, or applied by `setView` - what the
     effect below compares the view against. */
  const reported = useRef("");
  const [parts] = useState(() => {
    const Schedule = (props: ScheduleProps) => createElement(ScheduleOn, { ...props, scene });
    Schedule.displayName = "Schedule";
    return {
      Schedule,
      Lane,
      LaneGroup,
      Subtasks,
      Dependencies,
      BlockedTimes,
      Milestones,
      DataTable,
      setView: (next: ScheduleView) => {
        scene.applyView(next);
        reported.current = viewKey(scene.getView());
      },
      setDomain: scene.setDomain,
      positionAt: (clientX: number, clientY: number) => scene.positionAt(clientX, clientY),
      clientPointOf: (time: number, lane?: string) => scene.clientPointOf(time, lane),
      visibleDomain: () => scene.visibleDomain(),
      scrollToLane: (lane: string) => scene.scrollToLane(lane),
      scrollToSubtask: (id: string) => scene.scrollToSubtask(id),
      focusSubtask: (id: string) => scene.focusSubtask(id),
      toggleGroup: scene.toggleGroup,
      foldAll: scene.foldAll,
      unfoldAll: scene.unfoldAll,
    };
  });
  const view = useSyncExternalStore(scene.subscribeView, scene.getView, scene.getView);

  /* Every change the planner makes, once and whole, after the commit. The view
     the schedule starts with is where it starts, not a change - also once the
     groups declared took out the folds no group carries. `setView` has noted
     its view as reported already, so it is not one. */
  const key = viewKey(view);
  useEffect(() => {
    if (reported.current === key) return;
    reported.current = key;
    if (!scene.acted) return;
    onViewChange?.(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of the view, with that render's view and handler
  }, [key]);

  // A new object only when the view changed, as `useChart` hands its parts.
  return useMemo(() => ({ ...parts, view }), [parts, view]);
}
