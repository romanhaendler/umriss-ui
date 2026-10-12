/* Which points of an ascending channel can show in a view. */

import { describe, expect, it } from "vitest";
import { visibleWindow } from "../src/hit";

const x = Float64Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

describe("visibleWindow", () => {
  it("takes the points inside the span and one beyond each edge", () => {
    expect(visibleWindow(x, 10, 3.5, 5.5, 0)).toEqual([3, 7]);
  });

  it("takes a point that lies on an edge, and the one beyond it", () => {
    expect(visibleWindow(x, 10, 3, 5, 0)).toEqual([2, 7]);
  });

  it("widens the span by the reach of a mark on both sides", () => {
    expect(visibleWindow(x, 10, 4, 5, 1.5)).toEqual([2, 8]);
  });

  it("clamps at the ends of the channel", () => {
    expect(visibleWindow(x, 10, -5, 50, 0)).toEqual([0, 10]);
  });

  it("keeps next to nothing where the span lies beyond the data", () => {
    const [lo, hi] = visibleWindow(x, 10, 20, 30, 0);
    expect(hi - lo).toBeLessThanOrEqual(1);
    const [lo2, hi2] = visibleWindow(x, 10, -30, -20, 0);
    expect(hi2 - lo2).toBeLessThanOrEqual(1);
  });

  it("holds for an empty channel", () => {
    expect(visibleWindow(new Float64Array(0), 0, 0, 1, 0)).toEqual([0, 0]);
  });
});
