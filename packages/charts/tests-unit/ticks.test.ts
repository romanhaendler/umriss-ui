/* Tick algorithm and scale (R-7.3): table test cases including negative domains,
   very small steps and constant series. */

import { describe, expect, it } from "vitest";
import { decimalsForStep, dataDomain, niceDomain, tickStep, ticksFor } from "../src/ticks";
import { LinearScale } from "../src/scale";

describe("tickStep - the 1-2-5 grid", () => {
  const cases: ReadonlyArray<[number, number, number]> = [
    // [span, intended tick count, expected step]
    [10, 5, 2],
    [100, 5, 20],
    [1, 5, 0.2],
    [50, 4, 20],
    [94, 5, 20],
    [0.001, 5, 0.0002],
    [1_000_000, 4, 500_000],
    [7, 7, 1],
  ];
  for (const [span, target, expected] of cases) {
    it(`span ${span} at ${target} ticks → ${expected}`, () => {
      expect(tickStep(span, target)).toBeCloseTo(expected, 12);
    });
  }

  it("yields a usable step even for a degenerate span", () => {
    expect(tickStep(0, 5)).toBe(1);
    expect(tickStep(Number.NaN, 5)).toBe(1);
    expect(tickStep(-5, 5)).toBe(1);
  });

  it("allows only multiples of 1, 2 and 5 as the mantissa", () => {
    for (let i = 1; i < 400; i++) {
      const step = tickStep(i * 0.37, 6);
      const mantissa = step / Math.pow(10, Math.floor(Math.log10(step)));
      expect([1, 2, 5, 10]).toContain(Math.round(mantissa));
    }
  });
});

describe("decimalsForStep", () => {
  const cases: ReadonlyArray<[number, number]> = [
    [1, 0],
    [20, 0],
    [0.5, 1],
    [0.2, 1],
    [0.25, 2],
    [0.05, 2],
    [0.001, 3],
    [0.0002, 4],
  ];
  for (const [step, expected] of cases) {
    it(`step ${step} → ${expected} places`, () => {
      expect(decimalsForStep(step)).toBe(expected);
    });
  }
});

describe("niceDomain", () => {
  it("widens to nice boundaries", () => {
    expect(niceDomain(3, 97, 5)).toEqual([0, 100]);
    expect(niceDomain(18.2, 79.6, 5)).toEqual([0, 80]);
  });

  it("copes with negative domains", () => {
    expect(niceDomain(-7.3, -1.2, 5)).toEqual([-8, 0]);
    expect(niceDomain(-30, 12, 4)).toEqual([-40, 20]);
  });

  it("gives a constant series an artificial domain of ±1 (R-4.3)", () => {
    expect(niceDomain(5, 5, 5)).toEqual([4, 6]);
    expect(niceDomain(0, 0, 5)).toEqual([-1, 1]);
    expect(dataDomain(5, 5)).toEqual([4, 6]);
  });

  it("yields [0, 1] for unusable inputs", () => {
    expect(niceDomain(Number.NaN, 4, 5)).toEqual([0, 1]);
    expect(dataDomain(Number.POSITIVE_INFINITY, 4)).toEqual([0, 1]);
  });

  it("produces no −0", () => {
    const [, hi] = niceDomain(-7.3, -1.2, 5);
    expect(Object.is(hi, -0)).toBe(false);
  });
});

describe("ticksFor", () => {
  it("places ticks on multiples of the step", () => {
    expect(ticksFor(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(ticksFor(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6000000000000001, 0.8, 1]
      .map((v) => Number(v.toFixed(1))));
  });

  it("stays exact at very small steps", () => {
    expect(ticksFor(0, 0.001, 5)).toEqual([0, 0.0002, 0.0004, 0.0006, 0.0008, 0.001]);
  });

  it("covers negative domains", () => {
    expect(ticksFor(-7.3, -1.2, 5)).toEqual([-6, -4, -2]);
    expect(ticksFor(-8, 0, 4)).toEqual([-8, -6, -4, -2, 0]);
  });

  it("yields exactly one tick for a constant domain", () => {
    expect(ticksFor(5, 5, 5)).toEqual([5]);
  });

  it("tolerates swapped boundaries", () => {
    expect(ticksFor(10, 0, 5)).toEqual([0, 2, 4, 6, 8, 10]);
  });
});

describe("LinearScale", () => {
  it("maps the domain onto the range and back", () => {
    const s = new LinearScale([0, 100], [0, 200]);
    expect(s.toPx(0)).toBe(0);
    expect(s.toPx(50)).toBe(100);
    expect(s.toPx(100)).toBe(200);
    expect(s.fromPx(100)).toBe(50);
  });

  it("copes with an inverted range (the y axis)", () => {
    const s = new LinearScale([0, 10], [300, 100]);
    expect(s.toPx(0)).toBe(300);
    expect(s.toPx(10)).toBe(100);
    expect(s.fromPx(200)).toBeCloseTo(5, 12);
  });

  it("lands a degenerate domain in the middle of the range, without dividing by 0", () => {
    const s = new LinearScale([5, 5], [0, 200]);
    expect(s.toPx(5)).toBe(100);
    expect(Number.isFinite(s.toPx(99))).toBe(true);
    expect(s.fromPx(0)).toBe(5);
  });

  it("yields ticks through the same rule as ticksFor", () => {
    const s = new LinearScale([0, 10], [0, 100]);
    expect(s.ticks(5)).toEqual(ticksFor(0, 10, 5));
  });
});
