/* Materialisation with null values and the extent calculation per axis (R-7.3). */

import { describe, expect, it } from "vitest";
import {
  axisExtent,
  categoriesOf,
  categoryPlaces,
  firstKind,
  firstUnsortedIndex,
  instantOf,
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

  it("keeps the x channel ascending around an infinite or NaN x", () => {
    const ts = [Number.NEGATIVE_INFINITY, 1, Number.POSITIVE_INFINITY, 3, Number.NaN, Number.NEGATIVE_INFINITY, 5];
    const { series, extent } = materializeSeries(
      ts.map((t) => ({ t, a: 1 })),
      (d) => d.t,
      (d) => d.a,
    );
    expect(firstUnsortedIndex(series.x, series.length)).toBe(-1);
    expect(extent.xMin).toBe(1);
    expect(extent.xMax).toBe(5);
    expect([0, 2, 4, 5].every((i) => Number.isNaN(series.y[i] as number))).toBe(true);
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

/* A box's further numbers stand in named channels of their own, null for every
   other kind (ADR-0011): the median is y, the rest is never folded into y0 or
   w. */
describe("materializeSeries with a box", () => {
  interface Box {
    t: number;
    lo: number;
    q1: number;
    med: number | null;
    q3: number;
    hi: number;
  }
  const boxes: Box[] = [
    { t: 0, lo: 2, q1: 4, med: 5, q3: 6, hi: 9 },
    { t: 1, lo: 1, q1: 3, med: null, q3: 7, hi: 30 },
    { t: 2, lo: 3, q1: 5, med: 6, q3: 8, hi: 12 },
  ];
  const box = {
    lowerWhisker: (d: Box) => d.lo,
    lowerQuartile: (d: Box) => d.q1,
    upperQuartile: (d: Box) => d.q3,
    upperWhisker: (d: Box) => d.hi,
  };

  it("holds the four further numbers beside the median, a gap's as NaN", () => {
    const { series } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, { box });
    expect([...series.y].map(String)).toEqual(["5", "NaN", "6"]);
    expect([...(series.box?.lowerWhisker ?? [])].map(String)).toEqual(["2", "NaN", "3"]);
    expect([...(series.box?.lowerQuartile ?? [])].map(String)).toEqual(["4", "NaN", "5"]);
    expect([...(series.box?.upperQuartile ?? [])].map(String)).toEqual(["6", "NaN", "8"]);
    expect([...(series.box?.upperWhisker ?? [])].map(String)).toEqual(["9", "NaN", "12"]);
    expect(series.y0).toBeNull();
    expect(series.w).toBeNull();
  });

  it("spans the whisker ends in its extent; a gap contributes nothing", () => {
    const { extent } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, { box });
    expect(extent).toEqual({ xMin: 0, xMax: 2, yMin: 2, yMax: 12 });
    const { series } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, { box });
    expect(visibleExtent(series, 0, 2)).toEqual([2, 12]);
  });

  it("has no box channels for any other kind", () => {
    const { series } = materializeSeries(data, (d) => d.t, (d) => d.a, (d) => d.b, { value: (d) => d.b });
    expect(series.box).toBeNull();
  });
});

/* ADR-0040: a box carries its outliers - one flat channel of the values, one
   of offsets, box i's standing from offsets[i] to offsets[i + 1]. */
describe("materializeSeries with a box's outliers", () => {
  interface Box {
    t: number;
    med: number | null;
    out?: number[] | null;
  }
  const boxes: Box[] = [
    { t: 0, med: 5, out: [20, 1] },
    { t: 1, med: 6, out: [] },
    { t: 2, med: null, out: [99] },
    { t: 3, med: 7 },
    { t: 4, med: 6, out: [Number.NaN, 30, Number.POSITIVE_INFINITY] },
  ];
  const box = {
    lowerWhisker: () => 4,
    lowerQuartile: () => 5,
    upperQuartile: () => 6,
    upperWhisker: () => 8,
  };

  it("holds the values flat and an offset per box; a gap, an empty and a missing list hold none", () => {
    const { series } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, { box: { ...box, outliers: (d) => d.out } });
    expect([...(series.box?.outliers ?? [])]).toEqual([20, 1, 30]);
    expect([...(series.box?.outlierOffsets ?? [])]).toEqual([0, 2, 2, 2, 2, 3]);
  });

  it("pulls the extent to the outliers, not to a gap's", () => {
    const { extent } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, { box: { ...box, outliers: (d) => d.out } });
    expect([extent.yMin, extent.yMax]).toEqual([1, 30]);
    const { series } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, { box: { ...box, outliers: (d) => d.out } });
    expect(visibleExtent(series, 1, 4)).toEqual([4, 30]);
  });

  it("has no outlier channels without the accessor, nor for any other kind", () => {
    const { series } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, { box });
    expect(series.box?.outliers).toBeNull();
    expect(series.box?.outlierOffsets).toBeNull();
  });
});

/* box-plot 04: mean, notch bounds and count - named channels of their own,
   null where not given; the y values in the extent, the count not. */
describe("materializeSeries with a box's mean, notch and count", () => {
  interface Box {
    t: number;
    med: number | null;
  }
  const boxes: Box[] = [
    { t: 0, med: 5 },
    { t: 1, med: null },
  ];
  const box = {
    lowerWhisker: () => 4,
    lowerQuartile: () => 4.5,
    upperQuartile: () => 6,
    upperWhisker: () => 7,
  };

  it("holds them where given, NaN for a gap, and takes mean and notch into the extent", () => {
    const { series, extent } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, {
      box: { ...box, mean: () => 9, notchLower: () => 1, notchUpper: () => 5.5, count: () => 250 },
    });
    expect([...(series.box?.mean ?? [])].map(String)).toEqual(["9", "NaN"]);
    expect([...(series.box?.notchLower ?? [])].map(String)).toEqual(["1", "NaN"]);
    expect([...(series.box?.notchUpper ?? [])].map(String)).toEqual(["5.5", "NaN"]);
    expect([...(series.box?.count ?? [])].map(String)).toEqual(["250", "NaN"]);
    expect([extent.yMin, extent.yMax]).toEqual([1, 9]);
    expect(visibleExtent(series, 0, 1)).toEqual([1, 9]);
  });

  it("leaves them null where not given", () => {
    const { series } = materializeSeries(boxes, (d) => d.t, (d) => d.med, undefined, { box });
    expect(series.box?.mean).toBeNull();
    expect(series.box?.notchLower).toBeNull();
    expect(series.box?.notchUpper).toBeNull();
    expect(series.box?.count).toBeNull();
  });
});

/* ADR-0051: a category is a whole-number place, and the library keeps the map. */
describe("The categories of an axis", () => {
  interface Spend {
    centre: string | number | null;
    eur: number;
  }
  const centre = (d: Spend) => d.centre;

  it("are the distinct strings in the order of first occurrence, list after list", () => {
    const names = categoriesOf(
      [
        [{ centre: "Sales", eur: 1 }, { centre: "Design", eur: 2 }, { centre: "Sales", eur: 3 }],
        [{ centre: "Design", eur: 4 }, { centre: "Finance", eur: 5 }],
      ],
      centre,
    );
    expect(names).toEqual(["Sales", "Design", "Finance"]);
  });

  it("leave out what is no category: null, the empty string, a number after a category", () => {
    const rows: Spend[] = [{ centre: null, eur: 1 }, { centre: "", eur: 1 }, { centre: "Sales", eur: 1 }, { centre: 7, eur: 1 }];
    expect(categoriesOf([rows], centre)).toEqual(["Sales"]);
  });

  it("are none where a number comes first - the type decides, and a numeric axis stays one", () => {
    expect(categoriesOf([[{ centre: 2024, eur: 1 }, { centre: "Sales", eur: 1 }]], centre)).toBeNull();
    expect(categoriesOf([[{ centre: "2024", eur: 1 }]], centre)).toEqual(["2024"]);
    expect(categoriesOf([[]], centre)).toBeNull();
  });
});

describe("A series on a category axis", () => {
  interface Spend {
    centre: string | null;
    eur: number | null;
  }
  const place = new Map([["Sales", 0], ["Marketing", 1], ["Design", 2]]);
  const centre = (d: Spend) => d.centre;

  it("reads rows that come in axis order as they are", () => {
    const rows: Spend[] = [{ centre: "Sales", eur: 1 }, { centre: "Design", eur: 3 }];
    const places = categoryPlaces(rows, centre, place);
    expect([...places.x]).toEqual([0, 2]);
    expect(places.rows).toBeNull();
  });

  it("is held in axis order whatever the rows' order, each accessor handed its row's own index", () => {
    const rows: Spend[] = [
      { centre: "Design", eur: 30 },
      { centre: "Sales", eur: 10 },
      { centre: "Marketing", eur: null },
    ];
    const places = categoryPlaces(rows, centre, place);
    expect([...(places.rows ?? [])]).toEqual([1, 2, 0]);
    const seen: number[] = [];
    const { series, extent } = materializeSeries(
      rows,
      (_d, i) => places.x[i] as number,
      (d, i) => {
        seen.push(i);
        return d.eur;
      },
      undefined,
      { rows: places.rows },
    );
    expect([...series.x]).toEqual([0, 1, 2]);
    expect(series.y[0]).toBe(10);
    expect(Number.isNaN(series.y[1] as number)).toBe(true);
    expect(series.y[2]).toBe(30);
    expect(seen).toEqual([1, 2, 0]);
    expect(extent).toEqual({ xMin: 0, xMax: 2, yMin: 10, yMax: 30 });
    // The channels a kind does not use stay null (ADR-0011).
    expect(series.y0).toBeNull();
    expect(series.w).toBeNull();
    expect(series.box).toBeNull();
  });

  it("leaves out a row whose category has no place, and keeps rows of one place as given", () => {
    const rows: Spend[] = [
      { centre: "Sales", eur: 1 },
      { centre: null, eur: 99 },
      { centre: "Elsewhere", eur: 99 },
      { centre: "Sales", eur: 2 },
    ];
    const places = categoryPlaces(rows, centre, place);
    expect([...(places.rows ?? [])]).toEqual([0, 3]);
    const { series, extent } = materializeSeries(rows, (_d, i) => places.x[i] as number, (d) => d.eur, undefined, { rows: places.rows });
    expect(series.length).toBe(2);
    expect([...series.x]).toEqual([0, 0]);
    expect([...series.y]).toEqual([1, 2]);
    expect(extent.yMax).toBe(2);
  });
});

describe("An instant", () => {
  it("is a number as it is, a Date's own milliseconds, an ISO 8601 string read by the platform", () => {
    expect(instantOf(1_773_727_200_000)).toBe(1_773_727_200_000);
    expect(instantOf(new Date(1_773_727_200_000))).toBe(1_773_727_200_000);
    expect(instantOf("2026-03-17T06:00:00Z")).toBe(Date.UTC(2026, 2, 17, 6));
    // A date alone is UTC; a date with a time and no offset is local.
    expect(instantOf("2026-03-17")).toBe(Date.UTC(2026, 2, 17));
    expect(instantOf("2026-03-17T06:00")).toBe(new Date(2026, 2, 17, 6).getTime());
  });

  it("is none for what is no instant", () => {
    for (const v of ["next Tuesday", "", null, undefined, new Date("no date"), {}]) {
      expect(Number.isNaN(instantOf(v))).toBe(true);
    }
  });

  it("is told by the first value that is a place", () => {
    const at = (d: { at: unknown }) => d.at;
    expect(firstKind([[{ at: null }, { at: new Date(0) }, { at: 5 }]], at)).toBe("date");
    expect(firstKind([[{ at: "" }, { at: Number.NaN }], [{ at: 5 }]], at)).toBe("number");
    expect(firstKind([[{ at: "2026-03-17" }]], at)).toBe("string");
    expect(firstKind([[], [{ at: null }]], at)).toBeNull();
  });

  it("is no category: a Date first leaves the axis without categories", () => {
    const at = (d: { at: unknown }) => d.at;
    expect(categoriesOf([[{ at: new Date(0) }, { at: "Sales" }]], at)).toBeNull();
  });
});
