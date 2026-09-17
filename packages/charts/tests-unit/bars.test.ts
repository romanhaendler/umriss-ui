/* Bar geometry (ADR-0002).
   The arithmetic behind which there is no pictorial intuition: how wide a bar is,
   where its edges lie and how several bar series share one step. Half a bar out of
   place does not show up on a canvas. */

import { describe, expect, it } from "vitest";
import {
  barGroups,
  barPlacement,
  measureStep,
  effectiveStep,
} from "../src/bars";
import type { SeriesKind } from "../src/types";

function x(...values: number[]): Float64Array {
  return Float64Array.from(values);
}

describe("measureStep - smallest distance between two x values", () => {
  it("finds the distance at an even distribution", () => {
    expect(measureStep(x(0, 1, 2, 3), 4)).toBe(1);
    expect(measureStep(x(0, 10, 20), 3)).toBe(10);
  });

  it("takes the smallest gap at an uneven distribution", () => {
    // The consequence: in the thinly occupied areas gaps open up between the
    // bars. That is right, and not what a band scale would draw.
    expect(measureStep(x(0, 1, 5, 6, 20), 5)).toBe(1);
  });

  it("reports 0 where there is no distance", () => {
    expect(measureStep(x(5), 1)).toBe(0);
    expect(measureStep(x(), 0)).toBe(0);
    expect(measureStep(x(3, 3, 3), 3)).toBe(0);
  });
});

describe("effectiveStep - the replacement where no distance is measurable", () => {
  it("takes the measured distance where there is one", () => {
    expect(effectiveStep(2, 100)).toBe(2);
  });

  it("otherwise takes the width of the extent", () => {
    // A single data point thereby gets a visible bar instead of one of width
    // zero.
    expect(effectiveStep(0, 100)).toBe(100);
  });
});

describe("barPlacement - edge and width in domain units", () => {
  it("centres a single bar on its x value", () => {
    expect(barPlacement(10, 0.8, 0, 1)).toEqual({ offset: -4, width: 8 });
  });

  it("divides the group width among the members", () => {
    expect(barPlacement(10, 0.8, 0, 2)).toEqual({ offset: -4, width: 4 });
    expect(barPlacement(10, 0.8, 1, 2)).toEqual({ offset: 0, width: 4 });
  });

  it("centres the group as a whole, not its first member", () => {
    // Without centring, with two members every bar would sit half a step to the
    // right of its own mark - and that would look plausible.
    const left = barPlacement(10, 0.8, 0, 2);
    const right = barPlacement(10, 0.8, 1, 2);
    expect(left.offset).toBe(-(left.width + right.width) / 2);
    expect(right.offset + right.width).toBe((left.width + right.width) / 2);
  });

  it("lets three members neither overlap nor leave an edge uneven", () => {
    const placements = [0, 1, 2].map((k) => barPlacement(9, 1, k, 3));
    expect(placements.map((l) => l.width)).toEqual([3, 3, 3]);
    expect(placements.map((l) => l.offset)).toEqual([-4.5, -1.5, 1.5]);
    const last = placements[2] as { offset: number; width: number };
    expect(last.offset + last.width).toBe(4.5);
  });

  it("yields a bar without width at a step of 0", () => {
    expect(barPlacement(0, 0.8, 0, 1)).toEqual({ offset: 0, width: 0 });
  });
});

describe("barGroups - who shares one step", () => {
  function candidate(
    order: number,
    kind: SeriesKind,
    xAxisId: string,
    step = 10,
    fraction = 0.8,
  ) {
    return { order, kind, xAxisId, step, fraction };
  }

  it("counts only bars and only those of the same x axis", () => {
    const groups = barGroups([
      candidate(1, "line", "x"),
      candidate(2, "bar", "x"),
      candidate(3, "scatter", "x"),
      candidate(4, "bar", "x"),
      candidate(5, "bar", "top"),
    ]);
    expect(groups.get(2)).toMatchObject({ index: 0, size: 2 });
    expect(groups.get(4)).toMatchObject({ index: 1, size: 2 });
    // Another x axis is another group.
    expect(groups.get(5)).toMatchObject({ index: 0, size: 1 });
    // Whatever is not a bar does not appear in the map.
    expect(groups.has(1)).toBe(false);
    expect(groups.has(3)).toBe(false);
  });

  it("assigns the indices in registration order", () => {
    const groups = barGroups([
      candidate(7, "bar", "x"),
      candidate(9, "bar", "x"),
      candidate(11, "bar", "x"),
    ]);
    expect([7, 9, 11].map((o) => groups.get(o)?.index)).toEqual([0, 1, 2]);
    expect([7, 9, 11].map((o) => groups.get(o)?.size)).toEqual([3, 3, 3]);
  });

  it("gives the whole group the smallest step of its members", () => {
    // Series-own data can be of differing density. If every member calculated
    // with its own step, they would get different widths and different offsets -
    // and lie on top of one another.
    const groups = barGroups([
      candidate(1, "bar", "x", 10),
      candidate(2, "bar", "x", 4),
    ]);
    expect(groups.get(1)?.step).toBe(4);
    expect(groups.get(2)?.step).toBe(4);
  });

  it("passes over an unmeasurable step when choosing the smallest", () => {
    // 0 means "not measurable", not "tiny".
    const groups = barGroups([
      candidate(1, "bar", "x", 0),
      candidate(2, "bar", "x", 6),
    ]);
    expect(groups.get(1)?.step).toBe(6);
    expect(groups.get(2)?.step).toBe(6);
  });

  it("reports 0 when no member has a measurable step", () => {
    const groups = barGroups([candidate(1, "bar", "x", 0)]);
    expect(groups.get(1)?.step).toBe(0);
  });

  it("gives the whole group the width fraction of its first member", () => {
    // Otherwise the members would compute their offsets from different group
    // widths and the arrangement would fall apart.
    const groups = barGroups([
      candidate(1, "bar", "x", 10, 0.6),
      candidate(2, "bar", "x", 10, 0.9),
    ]);
    expect(groups.get(1)?.fraction).toBe(0.6);
    expect(groups.get(2)?.fraction).toBe(0.6);
  });

  it("lets two members with different data not overlap", () => {
    const groups = barGroups([
      candidate(1, "bar", "x", 10),
      candidate(2, "bar", "x", 4),
    ]);
    const a = groups.get(1) as { index: number; size: number; step: number; fraction: number };
    const b = groups.get(2) as { index: number; size: number; step: number; fraction: number };
    const placementA = barPlacement(a.step, a.fraction, a.index, a.size);
    const placementB = barPlacement(b.step, b.fraction, b.index, b.size);
    expect(placementA.offset + placementA.width).toBeLessThanOrEqual(placementB.offset);
  });

  it("yields an empty map for a list without bars", () => {
    expect(barGroups([candidate(1, "line", "x")]).size).toBe(0);
  });
});
