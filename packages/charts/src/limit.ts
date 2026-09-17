/* The limit model (ADR-0006).

   What a value is, once you read it against something. On a control room screen
   no number stands for itself: 47 °C is inside the tolerance or above it, and
   the answer has to be on the tile and not in the operator's head.

   The same rule stands a second time in @umriss-ui/core. That is deliberate and
   not an oversight: charts may import nothing from ui (R-1.2), and making ui
   depend on charts for thirty lines of comparison arithmetic would pull a canvas
   library into the bundle of every consumer who only wanted a coloured number.
   The two are held together by a case table in tests-unit/limitCases.ts, from
   which both unit tests and one conformance test run. A divergence is therefore
   a red test and not a report from the field.

   Deliberately free of the DOM, of React and of the scene, and deliberately
   without text: the words for a verdict live on the ui side in `wording`; on the
   charts side the caller supplies them. Exactly that is what makes the doubling
   cheap - there is nothing to duplicate but arithmetic.

   The field names and the verdict strings stay German for now. They are the wire
   format the two packages agree on, pinned by a conformance test that compares
   both versions structurally at runtime; they move in one commit across core,
   charts, the case table and that test, or not at all. */

/** Whether a limit is an upper or a lower bound. */
export type Side = "upper" | "lower";

/** How seriously a violation weighs. Exactly two: one severity that advises and
    one that calls for action. Five severities would be five colours, and five
    colours on a control room screen are noise. Whoever needs a third
    distinction sets a second limit. */
export type Severity = "warning" | "alarm";

/** What a value is. Four outcomes, not three.

    `unknown` is an outcome of its own and not a `null` return: a `null`
    invites `?? "ok"` at the call site, and that very expression is the defect
    this module exists to prevent. A value nobody has is a reason to look and
    not a reason to relax. */
export type Verdict = "ok" | "unknown" | "warning" | "alarm";

/** A bound: a value, a side and a severity. No more - a tolerance band is
    derived and never an input (two limits of equal severity on opposite sides
    enclose one). That keeps the one-sided case, which is the more common one,
    free of a `null` on the other edge. */
export interface Limit {
  value: number;
  side: Side;
  severity: Severity;
}

/** The set a value is read against: its bounds and, where there is one, its
    target.

    The target is not a limit. It is missed, never violated, and it is never the
    edge of a region. Conflating the two is how a tile turns red for being above
    target. */
export interface LimitSet {
  /** In any order; none, one or several. */
  limits?: readonly Limit[];
  target?: number;
}

/** The verdict and what led to it. */
export interface Assessment {
  verdict: Verdict;
  /** The violated limit - the same object the caller passed in, so that it can
      be recognised against the caller's own data. Absent where none is
      violated. */
  limit?: Limit;
  /** The amount beyond the bound, always positive. Absent where none is
      violated. */
  excess?: number;
  /** The signed distance from the target. Absent where none is set - a missing
      target yields no deviation of zero.

      Two fields and not one: excess and deviation are two numbers, and a single
      field meaning the one thing when a bound is violated and the other
      otherwise reads well and is wrong at three in the morning. */
  deviation?: number;
}

/* The order of severity. `unknown` lies between `ok` and `warning`. */
const VERDICT_WEIGHT: Record<Verdict, number> = {
  ok: 0,
  unknown: 1,
  warning: 2,
  alarm: 3,
};

/** How heavily a verdict weighs, as a number - for sorting and comparing, as
    when a matrix is to bring its worst cell to the top. It stands here so that
    the order is not reinvented at every call site. */
export function verdictWeight(verdict: Verdict): number {
  return VERDICT_WEIGHT[verdict];
}

const SEVERITY_WEIGHT: Record<Severity, number> = { warning: 2, alarm: 3 };

/** What the value is, given the limit set. A pure function of the two.

    A missing or non-finite value yields `unknown` - and nothing else: the
    deviation of a value nobody has is unknown to everybody too.

    A bound is violated when the value lies beyond it, not when it lies on it. A
    value exactly on the upper bound is in order. That is decided once here
    (ADR-0006), so that two building blocks on the same screen do not disagree
    about the edge.

    Where several bounds are violated the most severe wins; among equally severe
    ones the one the value lies furthest beyond. Under a tie in both, the one
    named first.

    No hysteresis: that would need the previous state, and a function of one
    value has none. Exactly that is the property which makes this module safe to
    duplicate. */
export function assess(value: number | null | undefined, set: LimitSet = {}): Assessment {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { verdict: "unknown" };
  }

  const target = set.target;
  const deviation =
    target !== undefined && Number.isFinite(target) ? value - target : undefined;

  let hit: Limit | undefined;
  let excess = 0;
  for (const bound of set.limits ?? []) {
    /* Beyond, not on it: a distance of 0 is no violation. The test for `> 0`
       also excludes bounds without a finite value - every comparison with NaN
       is false, and a bound nobody knows nobody can exceed. */
    const distance = bound.side === "upper" ? value - bound.value : bound.value - value;
    if (!(distance > 0)) continue;
    if (
      hit === undefined ||
      SEVERITY_WEIGHT[bound.severity] > SEVERITY_WEIGHT[hit.severity] ||
      (bound.severity === hit.severity && distance > excess)
    ) {
      hit = bound;
      excess = distance;
    }
  }

  if (hit === undefined) {
    return deviation === undefined
      ? { verdict: "ok" }
      : { verdict: "ok", deviation: deviation };
  }
  /* The verdict of a violation is its severity - which is why the severities
     carry the same names as the two heavy verdicts. */
  const violated: Assessment = {
    verdict: hit.severity,
    limit: hit,
    excess: excess,
  };
  return deviation === undefined ? violated : { ...violated, deviation: deviation };
}
