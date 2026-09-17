/* The value mapping of the DataViz marks (pure-logic-seams). What is checked are
   properties of the projection - the padding, the inversion of the y axis, the
   behaviour with a degenerate span - and not the formula itself. */

import { describe, expect, it } from "vitest";
import { clampFraction, project, percentDisplay } from "../src/components/DataViz/scale";

const WIDTH = 100;
const HEIGHT = 20;
const PADDING = 3;

describe("project", () => {
  it("delivers one point per value", () => {
    expect(project([1, 2, 3, 4], WIDTH, HEIGHT, PADDING)).toHaveLength(4);
  });

  it("spans the series across the full padded width", () => {
    const points = project([5, 9, 2], WIDTH, HEIGHT, PADDING);
    expect(points[0]![0]).toBe(PADDING);
    expect(points[points.length - 1]![0]).toBe(WIDTH - PADDING);
  });

  it("places the largest value at the top and the smallest at the bottom", () => {
    // y grows downwards: the maximum must have the smallest y value.
    const points = project([5, 9, 2], WIDTH, HEIGHT, PADDING);
    expect(points[1]![1]).toBe(PADDING);
    expect(points[2]![1]).toBe(HEIGHT - PADDING);
  });

  it("holds every point inside the padding", () => {
    for (const [x, y] of project([3, 8, 1, 6, 4], WIDTH, HEIGHT, PADDING)) {
      expect(x).toBeGreaterThanOrEqual(PADDING);
      expect(x).toBeLessThanOrEqual(WIDTH - PADDING);
      expect(y).toBeGreaterThanOrEqual(PADDING);
      expect(y).toBeLessThanOrEqual(HEIGHT - PADDING);
    }
  });

  /* A degenerate span: without a safeguard the division would be zero and every
     y would be NaN. */
  it("stays finite and on one height for a constant series", () => {
    const points = project([7, 7, 7], WIDTH, HEIGHT, PADDING);
    const heights = points.map(([, y]) => y);
    expect(heights.every(Number.isFinite)).toBe(true);
    expect(new Set(heights).size).toBe(1);
  });

  it("copes with a single value", () => {
    const points = project([7], WIDTH, HEIGHT, PADDING);
    expect(points).toHaveLength(1);
    expect(Number.isFinite(points[0]![0])).toBe(true);
    expect(Number.isFinite(points[0]![1])).toBe(true);
  });
});

describe("clampFraction", () => {
  it("holds the fraction between zero and one", () => {
    expect(clampFraction(-0.5)).toBe(0);
    expect(clampFraction(1.5)).toBe(1);
    expect(clampFraction(0.42)).toBe(0.42);
  });
});

describe("percentDisplay", () => {
  it("rounds the fraction to whole percent", () => {
    expect(percentDisplay(0.826)).toBe(83);
    expect(percentDisplay(0)).toBe(0);
    expect(percentDisplay(1)).toBe(100);
  });

  it("clamps before rounding", () => {
    expect(percentDisplay(1.4)).toBe(100);
    expect(percentDisplay(-2)).toBe(0);
  });
});
