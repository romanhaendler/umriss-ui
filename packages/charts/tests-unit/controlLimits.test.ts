/* Control chart (ADR-0008): control limits and violation rules.
   The arithmetic of statistical process control, behind which there is no
   pictorial intuition. Expected values come from the published constant and from
   hand calculation, never from running the implementation. */

import { describe, expect, it } from "vitest";
import {
  controlLimits,
  ruleOutlier,
  ruleRun,
  ruleTrend,
  ruleTwoOfThree,
  sigmaFromLimit,
  defaultRules,
  violatedIndices,
  violations,
  zones,
} from "../src/controlLimits";

/** Limits by hand instead of calculated: centre line 0, sigma 1. That way the
    rule examples read without a side calculation. */
function unitLimits() {
  return controlLimits([], { kind: "given", center: 0, sigma: 1 });
}

describe("controlLimits - sigma out of the mean moving range", () => {
  // By hand: values 10, 12, 11, 13, 12, 14.
  // Centre line = 72/6 = 12.
  // Moving ranges 2, 1, 2, 1, 2 → total 8, mean 8/5 = 1.6.
  // Sigma = 1.6 / 1.128 = 1.418439716312056…  (d₂ for a sample of size 2)
  // 3σ = 4.255319148936170… → upper 16.255319…, lower 7.744680…
  const series = [10, 12, 11, 13, 12, 14];

  it("computes the centre line, sigma and the limits out of the named window", () => {
    const g = controlLimits(series, { kind: "referenceWindow", from: 0, to: 6 });
    expect(g.center).toBe(12);
    expect(g.sigma).toBeCloseTo(1.418439716312056, 12);
    expect(g.upper).toBeCloseTo(16.25531914893617, 12);
    expect(g.lower).toBeCloseTo(7.744680851063829, 12);
  });

  it("ignores the out-of-control tail for calculated limits", () => {
    // The most important test of the module. The tail lies outside the reference
    // window, so it must not shift the limits - otherwise a process out of control
    // redefines "normal" around itself and the chart can no longer find what it
    // exists for.
    const window = { kind: "referenceWindow", from: 0, to: 6 } as const;
    const withTail = [...series, 40, 5, 60, 41];
    expect(controlLimits(withTail, window)).toEqual(
      controlLimits(series, window),
    );
  });

  it("computes out of exactly that window, not out of the whole series", () => {
    // Window 2…4: values 11, 13. Centre line = 12, one moving range of 2 → sigma =
    // 2 / 1.128 = 1.773049645390070…
    const g = controlLimits(series, { kind: "referenceWindow", from: 2, to: 4 });
    expect(g.center).toBe(12);
    expect(g.sigma).toBeCloseTo(1.7730496453900709, 12);
  });

  it("skips gaps in the series and in the moving range", () => {
    // By hand: 10, –, 12, 11, 13, 12, 14. Centre line = 72/6 = 12.
    // Pairs with a gap do not count: ranges 1, 2, 1, 2 → mean 6/4 = 1.5.
    // Sigma = 1.5 / 1.128 = 1.329787234042553…
    const g = controlLimits([10, NaN, 12, 11, 13, 12, 14], {
      kind: "referenceWindow",
      from: 0,
      to: 7,
    });
    expect(g.center).toBe(12);
    expect(g.sigma).toBeCloseTo(1.329787234042553, 12);
  });

  it("takes given limits as they are given", () => {
    // The series would yield centre line 12 and sigma 1.418… out of itself. A
    // baseline fixed last quarter is not tacitly recalculated.
    const g = controlLimits(series, { kind: "given", center: 0, sigma: 1 });
    expect(g).toEqual({
      center: 0,
      sigma: 1,
      upper: 3,
      lower: -3,
    });
  });

  it("calculates sigma back out of a limit held on paper", () => {
    expect(sigmaFromLimit(12, 16.5)).toBe(1.5);
  });

  it("lets the limits fall onto the centre line for a flat process", () => {
    // Sigma zero is no error: no spread, no zone, and under the rule "beyond, not
    // on it" no point violates anything.
    const g = controlLimits([5, 5, 5, 5], { kind: "referenceWindow", from: 0, to: 4 });
    expect(g).toEqual({
      center: 5,
      sigma: 0,
      upper: 5,
      lower: 5,
    });
    expect(violatedIndices(violations([5, 5, 5, 5], g))).toEqual([]);
  });

  it("yields no numbers for an empty window instead of throwing", () => {
    const g = controlLimits(series, { kind: "referenceWindow", from: 3, to: 3 });
    expect(Number.isNaN(g.center)).toBe(true);
    expect(Number.isNaN(g.sigma)).toBe(true);
  });

  it("trims a window reaching beyond the series", () => {
    expect(
      controlLimits(series, { kind: "referenceWindow", from: -5, to: 99 }),
    ).toEqual(controlLimits(series, { kind: "referenceWindow", from: 0, to: 6 }));
  });

  it("has no range at a single value and therefore sigma zero", () => {
    const g = controlLimits([7], { kind: "referenceWindow", from: 0, to: 1 });
    expect(g.center).toBe(7);
    expect(g.sigma).toBe(0);
  });
});

describe("zones - the faintly drawn one and two sigma lines", () => {
  it("yields the line above and below the centre line per multiple", () => {
    expect(zones(controlLimits([], { kind: "given", center: 10, sigma: 2 }))).toEqual([
      { k: 1, upper: 12, lower: 8 },
      { k: 2, upper: 14, lower: 6 },
    ]);
  });
});

describe("Rule 1 - one point beyond three sigma", () => {
  it("reports beyond, not on it", () => {
    // 3 and –3 lie on the limit; only 3.1 and –3.1 lie beyond it.
    expect(ruleOutlier([2.9, 3, 3.1, -3, -3.1], unitLimits())).toEqual([2, 4]);
  });

  it("does not report a gap", () => {
    expect(ruleOutlier([NaN, 9], unitLimits())).toEqual([1]);
  });
});

describe("Rule 2 - a run on one side of the centre line", () => {
  const g = unitLimits();

  it("does not report eight points and does report nine (Nelson)", () => {
    const eight = [1, 2, 1, 2, 1, 2, 1, 2];
    expect(ruleRun(eight, g)).toEqual([]);
    expect(ruleRun([...eight, 1], g)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("reports a run below the centre line just the same", () => {
    expect(ruleRun([-1, -2, -1, -2, -1, -2, -1, -2, -1], g)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("takes the run length as a parameter", () => {
    // A works whose house rule is Western Electric counts eight.
    expect(ruleRun([1, 2, 1, 2, 1, 2, 1, 2], g, 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("breaks the run at a point on the centre line", () => {
    // On the centre line there is no side.
    const values = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1];
    expect(ruleRun(values, g)).toEqual([]);
  });

  it("breaks the run at a gap", () => {
    expect(ruleRun([1, 1, 1, 1, NaN, 1, 1, 1, 1, 1], g)).toEqual([]);
  });

  it("reports nothing for a series shorter than the run length", () => {
    expect(ruleRun([1, 1, 1], g)).toEqual([]);
  });

  it("reports the points that extend a run beyond the length too", () => {
    expect(ruleRun([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], g)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });
});

describe("Rule 3 - a run of rises or of falls", () => {
  it("does not report five rising points and does report six (Nelson)", () => {
    expect(ruleTrend([1, 2, 3, 4, 5])).toEqual([]);
    expect(ruleTrend([1, 2, 3, 4, 5, 6])).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("reports a fall just the same", () => {
    expect(ruleTrend([6, 5, 4, 3, 2, 1])).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("breaks the run at two equal values", () => {
    // Equal is neither a rise nor a fall.
    expect(ruleTrend([1, 2, 3, 3, 4, 5, 6])).toEqual([]);
  });

  it("breaks the run at a gap", () => {
    expect(ruleTrend([1, 2, 3, NaN, 4, 5, 6])).toEqual([]);
  });

  it("takes the run length as a parameter", () => {
    expect(ruleTrend([1, 2, 3, 4, 5], 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("reports a trend in the middle of the series with its indices", () => {
    expect(ruleTrend([9, 1, 2, 3, 4, 5, 6, 0])).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("Rule 4 - two of three beyond two sigma on the same side", () => {
  const g = unitLimits();

  it("reports only the points beyond the zone, not the one in between", () => {
    expect(ruleTwoOfThree([2.5, 0, 2.5], g)).toEqual([0, 2]);
  });

  it("reports nothing when the two lie on different sides", () => {
    expect(ruleTwoOfThree([2.5, 0, -2.5], g)).toEqual([]);
  });

  it("reports beyond, not on it", () => {
    // 2 lies on the two sigma line, so only one point counts.
    expect(ruleTwoOfThree([2, 0, 2.5], g)).toEqual([]);
  });

  it("reports nothing for a series shorter than three points", () => {
    expect(ruleTwoOfThree([2.5, 2.5], g)).toEqual([]);
  });

  it("reports every point only once, even where several windows hit it", () => {
    expect(ruleTwoOfThree([2.5, 2.6, 2.7], g)).toEqual([0, 1, 2]);
  });

  it("reports below just the same", () => {
    expect(ruleTwoOfThree([0, -2.5, -2.5, 0], g)).toEqual([1, 2]);
  });
});

describe("violations - the rules switchable one by one", () => {
  const g = unitLimits();
  // Nine rising points, all above the centre line, the last three beyond three
  // sigma, several beyond two sigma: violates all four rules.
  const allFour = [0.1, 0.2, 0.3, 0.4, 2.5, 2.6, 3.5, 3.6, 3.7];

  it("reports all four with the default rules", () => {
    expect(violations(allFour, g).map((v) => v.rule)).toEqual([
      "outlier",
      "run",
      "trend",
      "twoOfThree",
    ]);
  });

  it("reports only the rules switched on", () => {
    const onlyOne = violations(allFour, g, {
      run: false,
      trend: false,
      twoOfThree: false,
    });
    expect(onlyOne.map((v) => v.rule)).toEqual(["outlier"]);
    expect(onlyOne[0]?.indices).toEqual([6, 7, 8]);
  });

  it("reports nothing at all when every rule is switched off", () => {
    expect(
      violations(allFour, g, {
        outlier: false,
        run: false,
        trend: false,
        twoOfThree: false,
      }),
    ).toEqual([]);
  });

  it("does not list a rule without hits", () => {
    expect(violations([0.1, -0.1, 0.2], g).map((v) => v.rule)).toEqual([]);
  });

  it("passes the run lengths through", () => {
    const eight = [1, 2, 1, 2, 1, 2, 1, 2];
    expect(violations(eight, g, { runLength: 8, trend: false }).map((v) => v.rule)).toEqual([
      "run",
    ]);
  });

  it("has nine and six as the default lengths (Nelson)", () => {
    expect(defaultRules.runLength).toBe(9);
    expect(defaultRules.trendLength).toBe(6);
  });
});

describe("violatedIndices - a scatter beside the line", () => {
  it("gathers the rules into one ascending, duplicate-free list", () => {
    const g = unitLimits();
    const values = [0.1, 0.2, 0.3, 0.4, 2.5, 2.6, 3.5, 3.6, 3.7];
    expect(violatedIndices(violations(values, g))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(violatedIndices(violations(values, g, { run: false, trend: false }))).toEqual(
      [4, 5, 6, 7, 8],
    );
  });

  it("yields an empty list for no violation", () => {
    expect(violatedIndices([])).toEqual([]);
  });
});
