/* Downsampling (charts-long-series 03, Q20): what of a course is drawn. */

import { describe, expect, it } from "vitest";
import { downsample } from "../src/downsample";
import type { MaterializedSeries } from "../src/types";

function course(ys: readonly number[], y0?: readonly number[]): MaterializedSeries {
  return {
    x: Float64Array.from(ys, (_, i) => i),
    y: Float64Array.from(ys),
    y0: y0 === undefined ? null : Float64Array.from(y0),
    w: null,
    length: ys.length,
  };
}

/** A plot `width` pixels wide over the domain [from, to], starting at 0. */
function plot(from: number, to: number, width: number) {
  const m = width / (to - from);
  return { from, to, m, b: -from * m, width };
}

describe("downsample", () => {
  it("draws every point of the window where there are few, one beyond each edge", () => {
    const series = course([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const p = plot(2.5, 6.5, 100);
    const out = downsample(series, p.from, p.to, p.m, p.b, p.width);
    expect([...out.x]).toEqual([2, 3, 4, 5, 6, 7]);
    expect([...out.y]).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it("keeps first, min, max and last per pixel column above two points per column", () => {
    // Ten columns of a hundred points; in each a spike up and one down.
    const ys = Array.from({ length: 1000 }, (_, i) => (i % 100 === 30 ? 50 : i % 100 === 70 ? -50 : i % 7));
    const p = plot(0, 1000, 10);
    const out = downsample(course(ys), p.from, p.to, p.m, p.b, p.width);
    expect(out.length).toBeLessThanOrEqual(40);
    for (let column = 0; column < 10; column++) {
      const inColumn = [...out.x].map((x, k) => [x, out.y[k] as number]).filter(([x]) => Math.floor((x as number) / 100) === column);
      expect(inColumn.map(([x]) => x)).toEqual([column * 100, column * 100 + 30, column * 100 + 70, column * 100 + 99]);
      expect(inColumn.map(([, y]) => y)).toEqual([ys[column * 100], 50, -50, ys[column * 100 + 99]]);
    }
  });

  it("keeps a gap as a gap", () => {
    const ys = Array.from({ length: 400 }, (_, i) => (i >= 150 && i < 160 ? Number.NaN : i % 5));
    const p = plot(0, 400, 20);
    const out = downsample(course(ys), p.from, p.to, p.m, p.b, p.width);
    const gaps = [...out.x].filter((_, k) => Number.isNaN(out.y[k] as number));
    expect(gaps).toEqual([150]);
    // Still in order: a path is built from left to right.
    for (let k = 1; k < out.length; k++) expect(out.x[k] as number).toBeGreaterThan(out.x[k - 1] as number);
  });

  it("keeps a trailing gap of a column after its first one", () => {
    // Column 0 runs gap - points - gap; without the trailing gap the line
    // would bridge from x=0.5 to the data at x=100.
    const series: MaterializedSeries = {
      x: Float64Array.from([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.9, 100, 100.5]),
      y: Float64Array.from([Number.NaN, 1, 2, 3, 4, 5, Number.NaN, 7, 8]),
      y0: null,
      w: null,
      length: 9,
    };
    const out = downsample(series, 0, 100.5, 1, 0, 2);
    const at100 = [...out.x].indexOf(100);
    expect(Number.isNaN(out.y[at100 - 1] as number)).toBe(true);
    expect(Number.isNaN(out.y[0] as number)).toBe(true);
  });

  it("takes a baseline channel along at the same points", () => {
    const ys = Array.from({ length: 300 }, (_, i) => i);
    const y0 = ys.map((v) => -v);
    const p = plot(0, 300, 10);
    const out = downsample(course(ys, y0), p.from, p.to, p.m, p.b, p.width);
    expect(out.y0).not.toBeNull();
    expect([...(out.y0 as Float64Array)]).toEqual([...out.y].map((v) => -v));
  });

  it("draws only the window of a zoomed course", () => {
    const ys = Array.from({ length: 100_000 }, (_, i) => Math.sin(i / 50));
    const p = plot(40_000, 41_000, 200);
    const out = downsample(course(ys), p.from, p.to, p.m, p.b, p.width);
    expect(out.x[0]).toBe(39_999);
    expect(out.x[out.length - 1]).toBe(41_000);
    expect(out.length).toBeLessThanOrEqual(4 * 202);
  });
});
