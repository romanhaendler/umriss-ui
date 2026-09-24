/* charts-alternatives 01 (C1, C2): the rows of the data table as a pure
   module - the visible domain, the series merged on their x, and above the
   limit the downsampled course with the count it stands for. */

import { describe, expect, it } from "vitest";
import { tableRows } from "../src/table";
import type { Course } from "../src/downsample";
import { DEFAULT_CHARTS_WORDING } from "../src/wording";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";

function course(xs: number[], ys: number[]): Course {
  return { x: Float64Array.from(xs), y: Float64Array.from(ys), y0: null, length: xs.length };
}

describe("The rows of the data table", () => {
  it("keeps the visible domain, both ends included", () => {
    const rows = tableRows([course([0, 1, 2, 3, 4], [10, 11, 12, 13, 14])], 1, 3);
    expect(rows.x).toEqual([1, 2, 3]);
    expect(rows.at).toEqual([[0], [1], [2]]);
    expect(rows.courses[0]?.y[rows.at[0]?.[0] as number]).toBe(11);
    expect(rows.thinned).toBe(false);
    expect(rows.readings).toBe(3);
  });

  it("merges series on their x, with no reading where a series has none", () => {
    const rows = tableRows([course([0, 2, 4], [1, 2, 3]), course([1, 2, 3], [7, 8, 9])], 0, 4);
    expect(rows.x).toEqual([0, 1, 2, 3, 4]);
    expect(rows.at).toEqual([
      [0, -1],
      [-1, 0],
      [1, 1],
      [-1, 2],
      [2, -1],
    ]);
  });

  it("keeps a gap as a row whose reading is a gap", () => {
    const rows = tableRows([course([0, 1, 2], [1, Number.NaN, 3])], 0, 2);
    expect(rows.x).toEqual([0, 1, 2]);
    expect(Number.isNaN(rows.courses[0]?.y[rows.at[1]?.[0] as number] as number)).toBe(true);
  });

  it("shows every row up to the limit", () => {
    const xs = Array.from({ length: 500 }, (_, i) => i);
    const rows = tableRows([course(xs, xs)], 0, 499);
    expect(rows.x).toHaveLength(500);
    expect(rows.thinned).toBe(false);
  });

  it("above the limit shows the downsampled course and counts what it stands for", () => {
    const n = 600_000;
    const xs = Array.from({ length: n }, (_, i) => i);
    const ys = xs.map((i) => (i === 300_123 ? 1_000 : i === 400_321 ? -1_000 : Math.sin(i / 1_000)));
    const rows = tableRows([course(xs, ys)], 0, n - 1);
    expect(rows.thinned).toBe(true);
    expect(rows.readings).toBe(n);
    expect(rows.x.length).toBeLessThanOrEqual(500);
    // First, lowest, highest and last per stretch: the ends and both spikes stay.
    const kept = rows.courses[0] as Course;
    const values = Array.from(kept.y.subarray(0, kept.length));
    expect(rows.x[0]).toBe(0);
    expect(rows.x[rows.x.length - 1]).toBe(n - 1);
    expect(values).toContain(1_000);
    expect(values).toContain(-1_000);
  });

  it("thins several series to the same limit together", () => {
    const xs = Array.from({ length: 2_000 }, (_, i) => i);
    const rows = tableRows([course(xs, xs), course(xs, xs.map((v) => -v))], 0, 1_999);
    expect(rows.thinned).toBe(true);
    expect(rows.readings).toBe(2_000);
    expect(rows.x.length).toBeLessThanOrEqual(500);
  });

  it("stays under the limit where every stretch keeps its gaps as well", () => {
    const xs = Array.from({ length: 50_000 }, (_, i) => i);
    // A gap every seventh reading: each stretch keeps its first gap and the
    // one after its last reading besides first, min, max and last.
    const ys = xs.map((i) => (i % 7 === 3 ? Number.NaN : Math.sin(i)));
    const rows = tableRows([course(xs, ys)], 0, 49_999);
    expect(rows.thinned).toBe(true);
    expect(rows.x.length).toBeLessThanOrEqual(500);
  });

  it("counts readings only inside the visible domain", () => {
    const xs = Array.from({ length: 10_000 }, (_, i) => i);
    const rows = tableRows([course(xs, xs)], 100, 399);
    expect(rows.readings).toBe(300);
    expect(rows.thinned).toBe(false);
  });
});

describe("The downsampled caption", () => {
  it("says how many readings the rows stand for, in each language's digits", () => {
    expect(DEFAULT_CHARTS_WORDING.downsampled(604_800)).toBe(
      "Downsampled from 604,800 readings: the first, lowest, highest and last value of each stretch.",
    );
    expect(GERMAN_CHARTS_WORDING.downsampled(604_800)).toBe(
      "Ausgedünnt aus 604.800 Messwerten: erster, kleinster, größter und letzter Wert je Abschnitt.",
    );
  });
});
