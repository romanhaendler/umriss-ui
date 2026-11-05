/* Downsampling.

   A week of seconds is 600,000 points, and a plot a thousand pixels wide. A
   path through all of them strokes every pixel column hundreds of times; what
   the eye gets from one column is where the course entered it, how high and
   how low it went, and where it left. So above two points per column a line or
   an area draws exactly those four per column - first, min, max, last - and
   never less than a spike. Bars and scatters are never thinned: a bar is a
   value, a scatter's point a sample, and neither is a course.

   Only the window of the x domain is drawn, and one point beyond each edge, so
   that the course enters and leaves the plot rather than starting inside it.
   The tooltip searches the raw data (hit.ts): a thinned course is a picture,
   not a set of readings. Pure and free of the DOM, so that it can be tested. */

import { lowerBound } from "./hit";
import type { MaterializedSeries } from "./types";

export type Course = Pick<MaterializedSeries, "x" | "y" | "y0" | "length"> & {
  /** Set when points were dropped: the gaps of maxGap are then already in the course as NaN points. */
  thinned?: boolean;
};

/** What of a course is drawn in a plot `width` pixels wide over [from, to],
    with px = x·m + b. Below the threshold, views onto the window - no copy. */
export function downsample(
  series: Course,
  from: number,
  to: number,
  m: number,
  b: number,
  width: number,
  maxGap?: number,
): Course {
  const { x, y, y0, length: n } = series;
  const lo = Math.max(0, lowerBound(x, n, from) - 1);
  const hi = Math.min(n - 1, lowerBound(x, n, to));
  if (hi < lo) return { x: x.subarray(0, 0), y: y.subarray(0, 0), y0: null, length: 0 };
  if (hi - lo + 1 <= 2 * width) {
    return {
      x: x.subarray(lo, hi + 1),
      y: y.subarray(lo, hi + 1),
      y0: y0 === null ? null : y0.subarray(lo, hi + 1),
      length: hi - lo + 1,
    };
  }

  const kept: number[] = [];
  const breaks = new Set<number>();
  let i = lo;
  while (i <= hi) {
    const c = Math.floor((x[i] as number) * m + b);
    const start = i;
    // first, min, max, last, min and max of y0, the first gap and the first
    // point after the last one, and the ends of every long step.
    const cand: number[] = [];
    let first = -1;
    let last = -1;
    let min = -1;
    let max = -1;
    let min0 = -1;
    let max0 = -1;
    let gap = -1;
    let tail = -1;
    for (; i <= hi && Math.floor((x[i] as number) * m + b) === c; i++) {
      const v = y[i] as number;
      if (Number.isNaN(v) || (y0 !== null && Number.isNaN(y0[i] as number))) {
        // The first gap of a column keeps the pen up across it, and the first
        // after its last point keeps the line from bridging to the next data.
        if (gap < 0) gap = i;
        if (tail < 0) tail = i;
        continue;
      }
      tail = -1;
      if (maxGap !== undefined && i > lo && (x[i] as number) - (x[i - 1] as number) > maxGap) {
        const before = y[i - 1] as number;
        if (!Number.isNaN(before) && (y0 === null || !Number.isNaN(y0[i - 1] as number))) {
          if (i - 1 >= start) {
            breaks.add(i - 1);
            cand.push(i - 1, i);
          } else {
            // The previous column kept i - 1 as its last: the break follows it.
            kept.push(Number.NaN);
          }
        }
      }
      if (first < 0) first = i;
      last = i;
      if (min < 0 || v < (y[min] as number)) min = i;
      if (max < 0 || v > (y[max] as number)) max = i;
      if (y0 !== null) {
        const w = y0[i] as number;
        if (min0 < 0 || w < (y0[min0] as number)) min0 = i;
        if (max0 < 0 || w > (y0[max0] as number)) max0 = i;
      }
    }
    // In the order of x: the path runs left to right through the column.
    cand.push(first, min, max, last, min0, max0, gap, tail);
    cand.sort((p, q) => p - q);
    let previous = -1;
    for (const k of cand) {
      if (k < 0 || k === previous) continue;
      kept.push(k);
      if (breaks.has(k)) kept.push(Number.NaN);
      previous = k;
    }
  }

  const out: Course = {
    x: new Float64Array(kept.length),
    y: new Float64Array(kept.length),
    y0: y0 === null ? null : new Float64Array(kept.length),
    length: kept.length,
    thinned: true,
  };
  kept.forEach((k, j) => {
    if (Number.isNaN(k)) {
      // The break sits at its left neighbour's x.
      out.x[j] = out.x[j - 1] as number;
      out.y[j] = Number.NaN;
      if (out.y0 !== null) out.y0[j] = Number.NaN;
      return;
    }
    out.x[j] = x[k] as number;
    out.y[j] = y[k] as number;
    if (out.y0 !== null) out.y0[j] = (y0 as Float64Array)[k] as number;
  });
  return out;
}
