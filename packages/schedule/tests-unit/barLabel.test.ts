/* Where a bar's label lies, and when there is none (schedule-legibility 03).

   The label belongs to the main time - not to the setup, which is not the work
   - and it is the visible part of it: a bar that began before the view keeps
   its label at the view's edge, the way the day band keeps its date. */

import { describe, expect, it } from "vitest";
import { CAP, MIN_LABEL_WIDTH, barLabelBox } from "../src/geometry";
import type { SubtaskBox } from "../src/geometry";

function box(mainFrom: number, mainTo: number, extra: Partial<SubtaskBox> = {}): SubtaskBox {
  return {
    subtask: { id: "s", task: "t", lane: "l", from: 0, to: 0 },
    lane: "l",
    miniature: false,
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
  it("keeps its full height, whatever the bar says besides its colour", () => {
    /* Until schedule-lane-groups 02 a muted bar was drawn at half height and
       its label shrank with it. Muted now says it in SATURATION, so no
       appearance takes height from a label any more. */
    const plain = barLabelBox(box(100, 300), 800)!;
    for (const appearance of [["muted"], ["provisional"], ["open"], ["muted", "open"]] as const) {
      const marked = barLabelBox(box(100, 300, { subtask: { id: "s", task: "t", lane: "l", from: 0, to: 0, appearance: [...appearance] } }), 800)!;
      expect(marked).toEqual(plain);
    }
  });

  it("steps aside for the caps of a fixed bar", () => {
    /* A word must not lie on a mark - the hatch across a bar's face was taken
       away for that reason, and a cap must not walk into the same mistake. */
    const fixed = barLabelBox(box(100, 300, { subtask: { id: "s", task: "t", lane: "l", from: 0, to: 0, appearance: ["fixed"] } }), 800)!;
    expect(fixed.x).toBeGreaterThan(100 + CAP);
    expect(fixed.x + fixed.width).toBeLessThan(300 - CAP);
    /* It is an inset and nothing more: the height is untouched, and the two
       ends give up the same. */
    expect(fixed.y).toBe(10);
    expect(fixed.height).toBe(23);
    expect(fixed.x - 100).toBe(300 - (fixed.x + fixed.width));
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
