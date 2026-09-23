/* State band geometry.

   A state band is a partition of the x axis: a state holds from the x value of
   its point until the x value of the next, and the last segment until the
   latest reading of the chart (lastSegmentEnd). There are no interstices - every end is the beginning of the
   next segment. Occupancy with explicit ends, gaps and overlaps is the
   schedule's (ADR-0026), not a band's.

   Deliberately free of the DOM and of the scene, and deliberately without a
   segment list: the drawing code iterates over the indices it has anyway and
   only asks here for the end. A list would be one allocation per frame for a
   subtraction.

   The gap is NaN in the state channel, not in the x channel - the encoding every
   series kind of this library uses. The segment then exists, it is only that
   nothing is known about it; whoever tests the channel draws nothing and reports
   nothing. Filling it with the state before it would be a claim about an
   interval about which nothing is known. */

/** Index of the segment that contains `target`: the largest index i with
    x[i] <= target. -1 when target lies before the first point - there no state
    is known. Assumes ascending x values (R-2.6).

    A boundary belongs to the segment that BEGINS THERE, not to the one that ends
    there: the new state holds from its own x value, otherwise the switching
    point would sit one segment out. With duplicate x values the same sentence
    holds, so the segment beginning last.

    Not nearestIndex: its answer is the nearest point, and in the right half of a
    segment that is the point at which only the following segment begins. */
export function segmentIndex(x: Float64Array, n: number, target: number): number {
  if (n <= 0) return -1;
  // Written negated, so that a NaN target drops out here as well.
  if (!(target >= (x[0] as number))) return -1;
  let lo = 0;
  let hi = n - 1;
  if ((x[hi] as number) <= target) return hi;
  // Invariant: x[lo] <= target < x[hi].
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((x[mid] as number) <= target) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** The x value at which segment i ends: the x value of the next point, and for
    the last segment `lastEnd` (lastSegmentEnd). */
export function segmentEnd(
  x: Float64Array,
  n: number,
  i: number,
  lastEnd: number,
): number {
  return i + 1 < n ? (x[i + 1] as number) : lastEnd;
}

/** Where the last segment ends: at `latest`, the latest x of the chart's data;
    where that is the band's own last point, one `step` after it; never beyond
    `domainEnd`.

    Leaving the last segment out would lose the current state - and that is the
    one a reader looks at first. Running it to the end of the domain claimed it
    for a time nobody reported: a "nice" domain's end is a rounding of the axis,
    not a moment (charts-review, finding 16). A single point, having no step,
    keeps a segment to the end of the domain instead of one of width zero. */
export function lastSegmentEnd(
  x: Float64Array,
  n: number,
  latest: number,
  step: number,
  domainEnd: number,
): number {
  const last = x[n - 1] as number;
  const end = latest > last ? latest : step > 0 ? last + step : domainEnd;
  return Math.min(end, domainEnd);
}

/** The median distance between consecutive x values - a band's rhythm, which
    one late or early report does not bend the way it bends the smallest.
    0 where there is no distance. Once per materialisation. */
export function medianStep(x: Float64Array, n: number): number {
  const d: number[] = [];
  for (let i = 1; i < n; i++) {
    const v = (x[i] as number) - (x[i - 1] as number);
    if (v > 0) d.push(v);
  }
  if (d.length === 0) return 0;
  d.sort((a, b) => a - b);
  return d[(d.length - 1) >> 1] as number;
}
