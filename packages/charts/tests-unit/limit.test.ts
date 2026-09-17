/* The limit model (ADR-0006).
   Comparison arithmetic without pictorial intuition: what a value is, given its
   bounds. The most important case stands first, and for a reason - the fourth
   outcome is the one an implementation silently folds into a boolean when no test
   holds it down. */

import { describe, expect, it } from "vitest";
import { assess, verdictWeight } from "../src/limit";
import type { Limit } from "../src/limit";
import { LIMIT_CASES } from "./limitCases";
import type { Case } from "./limitCases";

const UPPER_ALARM: Limit = { value: 90, side: "upper", severity: "alarm" };
const UPPER_WARNING: Limit = { value: 80, side: "upper", severity: "warning" };
const LOWER_ALARM: Limit = { value: 10, side: "lower", severity: "alarm" };

describe("assess - a value nobody has", () => {
  it("reports a missing value as unknown and not as ok", () => {
    // The defect this module prevents: a tile without a measurement looks today
    // like one with a good value. A dead sensor is no reason to relax.
    expect(assess(undefined, { limits: [UPPER_ALARM] }).verdict).toBe("unknown");
    expect(assess(undefined, { limits: [UPPER_ALARM] }).verdict).not.toBe("ok");
  });

  it("reports null, NaN and infinity as unknown", () => {
    const set = { limits: [UPPER_ALARM] };
    expect(assess(null, set).verdict).toBe("unknown");
    expect(assess(Number.NaN, set).verdict).toBe("unknown");
    expect(assess(Number.POSITIVE_INFINITY, set).verdict).toBe("unknown");
    expect(assess(Number.NEGATIVE_INFINITY, set).verdict).toBe("unknown");
  });

  it("returns no null but an assessment", () => {
    // A null would invite `?? "ok"` at the call site, and that very expression is
    // the defect.
    const assessment = assess(undefined, {});
    expect(assessment).not.toBeNull();
    expect(assessment.verdict).toBe("unknown");
  });

  it("carries neither an excess nor a deviation for an unknown value", () => {
    const assessment = assess(undefined, { limits: [UPPER_ALARM], target: 50 });
    expect("excess" in assessment).toBe(false);
    expect("deviation" in assessment).toBe(false);
    expect("limit" in assessment).toBe(false);
  });
});

describe("verdictWeight - the order of the four outcomes", () => {
  it("places unknown between ok and warning", () => {
    expect(verdictWeight("ok")).toBeLessThan(verdictWeight("unknown"));
    expect(verdictWeight("unknown")).toBeLessThan(verdictWeight("warning"));
    expect(verdictWeight("warning")).toBeLessThan(verdictWeight("alarm"));
  });
});

describe("assess - beyond the bound, not on it", () => {
  it("lets a value exactly on the upper bound be in order", () => {
    expect(assess(90, { limits: [UPPER_ALARM] }).verdict).toBe("ok");
  });

  it("lets a value exactly on the lower bound be in order", () => {
    expect(assess(10, { limits: [LOWER_ALARM] }).verdict).toBe("ok");
  });

  it("violates the upper bound at the smallest possible step above it", () => {
    const bound: Limit = { value: 1, side: "upper", severity: "alarm" };
    const assessment = assess(1 + Number.EPSILON, { limits: [bound] });
    expect(assessment.verdict).toBe("alarm");
    expect(assessment.excess).toBe(Number.EPSILON);
  });

  it("violates the lower bound at the smallest possible step below it", () => {
    const bound: Limit = { value: 1, side: "lower", severity: "alarm" };
    const assessment = assess(1 - Number.EPSILON / 2, { limits: [bound] });
    expect(assessment.verdict).toBe("alarm");
    expect(assessment.excess).toBe(Number.EPSILON / 2);
  });

  it("names the violated limit - the same object the caller gave", () => {
    // So that the call site recognises it against its own data and can name it,
    // without this module emitting a single word.
    const assessment = assess(95, { limits: [UPPER_WARNING, UPPER_ALARM] });
    expect(assessment.limit).toBe(UPPER_ALARM);
  });
});

describe("assess - one-sided sets are ordinary", () => {
  it("does not throw at a missing counter-bound and invents none", () => {
    expect(assess(-1000, { limits: [UPPER_ALARM] }).verdict).toBe("ok");
    expect(assess(1e9, { limits: [LOWER_ALARM] }).verdict).toBe("ok");
  });

  it("takes no set at all and reports ok", () => {
    expect(assess(42).verdict).toBe("ok");
    expect(assess(42, {}).verdict).toBe("ok");
    expect(assess(42, { limits: [] }).verdict).toBe("ok");
  });
});

describe("assess - who wins when several are violated", () => {
  it("reports the alarm, although the warning lies further back", () => {
    // The warning is exceeded by 15, the alarm only by 5. Severity beats the
    // distance, otherwise a warning would hide an alarm.
    const assessment = assess(95, { limits: [UPPER_WARNING, UPPER_ALARM] });
    expect(assessment.verdict).toBe("alarm");
    expect(assessment.limit).toEqual(UPPER_ALARM);
    expect(assessment.excess).toBe(5);
  });

  it("takes the greatest excess among equally severe ones", () => {
    const near: Limit = { value: 80, side: "upper", severity: "warning" };
    const far: Limit = { value: 50, side: "upper", severity: "warning" };
    expect(assess(100, { limits: [near, far] }).limit).toBe(far);
    expect(assess(100, { limits: [far, near] }).limit).toBe(far);
  });
});

describe("assess - excess and deviation are two numbers", () => {
  it("fills neither of the two fields from the other", () => {
    const assessment = assess(4, { limits: [LOWER_ALARM], target: 20 });
    expect(assessment.excess).toBe(6);
    expect(assessment.deviation).toBe(-16);
  });

  it("leaves the deviation absent without a target instead of setting it to zero", () => {
    const assessment = assess(50, { limits: [UPPER_ALARM] });
    expect("deviation" in assessment).toBe(false);
    expect(assessment.deviation).toBeUndefined();
  });

  it("reports a deviation of zero on the target, and it is present", () => {
    const assessment = assess(50, { target: 50 });
    expect("deviation" in assessment).toBe(true);
    expect(assessment.deviation).toBe(0);
  });

  it("violates nothing merely because the target is missed", () => {
    // A target is missed, never violated.
    const assessment = assess(1000, { target: 50 });
    expect(assessment.verdict).toBe("ok");
    expect(assessment.deviation).toBe(950);
  });
});

/* The shared case table. It is the artefact from which the ui tests and the
   conformance test run as well: a case that joins because of a defect in one
   package is thereby a case in the other. */

function checkCase(entry: Case): void {
  const assessment = assess(entry.value, entry.set);
  expect(assessment.verdict).toBe(entry.expected.verdict);

  // A field the expectation does not name must be absent - not present and
  // undefined.
  if (entry.expected.limit === undefined) {
    expect("limit" in assessment).toBe(false);
  } else {
    expect(assessment.limit).toEqual(entry.expected.limit);
  }

  if (entry.expected.excess === undefined) {
    expect("excess" in assessment).toBe(false);
  } else {
    expect(assessment.excess).toBe(entry.expected.excess);
  }

  if (entry.expected.deviation === undefined) {
    expect("deviation" in assessment).toBe(false);
  } else {
    expect(assessment.deviation).toBe(entry.expected.deviation);
  }
}

const GROUPS = [...new Set(LIMIT_CASES.map((entry) => entry.group))];

for (const group of GROUPS) {
  describe(`case table - ${group}`, () => {
    for (const entry of LIMIT_CASES.filter((c) => c.group === group)) {
      it(entry.name, () => checkCase(entry));
    }
  });
}
