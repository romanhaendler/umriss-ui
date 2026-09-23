/* Materialisation with null values and the extent calculation per axis (R-7.3). */

import { describe, expect, it } from "vitest";
import {
  axisExtent,
  firstUnsortedIndex,
  materializeSeries,
  visibleExtent,
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

  /* charts-review, bug 7: an infinity entered the extent, the extent was no
     longer finite, and the axis fell back to [0, 1] - every other value of the
     chart pressed flat against its edge. */
  it("treats ±Infinity in any channel as a gap outside the extent", () => {
    const rows = [
      { t: 0, a: 10, u: 0, w: 1 },
      { t: 1, a: Number.POSITIVE_INFINITY, u: 0, w: 1 },
      { t: 2, a: 30, u: Number.NEGATIVE_INFINITY, w: 1 },
      { t: 3, a: 20, u: 0, w: Number.POSITIVE_INFINITY },
      { t: Number.POSITIVE_INFINITY, a: 25, u: 0, w: 1 },
    ];
    const { series, extent } = materializeSeries(
      rows,
      (d) => d.t,
      (d) => d.a,
      (d) => d.u,
      { value: (d) => d.w },
    );
    expect(extent).toEqual({ xMin: 0, xMax: 3, yMin: 0, yMax: 30 });
    expect(series.y[0]).toBe(10);
    expect(Number.isNaN(series.y[1] as number)).toBe(true);
    expect(series.y[2]).toBe(30);
    expect(Number.isNaN(series.y0?.[2] as number)).toBe(true);
    expect(series.y[3]).toBe(20);
    expect(Number.isNaN(series.w?.[3] as number)).toBe(true);
    // An x that is no place is a gap as well: its value is not drawn.
    expect(Number.isNaN(series.y[4] as number)).toBe(true);
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

/* charts-long-series 02: `YAxis domain="visible"` fits what the x domain
   shows, not the whole course. */
describe("visibleExtent", () => {
  const course = materializeSeries(
    [
      { t: 0, a: 5, b: 0 },
      { t: 1, a: 50, b: 1 },
      { t: 2, a: 20, b: 2 },
      { t: 3, a: null, b: 3 },
      { t: 4, a: 30, b: -4 },
      { t: 5, a: 90, b: 5 },
    ] as { t: number; a: number | null; b: number }[],
    (d) => d.t,
    (d) => d.a,
  ).series;

  it("takes the points inside the window, edges included", () => {
    expect(visibleExtent(course, 2, 4)).toEqual([20, 30]);
    expect(visibleExtent(course, 1.5, 4.5)).toEqual([20, 30]);
  });

  it("leaves gaps out", () => {
    expect(visibleExtent(course, 3, 3)).toEqual([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
  });

  it("is empty where no point lies inside", () => {
    expect(visibleExtent(course, 6, 9)).toEqual([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    expect(visibleExtent(course, -3, -1)).toEqual([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
  });

  it("takes a baseline channel along", () => {
    const corridor = materializeSeries(
      [
        { t: 0, a: 5, b: 0 },
        { t: 1, a: 50, b: -8 },
        { t: 2, a: 20, b: 2 },
      ],
      (d) => d.t,
      (d) => d.a,
      (d) => d.b,
    ).series;
    expect(visibleExtent(corridor, 1, 2)).toEqual([-8, 50]);
  });
});
