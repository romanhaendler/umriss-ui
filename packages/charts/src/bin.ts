/* Bin: the arithmetic behind a histogram.

   Values in, rows out: each bin's bounds and its count. A `Bar` on a numeric x
   axis draws them (ADR-0002) at the bin's middle, so no chart kind and no
   renderer of its own. The edges are the 1-2-5 grid of the ticks (ticks.ts)
   unless the caller gives a domain.

   Deliberately free of the DOM and of the scene, like pareto.ts. */

import { invariant } from "./dev";
import { decimalsForStep, tickStep } from "./ticks";

/** A bin, the way it is drawn. */
export interface Bin {
  /** Lower edge; the bin holds it. */
  readonly from: number;
  /** Upper edge; the bin holds it only if it is the last one. */
  readonly to: number;
  /** The middle, `(from + to) / 2` - the bar's x. */
  readonly x: number;
  /** How many values fall in it. */
  readonly count: number;
}

/** The settings of `bin`. */
export interface BinOptions {
  /** The width of a bin. Wins over `count`. Without a `domain` the edges are
      multiples of it. */
  readonly width?: number;
  /** About how many bins: the width becomes the next 1-2-5 step, so the number
      comes out near it and not exactly - with a `domain`, exactly.
      @default 10 */
  readonly count?: number;
  /** The span the bins cover, the first edge on its start and the last on its
      end. Values outside it are left out, not clamped into the end bins. */
  readonly domain?: readonly [number, number];
}

/** More than this many bins is a width that is a mistake. */
const MAX_BINS = 10_000;

/** Counts values into bins of equal width.

    A value on an edge belongs to the bin that edge starts - `[from, to)` - but
    the last bin is closed, so the greatest value of a domain is counted and not
    lost. Values that are not finite (`NaN`, ±Infinity, `null`, `undefined`)
    are skipped, as a gap is on a chart. The values may be a typed array
    (`Float64Array`, `Int32Array`): they are read by index. Without values there are no bins; with
    values there is at least one, even when they are all equal. */
export function bin(values: ArrayLike<number | null | undefined>, options?: BinOptions): Bin[];
export function bin<T>(rows: readonly T[], value: (row: T) => number | null | undefined, options?: BinOptions): Bin[];
export function bin<T>(
  rows: ArrayLike<T>,
  second?: BinOptions | ((row: T) => number | null | undefined),
  third?: BinOptions,
): Bin[] {
  const [read, o]: [(row: T) => unknown, BinOptions] =
    typeof second === "function" ? [second, third ?? {}] : [(row) => row, second ?? {}];
  invariant(o.width === undefined || (o.width > 0 && Number.isFinite(o.width)), "bin: `width` has to be a number above 0.");
  invariant(o.count === undefined || o.count >= 1, "bin: `count` has to be at least 1.");

  const values: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const v = read(rows[i] as T);
    if (typeof v === "number" && Number.isFinite(v)) values.push(v);
  }
  const given = o.domain;
  if (given === undefined ? values.length === 0 : !Number.isFinite(given[0] + given[1])) return [];
  // A loop and not Math.min(...values): a long column would overflow the stack.
  const lo = given === undefined ? values.reduce((a, b) => Math.min(a, b)) : Math.min(given[0], given[1]);
  const hi = given === undefined ? values.reduce((a, b) => Math.max(a, b)) : Math.max(given[0], given[1]);

  const count = Math.max(1, Math.floor(o.count ?? 10));
  const width = o.width ?? (given !== undefined && hi > lo ? (hi - lo) / count : tickStep(hi - lo, count));
  // Nice edges are multiples of the width; a given domain starts where it says.
  const start = given === undefined ? Math.floor(lo / width) * width : lo;
  const end = Math.max(given === undefined ? Math.ceil(hi / width) * width : hi, start + width);
  const n = Math.max(1, Math.ceil((end - start) / width - 1e-9));
  invariant(n <= MAX_BINS, `bin: ${n} bins - the width is far too small for the span.`);

  // Rounded so that 3 · 0.1 is the edge 0.3 and not 0.30000000000000004.
  const digits = Math.min(20, Math.max(decimalsForStep(width), decimalsForStep(start)));
  const edges = Array.from({ length: n + 1 }, (_, i) =>
    given !== undefined && i === n ? end : Number((start + i * width).toFixed(digits)) + 0,
  );
  const counts = new Array<number>(n).fill(0);
  for (const v of values) {
    if (v < (edges[0] as number) || v > (edges[n] as number)) continue;
    // A guess from the arithmetic, corrected against the edges it must agree with.
    let i = Math.min(n - 1, Math.max(0, Math.floor((v - start) / width)));
    while (i < n - 1 && v >= (edges[i + 1] as number)) i++;
    while (i > 0 && v < (edges[i] as number)) i--;
    counts[i] = (counts[i] as number) + 1;
  }
  return counts.map((c, i) => {
    const from = edges[i] as number;
    const to = edges[i + 1] as number;
    return { from, to, x: (from + to) / 2, count: c };
  });
}
