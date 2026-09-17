/* Which lanes a gesture may not put its work on (CONTEXT.md, **Refusal**).

   Asked once, when the gesture takes hold, and held until it ends. Two reasons,
   and the first is the one a planner notices: a refusal that is known before
   the pointer arrives can be DRAWN - the lanes are marked the moment a drag
   begins, so nobody has to try a lane to learn it is closed. The second is
   arithmetic: `canMoveTo` reads a plant's master data, and a rule asked anew on
   every pointer movement would be asked hundreds of times for one drag.

   Holding the answer means a rule that changes mid-drag is not noticed while
   the drag runs. That is why the drop asks again (`sceneGestures.ts`): the
   picture may be a moment old, the reported intent never is.

   Free of the DOM, the canvas and the view - lanes by id, and the caller's
   rule. */

import type { Subtask } from "./model";

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
