/* useSchedule - where a schedule is declared, as a table is through useTable
   (ADR-0017, ADR-0048), and where its view stands (ADR-0047).

   It binds no row type: subtasks, tasks, lanes and blocked time are the
   library's own types. What it gives is the one place a schedule is declared
   from: the parts, the view and its setters. The parts are the same on every
   render, whatever the view does, so nothing is remounted. */

import { createElement, forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { Schedule as ScheduleOn, type ScheduleHandle, type ScheduleProps } from "./Schedule";
import { BlockedTimes, Dependencies, Lane, LaneGroup, Subtasks } from "./parts";
import { ScheduleScene } from "./scene";
import { Echoes } from "@umriss-ui/charts";
import { viewKey, type ScheduleView } from "./view";

/** What `useSchedule` takes: the view to start from and the handler that
    hears every change of it. */
export interface ScheduleOptions {
  /** The view to start from, and to go to whenever one differing in content
      from the last is handed in - the same view again changes nothing, and
      what it leaves out is reset; one the schedule reported itself, handed
      back late, is its own state coming back and not gone to. The schedule
      remembers none: where a view is kept is the application's decision. */
  initialView?: ScheduleView;
  /** Every change of the view, once, always the whole view - the one to keep,
      or to hand another schedule as its `initialView`. A pan or zoom is
      reported at most once per frame. Not called for the view the schedule
      starts with. */
  onViewChange?: (view: ScheduleView) => void;
}

/** What `useSchedule` hands back: the schedule and what is declared inside
    it, its view and the setters that change it. */
export interface ScheduleParts {
  /** The schedule. One per `useSchedule`: a second schedule is a second call. */
  Schedule: ForwardRefExoticComponent<ScheduleProps & RefAttributes<ScheduleHandle>>;
  Lane: typeof Lane;
  LaneGroup: typeof LaneGroup;
  Subtasks: typeof Subtasks;
  Dependencies: typeof Dependencies;
  BlockedTimes: typeof BlockedTimes;
  /** How the planner is looking at the plan: the span and the folded groups. */
  view: ScheduleView;
  /** Puts a span of two wall-clock instants in view; `null` shows the
      subtasks' extent. */
  setDomain: (span: readonly [number, number] | null) => void;
  /** Folds or unfolds one **Lane group**. */
  toggleGroup: (id: string) => void;
  /** Folds every group. */
  foldAll: () => void;
  /** Unfolds every group. */
  unfoldAll: () => void;
}

/** Declares a schedule: hands back `Schedule` and the parts declared inside it
    - `Lane`, `LaneGroup`, `Subtasks`, `Dependencies`, `BlockedTimes` -, its
    `view` and the setters `setDomain`, `toggleGroup`, `foldAll` and
    `unfoldAll`. A ref on `Schedule` still gives the `ScheduleHandle`. */
export function useSchedule(options: ScheduleOptions = {}): ScheduleParts {
  const { initialView, onViewChange } = options;
  const [scene] = useState(() => new ScheduleScene(initialView));
  const [echoes] = useState(() => new Echoes());
  const [parts] = useState(() => {
    const Schedule = forwardRef<ScheduleHandle, ScheduleProps>((props, ref) => createElement(ScheduleOn, { ...props, scene, ref }));
    Schedule.displayName = "Schedule";
    return {
      Schedule,
      Lane,
      LaneGroup,
      Subtasks,
      Dependencies,
      BlockedTimes,
      setDomain: scene.setDomain,
      toggleGroup: scene.toggleGroup,
      foldAll: scene.foldAll,
      unfoldAll: scene.unfoldAll,
    };
  });
  const view = useSyncExternalStore(scene.subscribeView, scene.getView, scene.getView);

  /* A view handed in applies whenever its content differs from the last one
     handed in and is no report of the schedule's own coming back late - before
     the paint, so the old view never shows for a frame. */
  const handedKey = initialView === undefined ? null : viewKey(initialView);
  const lastHanded = useRef(handedKey);
  useLayoutEffect(() => {
    if (initialView === undefined || handedKey === null || handedKey === lastHanded.current) return;
    lastHanded.current = handedKey;
    const echo = echoes.has(handedKey);
    echoes.handed(handedKey);
    if (!echo) scene.applyView(initialView);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- by content, not by identity
  }, [handedKey]);

  /* Every change of the view, once and whole, after the commit. The view the
     schedule starts with is where it starts, not a change - also once the
     groups declared took out the folds no group carries. */
  const key = viewKey(view);
  const reported = useRef(key);
  useEffect(() => {
    if (reported.current === key) return;
    reported.current = key;
    if (!scene.acted) return;
    echoes.reported(key);
    onViewChange?.(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of the view, with that render's view and handler
  }, [key]);

  // A new object only when the view changed, as `useChart` hands its parts.
  return useMemo(() => ({ ...parts, view }), [parts, view]);
}
