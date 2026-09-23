/* Binary search: edges, gaps, special cases (R-7.3). */

import { describe, expect, it } from "vitest";
import { nearestIndex, nearestPoint } from "../src/hit";
import { LinearScale } from "../src/scale";

const x = Float64Array.from([0, 10, 20, 30, 40]);

describe("nearestIndex", () => {
  it("finds the exact hit", () => {
    expect(nearestIndex(x, x.length, 20)).toBe(2);
  });

  it("rounds to the nearer neighbour", () => {
    expect(nearestIndex(x, x.length, 14)).toBe(1);
    expect(nearestIndex(x, x.length, 16)).toBe(2);
    expect(nearestIndex(x, x.length, 15)).toBe(1); // a tie goes to the left point
  });

  it("clamps at the edges", () => {
    expect(nearestIndex(x, x.length, -100)).toBe(0);
    expect(nearestIndex(x, x.length, 0)).toBe(0);
    expect(nearestIndex(x, x.length, 40)).toBe(4);
    expect(nearestIndex(x, x.length, 1e9)).toBe(4);
  });

  it("copes with one point and with none", () => {
    expect(nearestIndex(Float64Array.from([7]), 1, -3)).toBe(0);
    expect(nearestIndex(new Float64Array(0), 0, 5)).toBe(-1);
  });

  it("copes with duplicate x values", () => {
    const d = Float64Array.from([0, 5, 5, 5, 9]);
    expect([1, 2, 3]).toContain(nearestIndex(d, d.length, 5));
  });

  it("works correctly on large arrays too", () => {
    const large = new Float64Array(100_000);
    for (let i = 0; i < large.length; i++) large[i] = i * 0.5;
    expect(nearestIndex(large, large.length, 12_345.4)).toBe(24_691);
    expect(nearestIndex(large, large.length, 49_999.5)).toBe(99_999);
  });
});

/* charts-fixes 10: a scatter under "nearest" was hit by x alone - a point
   straight above the pointer beat one right beside it. */
describe("nearestPoint - x and y, in pixels", () => {
  // One unit is one pixel on both axes.
  const unit = new LinearScale([0, 100], [0, 100]);
  const px = Float64Array.from([10, 12, 30]);
  const py = Float64Array.from([90, 11, 10]);

  it("takes the point nearest in both dimensions, not in x alone", () => {
    // Nearest in x is index 0 (x 10), 80 px away in y.
    expect(nearestPoint(px, py, 3, 11, 10, unit, unit)).toBe(1);
    expect(nearestPoint(px, py, 3, 28, 10, unit, unit)).toBe(2);
  });

  it("skips a gap and yields -1 where every y is one", () => {
    const gap = Float64Array.from([90, Number.NaN, 10]);
    expect(nearestPoint(px, gap, 3, 11, 10, unit, unit)).toBe(2);
    expect(nearestPoint(px, Float64Array.from([Number.NaN, Number.NaN, Number.NaN]), 3, 11, 10, unit, unit)).toBe(-1);
    expect(nearestPoint(px, py, 0, 11, 10, unit, unit)).toBe(-1);
  });
});
