/* The limit model on the core side (ADR-0006).

   A pure function, no rendering, no reaching into a React body: arguments in,
   check the return value. The fourth outcome stands first - it is the defect
   `Meter` ships today, and the only part of this module that an implementation
   quietly folds into a boolean unless a test pins it down first.

   The case table comes from @umriss-ui/charts, because it has to live there:
   the lint permits this direction and not the other. The relative path goes to
   a test file, not to a module under src/ - no runtime dependency arises from
   it, and `limitConformance.test.ts` holds that executably.

   The model's field names stay German on purpose - they are a wire format
   shared with the charts, and `limitConformance.test.ts` compares that shape
   structurally. */

import { describe, expect, it } from "vitest";
import { assess, verdictWeight } from "../src/lib/limit";
import type { Limit } from "../src/lib/limit";
import { LIMIT_CASES } from "../../charts/tests-unit/limitCases";
import type { Case } from "../../charts/tests-unit/limitCases";

const ALARM_ABOVE: Limit = { value: 90, side: "upper", severity: "alarm" };
const WARNING_ABOVE: Limit = { value: 80, side: "upper", severity: "warning" };
const ALARM_BELOW: Limit = { value: 10, side: "lower", severity: "alarm" };

describe("assess – unknown is not ok", () => {
  it("reports a missing value as unknown", () => {
    // A tile without a measurement must not look like one with a good value.
    expect(assess(undefined, { limits: [ALARM_ABOVE] }).verdict).toBe("unknown");
  });

  it("does not report it as ok", () => {
    // The same statement from the other side, because it is the reason for the
    // whole module.
    expect(assess(undefined, { limits: [ALARM_ABOVE] }).verdict).not.toBe("ok");
  });

  it("yields an assessment and never null", () => {
    expect(assess(null, {})).toEqual({ verdict: "unknown" });
  });

  it("holds NaN and both infinities to be unknown", () => {
    expect(assess(Number.NaN, { limits: [ALARM_ABOVE] }).verdict).toBe("unknown");
    // Infinity lies above every bound and is still not an alarm, but plainly
    // not a measurement.
    expect(assess(Number.POSITIVE_INFINITY, { limits: [ALARM_ABOVE] }).verdict).toBe(
      "unknown",
    );
    expect(assess(Number.NEGATIVE_INFINITY, { limits: [ALARM_BELOW] }).verdict).toBe(
      "unknown",
    );
  });

  it("carries not one of the three fields for an unknown value", () => {
    const assessment = assess(Number.NaN, { limits: [ALARM_ABOVE], target: 50 });
    expect(Object.keys(assessment)).toEqual(["verdict"]);
  });
});

describe("verdictWeight – unknown lies between ok and warning", () => {
  it("orders the four outcomes", () => {
    const ordered = (["alarm", "ok", "warning", "unknown"] as const)
      .slice()
      .sort((a, b) => verdictWeight(a) - verdictWeight(b));
    expect(ordered).toEqual(["ok", "unknown", "warning", "alarm"]);
  });
});

describe("assess – the edge", () => {
  it("holds a value exactly on the bound to be in order, above as below", () => {
    expect(assess(90, { limits: [ALARM_ABOVE] }).verdict).toBe("ok");
    expect(assess(10, { limits: [ALARM_BELOW] }).verdict).toBe("ok");
  });

  it("holds the smallest possible step beyond it to be a violation", () => {
    const assessment = assess(1 + Number.EPSILON, {
      limits: [{ value: 1, side: "upper", severity: "warning" }],
    });
    expect(assessment.verdict).toBe("warning");
    expect(assessment.excess).toBe(Number.EPSILON);
  });

  it("holds the smallest possible step below it to be a violation", () => {
    const assessment = assess(1 - Number.EPSILON / 2, {
      limits: [{ value: 1, side: "lower", severity: "warning" }],
    });
    expect(assessment.verdict).toBe("warning");
    expect(assessment.excess).toBe(Number.EPSILON / 2);
  });
});

describe("assess – one-sided is the ordinary case", () => {
  it("makes do without a counter-bound, instead of inventing one", () => {
    expect(assess(-1000, { limits: [ALARM_ABOVE] })).toEqual({ verdict: "ok" });
    expect(assess(1e9, { limits: [ALARM_BELOW] })).toEqual({ verdict: "ok" });
  });

  it("makes do with no bounds at all", () => {
    expect(assess(42)).toEqual({ verdict: "ok" });
  });
});

describe("assess – precedence among several violations", () => {
  it("lets no warning hide an alarm", () => {
    const assessment = assess(95, { limits: [WARNING_ABOVE, ALARM_ABOVE] });
    expect(assessment.verdict).toBe("alarm");
    // 15 beyond the warning, 5 beyond the alarm: severity beats distance.
    expect(assessment.excess).toBe(5);
    expect(assessment.limit).toBe(ALARM_ABOVE);
  });

  it("takes the greatest excess among equally severe ones", () => {
    const near: Limit = { value: 80, side: "upper", severity: "warning" };
    const far: Limit = { value: 50, side: "upper", severity: "warning" };
    expect(assess(100, { limits: [near, far] }).excess).toBe(50);
    expect(assess(100, { limits: [far, near] }).excess).toBe(50);
  });
});

describe("assess – excess and deviation", () => {
  it("reports both, and neither of the two out of the other", () => {
    const assessment = assess(100, { limits: [ALARM_ABOVE], target: 50 });
    expect(assessment.excess).toBe(10);
    expect(assessment.deviation).toBe(50);
  });

  it("leaves the deviation out without a target, instead of reporting null", () => {
    const assessment = assess(50, { limits: [ALARM_ABOVE] });
    expect(Object.keys(assessment)).toEqual(["verdict"]);
  });

  it("reports a present deviation of zero on the target", () => {
    expect(assess(50, { target: 50 })).toEqual({ verdict: "ok", deviation: 0 });
  });

  it("misses a target without violating it", () => {
    expect(assess(1000, { target: 50 })).toEqual({ verdict: "ok", deviation: 950 });
    expect(assess(0, { target: 50 })).toEqual({ verdict: "ok", deviation: -50 });
  });
});

/* The shared case table, run out here for the second time. A case that comes in
   because of a defect in charts is thereby a case here. */

function checkCase(testCase: Case): void {
  const assessment = assess(testCase.value, testCase.set);
  expect(assessment.verdict).toBe(testCase.expected.verdict);

  // What the expectation does not name must be absent - not stand there and be
  // undefined.
  if (testCase.expected.limit === undefined) {
    expect("limit" in assessment).toBe(false);
  } else {
    expect(assessment.limit).toEqual(testCase.expected.limit);
  }

  if (testCase.expected.excess === undefined) {
    expect("excess" in assessment).toBe(false);
  } else {
    expect(assessment.excess).toBe(testCase.expected.excess);
  }

  if (testCase.expected.deviation === undefined) {
    expect("deviation" in assessment).toBe(false);
  } else {
    expect(assessment.deviation).toBe(testCase.expected.deviation);
  }
}

for (const group of new Set(LIMIT_CASES.map((testCase) => testCase.group))) {
  describe(`Case table – ${group}`, () => {
    for (const testCase of LIMIT_CASES.filter((c) => c.group === group)) {
      it(testCase.name, () => checkCase(testCase));
    }
  });
}
