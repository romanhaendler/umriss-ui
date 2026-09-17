/* Materialisation with null values and the extent calculation per axis (R-7.3). */

import { describe, expect, it } from "vitest";
import {
  axisExtent,
  firstUnsortedIndex,
  materializeSeries,
  type Binding,
} from "../src/materialize";

interface Row {
  t: number;
  a: number | null;
  b: number;
}

const data: Row[] = [
  { t: 0, a: 10, b: 1000 },
  { t: 1, a: null, b: 1100 },
  { t: 2, a: 30, b: 1200 },
  { t: 3, a: Number.NaN, b: 1300 },
  { t: 4, a: 20, b: 1400 },
];

describe("materializeSeries", () => {
  it("encodes null, undefined and NaN as a gap (R-2.5)", () => {
    const { series } = materializeSeries(
      data,
      (d) => d.t,
      (d) => d.a,
    );
    expect(series.length).toBe(5);
    expect([...series.x]).toEqual([0, 1, 2, 3, 4]);
    expect(series.y[0]).toBe(10);
    expect(Number.isNaN(series.y[1] as number)).toBe(true);
    expect(series.y[2]).toBe(30);
    expect(Number.isNaN(series.y[3] as number)).toBe(true);
    expect(series.y[4]).toBe(20);
  });

  it("treats undefined out of the accessor like null", () => {
    const { series } = materializeSeries(
      [{ t: 0 }, { t: 1 }] as { t: number; w?: number }[],
      (d) => d.t,
      (d) => d.w,
    );
    expect(Number.isNaN(series.y[0] as number)).toBe(true);
  });

  it("leaves gaps out of the extent", () => {
    const { extent } = materializeSeries(
      data,
      (d) => d.t,
      (d) => d.a,
    );
    expect(extent).toEqual({ xMin: 0, xMax: 4, yMin: 10, yMax: 30 });
  });

  it("yields empty arrays for empty data without throwing", () => {
    const { series, extent } = materializeSeries(
      [] as Row[],
      (d) => d.t,
      (d) => d.a,
    );
    expect(series.length).toBe(0);
    expect(Number.isFinite(extent.yMin)).toBe(false);
  });

  it("passes the index to the accessor", () => {
    const { series } = materializeSeries(
      data,
      (_d, i) => i * 10,
      (_d, i) => i,
    );
    expect([...series.x]).toEqual([0, 10, 20, 30, 40]);
    expect([...series.y]).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("Baseline - the second channel (area, bar)", () => {
  const tall: Row[] = [
    { t: 0, a: 100, b: 40 },
    { t: 1, a: 120, b: 50 },
    { t: 2, a: 110, b: 45 },
  ];

  it("creates no second channel without a baseline", () => {
    const { series } = materializeSeries(
      tall,
      (d) => d.t,
      (d) => d.a,
    );
    expect(series.y0).toBeNull();
  });

  it("pulls a fixed baseline into the extent", () => {
    // Without this rule the axis cuts off the foot of a filled mark - and that
    // does not look broken, only like a smaller area.
    const without = materializeSeries(
      tall,
      (d) => d.t,
      (d) => d.a,
    );
    expect(without.extent.yMin).toBe(100);

    const with0 = materializeSeries(
      tall,
      (d) => d.t,
      (d) => d.a,
      0,
    );
    expect(with0.extent.yMin).toBe(0);
    expect(with0.extent.yMax).toBe(120);
    // A fixed value needs no channel.
    expect(with0.series.y0).toBeNull();
  });

  it("creates a second channel for a baseline accessor and takes it into the extent", () => {
    const { series, extent } = materializeSeries(
      tall,
      (d) => d.t,
      (d) => d.a,
      (d) => d.b,
    );
    expect(series.y0).not.toBeNull();
    expect([...(series.y0 as Float64Array)]).toEqual([40, 50, 45]);
    expect(extent.yMin).toBe(40);
    expect(extent.yMax).toBe(120);
  });

  it("runs both channels in a single pass", () => {
    let upper = 0;
    let lower = 0;
    materializeSeries(
      tall,
      (d) => d.t,
      (d) => {
        upper++;
        return d.a;
      },
      (d) => {
        lower++;
        return d.b;
      },
    );
    expect(upper).toBe(3);
    expect(lower).toBe(3);
  });

  it("encodes a gap in the baseline as NaN", () => {
    const { series, extent } = materializeSeries(
      [{ t: 0, a: 10, b: 1 }, { t: 1, a: 20, b: null }] as {
        t: number;
        a: number;
        b: number | null;
      }[],
      (d) => d.t,
      (d) => d.a,
      (d) => d.b,
    );
    expect(Number.isNaN((series.y0 as Float64Array)[1] as number)).toBe(true);
    // A gap drops out of the extent, here as in the upper channel.
    expect(extent.yMin).toBe(1);
  });

  it("passes the index to the baseline accessor too", () => {
    const { series } = materializeSeries(
      tall,
      (d) => d.t,
      (d) => d.a,
      (_d, i) => i,
    );
    expect([...(series.y0 as Float64Array)]).toEqual([0, 1, 2]);
  });
});

describe("firstUnsortedIndex (DEV check R-2.6)", () => {
  it("reports -1 for ascending values", () => {
    const x = Float64Array.from([0, 1, 1, 2, 9]);
    expect(firstUnsortedIndex(x, x.length)).toBe(-1);
  });

  it("finds the first violation", () => {
    const x = Float64Array.from([0, 1, 5, 4, 9]);
    expect(firstUnsortedIndex(x, x.length)).toBe(3);
  });
});

describe("axisExtent - the extent per axis out of the bound series (R-4.13)", () => {
  const series: Binding[] = [
    {
      xAxisId: "x",
      yAxisId: "left",
      extent: { xMin: 0, xMax: 4, yMin: 10, yMax: 30 },
    },
    {
      xAxisId: "x",
      yAxisId: "right",
      extent: { xMin: 0, xMax: 4, yMin: 1000, yMax: 1400 },
    },
    {
      xAxisId: "top",
      yAxisId: "left",
      extent: { xMin: 100, xMax: 140, yMin: -5, yMax: 12 },
    },
  ];

  it("includes only the series bound to the axis", () => {
    expect(axisExtent("y", "left", series)).toEqual([-5, 30]);
    expect(axisExtent("y", "right", series)).toEqual([1000, 1400]);
  });

  it("keeps the x axis spaces apart", () => {
    expect(axisExtent("x", "x", series)).toEqual([0, 4]);
    expect(axisExtent("x", "top", series)).toEqual([100, 140]);
  });

  it("gives an axis without a bound series [0, 1]", () => {
    expect(axisExtent("y", "unknown", series)).toEqual([0, 1]);
    expect(axisExtent("y", "left", [])).toEqual([0, 1]);
  });

  it("passes over series that are not yet materialised", () => {
    expect(axisExtent("y", "left", [{ xAxisId: "x", yAxisId: "left", extent: null }])).toEqual(
      [0, 1],
    );
  });
});
