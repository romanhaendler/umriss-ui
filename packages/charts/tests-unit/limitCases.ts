/* The case table of the limit model (ADR-0006).

   The model stands twice in the workspace: once in @umriss-ui/charts, once in
   @umriss-ui/core. Charts may import nothing from ui (R-1.2), and ui is not to
   pull a canvas library into the bundle of every consumer for thirty lines of
   comparison arithmetic. The doubling is therefore intended - and the reasoning is
   executable: this table is the one artefact from which both unit tests and the
   conformance test run. A case that joins because of a defect in one package is
   thereby a case in the other.

   It lives here and not in ui, because the lint allows this direction and not the
   other. The ui tests fetch it over a relative path. No runtime dependency arises
   from that: the file lies in tests-unit/, no module under src/ touches it, and
   not a line of it stands in either bundle.

   Types of its own, none imported. The table describes what the two
   implementations agree on, and it must depend on neither of them. Where a
   signature no longer matches it, the type error is to stand in the tests and not
   disappear into the table.

   The field names and the verdict strings stay German deliberately: they are the
   wire format the two packages agree on, and the conformance test compares both
   versions structurally at runtime. They move in one commit across core, charts,
   this table and that test, or not at all.

   How to read an expectation: a field missing here must be missing in the
   assessment too. "No target" means no deviation - not a deviation of zero. On a
   tile at three in the morning the two are not the same. */

export type CaseSide = "upper" | "lower";

export type CaseSeverity = "warning" | "alarm";

export type CaseVerdict = "ok" | "unknown" | "warning" | "alarm";

export interface CaseLimit {
  value: number;
  side: CaseSide;
  severity: CaseSeverity;
}

export interface CaseLimitSet {
  limits?: readonly CaseLimit[];
  target?: number;
}

export interface CaseExpectation {
  verdict: CaseVerdict;
  /** The violated limit. Absent where none is violated. */
  limit?: CaseLimit;
  /** The amount beyond the bound. Absent where none is violated. */
  excess?: number;
  /** Signed against the target. Absent where none is set. */
  deviation?: number;
}

export interface Case {
  /** Group for the structure of the test output; without effect on the subject. */
  group: string;
  name: string;
  value: number | null | undefined;
  set: CaseLimitSet;
  expected: CaseExpectation;
}

/* Abbreviations for the table. They make the cases readable; the expectations are
   still written out as numbers and never calculated. */
const upperWarning = (value: number): CaseLimit => ({ value, side: "upper", severity: "warning" });
const upperAlarm = (value: number): CaseLimit => ({ value, side: "upper", severity: "alarm" });
const lowerWarning = (value: number): CaseLimit => ({ value, side: "lower", severity: "warning" });
const lowerAlarm = (value: number): CaseLimit => ({ value, side: "lower", severity: "alarm" });

/* The smallest possible step above 1 and the smallest possible one below it. Both
   are exactly representable, and both differences are exact - which is why the
   bound here stands at 1 and not at 100. */
const JUST_ABOVE = 1 + Number.EPSILON;
const JUST_BELOW = 1 - Number.EPSILON / 2;

export const LIMIT_CASES: readonly Case[] = [
  /* ---- unknown: the fourth outcome, and the reason for the model ---- */
  {
    group: "unknown",
    name: "a missing value is unknown, not ok",
    value: undefined,
    set: { limits: [upperAlarm(100)] },
    expected: { verdict: "unknown" },
  },
  {
    group: "unknown",
    name: "null is unknown",
    value: null,
    set: { limits: [upperAlarm(100)] },
    expected: { verdict: "unknown" },
  },
  {
    group: "unknown",
    name: "NaN is unknown",
    value: Number.NaN,
    set: { limits: [upperAlarm(100)] },
    expected: { verdict: "unknown" },
  },
  {
    group: "unknown",
    name: "infinity is unknown and not the worst alarm",
    value: Number.POSITIVE_INFINITY,
    set: { limits: [upperAlarm(100)] },
    expected: { verdict: "unknown" },
  },
  {
    group: "unknown",
    name: "minus infinity is unknown",
    value: Number.NEGATIVE_INFINITY,
    set: { limits: [lowerAlarm(0)] },
    expected: { verdict: "unknown" },
  },
  {
    group: "unknown",
    name: "an unknown value carries no deviation, even with a target",
    value: undefined,
    set: { limits: [upperAlarm(100)], target: 50 },
    expected: { verdict: "unknown" },
  },
  {
    group: "unknown",
    name: "unknown has no excess",
    value: Number.NaN,
    set: { limits: [lowerAlarm(10), upperAlarm(90)] },
    expected: { verdict: "unknown" },
  },

  /* ---- ok ---- */
  {
    group: "ok",
    name: "a value between both bounds is ok",
    value: 50,
    set: { limits: [lowerWarning(10), upperWarning(90)] },
    expected: { verdict: "ok" },
  },
  {
    group: "ok",
    name: "without limits and without a target every finite value is ok",
    value: -273.15,
    set: {},
    expected: { verdict: "ok" },
  },
  {
    group: "ok",
    name: "an empty limit list is ordinary, not a special case",
    value: 5,
    set: { limits: [] },
    expected: { verdict: "ok" },
  },

  /* ---- the bound itself: beyond, not on it ---- */
  {
    group: "the bound itself",
    name: "a value exactly on the upper bound is ok",
    value: 100,
    set: { limits: [upperAlarm(100)] },
    expected: { verdict: "ok" },
  },
  {
    group: "the bound itself",
    name: "a value exactly on the lower bound is ok",
    value: 100,
    set: { limits: [lowerAlarm(100)] },
    expected: { verdict: "ok" },
  },
  {
    group: "the bound itself",
    name: "the smallest possible step above the upper bound violates it",
    value: JUST_ABOVE,
    set: { limits: [upperAlarm(1)] },
    expected: { verdict: "alarm", limit: upperAlarm(1), excess: Number.EPSILON },
  },
  {
    group: "the bound itself",
    name: "the smallest possible step below the lower bound violates it",
    value: JUST_BELOW,
    set: { limits: [lowerAlarm(1)] },
    expected: { verdict: "alarm", limit: lowerAlarm(1), excess: Number.EPSILON / 2 },
  },
  {
    group: "the bound itself",
    name: "beyond the upper bound the distance behind it counts",
    value: 92.5,
    set: { limits: [upperWarning(90)] },
    expected: { verdict: "warning", limit: upperWarning(90), excess: 2.5 },
  },
  {
    group: "the bound itself",
    name: "beyond the lower bound the distance before it counts",
    value: 4,
    set: { limits: [lowerWarning(10)] },
    expected: { verdict: "warning", limit: lowerWarning(10), excess: 6 },
  },

  /* ---- one-sided: the normal case, not the exception ---- */
  {
    group: "one-sided",
    name: "only an upper bound: far below it is ok",
    value: -1000,
    set: { limits: [upperAlarm(90)] },
    expected: { verdict: "ok" },
  },
  {
    group: "one-sided",
    name: "only an upper bound: above it is an alarm",
    value: 91,
    set: { limits: [upperAlarm(90)] },
    expected: { verdict: "alarm", limit: upperAlarm(90), excess: 1 },
  },
  {
    group: "one-sided",
    name: "only a lower bound: far above it is ok",
    value: 1_000_000,
    set: { limits: [lowerAlarm(10)] },
    expected: { verdict: "ok" },
  },
  {
    group: "one-sided",
    name: "only a lower bound: below it is an alarm",
    value: 9,
    set: { limits: [lowerAlarm(10)] },
    expected: { verdict: "alarm", limit: lowerAlarm(10), excess: 1 },
  },

  /* ---- precedence: the most severe wins, then the greatest excess ---- */
  {
    group: "precedence",
    name: "beyond warning and alarm the alarm wins, although the warning lies further back",
    value: 95,
    set: { limits: [upperWarning(80), upperAlarm(90)] },
    expected: { verdict: "alarm", limit: upperAlarm(90), excess: 5 },
  },
  {
    group: "precedence",
    name: "the order of the limits changes nothing about the verdict",
    value: 95,
    set: { limits: [upperAlarm(90), upperWarning(80)] },
    expected: { verdict: "alarm", limit: upperAlarm(90), excess: 5 },
  },
  {
    group: "precedence",
    name: "a warning stays a warning as long as the alarm is unviolated",
    value: 85,
    set: { limits: [upperWarning(80), upperAlarm(90)] },
    expected: { verdict: "warning", limit: upperWarning(80), excess: 5 },
  },
  {
    group: "precedence",
    name: "among equally severe ones the greatest excess wins",
    value: 100,
    set: { limits: [upperWarning(80), upperWarning(50)] },
    expected: { verdict: "warning", limit: upperWarning(50), excess: 50 },
  },
  {
    group: "precedence",
    name: "the lower bound is violated, the upper one is not",
    value: 5,
    set: { limits: [lowerAlarm(10), upperAlarm(90)] },
    expected: { verdict: "alarm", limit: lowerAlarm(10), excess: 5 },
  },
  {
    group: "precedence",
    name: "two bands of the same side with different severities: only the outer one is violated",
    value: 12,
    set: {
      limits: [lowerWarning(20), lowerAlarm(10), upperWarning(80), upperAlarm(90)],
    },
    expected: { verdict: "warning", limit: lowerWarning(20), excess: 8 },
  },

  /* ---- target: missed, never violated ---- */
  {
    group: "target",
    name: "without a target the deviation is absent, it is not zero",
    value: 50,
    set: { limits: [upperAlarm(100)] },
    expected: { verdict: "ok" },
  },
  {
    group: "target",
    name: "above the target the deviation is positive",
    value: 62,
    set: { target: 50 },
    expected: { verdict: "ok", deviation: 12 },
  },
  {
    group: "target",
    name: "below the target the deviation is negative",
    value: 38,
    set: { target: 50 },
    expected: { verdict: "ok", deviation: -12 },
  },
  {
    group: "target",
    name: "on the target the deviation is zero and present",
    value: 50,
    set: { target: 50 },
    expected: { verdict: "ok", deviation: 0 },
  },
  {
    group: "target",
    name: "a target alone violates nothing, not even far beside it",
    value: 1000,
    set: { target: 50 },
    expected: { verdict: "ok", deviation: 950 },
  },
  {
    group: "target",
    name: "excess and deviation are two numbers",
    value: 100,
    set: { limits: [upperAlarm(90)], target: 50 },
    expected: {
      verdict: "alarm",
      limit: upperAlarm(90),
      excess: 10,
      deviation: 50,
    },
  },
  {
    group: "target",
    name: "violated below and below target: different amounts, different signs",
    value: 4,
    set: { limits: [lowerAlarm(10)], target: 20 },
    expected: {
      verdict: "alarm",
      limit: lowerAlarm(10),
      excess: 6,
      deviation: -16,
    },
  },
  {
    group: "target",
    name: "a target without a finite value is no target",
    value: 50,
    set: { target: Number.NaN },
    expected: { verdict: "ok" },
  },

  /* ---- unusable limits ---- */
  {
    group: "unusable limits",
    name: "a limit without a finite value does not count",
    value: 1e9,
    set: { limits: [{ value: Number.NaN, side: "upper", severity: "alarm" }] },
    expected: { verdict: "ok" },
  },
  {
    group: "unusable limits",
    name: "an unusable bound hides no usable one",
    value: 95,
    set: {
      limits: [{ value: Number.NaN, side: "upper", severity: "alarm" }, upperWarning(90)],
    },
    expected: { verdict: "warning", limit: upperWarning(90), excess: 5 },
  },
];
