/* Bin: the edges of a histogram. Pure arithmetic, tested directly - the bars
   stand at `x` on the numeric x axis (ADR-0002). */

import { describe, expect, it } from "vitest";
import { bin } from "../src/bin";

const counts = (b: ReturnType<typeof bin>) => b.map((x) => x.count);

describe("bin", () => {
  it("returns no bins for no values, or only values that are not numbers", () => {
    expect(bin([])).toEqual([]);
    expect(bin([Number.NaN, Number.POSITIVE_INFINITY, null, undefined])).toEqual([]);
  });

  it("makes one bin of a single value, starting on its edge", () => {
    expect(bin([5], { width: 1 })).toEqual([{ from: 5, to: 6, x: 5.5, count: 1 }]);
    expect(bin([7]).reduce((s, b) => s + b.count, 0)).toBe(1);
  });

  it("puts a value on an edge into the bin that edge starts", () => {
    const b = bin([0, 10, 19.9, 20], { width: 10, domain: [0, 30] });
    expect(counts(b)).toEqual([1, 2, 1]);
  });

  it("closes the last bin, so the greatest value is counted", () => {
    expect(counts(bin([0, 5, 10], { width: 5 }))).toEqual([1, 2]);
    expect(counts(bin([0, 30], { width: 10, domain: [0, 30] }))).toEqual([1, 0, 1]);
  });

  it("spans the data on the 1-2-5 grid for a count", () => {
    const b = bin([3, 18, 41, 97], { count: 5 });
    expect(b.map((x) => x.from)).toEqual([0, 20, 40, 60, 80]);
    expect(b[4]?.to).toBe(100);
    expect(counts(b)).toEqual([2, 0, 1, 0, 1]);
  });

  it("keeps decimal edges clean", () => {
    const b = bin([0, 0.3, 0.9], { width: 0.1 });
    expect(b[3]?.from).toBe(0.3);
    expect(b.length).toBe(9);
    expect(b[3]?.count).toBe(1);
  });

  it("takes a given domain as it is and drops what lies outside", () => {
    const b = bin([-1, 2, 4, 9, 11], { domain: [1, 10], count: 3 });
    expect(b.map((x) => [x.from, x.to])).toEqual([[1, 4], [4, 7], [7, 10]]);
    expect(counts(b)).toEqual([1, 1, 1]);
  });

  it("reads rows through an accessor and skips what is not finite", () => {
    const b = bin([{ v: 1 }, { v: null }, { v: 2 }, { v: 3 }], (r) => r.v, { width: 1 });
    expect(counts(b)).toEqual([1, 2]);
  });
});
