/* The schedule's domain, as the caller holds it (CONTEXT.md, "The schedule").

   Plain data and nothing else: the schedule draws it and changes none of it
   (ADR-0023). Every time is a wall-clock instant in milliseconds, every
   duration milliseconds - the unit `Date.now()` has, and the one
   @umriss-ui/charts' time arithmetic speaks. */

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
}

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

/** What the schedule reports when an interaction asks for a change. Every
    intent carries the values it asks for, not a difference: two intents of one
    drop - a move and a lane - give the same data in either order. */
export type Intent = MoveIntent | StretchIntent | SetupIntent | TeardownIntent | LaneIntent;

/** The names of the intents - the editing API of the schedule. */
export type IntentKind = Intent["kind"];

/** The subtask as the intent asks for it. An intent for another subtask leaves
    it as it is. */
export function applyIntent<S extends Subtask>(subtask: S, intent: Intent): S {
  if (intent.subtask !== subtask.id) return subtask;
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
