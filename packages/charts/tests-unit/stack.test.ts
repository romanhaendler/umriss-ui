/* Stacking (charts-stacking 01, 03): the sums behind a stacked bar or area.
   A stack a few units off still looks like a stack, so the arithmetic is
   checked in literals. */

import { describe, expect, it } from "vitest";
import { stackSeries, type StackInput } from "../src/stack";

const f = (...v: number[]) => Float64Array.from(v);
const member = (x: number[], y: number[]): StackInput => ({ x: f(...x), y: f(...y), length: x.length });
const list = (a: Float64Array) => Array.from(a);

describe("stackSeries", () => {
  it("stands each member on the sum of the ones below it", () => {
    const [a, b, c] = stackSeries([
      member([0, 1], [1, 2]),
      member([0, 1], [3, 4]),
      member([0, 1], [5, 6]),
    ]);
    expect(list(a!.bottom)).toEqual([0, 0]);
    expect(list(a!.top)).toEqual([1, 2]);
    expect(list(b!.bottom)).toEqual([1, 2]);
    expect(list(b!.top)).toEqual([4, 6]);
    expect(list(c!.bottom)).toEqual([4, 6]);
    expect(list(c!.top)).toEqual([9, 12]);
    expect(list(c!.value)).toEqual([5, 6]);
    expect(list(a!.total)).toEqual([9, 12]);
  });

  it("stacks a gap as zero above it, and keeps it a gap in its own member", () => {
    const [a, b] = stackSeries([member([0, 1], [2, Number.NaN]), member([0, 1], [3, 4])]);
    expect(a!.top[1]).toBeNaN();
    expect(a!.bottom[1]).toBeNaN();
    expect(a!.value[1]).toBeNaN();
    expect(list(b!.bottom)).toEqual([2, 0]);
    expect(list(b!.top)).toEqual([5, 4]);
    expect(list(b!.total)).toEqual([5, 4]);
  });

  it("stacks negatives downward from zero, apart from the positives", () => {
    const [a, b, c] = stackSeries([member([0], [3]), member([0], [-2]), member([0], [-1])]);
    expect([a!.bottom[0], a!.top[0]]).toEqual([0, 3]);
    expect([b!.bottom[0], b!.top[0]]).toEqual([0, -2]);
    expect([c!.bottom[0], c!.top[0]]).toEqual([-2, -3]);
    expect(c!.total[0]).toBe(0);
  });

  it("matches members by x, a missing reading counting as zero", () => {
    const [, b] = stackSeries([member([0, 2], [1, 1]), member([0, 1, 2], [5, 5, 5])]);
    expect(list(b!.bottom)).toEqual([1, 0, 1]);
    expect(list(b!.top)).toEqual([6, 5, 6]);
  });

  it("normalises every x to 100, negatives by their size", () => {
    const [a, b] = stackSeries([member([0, 1], [1, 3]), member([0, 1], [3, -1])], true);
    expect(list(a!.value)).toEqual([25, 75]);
    expect(list(b!.value)).toEqual([75, -25]);
    expect(list(b!.top)).toEqual([100, -25]);
    // The total stays the readings' own.
    expect(list(a!.total)).toEqual([4, 2]);
  });

  it("tops a normalised stack at exactly 100, where shares summed would not", () => {
    // Three thirds of 100 summed as shares are 99.99999999999999.
    const [, , c] = stackSeries([member([0], [1]), member([0], [1]), member([0], [1])], true);
    expect(c!.top[0]).toBe(100);
  });

  it("gives an x of zeros no shares rather than NaN", () => {
    const [a] = stackSeries([member([0], [0]), member([0], [0])], true);
    expect(a!.value[0]).toBe(0);
    expect(a!.top[0]).toBe(0);
  });
});
