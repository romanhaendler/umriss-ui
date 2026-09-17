/* The schedule's domain, as the caller holds it (CONTEXT.md, "The schedule").

   Plain data and nothing else: the schedule draws it and changes none of it
   (ADR-0023). Every time is a wall-clock instant in milliseconds, every
   duration milliseconds - the unit `Date.now()` has, and the one
   @umriss-ui/charts' time arithmetic speaks. */

import type { SubtaskAppearance } from "./appearance";

/** One whole undertaking. It is never drawn as a thing of its own: it shows as
    the colour its subtasks share, and in selection, which takes all of it. */
export interface Task {
  /** The caller's identity of the task. */
  readonly id: string;
  /** Any CSS colour - a literal, a token, `light-dark(…)`. The colour means what
      the caller's domain needs it to mean. */
  readonly color: string;
  /** What the task is called, where the schedule names it. */
  readonly name?: string;
}

/** The drawn interval: a main time on one lane, with an optional setup before
    it and a teardown after it. */
export interface Subtask {
  /** The caller's identity of the subtask. */
  readonly id: string;
  /** The id of the task it belongs to. */
  readonly task: string;
  /** The id of the lane it sits on. */
  readonly lane: string;
  /** Start of the main time. */
  readonly from: number;
  /** End of the main time. */
  readonly to: number;
  /** Duration of the setup before the main time; none is zero. */
  readonly setup?: number;
  /** Duration of the teardown after the main time; none is zero. */
  readonly teardown?: number;
  /** What the subtask is called, where the schedule names it. */
  readonly name?: string;
  /** What the bar says besides its colour: `"provisional"`, `"fixed"`,
      `"muted"`, `"open"`. Several hold at once; `"provisional"` and `"fixed"`
      contradict, and the later one in the list wins. */
  readonly appearance?: readonly SubtaskAppearance[];
  /** The share of the work that is done, from 0 to 1, drawn as a filled part
      of the bar. Without it nothing is claimed - an empty bar and a bar at
      zero per cent are two different statements. */
  readonly progress?: number;
}

/** A task's move between two of its subtasks: always from an end to a start. */
export interface Transport {
  /** The caller's identity of the transport. */
  readonly id: string;
  /** The id of the subtask it leaves. */
  readonly from: string;
  /** The id of the subtask it arrives at. */
  readonly to: string;
  /** How long the move takes. */
  readonly duration: number;
  /** Where it leaves: at the end of the main time, or after the teardown.
      Default `"teardown"` - the part leaves once the machine is cleared. */
  readonly leaves?: "main" | "teardown";
  /** Where it arrives: at the start of the main time, or before the setup.
      Default `"setup"` - the part must be there before the machine is set up. */
  readonly arrives?: "main" | "setup";
  /** How this one is drawn, where it is not drawn like the rest. It changes
      the picture and never the finding: whether a transport is late follows
      from `leaves` and `arrives` alone. */
  readonly route?: TransportRoute;
  /** Where on the bars this one's ends sit, where they do not sit like the
      rest. Also picture only. */
  readonly anchor?: TransportAnchor;
  /** Whether this one's ends are marked with a dot, where it is not marked
      like the rest. Also picture only. */
  readonly ends?: TransportEnds;
}

/** How a transport is drawn between its two ends: a curve that leaves and
    arrives forwards, a straight line, or axis-parallel segments. */
export type TransportRoute = "curve" | "straight" | "orthogonal";

/** Where on its bars a transport's ends sit: the middle of both, or the corner
    that faces the other stop - which is the shortest line between them. */
export type TransportAnchor = "centre" | "nearest";

/** Whether a transport's two ends carry a dot. The dot says where the line is
    anchored, which is worth saying while a plan is being read and is noise in a
    plan full of short moves - so it is the caller's choice. */
export type TransportEnds = "dot" | "none";

/** The interval a subtask occupies on its lane: setup and teardown included. */
export function occupied(subtask: Subtask): { from: number; to: number } {
  return { from: subtask.from - (subtask.setup ?? 0), to: subtask.to + (subtask.teardown ?? 0) };
}

/** When a transport leaves its subtask, by its anchor. */
export function departure(transport: Transport, from: Subtask): number {
  return (transport.leaves ?? "teardown") === "main" ? from.to : from.to + (from.teardown ?? 0);
}

/** When a transport has to have arrived at its subtask, by its anchor. */
export function arrival(transport: Transport, to: Subtask): number {
  return (transport.arrives ?? "setup") === "main" ? to.from : to.from - (to.setup ?? 0);
}

/* ---------------------------------------------------------------------- */
/* Intents (ADR-0023)                                                      */
/* ---------------------------------------------------------------------- */

/** Move the subtask in time: the main time keeps its length. */
export interface MoveIntent {
  readonly kind: "move";
  /** The id of the subtask. */
  readonly subtask: string;
  /** The new start of the main time. */
  readonly from: number;
  /** The new end of the main time. */
  readonly to: number;
}

/** Stretch the main time at one or both of its edges. */
export interface StretchIntent {
  readonly kind: "stretch";
  /** The id of the subtask. */
  readonly subtask: string;
  /** The new start of the main time. */
  readonly from: number;
  /** The new end of the main time. */
  readonly to: number;
}

/** Change the setup on its own. */
export interface SetupIntent {
  readonly kind: "setup";
  /** The id of the subtask. */
  readonly subtask: string;
  /** The new duration of the setup. */
  readonly setup: number;
}

/** Change the teardown on its own. */
export interface TeardownIntent {
  readonly kind: "teardown";
  /** The id of the subtask. */
  readonly subtask: string;
  /** The new duration of the teardown. */
  readonly teardown: number;
}

/** Put the subtask on another lane. */
export interface LaneIntent {
  readonly kind: "lane";
  /** The id of the subtask. */
  readonly subtask: string;
  /** The id of the new lane. */
  readonly lane: string;
}

/** Put work on the plan that was not on it: the answer to a drag from outside
    the schedule (schedule-refinement 07). It carries no subtask id - there is
    no subtask yet; the caller creates one, with its own identity, from
    `subtaskFromPlace`. */
export interface PlaceIntent {
  readonly kind: "place";
  /** The caller's key for the dragged item, as it declared it while dragging. */
  readonly item: string;
  /** The task the work belongs to. */
  readonly task: string;
  /** The lane it was dropped on. */
  readonly lane: string;
  /** Where its main time would start. */
  readonly from: number;
  /** Where its main time would end. */
  readonly to: number;
  /** The setup it was declared with. */
  readonly setup?: number;
  /** The teardown it was declared with. */
  readonly teardown?: number;
}

/** What the schedule reports when an interaction asks for a change. Every
    intent carries the values it asks for, not a difference: two intents of one
    drop - a move and a lane - give the same data in either order. */
export type Intent = MoveIntent | StretchIntent | SetupIntent | TeardownIntent | LaneIntent | PlaceIntent;

/** The names of the intents - the editing API of the schedule. */
export type IntentKind = Intent["kind"];

/** The subtask as the intent asks for it. An intent for another subtask leaves
    it as it is. */
export function applyIntent<S extends Subtask>(subtask: S, intent: Intent): S {
  /* A place intent has no subtask to apply it to: creating one is the caller's
     act, with the caller's identity (`subtaskFromPlace`). */
  if (intent.kind === "place" || intent.subtask !== subtask.id) return subtask;
  switch (intent.kind) {
    case "move":
    case "stretch":
      return { ...subtask, from: intent.from, to: intent.to };
    case "setup":
      return { ...subtask, setup: intent.setup };
    case "teardown":
      return { ...subtask, teardown: intent.teardown };
    case "lane":
      return { ...subtask, lane: intent.lane };
  }
}

/** The subtask a place intent asks for, under an id the caller chooses. */
export function subtaskFromPlace(intent: PlaceIntent, id: string): Subtask {
  return {
    id,
    task: intent.task,
    lane: intent.lane,
    from: intent.from,
    to: intent.to,
    ...(intent.setup === undefined ? {} : { setup: intent.setup }),
    ...(intent.teardown === undefined ? {} : { teardown: intent.teardown }),
  };
}
