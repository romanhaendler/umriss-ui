/* The rows of the data table (charts-alternatives 01, C1-C2).

   A reader who opens the table wants the values the chart shows - its visible
   domain, not the whole history behind a zoom. The series of one x axis share
   the table: their x values are merged into rows, and a series without a
   reading at a row's x leaves its cell empty.

   A week of seconds is 600,000 rows, and a table of 600,000 rows is no answer
   to anybody. Above the limit every series is thinned the way its line is
   drawn (downsample.ts) - first, lowest, highest and last per stretch of the
   domain -, and the table says how many readings the rows stand for. Pure and
   free of the DOM, so that it can be tested. */

import { downsample, type Course } from "./downsample";
import { lowerBound } from "./hit";

/** Above this many rows the table shows the downsampled course. */
export const TABLE_LIMIT = 500;

export interface TableRows {
  /** The x of each row, ascending. */
  x: number[];
  /** Per series, the course its cells read: its window of the domain, or what
      thinning kept of it. */
  courses: Course[];
  /** Per row, per series: the index into that series' course, or -1 where it
      has no reading at the row's x. */
  at: number[][];
  /** How many rows the visible domain holds before thinning. */
  readings: number;
  thinned: boolean;
}

/** The rows of the series over [from, to], both ends included. */
export function tableRows(series: readonly Course[], from: number, to: number, limit = TABLE_LIMIT): TableRows {
  const windows = series.map((s) => windowOf(s, from, to));
  // Counted before anything is built: the count decides whether it is.
  const readings = merge(windows, false).count;
  if (readings <= limit || !(to > from)) return { ...merge(windows, true), courses: windows, readings, thinned: false };
  // Four rows per stretch and series at most - first, min, max, last -, so the
  // stretches are counted to keep every series together under the limit. The
  // last x of the domain falls into the last stretch, not one past it.
  const stretches = Math.max(1, Math.floor(limit / 4 / Math.max(1, series.length)));
  const m = (stretches - 1) / (to - from);
  const thin = windows.map((w) => downsample(w, from, to, m, -from * m, stretches));
  return { ...merge(thin, true), courses: thin, readings, thinned: true };
}

function windowOf(c: Course, from: number, to: number): Course {
  const lo = lowerBound(c.x, c.length, from);
  let hi = lowerBound(c.x, c.length, to);
  while (hi < c.length && (c.x[hi] as number) <= to) hi++;
  return {
    x: c.x.subarray(lo, hi),
    y: c.y.subarray(lo, hi),
    y0: c.y0 === null ? null : c.y0.subarray(lo, hi),
    length: Math.max(0, hi - lo),
  };
}

/** The courses merged on x: a row per x, in ascending order. A series with two
    readings at one x gives that x two rows. `keep` false only counts. */
function merge(courses: readonly Course[], keep: boolean): { x: number[]; at: number[][]; count: number } {
  const next = courses.map(() => 0);
  const x: number[] = [];
  const at: number[][] = [];
  let count = 0;
  for (;;) {
    let low = Number.POSITIVE_INFINITY;
    for (let s = 0; s < courses.length; s++) {
      const c = courses[s] as Course;
      const i = next[s] as number;
      if (i < c.length && (c.x[i] as number) < low) low = c.x[i] as number;
    }
    if (low === Number.POSITIVE_INFINITY) break;
    const row = keep ? courses.map(() => -1) : null;
    for (let s = 0; s < courses.length; s++) {
      const c = courses[s] as Course;
      const i = next[s] as number;
      if (i < c.length && c.x[i] === low) {
        if (row !== null) row[s] = i;
        next[s] = i + 1;
      }
    }
    count++;
    if (row !== null) {
      x.push(low);
      at.push(row);
    }
  }
  return { x, at, count };
}
