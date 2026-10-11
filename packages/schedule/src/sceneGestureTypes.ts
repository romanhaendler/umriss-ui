/* The vocabulary of the gestures: what a pointer interaction reports, what the
   host gives the gestures, the gesture states themselves and the ghost's label.
   Declarations and two constants - the behaviour is in `sceneGestures.ts`. */

import type { Intent, Subtask } from "./model";
import type { SceneData } from "./sceneData";
import type { ScheduleHit, SceneView } from "./sceneView";

/** A pointer interaction, reported with its target and its position. */
export interface ScheduleInteraction {
  /** `"hover"` is reported when the target under the pointer changes, not on
      every movement. */
  readonly type: "click" | "contextmenu" | "hover";
  /** What the pointer is on. */
  readonly hit: ScheduleHit;
  /** The pointer's horizontal client coordinate - where a `ContextMenu` opens. */
  readonly clientX: number;
  /** The pointer's vertical client coordinate. */
  readonly clientY: number;
  /** The wall-clock instant under the pointer. */
  readonly time: number;
  /** The lane under the pointer, or null below the last one. */
  readonly lane: string | null;
}

export interface SceneHandlers {
  /** Whether this subtask may go to this lane. Asked while a drag runs and
      again at the drop; absent means every lane is open. */
  canMoveTo?: (subtask: Subtask, lane: string) => boolean;
  onIntent?: (intent: Intent) => void;
  onInteraction?: (interaction: ScheduleInteraction) => void;
  onSelectedTaskChange?: (task: string | null, subtask: string | null) => void;
}

/** What the gestures need from the scene they belong to. */
export interface GestureHost {
  readonly data: SceneData;
  readonly view: SceneView;
  plotElement(): HTMLElement | null;
  handlers(): SceneHandlers;
  selectedSubtask(): string | null;
  /** A click chose a task and possibly one of its subtasks. */
  select(task: string | null, subtask: string | null): void;
  /** The view moved: lay out, publish, draw. */
  viewChanged(): void;
  /** The planner panned or zoomed. As `viewChanged`; where the span through
      time changed, it is reported as well. */
  viewMoved(time: boolean): void;
  /** Only interaction state changed: publish and draw. */
  interactionChanged(): void;
}

export type EditMode = "move" | "stretch-from" | "stretch-to" | "leadIn" | "leadOut";

/** What the application says it is dragging in, while it drags it: the
    browser hands over the dragged data only on the drop, so the ghost before
    the drop can only come from the caller. */
export interface PlacingItem {
  /** The caller's key for the dragged item; it comes back in the intent. */
  readonly item: string;
  /** The task the work belongs to. */
  readonly task: string;
  /** How long its main time is. */
  readonly duration: number;
  /** The lead-in it brings. */
  readonly leadIn?: number;
  /** The lead-out it brings. */
  readonly leadOut?: number;
}

/** The id the ghost of a drag from outside carries while it is in flight. It
    is never data: the placed subtask gets the caller's id (`subtaskFromPlace`). */
export const PLACING = "\u0000placing";

/* `refused` is the set of lanes the dragged work may not go to, asked once when
   the gesture took hold and carried by the gesture itself - so it cannot
   outlive it (`refusal.ts`). */
export type Gesture =
  | { kind: "none" }
  | { kind: "place"; ghost: Subtask; item: PlacingItem; refused: ReadonlySet<string> }
  | { kind: "pending"; pointerId: number; x0: number; y0: number; mode: EditMode | "pan"; subtask: Subtask | null }
  | { kind: "pan"; pointerId: number; lastX: number; lastY: number }
  /* `t0` is the working time the drag took hold at - not a pixel, because
     auto-pan moves the scale under a drag in flight. */
  | { kind: "edit"; pointerId: number; mode: EditMode; subtask: Subtask; t0: number; ghost: Subtask; refused: ReadonlySet<string> }
  | { kind: "pinch"; distance: number };

/** No lane refused - the answer for every gesture that cannot change a lane at
    all, and the value a gesture starts from. */
export const NONE_REFUSED: ReadonlySet<string> = new Set<string>();

/** The ghost's label, as the DOM reads it. */
export interface GhostSummary {
  /** The pointer stands over a lane this subtask may not go to; the ghost
      stayed where it was allowed. */
  readonly refused: boolean;
  /** Every lane this work may not go to, for the whole run of the gesture -
      the ids, so that an application can mark its own parts beside the plot
      the way the schedule marks the lanes. */
  readonly refusedLanes: readonly string[];
  /** The pointer stands where the work would cover blocked time; the ghost
      stayed where it was allowed. */
  readonly blocked: boolean;
  readonly x: number;
  readonly y: number;
  /** The height of the bar the label belongs to, so the label can go under it
      where there is no room above. */
  readonly height: number;
  readonly from: number;
  readonly to: number;
  readonly overlap: boolean;
  readonly violated: boolean;
}
