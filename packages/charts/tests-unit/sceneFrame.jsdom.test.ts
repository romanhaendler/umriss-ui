// @vitest-environment jsdom

/* What the scene does across frames once it is bound: the size it lands on
   after a resize there and back, and a hover that follows new data under a
   resting pointer. jsdom measures every text as zero and has no 2D context -
   neither matters to the layout or the hit test. */

import { describe, expect, it } from "vitest";
import { ChartScene } from "../src/scene";
import type {
  AxisConfig,
  LineSeriesConfig,
  ScatterSeriesConfig,
  SeriesConfig,
  StateSeriesConfig,
} from "../src/types";

interface Row {
  t: number;
  a: number;
}

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
  domain: [0, 100],
};

const line: LineSeriesConfig = {
  kind: "line",
  accessor: (d) => (d as Row).a,
  xAxisId: "x",
  yAxisId: "y",
  strokeWidth: 1.5,
  markers: "auto",
  name: "A",
};

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

function bound(): ChartScene {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const scene = new ChartScene();
  scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
  scene.registerAxis(xAxis);
  scene.registerAxis(yAxis);
  scene.registerSeries(line);
  scene.requestResize(400, 300);
  return scene;
}

describe("ChartScene across frames", () => {
  it("lands on the last size of a resize there and back within one frame", async () => {
    const scene = bound();
    await frame();
    scene.requestResize(500, 300);
    scene.requestResize(400, 300);
    await frame();
    expect(scene.getLayoutSnapshot().layout.width).toBe(400);
    scene.unbind();
  });

  it("asks the hit again when the data change under a resting pointer", async () => {
    const scene = bound();
    scene.registerTooltip({ mode: "x" });
    scene.setData([
      { t: 0, a: 10 },
      { t: 1, a: 20 },
      { t: 2, a: 30 },
    ]);
    await frame();
    const plot = scene.getLayoutSnapshot().layout.plot;
    scene.pointerMove(plot.x + plot.width / 2, plot.y + plot.height / 2);
    expect(scene.getHoverSnapshot().hover?.hit.points[0]?.yValue).toBe(20);

    scene.setData([
      { t: 0, a: 10 },
      { t: 1, a: 70 },
      { t: 2, a: 30 },
    ]);
    await frame();
    const hover = scene.getHoverSnapshot().hover;
    expect(hover?.hit.points[0]?.yValue).toBe(70);
    expect(hover?.marker[0]?.y).toBeCloseTo(plot.y + plot.height * 0.3);
    scene.unbind();
  });

  /* charts-review, bug 3: the chip beside a cell's value showed a palette
     colour the matrix never draws, instead of the cell's own. */
  it("gives a matrix cell's tooltip chip the cell's colour", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const scene = new ChartScene();
    scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
    scene.registerAxis(xAxis);
    scene.registerAxis({ ...yAxis, domain: "data" });
    scene.registerSeries({
      kind: "matrix",
      name: "OEE",
      accessor: (d) => (d as Row).a,
      value: (d) => (d as Row).t + 2 * (d as Row).a,
      coloring: { kind: "gradient", stops: ["#000001", "#000002", "#000003", "#000004"] },
      xAxisId: "x",
      yAxisId: "y",
    });
    scene.registerTooltip({ mode: "x" });
    scene.setData([
      { t: 0, a: 0 },
      { t: 1, a: 0 },
      { t: 0, a: 1 },
      { t: 1, a: 1 },
    ]);
    scene.requestResize(400, 300);
    await frame();
    const axes = scene.getLayoutSnapshot().layout.axes;
    const x = axes.find((a) => a.orientation === "x");
    const y = axes.find((a) => a.orientation === "y");
    // The cell at (1, 1) carries the value 3, the top of the range: the last stop.
    scene.pointerMove(x?.scale.toPx(1) ?? 0, y?.scale.toPx(1) ?? 0);
    const point = scene.getHoverSnapshot().hover?.hit.points[0];
    expect(point?.value).toBe(3);
    expect(point?.color).toBe("#000004");
    scene.unbind();
  });

  it("places an x limit on an operating-time axis in operating time", async () => {
    const HOUR = 3_600_000;
    const root = document.createElement("div");
    document.body.appendChild(root);
    const scene = new ChartScene();
    scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
    scene.registerAxis({
      ...xAxis,
      calendar: [
        { from: 0, to: 8 * HOUR },
        { from: 24 * HOUR, to: 32 * HOUR },
      ],
    });
    scene.registerAxis(yAxis);
    scene.registerSeries(line);
    scene.setData([
      { t: 0, a: 10 },
      { t: 32 * HOUR, a: 20 },
    ]);
    scene.registerLimit({
      kind: "line",
      value: 26 * HOUR,
      axisId: "x",
      orientation: "x",
      severity: "alarm",
      role: "specification",
      label: "Changeover",
      inExtent: true,
    });
    scene.requestResize(400, 300);
    await frame();
    const { layout, limits } = scene.getLayoutSnapshot();
    const axis = layout.axes.find((a) => a.orientation === "x");
    expect(limits[0]?.px).toBe(axis?.scale.toPx(10 * HOUR));
    scene.unbind();
  });
});

/* charts-fixes 10: hit testing where bands, cells and points meet. */
describe("ChartScene - the hit of a band beside points", () => {
  const band: StateSeriesConfig = {
    kind: "state",
    name: "State",
    accessor: () => 0,
    states: [{ label: "Production", color: "#2e7d32" }],
    xAxisId: "x",
    yAxisId: "y",
  };
  const rows = [
    { t: 0, a: 10 },
    { t: 5, a: 50 },
    { t: 10, a: 90 },
  ];

  function withBand(mode: "x" | "nearest", ...series: SeriesConfig[]) {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const scene = new ChartScene();
    scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
    scene.registerAxis(xAxis);
    scene.registerAxis(yAxis);
    for (const s of series) scene.registerSeries(s);
    scene.registerTooltip({ mode });
    scene.setData(rows);
    scene.requestResize(400, 300);
    return scene;
  }

  function scales(scene: ChartScene) {
    const axes = scene.getLayoutSnapshot().layout.axes;
    const x = axes.find((a) => a.orientation === "x");
    const y = axes.find((a) => a.orientation === "y");
    if (x === undefined || y === undefined) throw new Error("axes missing");
    return { x: x.scale, y: y.scale };
  }

  it("\"nearest\": a point within reach wins over the band under it", async () => {
    const scene = withBand("nearest", band, line);
    await frame();
    const { x, y } = scales(scene);
    scene.pointerMove(x.toPx(5) + 3, y.toPx(50) + 3);
    expect(scene.getHoverSnapshot().hover?.hit.points[0]?.seriesName).toBe("A");
    scene.unbind();
  });

  it("\"nearest\": the band where no point is within reach", async () => {
    const scene = withBand("nearest", band, line);
    await frame();
    const { x, y } = scales(scene);
    scene.pointerMove(x.toPx(5) + 3, y.toPx(10));
    expect(scene.getHoverSnapshot().hover?.hit.points[0]?.seriesName).toBe("State");
    scene.unbind();
  });

  it("anchors crosshair and tooltip at the pointer in a chart of bands only", async () => {
    const scene = withBand("x", band);
    await frame();
    const { x, y } = scales(scene);
    const pointer = x.toPx(7);
    scene.pointerMove(pointer, y.toPx(50));
    // Not the section's beginning at t = 0.
    expect(scene.getHoverSnapshot().hover?.hit.xPx).toBe(pointer);
    scene.unbind();
  });

  it("\"nearest\" over a scatter measures x and y", async () => {
    const scatter: ScatterSeriesConfig = {
      kind: "scatter",
      name: "S",
      accessor: (d) => (d as Row).a,
      xAxisId: "x",
      yAxisId: "y",
      radius: 3,
    };
    const scene = withBand("nearest", scatter);
    await frame();
    const { x, y } = scales(scene);
    // Nearer in x to t = 5 (a = 50); nearer in the plane to t = 10 (a = 90).
    scene.pointerMove(x.toPx(7), y.toPx(90));
    expect(scene.getHoverSnapshot().hover?.hit.points[0]?.yValue).toBe(90);
    scene.unbind();
  });
});
