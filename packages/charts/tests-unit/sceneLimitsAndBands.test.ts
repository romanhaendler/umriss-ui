/* What the scene does with limits, lanes and extra channels.

   The cases here are the acceptance of the tickets judging-values 02/03 and
   plant-at-a-glance 03: they hold down decisions that could otherwise be reversed
   unnoticed - the default that a limit pulls the extent; that a lane does NOT pull
   its axis; that the value channel is null for every kind that does not need it. */

import { describe, expect, it } from "vitest";
import { ChartScene } from "../src/scene";
import { dataDomain } from "../src/ticks";
import { cellSize } from "../src/cells";
import { FALLBACK_THEME } from "../src/theme";
import type {
  AxisConfig,
  LimitConfig,
  LineSeriesConfig,
  MatrixSeriesConfig,
  StateSeriesConfig,
} from "../src/types";

interface Row {
  t: number;
  a: number;
  z: number;
  w: number;
}

const data: Row[] = [
  { t: 0, a: 10, z: 0, w: 5 },
  { t: 1, a: 20, z: 1, w: 9 },
  { t: 2, a: 30, z: 0, w: 1 },
];

const xAxis: AxisConfig = {
  id: "x",
  orientation: "x",
  position: "bottom",
  accessor: (d) => (d as Row).t,
  domain: "data",
};

const yAxis: AxisConfig = {
  id: "y",
  orientation: "y",
  position: "left",
  accessor: (d) => (d as Row).a,
  domain: "data",
};

function line(): LineSeriesConfig {
  return {
    kind: "line",
    accessor: (d) => (d as Row).a,
    xAxisId: "x",
    yAxisId: "y",
    strokeWidth: 1.5,
    markers: "auto",
  };
}

function stateSeries(part: Partial<StateSeriesConfig> = {}): StateSeriesConfig {
  return {
    kind: "state",
    accessor: (d) => (d as Row).z,
    xAxisId: "x",
    yAxisId: "y",
    states: [
      { label: "Production", color: "#2e7d32" },
      { label: "Fault", color: "#c62828" },
    ],
    ...part,
  };
}

function limit(part: Partial<LimitConfig> = {}): LimitConfig {
  return {
    kind: "line",
    value: 90,
    axisId: "y",
    orientation: "y",
    severity: "alarm",
    role: "specification",
    inExtent: true,
    ...part,
  } as LimitConfig;
}

function makeScene(): ChartScene {
  const s = new ChartScene();
  s.setData(data);
  s.registerAxis(xAxis);
  s.registerAxis(yAxis);
  return s;
}

describe("Limits pull the extent", () => {
  it("widens the axis upwards when the limit lies above the data", () => {
    const s = makeScene();
    s.registerSeries(line());
    expect(s.axisExtent("y", "y")).toEqual([10, 30]);
    s.registerLimit(limit({ value: 90 } as Partial<LimitConfig>));
    expect(s.axisExtent("y", "y")).toEqual([10, 90]);
  });

  it("widens the axis downwards when the limit lies below the data", () => {
    const s = makeScene();
    s.registerSeries(line());
    s.registerLimit(limit({ value: -5 } as Partial<LimitConfig>));
    expect(s.axisExtent("y", "y")).toEqual([-5, 30]);
  });

  it("leaves the axis alone when the limit explicitly does not want it", () => {
    const s = makeScene();
    s.registerSeries(line());
    s.registerLimit(limit({ value: 900, inExtent: false } as Partial<LimitConfig>));
    expect(s.axisExtent("y", "y")).toEqual([10, 30]);
  });

  it("takes up both edges of a band", () => {
    const s = makeScene();
    s.registerSeries(line());
    s.registerLimit({
      kind: "band",
      from: 5,
      to: 40,
      axisId: "y",
      orientation: "y",
      severity: "warning",
      role: "specification",
      inExtent: true,
    });
    expect(s.axisExtent("y", "y")).toEqual([5, 40]);
  });

  it("carries an axis without any series out of its limits alone", () => {
    // A chart whose only content is its limits is degenerate - but not
    // inadmissible, and it must not blow up the extent calculation.
    const s = makeScene();
    s.registerLimit(limit({ value: 70 } as Partial<LimitConfig>));
    s.registerLimit(limit({ value: 20 } as Partial<LimitConfig>));
    expect(s.axisExtent("y", "y")).toEqual([20, 70]);
  });

  it("leaves a limit on another axis uninvolved", () => {
    const s = makeScene();
    s.registerSeries(line());
    s.registerLimit(limit({ axisId: "y2", value: 900 } as Partial<LimitConfig>));
    expect(s.axisExtent("y", "y")).toEqual([10, 30]);
  });

  it("takes no limit into the legend", () => {
    const s = makeScene();
    s.registerSeries(line());
    s.registerLimit(limit());
    expect(s.legendItems()).toHaveLength(1);
  });
});

describe("Lanes do not pull their axis", () => {
  it("lets a state series contribute nothing to the y extent", () => {
    // If the state code pulled the axis, a machine with five states would yield a
    // y axis from 0 to 4 - and a stack of four machines could no longer be built.
    //
    // The codes here are deliberately 2 and 3 and not 0 and 1: otherwise the
    // contribution would coincide with the default [0, 1], and the test would pass
    // even if the series did pull its axis.
    const s = makeScene();
    s.registerSeries(
      stateSeries({
        accessor: (d) => (d as Row).z + 2,
        states: [
          { label: "-", color: "#000" },
          { label: "-", color: "#000" },
          { label: "Production", color: "#2e7d32" },
          { label: "Fault", color: "#c62828" },
        ],
      }),
    );
    expect(s.axisExtent("y", "y")).toEqual([0, 1]); // the default, without a contribution
  });

  it("lets a line on the same axis determine the extent alone", () => {
    const s = makeScene();
    s.registerSeries(line());
    s.registerSeries(stateSeries());
    expect(s.axisExtent("y", "y")).toEqual([10, 30]);
  });

  it("does contribute the x extent of a state series", () => {
    const s = makeScene();
    s.registerSeries(stateSeries());
    expect(s.axisExtent("x", "x")).toEqual([0, 2]);
  });
});

describe("The legend of a state series counts states, not series", () => {
  it("yields one entry per state with its colour", () => {
    const s = makeScene();
    s.registerSeries(stateSeries({ name: "Machine 4" }));
    const items = s.legendItems();
    expect(items.map((i) => i.name)).toEqual(["Production", "Fault"]);
    expect(items.map((i) => i.color)).toEqual(["#2e7d32", "#c62828"]);
  });

  it("still highlights the series on hover", () => {
    const s = makeScene();
    const id = s.registerSeries(stateSeries());
    expect(new Set(s.legendItems().flatMap((i) => i.seriesIds))).toEqual(new Set([id]));
  });

  /* charts-review, bug 5: three machines share one state list, and hovering
     "Fault" dimmed two of them - the entry named the first band only. */
  it("highlights every band that shares a state", () => {
    const s = makeScene();
    const first = s.registerSeries(stateSeries({ name: "Machine 1" }));
    const second = s.registerSeries(stateSeries({ name: "Machine 2" }));
    const fault = s.legendItems().find((i) => i.name === "Fault");
    expect(fault?.seriesIds).toEqual([first, second]);
  });

  it("keeps the entries of two state series apart", () => {
    const s = makeScene();
    s.registerSeries(stateSeries());
    s.registerSeries(stateSeries());
    const ids = s.legendItems().map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/* charts-review, bugs 3 and 14: a matrix took a palette colour it never draws
   into its legend entry, and a state band and a matrix each used up a place of
   a six-colour palette - the line after them came out in its third colour. */
describe("A state band and a matrix colour themselves", () => {
  function matrix(part: Partial<MatrixSeriesConfig> = {}): MatrixSeriesConfig {
    return {
      kind: "matrix",
      name: "OEE",
      accessor: (d) => (d as Row).a,
      value: (d) => (d as Row).w,
      coloring: { kind: "gradient", stops: ["#eeeeee", "#333333"] },
      xAxisId: "x",
      yAxisId: "y",
      ...part,
    };
  }

  it("shows a gradient's stops in the matrix' legend entry, not a palette colour", () => {
    const s = makeScene();
    s.registerSeries(matrix());
    const chip = s.legendItems()[0]?.color ?? "";
    expect(chip).toContain("#eeeeee");
    expect(chip).toContain("#333333");
    expect(FALLBACK_THEME.series.some((c) => chip.includes(c))).toBe(false);
  });

  it("shows the limit set's colours in the legend entry of an assessed matrix", () => {
    const s = makeScene();
    s.registerSeries(matrix({ coloring: { kind: "assessment", limits: {} } }));
    const chip = s.legendItems()[0]?.color ?? "";
    expect(chip).toContain(FALLBACK_THEME.colorOk);
    expect(chip).toContain(FALLBACK_THEME.colorWarning);
    expect(chip).toContain(FALLBACK_THEME.colorAlarm);
  });

  it("gives the first line after them the first palette colour", () => {
    const s = makeScene();
    s.registerSeries(stateSeries({ name: "Machine 1" }));
    s.registerSeries(matrix());
    s.registerSeries({ ...line(), name: "Temperature" });
    s.registerSeries(line());
    const colors = Object.fromEntries(s.legendItems().map((i) => [i.name, i.color]));
    expect(colors.Temperature).toBe(FALLBACK_THEME.series[0]);
    // Without a name the position counts - among the series that take a colour.
    expect(colors["Series 4"]).toBe(FALLBACK_THEME.series[1]);
  });
});

describe("The value channel exists only where a kind needs it (ADR-0011)", () => {
  const access = (s: ChartScene) => s.seriesInOrder()[0]?.materialized ?? null;

  it("leaves the value channel null for a line, an area, a bar and a scatter", () => {
    const s = makeScene();
    s.registerSeries(line());
    s.axisExtent("y", "y"); // forces the materialisation
    const mat = access(s);
    expect(mat?.w).toBeNull();
  });

  it("leaves the value channel null for a state series too", () => {
    const s = makeScene();
    s.registerSeries(stateSeries());
    s.axisExtent("y", "y");
    const mat = access(s);
    expect(mat?.w).toBeNull();
  });

  it("fills the value channel for the matrix", () => {
    const s = makeScene();
    const matrix: MatrixSeriesConfig = {
      kind: "matrix",
      accessor: (d) => (d as Row).a,
      value: (d) => (d as Row).w,
      coloring: { kind: "gradient", stops: ["#eee", "#333"] },
      xAxisId: "x",
      yAxisId: "y",
    };
    s.registerSeries(matrix);
    s.axisExtent("y", "y");
    const mat = access(s);
    expect([...(mat?.w ?? [])]).toEqual([5, 9, 1]);
  });
});

describe("Degenerate cases that look like an empty chart", () => {
  it("measures the cell edge and does not clamp it to zero prematurely", () => {
    /* The scene assembles the cell edge out of TWO pieces: the measured spacing
       (here) and, where none is measurable, the span of the AXIS domain (at
       drawing time). Whoever pulls both together here already gets, with a single
       row, a cell of height zero out of zero and zero - an empty chart that looks
       as though there were no data.

       Hence this test holds down: what is stored is the MEASURED spacing, even
       when it is zero. That zero is rescued is held down by cells.test.ts. */
    const cells = [
      { t: 0, a: 0, z: 0, w: 5 },
      { t: 1, a: 0, z: 0, w: 9 },
      { t: 0, a: 2, z: 0, w: 1 },
      { t: 1, a: 2, z: 0, w: 3 },
    ];
    const s = new ChartScene();
    s.setData(cells);
    s.registerAxis(xAxis);
    s.registerAxis(yAxis);
    s.registerSeries({
      kind: "matrix",
      accessor: (d) => (d as Row).a,
      value: (d) => (d as Row).w,
      coloring: { kind: "gradient", stops: ["#eee", "#333"] },
      xAxisId: "x",
      yAxisId: "y",
    });
    // Two rows at a distance of 2, two columns at a distance of 1: half the edge
    // belongs outwards, otherwise the axis cuts into the border cells.
    expect(s.axisExtent("y", "y")).toEqual([-1, 3]);
    expect(s.axisExtent("x", "x")).toEqual([-0.5, 1.5]);
  });

  it("leaves a single row a point extent instead of stretching it", () => {
    // The counter-case: no spacing measurable, so no padding - and explicitly none
    // invented. The axis widens a point itself (dataDomain/niceDomain), and out of
    // that the drawing code fetches the edge.
    const oneRow = [
      { t: 0, a: 4, z: 0, w: 5 },
      { t: 1, a: 4, z: 0, w: 9 },
    ];
    const s = new ChartScene();
    s.setData(oneRow);
    s.registerAxis(xAxis);
    s.registerAxis(yAxis);
    s.registerSeries({
      kind: "matrix",
      accessor: (d) => (d as Row).a,
      value: (d) => (d as Row).w,
      coloring: { kind: "gradient", stops: ["#eee", "#333"] },
      xAxisId: "x",
      yAxisId: "y",
    });
    expect(s.axisExtent("y", "y")).toEqual([4, 4]);
    // And exactly this point is widened by the domain calculation before an edge
    // comes out of it - otherwise the cell would stay zero high.
    expect(dataDomain(4, 4)[1] - dataDomain(4, 4)[0]).toBeGreaterThan(0);
    expect(cellSize(0, dataDomain(4, 4)[1] - dataDomain(4, 4)[0])).toBeGreaterThan(0);
  });
});

describe("Operating time axis: the x channel stays ascending", () => {
  /* The point at which it almost went wrong. `toOperatingTime` yields NaN for time
     that, according to the calendar, does not exist - and a NaN in the x channel
     breaks every binary search silently: every comparison with NaN is false, the
     search carries on to the left and lands on a point from an earlier shift.
     `firstUnsortedIndex` does not fire either, for exactly the same reason.

     Hence such a point gets a clamped POSITION on the seam and becomes a gap
     through its value: never drawn, never hit. */

  const HOUR = 3_600_000;
  const SHIFT = [
    { from: 0, to: 8 * HOUR },
    { from: 24 * HOUR, to: 32 * HOUR },
  ];

  interface Point {
    t: number;
    v: number;
  }

  const series: Point[] = [
    { t: 1 * HOUR, v: 10 }, // in the first shift
    { t: 7 * HOUR, v: 11 },
    { t: 12 * HOUR, v: 12 }, // in between: does not exist
    { t: 20 * HOUR, v: 13 }, // in between: does not exist
    { t: 25 * HOUR, v: 14 }, // in the second shift
  ];

  function sceneWithCalendar(): ChartScene {
    const s = new ChartScene();
    s.setData(series);
    s.registerAxis({
      id: "x",
      orientation: "x",
      position: "bottom",
      accessor: (d) => (d as Point).t,
      domain: "data",
      calendar: SHIFT,
    });
    s.registerAxis({
      id: "y",
      orientation: "y",
      position: "left",
      accessor: (d) => (d as Point).v,
      domain: "data",
    });
    s.registerSeries({
      kind: "line",
      accessor: (d) => (d as Point).v,
      xAxisId: "x",
      yAxisId: "y",
      strokeWidth: 1.5,
      markers: "auto",
    });
    return s;
  }

  it("contains no NaN and falls nowhere", () => {
    const s = sceneWithCalendar();
    s.axisExtent("x", "x");
    const mat = s.seriesInOrder()[0]?.materialized;
    const x = [...(mat?.x ?? [])];
    expect(x.some((v) => Number.isNaN(v))).toBe(false);
    for (let i = 1; i < x.length; i++) {
      expect(x[i] as number).toBeGreaterThanOrEqual(x[i - 1] as number);
    }
  });

  it("turns a point in removed time into a gap", () => {
    const s = sceneWithCalendar();
    s.axisExtent("x", "x");
    const y = [...(s.seriesInOrder()[0]?.materialized?.y ?? [])];
    expect(Number.isNaN(y[2] as number)).toBe(true);
    expect(Number.isNaN(y[3] as number)).toBe(true);
    // The neighbours stay untouched.
    expect(y[1]).toBe(11);
    expect(y[4]).toBe(14);
  });

  it("maps an x limit into operating time for the extent", () => {
    // 26 o'clock on the wall is the second shift's second hour: 8 h + 2 h.
    const s = sceneWithCalendar();
    s.registerLimit({
      kind: "line",
      value: 26 * HOUR,
      axisId: "x",
      orientation: "x",
      severity: "alarm",
      role: "specification",
      inExtent: true,
    });
    expect(s.axisExtent("x", "x")).toEqual([1 * HOUR, 10 * HOUR]);
  });

  it("does not let removed time into the extent", () => {
    // Otherwise the axis would reach to a seam at which nothing lies.
    const s = sceneWithCalendar();
    expect(s.axisExtent("x", "x")).toEqual([1 * HOUR, 8 * HOUR + 1 * HOUR]);
  });
});
