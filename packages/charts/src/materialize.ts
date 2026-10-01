/* Materialisation (R-2.7) and extents per axis (R-4.13).

   Deliberately free of the DOM and of scene state: the draw loop works only on
   the typed arrays produced here, and both functions are directly unit testable
   that way. Gaps (null/undefined/NaN/±Infinity out of the accessor) are
   encoded as NaN (R-2.5). */

import { lowerBound } from "./hit";
import type { Accessor, BoxChannels, BoxExtras, BoxNumbers, MaterializedSeries } from "./types";

/** An accessor's value, or NaN for a gap. An infinity is a gap as well: it is no
    value a chart can place, and in the extent it would leave no finite range -
    the axis would fall back to [0, 1] and press every other value flat. */
function valueOf(raw: number | null | undefined): number {
  return raw === null || raw === undefined || !Number.isFinite(raw) ? Number.NaN : raw;
}

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
  /** A box's further numbers (ADR-0011): one channel each. */
  box?: BoxNumbers<Accessor<T>> &
    Partial<BoxExtras<Accessor<T>>> & {
    /** Its outliers, a list per point (ADR-0040). */
    outliers?: (d: T, index: number) => readonly number[] | null | undefined;
  };
  /** Pre-mapping of the x values, before anything calculates. The working
      calendar comes in here: the scale stays affine, because the channel already
      stands in working time (ADR-0001).

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
  const boxAccessors = extra?.box ?? null;
  const box: BoxChannels | null =
    boxAccessors === null
      ? null
      : {
          lowerQuartile: new Float64Array(n),
          upperQuartile: new Float64Array(n),
          lowerWhisker: new Float64Array(n),
          upperWhisker: new Float64Array(n),
          outliers: null,
          outlierOffsets: boxAccessors.outliers === undefined ? null : new Uint32Array(n + 1),
          mean: boxAccessors.mean === undefined ? null : new Float64Array(n),
          notchLower: boxAccessors.notchLower === undefined ? null : new Float64Array(n),
          notchUpper: boxAccessors.notchUpper === undefined ? null : new Float64Array(n),
          count: boxAccessors.count === undefined ? null : new Float64Array(n),
        };
  const outlierAccessor = boxAccessors?.outliers ?? null;
  const offsets = box?.outlierOffsets ?? null;
  const outliers: number[] = [];
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
    // An x that is no place - an infinity or NaN - takes the place of the point
    // before it (−∞ before the first), so that the channel stays ascending.
    const placeless = !Number.isFinite(xRaw);
    const xv = placeless
      ? i > 0 ? (x[i - 1] as number) : Number.NEGATIVE_INFINITY
      : map === null ? xRaw : map(xRaw);
    x[i] = xv;
    // Such a point - and one in removed time, which keeps its position - counts
    // neither in the extent nor as a value.
    const unplaced = placeless || (isGap !== null && isGap(xRaw));
    if (!unplaced) {
      if (xv < xMin) xMin = xv;
      if (xv > xMax) xMax = xv;
    }
    const yv = unplaced ? Number.NaN : valueOf(yAccessor(d, i));
    y[i] = yv;
    // Comparisons with NaN are always false - gaps thereby drop out of the extent.
    if (yv < yMin) yMin = yv;
    if (yv > yMax) yMax = yv;
    if (valueAccessor !== null) {
      // A missing value is a hole in the matrix, not a zero.
      (w as Float64Array)[i] = unplaced ? Number.NaN : valueOf(valueAccessor(d, i));
    }
    if (boxAccessors !== null) {
      // A box without its median is a gap whole: nothing of it is drawn or
      // counted.
      for (const key of BOX_KEYS) {
        const v = Number.isNaN(yv) ? Number.NaN : valueOf(boxAccessors[key](d, i));
        (box as BoxChannels)[key][i] = v;
        if (v < yMin) yMin = v;
        if (v > yMax) yMax = v;
      }
      for (const key of BOX_EXTRA_KEYS) {
        const accessor = boxAccessors[key];
        const channel = (box as BoxChannels)[key];
        if (accessor === undefined || channel === null) continue;
        const v = Number.isNaN(yv) ? Number.NaN : valueOf(accessor(d, i));
        channel[i] = v;
        // A count is no place on the y axis.
        if (key === "count") continue;
        if (v < yMin) yMin = v;
        if (v > yMax) yMax = v;
      }
      if (outlierAccessor !== null) {
        const list = Number.isNaN(yv) ? null : outlierAccessor(d, i);
        for (const raw of list ?? []) {
          // A value that is no place is left out, as a gap is.
          if (!Number.isFinite(raw)) continue;
          outliers.push(raw);
          if (raw < yMin) yMin = raw;
          if (raw > yMax) yMax = raw;
        }
        if (offsets !== null) offsets[i + 1] = outliers.length;
      }
    }
    if (baseAccessor !== null) {
      const uv = unplaced ? Number.NaN : valueOf(baseAccessor(d, i));
      (y0 as Float64Array)[i] = uv;
      if (uv < yMin) yMin = uv;
      if (uv > yMax) yMax = uv;
    }
  }
  if (box !== null && outlierAccessor !== null) box.outliers = Float64Array.from(outliers);
  return { series: { x, y, y0, w, box, length: n }, extent: { xMin, xMax, yMin, yMax } };
}

/** A box's further numbers, top to bottom as drawn: the order of its tooltip
    rows, readout and table columns (box-plot B9). */
export const BOX_KEYS = ["upperWhisker", "upperQuartile", "lowerQuartile", "lowerWhisker"] as const;

/** A box's optional numbers, in the order its tooltip reads them. */
export const BOX_EXTRA_KEYS = ["mean", "notchUpper", "notchLower", "count"] as const;

/** Index of the first box whose numbers are not lower whisker ≤ lower
    quartile ≤ median ≤ upper quartile ≤ upper whisker, otherwise -1 (DEV
    check, box-plot 04). A gap is in order. */
export function firstDisorderedBox(series: MaterializedSeries): number {
  const box = series.box;
  if (box === null) return -1;
  for (let i = 0; i < series.length; i++) {
    const median = series.y[i] as number;
    if (Number.isNaN(median)) continue;
    const lo = box.lowerWhisker[i] as number;
    const q1 = box.lowerQuartile[i] as number;
    const q3 = box.upperQuartile[i] as number;
    const hi = box.upperWhisker[i] as number;
    if (lo > q1 || q1 > median || median > q3 || q3 > hi) return i;
  }
  return -1;
}

/** Index of the first unsorted x value, otherwise -1 (DEV check, R-2.6). */
export function firstUnsortedIndex(x: Float64Array, n: number): number {
  for (let i = 1; i < n; i++) {
    if ((x[i] as number) < (x[i - 1] as number)) return i;
  }
  return -1;
}

/** The y extent of the points whose x lies in [from, to], a baseline channel
    included and gaps left out; [+∞, −∞] where none does. A binary search to
    the first, then only the window - x ascending (R-2.6). */
export function visibleExtent(
  series: MaterializedSeries,
  from: number,
  to: number,
): [number, number] {
  const { x, y, y0, box, length } = series;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = lowerBound(x, length, from); i < length && (x[i] as number) <= to; i++) {
    const v = y[i] as number;
    if (v < min) min = v;
    if (v > max) max = v;
    if (y0 !== null) {
      const u = y0[i] as number;
      if (u < min) min = u;
      if (u > max) max = u;
    }
    if (box !== null) {
      for (const key of BOX_KEYS) {
        const u = box[key][i] as number;
        if (u < min) min = u;
        if (u > max) max = u;
      }
      for (const channel of [box.mean, box.notchLower, box.notchUpper]) {
        if (channel === null) continue;
        const u = channel[i] as number;
        if (u < min) min = u;
        if (u > max) max = u;
      }
      const { outliers, outlierOffsets } = box;
      if (outliers !== null && outlierOffsets !== null) {
        for (let k = outlierOffsets[i] as number; k < (outlierOffsets[i + 1] as number); k++) {
          const u = outliers[k] as number;
          if (u < min) min = u;
          if (u > max) max = u;
        }
      }
    }
  }
  return [min, max];
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
