/* The keyboard's walk (charts-a11y, ADR-0030): where the Active point goes
   next, over the materialised series and inside the visible domain. Pure, so
   the keys can be tested without a canvas; the scene turns a position into a
   hit by asking the hit test at its pixel, as a pointer would.

   A position is an x value at which some walked series has a point: a y that
   is no gap, and for a cell a finite value (the hit's own rule, R-4.6). x is
   sorted ascending in every series (R-2.6). */

import { lowerBound } from "./hit";

export interface WalkSeries {
  readonly x: Float64Array;
  readonly y: Float64Array;
  /** A cell's value; null for every kind but the matrix. */
  readonly w: Float64Array | null;
  readonly length: number;
}

export type Move = "next" | "previous" | "first" | "last" | "pageNext" | "pagePrevious";

const valid = (s: WalkSeries, i: number): boolean =>
  !Number.isNaN(s.y[i] as number) && (s.w === null || Number.isFinite(s.w[i] as number));

/** The smallest position at or above `v` (`strict`: above) - Infinity where none. */
function firstFrom(series: readonly WalkSeries[], v: number, strict: boolean): number {
  let best = Number.POSITIVE_INFINITY;
  for (const s of series) {
    for (let i = lowerBound(s.x, s.length, v); i < s.length; i++) {
      const x = s.x[i] as number;
      if (x >= best) break;
      if ((strict && x === v) || !valid(s, i)) continue;
      best = x;
      break;
    }
  }
  return best;
}

/** The largest position at or below `v` (`strict`: below) - -Infinity where none. */
function lastUpTo(series: readonly WalkSeries[], v: number, strict: boolean): number {
  let best = Number.NEGATIVE_INFINITY;
  for (const s of series) {
    // The last index below v, or - not strict - the last at or below it.
    let i = lowerBound(s.x, s.length, v) - 1;
    if (!strict) while (i + 1 < s.length && (s.x[i + 1] as number) === v) i++;
    for (; i >= 0; i--) {
      const x = s.x[i] as number;
      if (x <= best) break;
      if (!valid(s, i)) continue;
      best = x;
      break;
    }
  }
  return best;
}

const inside = (x: number, [from, to]: readonly [number, number]) => x >= from && x <= to;

/** Where a key takes the Active point, from `from` (null: from nowhere). At an
    end it stays; null only where there is nothing to walk at all. */
export function stepPosition(
  series: readonly WalkSeries[],
  from: number | null,
  move: Move,
  domain: readonly [number, number],
): number | null {
  const first = firstFrom(series, domain[0], false);
  const last = lastUpTo(series, domain[1], false);
  if (!inside(first, domain) || !inside(last, domain)) return null;
  if (from === null) return move === "previous" || move === "last" || move === "pagePrevious" ? last : first;
  const tenth = (domain[1] - domain[0]) / 10;
  let to: number;
  switch (move) {
    case "first":
      return first;
    case "last":
      return last;
    case "next":
      to = firstFrom(series, from, true);
      break;
    case "previous":
      to = lastUpTo(series, from, true);
      break;
    case "pageNext":
      to = Math.min(firstFrom(series, from + tenth, false), last);
      break;
    case "pagePrevious":
      to = Math.max(lastUpTo(series, from - tenth, false), first);
      break;
  }
  return inside(to, domain) ? to : from;
}

/** The position nearest to `v` inside the domain - where the Active point
    goes when the domain moved away under it. */
export function nearestPosition(
  series: readonly WalkSeries[],
  v: number,
  domain: readonly [number, number],
): number | null {
  const clamped = Math.min(Math.max(v, domain[0]), domain[1]);
  const up = firstFrom(series, clamped, false);
  const down = lastUpTo(series, clamped, false);
  const candidates = [up, down].filter((x) => inside(x, domain));
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
}

export interface Cell {
  x: number;
  y: number;
}

/** A matrix walks in two dimensions: along its row (left/right) to the next
    x with a value at the same y, along its column (up/down) to the next y with
    a value at the same x. At an edge it stays. */
export function stepCell(m: WalkSeries, at: Cell, direction: "left" | "right" | "up" | "down"): Cell {
  let best: Cell | null = null;
  for (let i = 0; i < m.length; i++) {
    if (!valid(m, i)) continue;
    const x = m.x[i] as number;
    const y = m.y[i] as number;
    let ok: boolean;
    let closer: boolean;
    switch (direction) {
      case "right":
        ok = y === at.y && x > at.x;
        closer = best === null || x < best.x;
        break;
      case "left":
        ok = y === at.y && x < at.x;
        closer = best === null || x > best.x;
        break;
      case "up":
        ok = x === at.x && y > at.y;
        closer = best === null || y < best.y;
        break;
      case "down":
        ok = x === at.x && y < at.y;
        closer = best === null || y > best.y;
        break;
    }
    if (ok && closer) best = { x, y };
  }
  return best ?? at;
}
