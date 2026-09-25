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

/** The drawn interval: a main time on one lane, with an optional lead-in before
    it and a lead-out after it. */
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
  /** Duration of the lead-in before the main time; none is zero. */
  readonly leadIn?: number;
  /** Duration of the lead-out after the main time; none is zero. */
  readonly leadOut?: number;
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

/** Two subtasks of one task in order: the later one may not begin before the
    earlier one ends plus a lag. Always from an end to a start. */
export interface Dependency {
  /** The caller's identity of the dependency. */
  readonly id: string;
  /** The id of the subtask it leaves. */
  readonly from: string;
  /** The id of the subtask it arrives at. */
  readonly to: string;
  /** The least time between the two anchors; zero where the successor may
      begin as soon as the predecessor ends. */
  readonly lag: number;
  /** Where it leaves: at the end of the main time, or after the lead-out.
      Default `"leadOut"` - the predecessor counts as ended once its lead-out is. */
  readonly leaves?: "main" | "leadOut";
  /** Where it arrives: at the start of the main time, or before the lead-in.
      Default `"leadIn"` - the lag must have run out before the successor's
      lead-in begins. */
  readonly arrives?: "main" | "leadIn";
  /** How this one is drawn, where it is not drawn like the rest. It changes
      the picture and never the finding: whether a dependency is violated follows
      from `leaves` and `arrives` alone. */
  readonly route?: DependencyRoute;
  /** Where on the bars this one's line attaches, where it does not attach like
      the rest. Also picture only, and not to be confused with the two anchors
      above: those say what the dependency connects, this says where the line
      touches. */
  readonly attach?: DependencyAttachment;
  /** Whether this one's ends are marked with a dot, where it is not marked
      like the rest. Also picture only. */
  readonly ends?: DependencyEnds;
}

/** How a dependency is drawn between its two ends: a curve that leaves and
    arrives forwards, a straight line, or axis-parallel segments. */
export type DependencyRoute = "curve" | "straight" | "orthogonal";

/** Where on its bars a dependency's line attaches: the middle of both, or the
    edge that faces the other stop - which is the shortest line between them.

    Deliberately not called an anchor: a dependency already HAS two anchors
    (`leaves`, `arrives`), and those decide what it connects and therefore
    whether it is violated. This decides where the line touches, and nothing else.
    The tree has an **Anchor** of its own as well (CONTEXT.md). */
export type DependencyAttachment = "centre" | "nearest";

/** Whether a dependency's two ends carry a dot. The dot says where the line is
    anchored, which is worth saying while a plan is being read and is noise in a
    plan full of short moves - so it is the caller's choice. */
export type DependencyEnds = "dot" | "none";

/** The interval a subtask occupies on its lane: lead-in and lead-out included. */
export function occupied(subtask: Subtask): { from: number; to: number } {
  return { from: subtask.from - (subtask.leadIn ?? 0), to: subtask.to + (subtask.leadOut ?? 0) };
}

/** When a dependency leaves its subtask, by its anchor. */
export function departure(dependency: Dependency, from: Subtask): number {
  return (dependency.leaves ?? "leadOut") === "main" ? from.to : from.to + (from.leadOut ?? 0);
}

/** When a dependency has to have arrived at its subtask, by its anchor. */
export function arrival(dependency: Dependency, to: Subtask): number {
  return (dependency.arrives ?? "leadIn") === "main" ? to.from : to.from - (to.leadIn ?? 0);
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

/** Change the lead-in on its own. */
export interface LeadInIntent {
  readonly kind: "leadIn";
  /** The id of the subtask. */
  readonly subtask: string;
  /** The new duration of the lead-in. */
  readonly leadIn: number;
}

/** Change the lead-out on its own. */
export interface LeadOutIntent {
  readonly kind: "leadOut";
  /** The id of the subtask. */
  readonly subtask: string;
  /** The new duration of the lead-out. */
  readonly leadOut: number;
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
  /** The lead-in it was declared with. */
  readonly leadIn?: number;
  /** The lead-out it was declared with. */
  readonly leadOut?: number;
}

/** What the schedule reports when an interaction asks for a change. Every
    intent carries the values it asks for, not a difference: two intents of one
    drop - a move and a lane - give the same data in either order. */
export type Intent = MoveIntent | StretchIntent | LeadInIntent | LeadOutIntent | LaneIntent | PlaceIntent;

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
    case "leadIn":
      return { ...subtask, leadIn: intent.leadIn };
    case "leadOut":
      return { ...subtask, leadOut: intent.leadOut };
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
    ...(intent.leadIn === undefined ? {} : { leadIn: intent.leadIn }),
    ...(intent.leadOut === undefined ? {} : { leadOut: intent.leadOut }),
  };
}
