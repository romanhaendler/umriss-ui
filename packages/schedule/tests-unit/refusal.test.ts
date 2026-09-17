/* The refused lanes of a gesture (schedule-lane-groups 01).

   The point of the module is that the caller's rule is asked ONCE per lane,
   when the gesture takes hold, and that the answer then stands for the whole
   run of it - so a planner is shown the refusal before meeting it, and a rule
   that reads master data is not asked again on every pointer movement. Both
   halves are tested here: which lanes come back, and how often the rule was
   asked to say so. */

import { describe, expect, it, vi } from "vitest";
import { refusedLanes } from "../src/refusal";
import type { Subtask } from "../src/model";

const MIN = 60_000;
const at = (minutes: number) => Date.UTC(2026, 2, 17, 6, 0) + minutes * MIN;

const LANES = ["press-1", "press-2", "weld", "paint"];
const MOULDED: Subtask = { id: "moulded", task: "bound", lane: "press-2", from: at(0), to: at(120) };

/* The mould fits the presses and nothing else - the rule of the example. */
const mayGo = (_subtask: Subtask, lane: string) => lane.startsWith("press");

describe("the refused lanes of a gesture", () => {
  it("refuses nothing without a rule", () => {
    expect(refusedLanes(LANES, MOULDED, MOULDED.lane, undefined)).toEqual(new Set());
  });

  it("holds the lanes the rule turns down", () => {
    expect(refusedLanes(LANES, MOULDED, MOULDED.lane, mayGo)).toEqual(new Set(["weld", "paint"]));
  });

  it("never refuses the lane the work already sits on", () => {
    /* It is already there: a rule that would turn it down now says nothing
       about a move the planner has not made. */
    expect(refusedLanes(LANES, MOULDED, "weld", mayGo).has("weld")).toBe(false);
  });

  it("asks about every other lane exactly once", () => {
    const rule = vi.fn(mayGo);
    refusedLanes(LANES, MOULDED, MOULDED.lane, rule);
    expect(rule).toHaveBeenCalledTimes(LANES.length - 1);
    expect(rule.mock.calls.map(([, lane]) => lane)).toEqual(["press-1", "weld", "paint"]);
  });

  it("asks with the subtask it was given", () => {
    const rule = vi.fn(mayGo);
    refusedLanes(LANES, MOULDED, MOULDED.lane, rule);
    for (const [subtask] of rule.mock.calls) expect(subtask).toBe(MOULDED);
  });

  it("asks about every lane where the work has no home yet", () => {
    /* Work dragged in from outside sits nowhere, so no lane is spared. */
    const rule = vi.fn(mayGo);
    expect(refusedLanes(LANES, MOULDED, null, rule)).toEqual(new Set(["weld", "paint"]));
    expect(rule).toHaveBeenCalledTimes(LANES.length);
  });

  it("holds no lane the schedule does not have", () => {
    expect(refusedLanes([], MOULDED, null, () => false)).toEqual(new Set());
  });
});
