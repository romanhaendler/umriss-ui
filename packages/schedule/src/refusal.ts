/* Which lanes a gesture may not put its work on (CONTEXT.md, **Refusal**).

   Asked once, when the gesture takes hold, and held until it ends: the refused
   lanes can be drawn from the moment a drag begins, and `canMoveTo`, which
   reads the application's master data, is not asked on every pointer movement.

   A rule that changes mid-drag is therefore not noticed while the drag runs;
   the drop asks again (`sceneGestures.ts`), so the picture may be a moment
   old, the reported intent never is.

   Free of the DOM, the canvas and the view - lanes by id, and the caller's
   rule. */

import { occupied, type BlockedTime, type Subtask } from "./model";

/** Whether a gesture may not put its work here because of blocked time: the
    position covers blocked time on its lane that the work did not already
    cover where it came from.

    Blocked time is a refusal of a PLACE IN TIME, where `canMoveTo` refuses a
    whole lane - so it is asked per position and not held for the gesture; it
    is data the schedule has, no rule of the caller's to spare. What the work
    already covers is its home, as its own lane is for `refusedLanes`: never
    refused, since the data put it there and a drag that only nudges it must not
    be locked in place. `original` is null for work dragged in from outside. */
export function entersBlockedTime(position: Subtask, original: Subtask | null, blocked: readonly BlockedTime[]): boolean {
  const covers = (s: Subtask, b: BlockedTime) => {
    const own = occupied(s);
    return s.lane === b.lane && own.from < b.to && b.from < own.to;
  };
  return blocked.some((b) => covers(position, b) && !(original !== null && covers(original, b)));
}

/** The lanes this work may not go to.

    `home` is the lane it already sits on, or null for work dragged in from
    outside, which sits nowhere yet. Home is never asked about and never
    refused: the work IS there, and a rule that would turn it down now says
    nothing about a move the planner has not made. */
export function refusedLanes(
  lanes: readonly string[],
  subtask: Subtask,
  home: string | null,
  canMoveTo: ((subtask: Subtask, lane: string) => boolean) | undefined,
): ReadonlySet<string> {
  const refused = new Set<string>();
  if (canMoveTo === undefined) return refused;
  for (const lane of lanes) {
    if (lane === home) continue;
    if (!canMoveTo(subtask, lane)) refused.add(lane);
  }
  return refused;
}
