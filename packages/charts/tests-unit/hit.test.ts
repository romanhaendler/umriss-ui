/* Binary search: edges, gaps, special cases (R-7.3). */

import { describe, expect, it } from "vitest";
import { nearestIndex } from "../src/hit";

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
