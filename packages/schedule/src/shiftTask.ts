/* Shifting a whole task: one move intent per subtask of the task, each by the
   same amount, so every dependency that fitted still fits. */

import type { MoveIntent, Subtask } from "./model";

/** The moves that carry a whole task in time - every subtask of it by the same
    amount, so that its lengths and the distances between its stops stay as
    they were. The schedule never runs it: apply the moves like any other
    intent, or run `ripple` over them first.
    @param subtasks All subtasks; only those of `task` are moved.
    @param task The id of the task, as its subtasks name it in `task`.
    @param by How far, in milliseconds; negative is earlier.
    @returns One move intent per subtask of the task - none where `by` is zero
      or not finite. */
export function shiftTask(subtasks: readonly Subtask[], task: string, by: number): MoveIntent[] {
  if (by === 0 || !Number.isFinite(by)) return [];
  return subtasks
    .filter((subtask) => subtask.task === task)
    .map((subtask) => ({ kind: "move", subtask: subtask.id, from: subtask.from + by, to: subtask.to + by }));
}
