/* Materialisation (R-2.7) and extents per axis (R-4.13).

   Deliberately free of the DOM and of scene state: the draw loop works only on
   the typed arrays produced here, and both functions are directly unit testable
   that way. Gaps (null/undefined/NaN out of the accessor) are encoded as NaN
   (R-2.5). */

import type { Accessor, MaterializedSeries } from "./types";

export interface Extent {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface Material {
  series: MaterializedSeries;
  extent: Extent;
}

/** Baseline of a series: a second accessor or a fixed value.
    It enters the extent of its y axis, so that an axis does not cut off the foot
    of a filled mark (CONTEXT.md: Baseline). */
export type Baseline<T> = Accessor<T> | number;

/** Channels that only individual series kinds need, and the pre-mapping of the
    x axis. Named rather than overloading existing channels (ADR-0011);
    optional, so that every existing call stays correct unchanged. */
export interface ExtraChannels<T> {
  /** Value channel of the matrix: the third value per point. */
  value?: Accessor<T>;
  /** Pre-mapping of the x values, before anything calculates. The operating
      calendar comes in here: the scale stays affine, because the channel already
      stands in operating time (ADR-0001).

      It must be MONOTONIC and must not yield NaN. Binary search - for a hit as
      for a segment boundary - assumes ascending x values, and every comparison
      with NaN is false: a search over a block of NaN silently lands on the wrong
      point. What does not exist at a place is reported through xGap instead. */
  xMap?: (v: number) => number;
  /** Does this x value belong to time which, according to the calendar, does not
      exist? Such a point gets a POSITION out of xMap, so that the channel stays
      ascending - it is never drawn and never hit, because its values are gaps. */
  xGap?: (v: number) => boolean;
}

/** Accessors run exactly here - once per change of data or accessor.
    With a baseline accessor a second channel arises; a fixed value only enters
    the extent and occupies no memory. */
export function materializeSeries<T>(
  data: readonly T[],
  xAccessor: (d: T, index: number) => number,
  yAccessor: Accessor<T>,
  baseline?: Baseline<T>,
  extra?: ExtraChannels<T>,
): Material {
  const n = data.length;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const baseAccessor = typeof baseline === "function" ? baseline : null;
  const y0 = baseAccessor === null ? null : new Float64Array(n);
  const valueAccessor = extra?.value ?? null;
  const w = valueAccessor === null ? null : new Float64Array(n);
  const map = extra?.xMap ?? null;
  const isGap = extra?.xGap ?? null;
  let xMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;
  // A fixed baseline pulls the extent only where there is data: an empty series
  // contributes to no axis, here as everywhere.
  if (typeof baseline === "number" && n > 0) {
    yMin = baseline;
    yMax = baseline;
  }
  for (let i = 0; i < n; i++) {
    const d = data[i] as T;
    const xRaw = xAccessor(d, i);
    const xv = map === null ? xRaw : map(xRaw);
    x[i] = xv;
    // A point in removed time keeps its position, so that the channel stays
    // ascending, but it counts neither in the extent nor as a value.
    const calendarGap = isGap !== null && isGap(xRaw);
    if (!calendarGap) {
      if (xv < xMin) xMin = xv;
      if (xv > xMax) xMax = xv;
    }
    const raw = calendarGap ? null : yAccessor(d, i);
    const yv = raw === null || raw === undefined ? Number.NaN : raw;
    y[i] = yv;
    // Comparisons with NaN are always false - gaps thereby drop out of the extent.
    if (yv < yMin) yMin = yv;
    if (yv > yMax) yMax = yv;
    if (valueAccessor !== null) {
      const rawValue = calendarGap ? null : valueAccessor(d, i);
      // A missing value is a hole in the matrix, not a zero.
      (w as Float64Array)[i] =
        rawValue === null || rawValue === undefined ? Number.NaN : rawValue;
    }
    if (baseAccessor !== null) {
      const rawBase = calendarGap ? null : baseAccessor(d, i);
      const uv = rawBase === null || rawBase === undefined ? Number.NaN : rawBase;
      (y0 as Float64Array)[i] = uv;
      if (uv < yMin) yMin = uv;
      if (uv > yMax) yMax = uv;
    }
  }
  return { series: { x, y, y0, w, length: n }, extent: { xMin, xMax, yMin, yMax } };
}

/** Index of the first unsorted x value, otherwise -1 (DEV check, R-2.6). */
export function firstUnsortedIndex(x: Float64Array, n: number): number {
  for (let i = 1; i < n; i++) {
    if ((x[i] as number) < (x[i - 1] as number)) return i;
  }
  return -1;
}

export interface Binding {
  xAxisId: string;
  yAxisId: string;
  extent: Extent | null;
}

/** Extent of an axis exclusively out of the series bound to it (R-4.13).
    Without a bound series: [0, 1]. */
export function axisExtent(
  orientation: "x" | "y",
  axisId: string,
  series: readonly Binding[],
  /** Values outside the series that pull the extent along: the limits.
      They count like data, so that a chart still shows its alarm line on a good
      day. */
  extraValues?: readonly number[],
): readonly [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const entry of series) {
    const extent = entry.extent;
    if (extent === null) continue;
    const bound =
      orientation === "x" ? entry.xAxisId === axisId : entry.yAxisId === axisId;
    if (!bound) continue;
    const lo = orientation === "x" ? extent.xMin : extent.yMin;
    const hi = orientation === "x" ? extent.xMax : extent.yMax;
    if (lo < min) min = lo;
    if (hi > max) max = hi;
  }
  if (extraValues !== undefined) {
    for (const v of extraValues) {
      if (!Number.isFinite(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  return [min, max];
}
