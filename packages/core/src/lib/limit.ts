/* The limit model (ADR-0006).

   The rule that says what a number is. On a data-dense screen no number
   stands for itself - 82 % is above target or below it - and today the
   application decides that in a question-mark-colon in the middle of the JSX,
   again three components further on and there with a different bound. The
   library holds the colour and gives the rule away; that is the wrong way
   round, because the colour is the easy part.

   The same rule stands a second time in @umriss-ui/charts, and that is
   deliberate. charts may import nothing from ui (R-1.2); making ui depend on
   charts would pull a canvas library into the bundle of every consumer who
   wanted a coloured tile; and a third package for thirty lines would be a
   build, a version and a release for thirty lines. So the rule stands twice,
   the word once (CONTEXT.md), and a conformance test runs both versions from
   one case table. The doubling is explained, and the explanation is
   executable.

   It lives in lib/ and not with a component because more than one needs it:
   the tile now, meter and matrix later.

   Pure functions, no React, no text. The words for the verdicts live in
   `wording`. */

/** Whether a limit is an upper or a lower bound. */
export type Side = "upper" | "lower";

/** How seriously a violation weighs: one severity that advises and one that
    calls for action. Exactly two - whoever offers five gets five colours on
    the screen, and five colours are noise. For a third distinction one sets a
    second limit. */
export type Severity = "warning" | "alarm";

/** What a value is. Four outcomes, ordered by severity, `unknown` between
    `ok` and `warning`: a value nobody has is a reason to look.

    The fourth outcome is not a `null`. A `null` would invite `?? "ok"` at the
    call site, and that expression is exactly the defect this module exists
    against: a dead data source would look like a healthy service. */
export type Verdict = "ok" | "unknown" | "warning" | "alarm";

/** A bound: a value, a side, a severity.

    No tolerance band as input. A band is derived - two limits of equal
    severity on opposite sides enclose one - and as an input type it would
    force a `null` on one edge in the one-sided case. One-sided is the common
    case, not the exception. */
export interface Limit {
  value: number;
  side: Side;
  severity: Severity;
}

/** The set a value is read against.

    The target stands beside the limits and is not one: it is missed, never
    violated, and it is never the edge of a region. Conflating the two is how a
    tile turns red for being above target. */
export interface LimitSet {
  /** In any order; none, one or several. */
  limits?: readonly Limit[];
  target?: number;
}

/** The verdict and what led to it. */
export interface Assessment {
  verdict: Verdict;
  /** The violated limit - the same object the caller passed in. Absent where
      none is violated. */
  limit?: Limit;
  /** The amount beyond the bound, always positive. Absent where none is
      violated. */
  excess?: number;
  /** The signed distance from the target. Absent where none is set: no target
      means no deviation, not a deviation of zero.

      Two fields, because they are two numbers. A single one meaning the one
      thing when a bound is violated and the other otherwise reads well and is
      wrong at three in the morning. */
  deviation?: number;
}

/* Severity as a number. `unknown` lies between `ok` and `warning`; the two
   severities carry the same names as the two heavy verdicts, because the
   verdict of a violation is its severity. */
const VERDICT_WEIGHT: Record<Verdict, number> = {
  ok: 0,
  unknown: 1,
  warning: 2,
  alarm: 3,
};

/** How heavily a verdict weighs - for sorting and comparing, as when a matrix
    brings the worst tile to the top. It stands here so that the order is not
    reinvented at every call site. */
export function verdictWeight(verdict: Verdict): number {
  return VERDICT_WEIGHT[verdict];
}

/** Only a finite value is a measurement. `null`, `undefined`, `NaN` and
    infinity are not - and infinity is therefore not the worst alarm of all,
    but plainly unknown. */
function isMeasurable(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

interface Violation {
  limit: Limit;
  excess: number;
}

/** How far beyond this bound the value lies, or nothing.

    Beyond, not on it: a value exactly on the upper bound is in order. Decided
    once (ADR-0006), so that two components on the same screen do not disagree
    about the edge. A bound without a finite value drops out here as well -
    what nobody knows, nobody can exceed. */
function checkBound(value: number, limit: Limit): Violation | null {
  if (!Number.isFinite(limit.value)) return null;
  const excess =
    limit.side === "upper" ? value - limit.value : limit.value - value;
  return excess > 0 ? { limit, excess } : null;
}

/** The more severe of two; among equally severe ones, the one with the
    greater distance. Strict, so that under a tie in both the first named
    stays. */
function isMoreSevere(candidate: Violation, best: Violation): boolean {
  const a = VERDICT_WEIGHT[candidate.limit.severity];
  const b = VERDICT_WEIGHT[best.limit.severity];
  if (a !== b) return a > b;
  return candidate.excess > best.excess;
}

/**
 * What the value is, given the limit set. A pure function of the two.
 *
 * A missing or non-finite value yields `unknown` - and nothing else: nobody
 * knows the deviation of a value nobody has.
 *
 * Where several bounds are violated the most severe wins, and among equally
 * severe ones the one with the greatest excess. A warning must not hide an
 * alarm, even where the value lies further beyond the warning.
 *
 * No hysteresis: that would need the previous state, and a function of a
 * single value has none. Exactly that is what makes this module safe to
 * duplicate; the trailing of an alarm belongs to its lifecycle and not to a
 * bound.
 */
export function assess(value: number | null | undefined, set: LimitSet = {}): Assessment {
  if (!isMeasurable(value)) return { verdict: "unknown" };

  const violations = (set.limits ?? [])
    .map((limit) => checkBound(value, limit))
    .filter((v): v is Violation => v !== null);

  const worst = violations.reduce<Violation | null>(
    (best, candidate) =>
      best === null || isMoreSevere(candidate, best) ? candidate : best,
    null,
  );

  const assessment: Assessment = worst === null
    ? { verdict: "ok" }
    : {
        verdict: worst.limit.severity,
        limit: worst.limit,
        excess: worst.excess,
      };

  const target = set.target;
  if (target !== undefined && Number.isFinite(target)) {
    assessment.deviation = value - target;
  }
  return assessment;
}
