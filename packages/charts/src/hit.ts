/* Hit testing (R-4.6).
   Binary search over the materialised x array of a series; x values are assumed
   to be sorted ascending (R-2.6). The comparison between series of different x
   axes always happens in pixel space, never in domain space. */

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
