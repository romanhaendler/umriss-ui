/* Shifting a whole task: one move per subtask, lengths and distances kept
   (schedule-refinement 04). Expected values by hand, in minutes. */

import { describe, expect, it } from "vitest";
import { shiftTask } from "../src/shiftTask";
import type { Subtask } from "../src/model";

const MIN = 60_000;
const at = (minutes: number) => Date.UTC(2026, 2, 17, 6, 0) + minutes * MIN;

const DATA: Subtask[] = [
  { id: "a-1", task: "a", lane: "saw", from: at(0), to: at(60), leadIn: 15 * MIN },
  { id: "b-1", task: "b", lane: "saw", from: at(60), to: at(90) },
  { id: "a-2", task: "a", lane: "mill", from: at(100), to: at(160) },
];

describe("shiftTask", () => {
  it("moves every subtask of the task by the amount, in the order of the data", () => {
    expect(shiftTask(DATA, "a", 30 * MIN)).toEqual([
      { kind: "move", subtask: "a-1", from: at(30), to: at(90) },
      { kind: "move", subtask: "a-2", from: at(130), to: at(190) },
    ]);
  });

  it("moves earlier with a negative amount", () => {
    expect(shiftTask(DATA, "b", -15 * MIN)).toEqual([{ kind: "move", subtask: "b-1", from: at(45), to: at(75) }]);
  });

  it("gives nothing for no amount or an unknown task", () => {
    expect(shiftTask(DATA, "a", 0)).toEqual([]);
    expect(shiftTask(DATA, "nobody", 30 * MIN)).toEqual([]);
  });
});
