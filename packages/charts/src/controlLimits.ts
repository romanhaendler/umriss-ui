/* Control chart: control limits and violation rules (ADR-0008).

   A control limit is not a specification limit. The specification limit is
   chosen by the design; it says what the customer assumes. The control limit is
   calculated from the process; it says what the process usually does. A process
   can be in control and outside the specification, or the other way round, and
   each of the four states calls for different action. This module calculates
   control limits exclusively.

   Control limits are never calculated from whatever happens to be on the screen.
   Either the caller gives them - from a baseline they have fixed - or they name
   a reference window and the limits are calculated from exactly that window.
   That is why `controlLimits` has no third, tacit possibility: if it had, the
   limits would wander while scrolling, a process out of control would redefine
   "normal" around itself, and the chart would no longer find what it exists for.

   Deliberately free of the DOM and of the scene, like bars.ts: arithmetic
   without pictorial intuition belongs in a pure module and is tested directly.

   The file is called after the control limits and not `controlChart.ts`, because
   <ControlChart> is the component: on a file system that does not distinguish
   upper and lower case an import of `./ControlChart` would find a
   `controlChart.ts` lying beside it. Same reason as bars.ts and cells.ts; see
   CONTEXT.md on module names. */

import { warnOnce } from "./dev";

/** Centre line, estimated spread and the control limits at three sigma. */
export interface ControlLimits {
  readonly center: number;
  /** Estimated spread of a single value, not the distance to the limit. */
  readonly sigma: number;
  readonly upper: number;
  readonly lower: number;
}

/** Where the limits come from. There are exactly these two possibilities. */
export type ControlLimitOrigin =
  /** From a baseline the caller has fixed. Taken as it is - even where the
      series would yield something else out of itself. */
  | { readonly kind: "given"; readonly center: number; readonly sigma: number }
  /** From exactly this index range of the series, half-open [from, to). */
  | { readonly kind: "referenceWindow"; readonly from: number; readonly to: number };

/* d₂ = 1.128 is the expected value of the range of a sample of size 2 from a
   standard normal distribution. It stands so in the published tables of control
   chart constants (ASTM STP-15D, table of factors for quality control charts;
   identical in Duncan and in every SPC handbook) and is the constant for the
   individuals chart, because its moving range is always formed from two
   consecutive individual values.
   Estimated spread: σ̂ = mean moving range / d₂. */
const D2_SAMPLE_TWO = 1.128;

/** Limits from centre line and sigma - three sigma to either side. */
function limitsFrom(center: number, sigma: number): ControlLimits {
  return {
    center,
    sigma,
    upper: center + 3 * sigma,
    lower: center - 3 * sigma,
  };
}

/** Sigma calculated back from a limit that stands on paper. For callers whose
    baseline has been handed down as a centre line and a control limit. */
export function sigmaFromLimit(center: number, upper: number): number {
  return (upper - center) / 3;
}

/** Centre line and control limits. Either given or calculated from exactly the
    named reference window - never from the whole series and never from the
    visible excerpt. Gaps (NaN) count neither in the centre line nor in the
    moving range. A window without values yields NaN limits, not an error: the
    chart then draws no line instead of bursting. */
export function controlLimits(
  values: readonly number[],
  origin: ControlLimitOrigin,
): ControlLimits {
  if (origin.kind === "given") {
    return limitsFrom(origin.center, origin.sigma);
  }
  const from = Math.max(0, Math.trunc(origin.from));
  const to = Math.min(values.length, Math.trunc(origin.to));

  let sum = 0;
  let count = 0;
  let rangeSum = 0;
  let ranges = 0;
  let previous = Number.NaN;
  for (let i = from; i < to; i++) {
    const value = values[i] as number;
    if (!Number.isFinite(value)) {
      previous = Number.NaN;
      continue;
    }
    sum += value;
    count++;
    if (Number.isFinite(previous)) {
      rangeSum += Math.abs(value - previous);
      ranges++;
    }
    previous = value;
  }
  if (count === 0) return limitsFrom(Number.NaN, Number.NaN);
  // A single value has no moving range: no spread measurable, so sigma zero -
  // the same result as for a flat process.
  const sigma = ranges === 0 ? 0 : rangeSum / ranges / D2_SAMPLE_TWO;
  return limitsFrom(sum / count, sigma);
}

/** A zone line: k times sigma above and below the centre line. */
export interface Zone {
  readonly k: number;
  readonly upper: number;
  readonly lower: number;
}

/** The faintly drawn zone lines. Rule 4 is about the two-sigma zone, and a
    reader cannot check it against a chart that does not show it. */
export function zones(
  limits: ControlLimits,
  multiples: readonly number[] = [1, 2],
): Zone[] {
  return multiples.map((k) => ({
    k,
    upper: limits.center + k * limits.sigma,
    lower: limits.center - k * limits.sigma,
  }));
}

/** Side of the centre line: 1 above, -1 below, 0 exactly on it or a gap.
    Exactly on it is no side - otherwise a run would depend on which way a point
    was rounded that does not deviate at all. */
function side(value: number, center: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > center) return 1;
  if (value < center) return -1;
  return 0;
}

/** All indices of a run of equal codes, as soon as it reaches the length - the
    points that extend it beyond the length included: they belong to the signal.
    Code 0 means "no run" and breaks it off. */
function runs(codes: readonly number[], length: number): number[] {
  const hits: number[] = [];
  if (length < 1) return hits;
  let start = 0;
  for (let i = 1; i <= codes.length; i++) {
    // Past the end stands NaN: unequal to everything, closing the last run.
    const now = i < codes.length ? (codes[i] as number) : Number.NaN;
    const running = codes[start] as number;
    if (now !== running) {
      if (running !== 0 && i - start >= length) {
        for (let k = start; k < i; k++) hits.push(k);
      }
      start = i;
    }
  }
  return hits;
}

/** Name of a rule, the way it is switched on and off in `violations`. */
export type RuleName = "outlier" | "run" | "trend" | "twoOfThree";

/** Which rules run, and with which run lengths. */
export interface RuleOptions {
  readonly outlier: boolean;
  readonly run: boolean;
  readonly trend: boolean;
  readonly twoOfThree: boolean;
  /** Points on one side of the centre line from which rule 2 fires. */
  readonly runLength: number;
  /** Points in succession from which rule 3 fires. */
  readonly trendLength: number;
}

/** All four rules, with Nelson's run lengths: nine points on one side, six
    points in succession rising or falling. Western Electric counts eight; both
    lengths are therefore parameters. */
export const defaultRules: RuleOptions = {
  outlier: true,
  run: true,
  trend: true,
  twoOfThree: true,
  runLength: 9,
  trendLength: 6,
};

/** Rule 1 (Nelson 1, Western Electric 1): one point beyond three sigma.
    Beyond, not on it - a point exactly on the limit violates nothing. */
export function ruleOutlier(
  values: readonly number[],
  limits: ControlLimits,
): number[] {
  const hits: number[] = [];
  // Without a spread the limits lie on the centre line, and every value off it
  // would be "beyond" - a statement about the window, not about the value.
  if (!(limits.sigma > 0)) return hits;
  for (let i = 0; i < values.length; i++) {
    const value = values[i] as number;
    if (value > limits.upper || value < limits.lower) hits.push(i);
  }
  return hits;
}

/** Rule 2 (Nelson 2): a run of points on one side of the centre line. The
    default length is nine - Nelson. Western Electric counts eight; that is why
    the length is a parameter and not a literal, so that a works with a rule of
    its own need not argue with the library. */
export function ruleRun(
  values: readonly number[],
  limits: ControlLimits,
  length: number = defaultRules.runLength,
): number[] {
  return runs(
    values.map((value) => side(value, limits.center)),
    length,
  );
}

/** Rule 3 (Nelson 3): a run of nothing but rises or nothing but falls. The
    default length is six points, so five steps - Nelson. Two equal values are
    neither a rise nor a fall and break the run. */
export function ruleTrend(
  values: readonly number[],
  length: number = defaultRules.trendLength,
): number[] {
  // One code per step, not per point: n points are n-1 steps.
  const steps: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const a = values[i - 1] as number;
    const b = values[i] as number;
    steps.push(Number.isFinite(a) && Number.isFinite(b) ? Math.sign(b - a) : 0);
  }
  const hits: number[] = [];
  for (const step of runs(steps, Math.max(1, length - 1))) {
    // Step i connects point i and point i+1.
    if (hits[hits.length - 1] !== step) hits.push(step);
    hits.push(step + 1);
  }
  return hits;
}

/** Rule 4 (Nelson 5): two of three consecutive points beyond two sigma on the
    same side. Reported are the points beyond the zone, not the one in between -
    that one is unremarkable and, marked, would look like a measurement error. */
export function ruleTwoOfThree(
  values: readonly number[],
  limits: ControlLimits,
): number[] {
  // The same degenerate zone as for rule 1.
  if (!(limits.sigma > 0)) return [];
  const upper = limits.center + 2 * limits.sigma;
  const lower = limits.center - 2 * limits.sigma;
  const marked = new Set<number>();
  for (let i = 0; i + 2 < values.length; i++) {
    for (const beyond of [
      [i, i + 1, i + 2].filter((k) => (values[k] as number) > upper),
      [i, i + 1, i + 2].filter((k) => (values[k] as number) < lower),
    ]) {
      if (beyond.length >= 2) for (const k of beyond) marked.add(k);
    }
  }
  return [...marked].sort((a, b) => a - b);
}

/** A rule and the indices it violates. */
export interface Violation {
  readonly rule: RuleName;
  readonly indices: readonly number[];
}

/** The rules switched on, each with its indices. Rules without hits do not
    appear in the list. The indices are data, not merely marks: they can be
    listed beside the chart as well as marked on it. */
export function violations(
  values: readonly number[],
  limits: ControlLimits,
  options: Partial<RuleOptions> = {},
): Violation[] {
  const o: RuleOptions = { ...defaultRules, ...options };
  if (limits.sigma === 0) {
    warnOnce(
      "control-sigma-zero",
      "control limits with sigma 0 lie on the centre line - the reference window is constant. " +
        "Rules 1 and 4 find nothing there; take a window with spread, or a given sigma.",
    );
  }
  const found: Violation[] = [];
  const take = (rule: RuleName, indices: number[]) => {
    if (indices.length > 0) found.push({ rule, indices });
  };
  if (o.outlier) take("outlier", ruleOutlier(values, limits));
  if (o.run) take("run", ruleRun(values, limits, o.runLength));
  if (o.trend) take("trend", ruleTrend(values, o.trendLength));
  if (o.twoOfThree) take("twoOfThree", ruleTwoOfThree(values, limits));
  return found;
}

/** All violated indices, ascending and free of duplicates - the scatter drawn
    beside the line. */
export function violatedIndices(found: readonly Violation[]): number[] {
  const all = new Set<number>();
  for (const v of found) for (const i of v.indices) all.add(i);
  return [...all].sort((a, b) => a - b);
}
