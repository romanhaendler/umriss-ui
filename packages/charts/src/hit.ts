/* Hit testing (R-4.6).
   Binary search over the materialised x array of a series; x values are assumed
   to be sorted ascending (R-2.6). The comparison between series of different x
   axes always happens in pixel space, never in domain space. */

import type { Scale } from "./types";

/** Index of the value with the smallest distance to target; -1 for an empty
    array. */
export function nearestIndex(x: Float64Array, n: number, target: number): number {
  if (n <= 0) return -1;
  if (n === 1) return 0;
  let lo = 0;
  let hi = n - 1;
  if (target <= (x[lo] as number)) return lo;
  if (target >= (x[hi] as number)) return hi;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((x[mid] as number) <= target) lo = mid;
    else hi = mid;
  }
  const dLo = target - (x[lo] as number);
  const dHi = (x[hi] as number) - target;
  return dHi < dLo ? hi : lo;
}

/** The first index whose x is not below `v`; n where there is none. */
export function lowerBound(x: Float64Array, n: number, v: number): number {
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((x[mid] as number) < v) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Index of the point nearest in pixel space, in x and y - a scatter under
    "nearest", where the point straight above the pointer is not the one it
    points at. -1 where there is none; a gap (NaN in y) is never one. Walks
    outwards from the nearest x and stops where the x distance alone exceeds the
    best, so it visits a handful of points, not all of them. */
export function nearestPoint(
  x: Float64Array,
  y: Float64Array,
  n: number,
  targetX: number,
  targetY: number,
  xScale: Pick<Scale, "toPx">,
  yScale: Pick<Scale, "toPx">,
): number {
  const start = nearestIndex(x, n, targetX);
  if (start < 0) return -1;
  const px = xScale.toPx(targetX);
  const py = yScale.toPx(targetY);
  let best = -1;
  let bestD = Number.POSITIVE_INFINITY;
  for (let i = start; i >= 0; i--) {
    const dx = xScale.toPx(x[i] as number) - px;
    if (dx * dx > bestD) break;
    const v = y[i] as number;
    if (Number.isNaN(v)) continue;
    const dy = yScale.toPx(v) - py;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  for (let i = start + 1; i < n; i++) {
    const dx = xScale.toPx(x[i] as number) - px;
    if (dx * dx > bestD) break;
    const v = y[i] as number;
    if (Number.isNaN(v)) continue;
    const dy = yScale.toPx(v) - py;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
