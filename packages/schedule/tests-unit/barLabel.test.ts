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
  it("is the bar as it is drawn: a muted bar is slim, and so is its label", () => {
    const plain = barLabelBox(box(100, 300), 800)!;
    const muted = barLabelBox(box(100, 300, { subtask: { id: "s", task: "t", lane: "l", from: 0, to: 0, appearance: ["muted"] } }), 800)!;
    expect(muted.height).toBeLessThan(plain.height);
    expect(muted.y).toBeGreaterThan(plain.y);
    /* Centred in the same box, so the two share a middle within a pixel. */
    expect(Math.abs(muted.y + muted.height / 2 - (plain.y + plain.height / 2))).toBeLessThanOrEqual(1);
  });

  it("lies on the main time, not on the setup or the teardown", () => {
    expect(barLabelBox(box(100, 300), 800)).toEqual({ x: 100, width: 200, y: 10, height: 23 });
  });

  it("keeps the label at the view's edge where the bar began before it", () => {
    expect(barLabelBox(box(-150, 300), 800)).toEqual({ x: 0, width: 300, y: 10, height: 23 });
  });

  it("stops at the view's other edge", () => {
    expect(barLabelBox(box(600, 1200), 800)).toEqual({ x: 600, width: 200, y: 10, height: 23 });
  });

  /* Sixty-four pixels, written out: about seven characters at the type size
     the labels are set in, which is an order number. The constant carries the
     same number and the reason. */
  it("gives no label to a bar too narrow to read one", () => {
    expect(MIN_LABEL_WIDTH).toBe(64);
    expect(barLabelBox(box(100, 163), 800)).toBeNull();
    expect(barLabelBox(box(100, 164), 800)).not.toBeNull();
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
