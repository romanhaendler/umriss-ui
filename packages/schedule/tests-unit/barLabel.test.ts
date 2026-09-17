/* Where a bar's label lies, and when there is none (schedule-legibility 03).

   The label belongs to the main time - not to the setup, which is not the work
   - and it is the visible part of it: a bar that began before the view keeps
   its label at the view's edge, the way the day band keeps its date. */

import { describe, expect, it } from "vitest";
import { MIN_LABEL_WIDTH, barLabelBox } from "../src/geometry";
import type { SubtaskBox } from "../src/geometry";

function box(mainFrom: number, mainTo: number, extra: Partial<SubtaskBox> = {}): SubtaskBox {
  return {
    subtask: { id: "s", task: "t", lane: "l", from: 0, to: 0 },
    laneIndex: 0,
    depth: 0,
    y: 10,
    height: 23,
    outerFrom: mainFrom - 5,
    mainFrom,
    mainTo,
    outerTo: mainTo + 5,
    ...extra,
  };
}

describe("barLabelBox", () => {
  it("lies on the main time, not on the setup or the teardown", () => {
    expect(barLabelBox(box(100, 300), 800)).toEqual({ x: 100, width: 200, y: 10, height: 23 });
  });

  it("keeps the label at the view's edge where the bar began before it", () => {
    expect(barLabelBox(box(-150, 300), 800)).toEqual({ x: 0, width: 300, y: 10, height: 23 });
  });

  it("stops at the view's other edge", () => {
    expect(barLabelBox(box(600, 1200), 800)).toEqual({ x: 600, width: 200, y: 10, height: 23 });
  });

  it("gives no label to a bar too narrow to read one", () => {
    expect(barLabelBox(box(100, 100 + MIN_LABEL_WIDTH - 1), 800)).toBeNull();
    expect(barLabelBox(box(100, 100 + MIN_LABEL_WIDTH), 800)).not.toBeNull();
  });

  it("gives no label to a bar whose visible part is too narrow", () => {
    /* Two pixels of a wide bar are in view: a wide bar, no room for a word. */
    expect(barLabelBox(box(798, 1200), 800)).toBeNull();
  });

  it("gives no label to a bar outside the view", () => {
    expect(barLabelBox(box(-400, -100), 800)).toBeNull();
    expect(barLabelBox(box(900, 1200), 800)).toBeNull();
  });
});
